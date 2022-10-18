package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"

	// "time"
	// "math"

	users "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/Users"

	_ "github.com/mattn/go-sqlite3"
)

var (
	UserTable *users.UserData
)

// func calculateAge(dob string) int {
// 	// Format of timestamp
// 	format := "2006-01-02" // Mon Jan 2

// 	// Parse the timestamp so that it's stored in time.Time
// 	cur, err := time.Parse(format, dob)
// 	if err != nil {
// 		panic(err)
// 	}
// 	// Current time
// 	now := time.Now()
// 	now = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

// 	// As both are of type time.Time, it's subtractable
// 	dur := now.Sub(cur)

// 	// Print duration (in Years)
// 	return int(math.Trunc(dur.Seconds() / 31560000))
// }

// var registrationData = make(map[string]interface{})

// recieves user input from the registration page and inserts it into the user table in the SQL database.
func signUp(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/signup" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /signup found")
	}

	var registrationData users.UserFields

	if r.Method != "POST" {
	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}

		err = json.Unmarshal(body, &registrationData)
		if err != nil {
			panic(err)
		}
	}

	// content, _ := json.Marshal(registrationData)
	// w.Header().Set("Content-Type", "application/json")
	// w.Write(content)

	fmt.Println("registration Data", registrationData)
	UserTable.Add(registrationData)
	displayInfo()
}

func login(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/login" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /login found")
	}
	var loginData users.UserFields
	if r.Method != "POST" {
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
	// this method returns a single row of the information requested within the query that corresponds with the identification key used (i.e username) if it exists
	// It then stores the request information in the corresponding variable addresses. Once we check verify that that user exists and the passwords match,we send user to the homepage.
	row := UserTable.Data.QueryRow("SELECT * from user WHERE lastName= ?", loginData.LastName)
	var firstName, lastName, dateOfBirth, gender, username, email, password string
	switch err := row.Scan(&firstName, &lastName, &dateOfBirth, &gender, &username, &email, &password); err {
	case sql.ErrNoRows:
		fmt.Println("No rows were returned!")
	case nil:
		fmt.Println("first name:=",firstName, "last name:=",lastName,"DoB:=", dateOfBirth,"gender:=",gender, "username:=",username,"email:=",email,"password:=",password)
		fmt.Println(firstName + " Info Found.")
	default:
		panic(err)
	}

}

func homepage(w http.ResponseWriter, r *http.Request) {
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
		fmt.Println("first name:=",firstName, "last name:=",lastName,"DoB:=", dateOfBirth,"gender:=",gender, "username:=",username,"email:=",email,"password:=",password)
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

	mux.HandleFunc("/", homepage)
	mux.HandleFunc("/signup", signUp)
	mux.HandleFunc("/login", login)

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
