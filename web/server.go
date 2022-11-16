package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
	"time"

	users "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/Users"
	posts "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/post"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/misc"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/sessions"

	_ "github.com/mattn/go-sqlite3"
)

var (
	UserTable          *users.UserData
	PostTable          *posts.PostData
	storedChats        = &storeMapOfChats{Chats: make(map[string]map[string]mapOfChats)}
	sliceOfChats       []*mapOfChats
	uuidsFromChats     = make(chan *storeMapOfChats)
	uuidFromSecondUser = make(chan *storeMapOfChats)
	sessionWithMap     = make(chan *sessions.Session)
	sessionWithoutMap  = make(chan *sessions.Session)
	sessionInFromLogin = make(chan *sessions.Session)
	jsName             = make(chan string)
)

type mapOfChats struct {
	ChatId map[string]map[string]string
}

type storeMapOfChats struct {
	Chats map[string]map[string]mapOfChats
}

// recieves user input from the registration page and inserts it into the user table in the SQL database.
func signUp(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/signup" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /signup found")
	}

	var registrationData users.UserFields

	if r.Method != "POST" {
		//add bad request error
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &registrationData)
		if err != nil {
			panic(err)
		}

		registrationData = misc.DataEntryRegistration(UserTable, registrationData)

		if registrationData.Success {
			UserTable.Add(registrationData)
			session.IsAuthorized = true
			session.Username = registrationData.Username
			session.Expiry = time.Now().Add(120 * time.Second)
		}

		content, _ := json.Marshal(registrationData)
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
	}
}

func login(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/login" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /login found")
	}
	var loginData users.UserFields
	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &loginData)
		if err != nil {
			panic(err)
		}
	}

	loginData = misc.VerifyLogin(UserTable, loginData)
	if loginData.Success {
		for key, value := range sessions.SessionMap.Data {
			if value.Username == loginData.Username {
				delete(sessions.SessionMap.Data, key)
			}
		}
		session.IsAuthorized = true
		session.Username = loginData.Username
		session.Expiry = time.Now().Add(120 * time.Second)
	}
	content, _ := json.Marshal(loginData)
	w.Header().Set("Content-Type", "application/json")
	// w.Header().Set("Content-Length", "application/json")
	w.Write(content)
}
func profile(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/profile" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /login found")
	}

	profileData := UserTable.GetUser(session.Username)
	fmt.Println("profile Data", profileData)
	content, _ := json.Marshal(profileData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)
}

// store the chat id into a channel of stored-chats and output the channel
var wg sync.WaitGroup

func storeChatIdFromSession(sessionsFromLogin *sessions.Session, jsdata string, uuid string) <-chan *storeMapOfChats {
	mapChat := mapOfChats{ChatId: make(map[string]map[string]string)}
	if mapChat.ChatId[sessionsFromLogin.Username] == nil {
		mapChat.ChatId[sessionsFromLogin.Username] = make(map[string]string)
	}
	sessionsFromLogin.ChatId = make(map[string]map[string]string)
	if sessionsFromLogin.ChatId[sessionsFromLogin.Username] == nil {
		sessionsFromLogin.ChatId[sessionsFromLogin.Username] = make(map[string]string)
	}
	wg.Add(1)
	go func(wg *sync.WaitGroup) {
		if storedChats.Chats[uuid] == nil {
			storedChats.Chats[uuid] = make(map[string]mapOfChats)

			//store uuid into map of chats
			mapChat.ChatId[sessionsFromLogin.Username][jsdata] = uuid
			sliceOfChats = append(sliceOfChats, &mapChat)

			//store uuid into session
			sessionsFromLogin.ChatId[sessionsFromLogin.Username][jsdata] = uuid
			//store the map of chat into a storage of chats

			//there should only be two users associated with the uuid
			storedChats.Chats[uuid][sessionsFromLogin.Username] = mapChat

			fmt.Println("comes here to store id")
			wg.Done()
			sessionInFromLogin <- sessionsFromLogin
			jsName <- jsdata
			uuidsFromChats <- storedChats
			fmt.Println("sent off data into channels.")
		}
	}(&wg)
	return uuidsFromChats
}

func Chat(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/chat" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /chat found")
	}
	if r.Method != "POST" {
		//bad request
	} else {
		jsUsername, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		chatid := sessions.Generate()

		if session.IsAuthorized && sliceOfChats != nil {
			for _, currentSessinons := range sessions.SessionMap.Data {
				for i := 0; i < len(sliceOfChats); i++ {
					if (sliceOfChats[i] != nil) && currentSessinons.Username == string(jsUsername) && sliceOfChats[i].ChatId[string(jsUsername)][session.Username] != "" {
						sessionWithMap <- currentSessinons
						sessionWithoutMap <- session
						uuidFromSecondUser <- storedChats
						fmt.Println("found js user in current sessions")
						return
					}
				}
			}
		}

		if session.IsAuthorized {
			//if a session has already been associated with a uuid then make the uuid the same as the previous
			if sliceOfChats != nil {
				for i := 0; i < len(sliceOfChats); i++ {
					if sliceOfChats[i] != nil && sliceOfChats[i].ChatId[session.Username][string(jsUsername)] != "" {
						sessionInFromLogin <- session
						jsName <- string(jsUsername)
						uuidsFromChats <- storedChats
						fmt.Println("user already opened chat.")
						return
					}
				}
				storeChatIdFromSession(session, string(jsUsername), chatid)
			} else {
				storeChatIdFromSession(session, string(jsUsername), chatid)
			}
		}
	}
}

func friends(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/friends" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /login found")
	}

	friendsData := UserTable.Get()
	content, _ := json.Marshal(friendsData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)
}

func getPosts(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	postData := PostTable.Get()
	content, _ := json.Marshal(postData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)
}

func createPost(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	var postData posts.PostFields
	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &postData)
		if err != nil {
			panic(err)
		}
		if session.Username == "" {
			postData.Error = "Cannot Add Post, please Sign Up or Log In"

		} else if (len(postData.Thread) == 0) && (postData.Image == "") && (postData.Text == "") {
			postData.Error = "please add content or close"
		} else {
			postData.Id = sessions.Generate()
			postData.Image = misc.ConvertImage("post", postData.Image, postData.ImageType, postData.Id)
			postData.Author = session.Username
			// fmt.Println("postData", postData)
			PostTable.Add(postData)
		}

		// displayInfo("posts")
		content, _ := json.Marshal(postData)
		// fmt.Println("postData", string(content))
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
	}
}

func homepage(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/" {
		return
	}

	t, err := template.ParseFiles("./ui/templates/homepage.html")
	if err != nil {
		fmt.Println(("homepage error template not found"))
		return
	}
	t.Execute(w, nil)
}

func checkUserLogin(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.URL.Path != "/checklogin" {
		return
	}
	content, _ := json.Marshal(session)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)

}

func displayInfo(table string) {
	switch table {
	case "user":
		row, err := UserTable.Data.Query(`SELECT * FROM "user"`)
		if err != nil {
			log.Fatal(err)
		}

		defer row.Close()
		for row.Next() { // Iterate and fetch the records from result cursor
			var firstName, lastName, dateOfBirth, gender, username, email, password string
			err1 := row.Scan(&firstName, &lastName, &dateOfBirth, &gender, &username, &email, &password)
			if err1 != nil {
				fmt.Println("error with scanning rows in", err1)
				// return err
			}
			fmt.Println("first name:=", firstName, "last name:=", lastName, "DoB:=", dateOfBirth, "gender:=", gender, "username:=", username, "email:=", email, "password:=", password)
		}
	case "posts":
		row, err := PostTable.Data.Query(`SELECT * FROM "posts"`)
		if err != nil {
			log.Fatal(err)
		}
		defer row.Close()

		for row.Next() {
			var id, author, image, text, thread string
			var time int
			err1 := row.Scan(&id, &author, &image, &text, &thread, &time)
			if err1 != nil {
				fmt.Println("error with scanning rows in", err1)
				// return err
			}
			fmt.Println("postID:=", id, "author:=", author, "image-location:=", image, "text:=", text, "threads:=", thread, "time:=", time)
		}
	}
}

func setUpHandlers() {
	mux := http.NewServeMux()

	//fileS sends the ui folder to the server
	fileS := http.FileServer(http.Dir("./ui/"))
	// the first parameter is a handler, the second parameter strips the prefix from the URL ,
	// and forwards the request to the attached/corresponding directory

	// For example:
	// To serve a directory on disk (/tmp) under an alternate URL
	// path (/tmpfiles/), use StripPrefix to modify the request
	// URL's path before the FileServer sees it:
	// http.Handle("/tmpfiles/",
	// 	http.StripPrefix("/tmpfiles/", http.FileServer(http.Dir("/tmp"))))

	// 	FileServer() is told the root of static files is "/tmp". We want the URL to start with "/tmpfiles/".
	//  So if someone requests "/tempfiles/example.txt", we want the server to send the file "/tmp/example.txt".
	// In order to achieve this, we have to strip "/tmpfiles" from the URL, and the remaining will be the relative
	// path compared to the root folder "/tmp" which if we join gives:
	// /tmp/example.txt

	mux.Handle("/ui/", http.StripPrefix("/ui/", fileS))

	mux.HandleFunc("/", sessions.Middleware(homepage))
	mux.HandleFunc("/checklogin", sessions.Middleware(checkUserLogin))
	mux.HandleFunc("/signup", sessions.Middleware(signUp))
	mux.HandleFunc("/login", sessions.Middleware(login))
	mux.HandleFunc("/profile", sessions.Middleware(profile))
	mux.HandleFunc("/friends", sessions.Middleware(friends))
	mux.HandleFunc("/createPost", sessions.Middleware(createPost))
	mux.HandleFunc("/getPosts", sessions.Middleware(getPosts))
	mux.HandleFunc("/chat", sessions.Middleware(Chat))
	go mux.HandleFunc("/ws", sessions.Middleware(serveWs))
	go h.run()
	fmt.Println("Starting Server")
	fmt.Println("Please open http://localhost:8000/")
	if err := http.ListenAndServe(":8000", mux); err != nil {
		log.Fatal(err)
	}
}

func initDB() {
	db, _ := sql.Open("sqlite3", "./internal/forumDataBase.db")
	UserTable = users.CreateUserTable(db)
	PostTable = posts.CreatePostTable(db)
}

func main() {
	initDB()
	setUpHandlers()
}
