package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
)

type registrationInfo struct {
	FirstName   string `json:"first-name"`
	LastName    string `json:"last-name"`
	DateOfBirth string `json:"date-of-birth"`
	Gender      string `json:"gender"`
	Username    string `json:"username-register"`
	Email       string `json:"email-register"`
	Password    string `json:"password-register"`
}

// this sends the inputs in the registration from to the username handleFunc.
func signUp(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/signup" {
		// errorHandler(w, r, http.StatusBadRequest)
		fmt.Println("error no /signup found")
	}

	var registrationData registrationInfo

	if r.Method != "POST" {

	} else {
		body, err := ioutil.ReadAll(r.Body)
		if err != nil {
			panic(err)
		}
		// log.Println(string(body))

		err = json.Unmarshal(body, &registrationData)
		if err != nil {
			panic(err)
		}
	}

	fmt.Println("registration Data", registrationData)

	fmt.Println("first name", registrationData.FirstName)
	fmt.Println("last name", registrationData.LastName)
	fmt.Println("DOB", registrationData.DateOfBirth)
	fmt.Println("Gender", registrationData.Gender)
	fmt.Println("Username", registrationData.Username)
	fmt.Println("Email", registrationData.Email)
	fmt.Println("Password", registrationData.Password)
}

func homepage(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		fmt.Println("error registration page")
		return
	}

	t, err := template.ParseFiles("./ui/templates/homepage.html")
	if err != nil {
		fmt.Println(("homepage error template not found"))
		return
	}
	t.Execute(w, nil)

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

	fmt.Println("Starting Server")
	fmt.Println("Please open http://localhost:8000/")
	if err := http.ListenAndServe(":8000", mux); err != nil {
		log.Fatal(err)
	}
}

func main() {
	setUpHandlers()
}
