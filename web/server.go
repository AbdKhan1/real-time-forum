package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"

	"time"
	// "math"

	users "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/Users"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/misc"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/sessions"

	_ "github.com/mattn/go-sqlite3"
)

var (
	UserTable *users.UserData
)

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
	w.Write(content)
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

func displayInfo() {
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
	mux.HandleFunc("/signup", sessions.Middleware(signUp))
	mux.HandleFunc("/login", sessions.Middleware(login))

	fmt.Println("Starting Server")
	fmt.Println("Please open http://localhost:8000/")
	if err := http.ListenAndServe(":8000", mux); err != nil {
		log.Fatal(err)
	}
}

func initDB() {
	db, _ := sql.Open("sqlite3", "./internal/forumDataBase.db")
	UserTable = users.CreateUserTable(db)
}

func main() {
	initDB()
	setUpHandlers()
}
