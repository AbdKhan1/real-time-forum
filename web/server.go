package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	users "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/Users"
	chat "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/chat"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/comments"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/commentsAndLikes"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/likes"
	notif "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/notification"
	posts "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/post"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/misc"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/sessions"

	_ "github.com/mattn/go-sqlite3"
)

var (
	UserTable          *users.UserData
	PostTable          *posts.PostData
	ChatTable          *chat.ChatData
	NotifTable         *notif.NotifData
	CommentTable       *comments.CommentData
	LikesDislikesTable *likes.LikesData
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
		session.IsAuthorized = true
		session.Username = loginData.Username
		session.Expiry = time.Now().Add(120 * time.Second)
	}
	content, _ := json.Marshal(loginData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)
}

func profile(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	profileData := UserTable.GetUser(session.Username)
	fmt.Println("profile Data", profileData)
	content, _ := json.Marshal(profileData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)
}

type requestFilter struct {
	counterMap map[string]map[string]int
	readAll    map[string]map[string]bool
	mutex      sync.RWMutex
}

func initRequestFilter() *requestFilter {
	return &requestFilter{counterMap: make(map[string]map[string]int), readAll: make(map[string]map[string]bool)}
}

var filter = initRequestFilter()

func (rq *requestFilter) increment(sessionId, room string) int {
	rq.mutex.Lock()
	defer rq.mutex.Unlock()
	if rq.counterMap[sessionId] == nil {
		rq.counterMap[sessionId] = make(map[string]int)
		rq.counterMap[sessionId][room] = 1
	} else {
		rq.counterMap[sessionId][room]++
	}
	return rq.counterMap[sessionId][room]
}

func (rq *requestFilter) getInt(sessionId, room string) int {
	rq.mutex.RLock()
	defer rq.mutex.RUnlock()
	return rq.counterMap[sessionId][room]
}

func (rq *requestFilter) getBool(sessionId, room string) bool {
	rq.mutex.RLock()
	defer rq.mutex.RUnlock()
	if rq.readAll[sessionId] != nil {
		return rq.readAll[sessionId][room]
	} else {
		rq.readAll[sessionId] = make(map[string]bool)
		return rq.readAll[sessionId][room]
	}
}

func (rq *requestFilter) readAllMessages(sessionId, room string) {
	rq.mutex.Lock()
	defer rq.mutex.Unlock()
	if rq.readAll[sessionId] != nil && rq.counterMap[sessionId] != nil {
		rq.readAll[sessionId][room] = true
	}
}

func (rq *requestFilter) delete(sessionId string) {
	rq.mutex.Lock()
	defer rq.mutex.Unlock()
	if rq.counterMap[sessionId] != nil && rq.readAll[sessionId] != nil {
		delete(rq.counterMap, sessionId)
		delete(rq.readAll, sessionId)
	}
}

func previousChat(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	friendName, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}

	previousChats := ChatTable.GetChat(session.Username, string(friendName))
	var resetChatNotif notif.NotifFields

	if len(previousChats) != 0 {
		moreThanTenMsgs := (len(previousChats) >= 10)
		resetChatNotif = notif.NotifFields{
			Receiver:      session.Username,
			Sender:        string(friendName),
			NumOfMessages: 0,
		}

		//send to javascript "read-all-msgs" if condition is true
		if filter.getBool(session.Id, previousChats[0].Id) {
			content, _ := json.Marshal("read-all-msgs")
			NotifTable.Update(resetChatNotif)
			w.Header().Set("Content-Type", "application/json")
			w.Write(content)
			return
		}

		//minus the previous messages by ten per request.
		if moreThanTenMsgs {
			filter.increment(session.Id, previousChats[0].Id)
			displayMsgs := len(previousChats) - (filter.getInt(session.Id, previousChats[0].Id) * 10)
			switch {
			//if the messages have reached single digits
			case displayMsgs < 0:
				//minus the countermap by one to get the number of remaining indexes instead of a negative number
				remainingMessages := len(previousChats) - ((filter.getInt(session.Id, previousChats[0].Id) - 1) * 10)
				previousChats = previousChats[0:remainingMessages]
				filter.readAllMessages(session.Id, previousChats[0].Id)
			case displayMsgs == 0:
				previousChats = previousChats[displayMsgs : displayMsgs+10]
				filter.readAllMessages(session.Id, previousChats[0].Id)
			default:
				previousChats = previousChats[displayMsgs : displayMsgs+10]
			}
		} else if !moreThanTenMsgs {
			filter.readAllMessages(session.Id, previousChats[0].Id)
		}
		content, _ := json.Marshal(previousChats)
		NotifTable.Update(resetChatNotif)
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
		return
	} else {
		content, _ := json.Marshal("empty")
		NotifTable.Update(resetChatNotif)
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
		return
	}
}

// store the chat id into a channel of stored-chats and output the channel
var wg sync.WaitGroup

func storeChatIdFromSession(sessionsFromLogin *sessions.Session, jsdata string, uuid string) <-chan *storeMapOfChats {
	mapChat := mapOfChats{ChatId: make(map[string]map[string]string)}
	if mapChat.ChatId[sessionsFromLogin.Username] == nil {
		mapChat.ChatId[sessionsFromLogin.Username] = make(map[string]string)
	}
	wg.Add(1)
	go func(wg *sync.WaitGroup) {
		if storedChats.Chats[uuid] == nil {
			storedChats.Chats[uuid] = make(map[string]mapOfChats)

			//store uuid into map of chats
			mapChat.ChatId[sessionsFromLogin.Username][jsdata] = uuid
			sliceOfChats = append(sliceOfChats, &mapChat)
			//store the map of chat into a storage of chats

			//there should only be two users associated with the uuid
			storedChats.Chats[uuid][sessionsFromLogin.Username] = mapChat

			fmt.Println("comes here to store id")
			wg.Done()
			sessionInFromLogin <- sessionsFromLogin
			jsName <- jsdata
			uuidsFromChats <- storedChats
			fmt.Println("sent off data into channels.")
			//it has already been used.
		} else {
			fmt.Println("sent of uuid to user's other device.")
			sessionInFromLogin <- sessionsFromLogin
			jsName <- jsdata
			uuidsFromChats <- storedChats
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
		chatid := ""
		//gets the id from the previously opened-chats of user1 and user2.
		databaseChat := ChatTable.GetChat(session.Username, string(jsUsername))
		if len(databaseChat) >= 1 {
			chatid = databaseChat[0].Id
		} else {
			chatid = sessions.Generate()
			newNotif := &notif.NotifFields{
				Sender:        session.Username,
				Receiver:      string(jsUsername),
				NumOfMessages: 0,
				Date:          0,
			}
			NotifTable.Add(newNotif)
		}

		if session.IsAuthorized && sliceOfChats != nil {
			for _, currentSessinons := range sessions.SessionMap.Data {
				for i := 0; i < len(sliceOfChats); i++ {
					if (sliceOfChats[i] != nil) && currentSessinons.Username == string(jsUsername) && sliceOfChats[i].ChatId[string(jsUsername)][session.Username] != "" {
						sessionWithMap <- currentSessinons
						sessionWithoutMap <- session
						uuidFromSecondUser <- storedChats
						filter.delete(session.Id)
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
						filter.delete(session.Id)
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
	displayInfo("notif")

	friendsData := UserTable.Get()
	content, _ := json.Marshal(friendsData)
	w.Header().Set("Content-Type", "application/json")
	w.Write(content)
}

func friendNotif(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		var notifT notif.NotifType
		err = json.Unmarshal(body, &notifT)
		if err != nil {
			panic(err)
		}
		if notifT.Type == "friend" {
			friendsNotifData := NotifTable.Get(notifT.FriendName, session.Username)
			content, err := json.Marshal(friendsNotifData)
			if err != nil {
				fmt.Println("friend error", err)
			}
			w.Header().Set("Content-Type", "application/json")
			w.Write(content)
		} else if notifT.Type == "total" {
			totalNotifData := NotifTable.TotalNotifs(session.Username)
			for onlineClient := range statusH.onlineClients {
				if session.Username == onlineClient.name {
					onlineClient.sendNotification <- &notif.NotifFields{TotalNumber: totalNotifData}
					filter.delete(session.Id)
					fmt.Println("sent off to write totalNotifcation.")
				}
			}
		}
	}
}

func getPosts(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	postData := PostTable.Get(LikesDislikesTable)
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
			var imagePath string = misc.ConvertImage("post", postData.Image, postData.ImageType, postData.Id)
			if imagePath == "Error Uploading Image" {
				postData.Error = "Error Uploading Image"
			} else if imagePath == "uploaded image size is too big! (Maximum 20 Mb)" {
				postData.Error = "uploaded image size is too big! (Maximum 20 Mb)"
			} else {
				postData.Id = sessions.Generate()
				postData.Image = imagePath
				postData.Author = session.Username
				PostTable.Add(postData)
				for connections := range statusH.onlineClients {
					connections.sendPostArray <- postData
				}
			}
		}
		content, _ := json.Marshal(postData)
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
	}
}

// allows user to like, dislike, view comments and delete post as well return post information for corresponding pop ups
func postInteractions(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	var likeData likes.LikesFields

	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		err = json.Unmarshal(body, &likeData)
		if err != nil {
			panic(err)
		}

		if likeData.Type == "like/dislike" {

			likeData.Username = session.Username
			fmt.Println("incoming like", likeData)
			LikesDislikesTable.Add(likeData)
			// postData := PostTable.GetPost(likeData, LikesDislikesTable)

			for connections := range statusH.onlineClients {
				connections.sendLikes <- likes.ReturnLikesFields{
					PostId:  likeData.PostId,
					Like:    len(LikesDislikesTable.Get(likeData.PostId, "l")),
					Dislike: len(LikesDislikesTable.Get(likeData.PostId, "d")),
				}
			}

		} else if likeData.Type == "delete" {
			PostTable.Delete(CommentTable, LikesDislikesTable, likeData.PostId)
		} else if likeData.Type == "comment" {
			fmt.Println(likeData)
			commentData := CommentTable.Get("", likeData.PostId)
			fmt.Println("post comments:= ", commentData)
			content, _ := json.Marshal(commentData)
			w.Header().Set("Content-Type", "application/json")
			w.Write(content)
		} else {
			postData := PostTable.GetPost(likeData, LikesDislikesTable)
			content, _ := json.Marshal(postData)
			w.Header().Set("Content-Type", "application/json")
			w.Write(content)
		}

	}
}

// edit post
func editPost(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	var postData posts.PostFields
	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		fmt.Println("edit post", string(body))
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &postData)
		if err != nil {
			panic(err)
		}
		if session.Username == "" {
			postData.Error = "Cannot Edit Post, please Sign Up or Log In"

		} else if (len(postData.Thread) == 0) && (postData.Text == "") {
			postData.Error = "please add content to edit post or close"
		} else {
			PostTable.Update(postData, postData.Id)
		}
		content, _ := json.Marshal(postData)
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
	}
}

func createComment(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	var commentData comments.CommentFields
	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &commentData)
		if err != nil {
			panic(err)
		}
		fmt.Println(commentData)
		if session.Username == "" {
			commentData.Error = "Cannot Add Post, please Sign Up or Log In"

		} else if (len(commentData.Thread) == 0) && (commentData.Image == "") && (commentData.Text == "") {
			commentData.Error = "please add content or close"
		} else {
			commentData.CommentId = sessions.Generate()
			var imagePath string = misc.ConvertImage("comment", commentData.Image, commentData.ImageType, commentData.CommentId)
			if imagePath == "Error Uploading Image" {
				commentData.Error = "Error Uploading Image"
			} else if imagePath == "uploaded image size is too big! (Maximum 20 Mb)" {
				commentData.Error = "uploaded image size is too big! (Maximum 20 Mb)"
			} else {
				commentData.Image = imagePath
				commentData.Author = session.Username
				fmt.Println("comment data", commentData)
				CommentTable.Add(commentData)
			}
		}
		content, _ := json.Marshal(commentData)
		w.Header().Set("Content-Type", "application/json")
		w.Write(content)
	}
}

// allows user to like, dislike, and delete post as well return post information for corresponding pop ups
func commentInteractions(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	var likeData commentsAndLikes.CommentsAndLikesFields

	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		err = json.Unmarshal(body, &likeData)
		if err != nil {
			panic(err)
		}

		if likeData.Type == "like/dislike" {

			likeData.Username = session.Username
			// LikesDislikesTable.Add(likeData)
			// commentData := CommentTable.GetComment(likeData, LikesDislikesTable)
			// content, _ := json.Marshal(commentData)
			// w.Header().Set("Content-Type", "application/json")
			// w.Write(content)

		} else if likeData.Type == "delete" {
			CommentTable.Delete(likeData.CommentId)
		}

	}
}

func editComment(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	var commentData comments.CommentFields
	if r.Method != "POST" {
		//bad request
	} else {
		body, err := ioutil.ReadAll(r.Body)
		fmt.Println("edit comment", string(body))
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &commentData)
		if err != nil {
			panic(err)
		}
		if session.Username == "" {
			commentData.Error = "Cannot Edit Comment, please Sign Up or Log In"

		} else if (len(commentData.Thread) == 0) && (commentData.Text == "") {
			commentData.Error = "please add content to edit post or close"
		} else {
			fmt.Println("add", commentData)
			CommentTable.Update(commentData)
		}
		content, _ := json.Marshal(commentData)
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
	mux.HandleFunc("/friendNotif", sessions.Middleware(friendNotif))
	mux.HandleFunc("/createPost", sessions.Middleware(createPost))
	mux.HandleFunc("/getPosts", sessions.Middleware(getPosts))
	mux.HandleFunc("/post-interactions", sessions.Middleware(postInteractions))
	mux.HandleFunc("/editPost", sessions.Middleware(editPost))
	mux.HandleFunc("/createComment", sessions.Middleware(createComment))
	mux.HandleFunc("/comment-interactions", sessions.Middleware(commentInteractions))
	mux.HandleFunc("/editComment", sessions.Middleware(editComment))
	mux.HandleFunc("/previousChat", sessions.Middleware(previousChat))
	mux.HandleFunc("/chat", sessions.Middleware(Chat))
	go h.run()
	go statusH.run()
	mux.HandleFunc("/ws/chat", sessions.Middleware(serveChat))
	mux.HandleFunc("/ws/status", sessions.Middleware(serveOnline))
	fmt.Println("Starting Server")
	fmt.Println("Please open http://localhost:8000/")
	if err := http.ListenAndServe(":8000", mux); err != nil {
		log.Fatal(err)
	}
}

func initDB() {
	db, _ := sql.Open("sqlite3", "./internal/forumDataBase.db")
	NotifTable = notif.CreateNotifTable(db)
	UserTable = users.CreateUserTable(db)
	PostTable = posts.CreatePostTable(db)
	ChatTable = chat.CreateChatTable(db)
	LikesDislikesTable = likes.CreateLikesTable(db)
	NotifTable = notif.CreateNotifTable(db)
	CommentTable = comments.CreateCommentTable(db)
}

func createImageFolders() {
	_, err := os.Stat("./ui/userImages")
	if err != nil {
		if os.IsNotExist(err) {
			err := os.Mkdir("./ui/userImages", 0755)
			if err != nil {
				log.Fatal(err)
			}
		} else {
			// Some other error. The file may or may not exist
			log.Fatal(err)
		}
	}

	_, err1 := os.Stat("./ui/postImages")
	if err1 != nil {
		if os.IsNotExist(err1) {
			err := os.Mkdir("./ui/postImages", 0755)
			if err != nil {
				log.Fatal(err1)
			}
		} else {
			// Some other error. The file may or may not exist
			log.Fatal(err1)
		}
	}

	_, err2 := os.Stat("./ui/commentImages")
	if err2 != nil {
		if os.IsNotExist(err2) {
			err := os.Mkdir("./ui/commentImages", 0755)
			if err != nil {
				log.Fatal(err2)
			}
		} else {
			// Some other error. The file may or may not exist
			log.Fatal(err2)
		}
	}
}

func main() {
	createImageFolders()
	initDB()
	setUpHandlers()
}
