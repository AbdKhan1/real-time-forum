package misc

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"html/template"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	users "learn.01founders.co/git/gymlad/real-time-forum.git/internal/SQLTables/Users"
	"learn.01founders.co/git/gymlad/real-time-forum.git/web/sessions"

	"golang.org/x/crypto/bcrypt"
)

func calculateAge(dob string) int {
	// Format of timestamp

	format := "2006-01-02" // Mon Jan 2

	// Parse the timestamp so that it's stored in time.Time
	cur, _ := time.Parse(format, dob)

	// Current time
	now := time.Now()
	now = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	// As both are of type time.Time, it's subtractable
	dur := now.Sub(cur)
	return int(math.Trunc(dur.Seconds() / 31560000))
}

func Capitalise(str string) string {
	if strings.Contains(str, "-") {
		strSplit := strings.Split(str, "-")
		for i, word := range strSplit {
			strSplit[i] = strings.Title(word)
		}
		str = strings.Join(strSplit, "-")
		return str
	}
	str = strings.Title(str)
	return str
}

// this receives a password and encrypts it, protect a user's password in the database.
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// this checks whether the inputted string when trying to login matches the encrypted password
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// this determines wither an E-mail exists in the database
func emailExists(UserTable *users.UserData, email string) bool {
	row := UserTable.Data.QueryRow("SELECT email from user where email= ?", email)
	temp := ""
	row.Scan(&temp)
	if temp != "" {
		return true
	}
	return false
}

// this determines wither an username exists in the database
func usernameExists(UserTable *users.UserData, username string) bool {
	row := UserTable.Data.QueryRow("SELECT username from user where username= ?", username)
	temp := ""
	row.Scan(&temp)
	if temp != "" {
		return true
	}
	return false
}

func DataEntryRegistration(UserTable *users.UserData, data users.UserFields) users.UserFields {
	data.FirstName = Capitalise(template.HTMLEscapeString(data.FirstName))
	data.LastName = Capitalise(template.HTMLEscapeString(data.LastName))
	data.DateOfBirth = template.HTMLEscapeString(data.DateOfBirth)
	data.Gender = template.HTMLEscapeString(data.Gender)
	data.Username = template.HTMLEscapeString(data.Username)
	data.Email = template.HTMLEscapeString(data.Email)
	data.Password = template.HTMLEscapeString(data.Password)
	data.Password, _ = hashPassword(data.Password)
	data.Success = true
	data.Error = "Failed Registration! Please Amend: <br>"
	data.Status = "Online"

	data.Image = ConvertImage("user", data.Image, data.ImageType, data.Username)

	if usernameExists(UserTable, data.Username) {
		data.Error += "-Username <br>"
		data.Success = false
	}
	if emailExists(UserTable, data.Email) {
		data.Error += "-Email <br>"
		data.Success = false
	}
	if calculateAge(data.DateOfBirth) < 0 || calculateAge(data.DateOfBirth) > 120 {
		data.Error += "-Please Be Alive <br>"
		data.Success = false
	}
	return data
}

func VerifyLogin(UserTable *users.UserData, data users.UserFields) users.UserFields {
	row := UserTable.Data.QueryRow("SELECT * from user WHERE username= ?", data.Username)
	data.Error = "Failed Log In! Why???<br> "
	var firstName, lastName, dateOfBirth, gender, username, email, password, image, online string
	switch err := row.Scan(&firstName, &lastName, &dateOfBirth, &gender, &username, &email, &password, &image, &online); err {
	case sql.ErrNoRows:
		fmt.Println("No rows were returned!")
		data.Error += "-Username Does Not Exist<br>"
	case nil:
		fmt.Println(data.Username + " Info Found.")
	default:
		panic(err)
	}
	if !CheckPasswordHash(data.Password, password) {
		fmt.Println("Password Incorrect!")
		data.Error += "-Password Is Incorrect<br>"
		data.Success = false
	} else {
		data.Success = true
	}

	data.FirstName = firstName
	data.LastName = lastName
	data.DateOfBirth = dateOfBirth
	data.Gender = gender
	data.Email = email
	data.Image = image
	data.Status = online

	return data
}

func VerifyStatus(UserTable *users.UserData, data users.UserFields) users.UserFields {
	row := UserTable.Data.QueryRow("SELECT * from user WHERE username= ?", data.Username)
	data.Error = "Failed Log In! Why???<br> "
	var firstName, lastName, dateOfBirth, gender, username, email, password, image, online string
	switch err := row.Scan(&firstName, &lastName, &dateOfBirth, &gender, &username, &email, &password, &image, &online); err {
	case sql.ErrNoRows:
		fmt.Println("No rows were returned!")
		data.Error += "-Username Does Not Exist<br>"
	case nil:
		fmt.Println(data.Username + " Info Found.")
	default:
		panic(err)
	}
	data.Success = true
	data.FirstName = firstName
	data.LastName = lastName
	data.DateOfBirth = dateOfBirth
	data.Gender = gender
	data.Email = email
	data.Image = image
	data.Status = online
	return data
}

func AlreadyLoggedIn(r *http.Request) bool {
	c, err := r.Cookie(sessions.COOKIE_NAME)
	if err != nil {
		return false
	}
	sess := sessions.SessionMap.Data[c.Value]
	if sess.Username != "" {
		return true
	}
	return false
}

// https://freshman.tech/snippets/go/image-to-base64/
// https://stackoverflow.com/questions/43212213/base64-string-decode-and-save-as-file
func ConvertImage(where string, imgStr string, imgType string, ID string) string {
	if len([]byte(imgStr)) > 20*1024*1024 {
		return "uploaded image size is too big! (Maximum 20 Mb)"
	}

	if imgStr == "" {
		return ""
	}

	dec, _ := base64.StdEncoding.DecodeString(imgStr)

	if where == "user" {
		filename := ID

		switch imgType {
		case "image/jpeg":
			filename += ".jpg"
		case "image/png":
			filename += ".png"
		case "image/gif":
			filename += ".gif"
		case "audio/mpeg":
			filename += ".mp3"
		case "video/mp4":
			filename += ".mp4"
		}

		f, err := os.Create("ui/userImages/" + filename)
		if err != nil {
			panic(err)
		}
		defer f.Close()

		if _, err := f.Write(dec); err != nil {
			panic(err)
		}
		if err := f.Sync(); err != nil {
			panic(err)
		}
		return "ui/userImages/" + filename
	} else if where == "post" {
		filename := ID

		switch imgType {
		case "image/jpeg":
			filename += ".jpg"
		case "image/png":
			filename += ".png"
		case "image/gif":
			filename += ".gif"
		case "audio/mpeg":
			filename += ".mp3"
		case "video/mp4":
			filename += ".mp4"
		}

		f, err := os.Create("ui/postImages/" + filename)
		if err != nil {
			panic(err)
		}
		defer f.Close()

		if _, err := f.Write(dec); err != nil {
			panic(err)
		}
		if err := f.Sync(); err != nil {
			panic(err)
		}
		return "ui/postImages/" + filename
	} else {
		return ""
	}
}
