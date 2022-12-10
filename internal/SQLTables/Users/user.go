package users

import (
	"database/sql"
	"fmt"
)

type UserData struct {
	Data *sql.DB
}

func CreateUserTable(db *sql.DB) *UserData {
	stmt, _ := db.Prepare(`
	CREATE TABLE IF NOT EXISTS "user" (
		"firstName"	TEXT,
		"lastName"	TEXT,
		"dateOfBirth" TEXT,
		"gender" TEXT,
		"username"	TEXT UNIQUE,
		"email"	TEXT NOT NULL UNIQUE,
		"password"	TEXT NOT NULL,
		"image"	TEXT,
		"status" TEXT,
		PRIMARY KEY("username")
	);
`)
	stmt.Exec()

	return &UserData{
		Data: db,
	}
}

func (user *UserData) UpdateStatus(userFields UserFields) error {
	stmt, err := user.Data.Prepare(`
	UPDATE "user" SET status = ? WHERE username = ?
	`)
	if err != nil {
		fmt.Println("error preparing table:", err)
		return err
	}
	_, errorWithTable := stmt.Exec(userFields.Status, userFields.Username)
	if errorWithTable != nil {
		fmt.Println("error adding to table:", errorWithTable)
		return errorWithTable

	}
	fmt.Println("Made user:", userFields.Status)
	return nil
}

func (user *UserData) Add(userFields UserFields) error {
	stmt, err := user.Data.Prepare(`
	INSERT INTO "user" (firstName, lastName, dateOfBirth, gender, username, email, password,image, status) values (?, ?, ?, ?, ?, ?, ?,?,?)
	`)
	if err != nil {
		fmt.Println("error preparing table:", err)
		return err
	}
	_, errorWithTable := stmt.Exec(userFields.FirstName, userFields.LastName, userFields.DateOfBirth, userFields.Gender, userFields.Username, userFields.Email, userFields.Password, userFields.Image, userFields.Status)
	if errorWithTable != nil {
		fmt.Println("error adding to table:", errorWithTable)
		return errorWithTable
	}
	return nil
}

func (user *UserData) Get() []UserFields {
	sliceOfUserTableRows := []UserFields{}
	rows, _ := user.Data.Query(`
	SELECT * FROM "user"
	`)
	var firstName, lastName, dateOfBirth, gender, username, email, password, image, status string

	for rows.Next() {
		rows.Scan(&firstName, &lastName, &dateOfBirth, &gender, &username, &email, &password, &image, &status)
		userTableRows := UserFields{
			FirstName:   firstName,
			LastName:    lastName,
			DateOfBirth: dateOfBirth,
			Gender:      gender,
			Username:    username,
			Email:       email,
			Password:    password,
			Image:       image,
			Status:      status,
		}
		sliceOfUserTableRows = append(sliceOfUserTableRows, userTableRows)
	}
	rows.Close()
	return sliceOfUserTableRows
}

func (user *UserData) GetUser(str string) UserFields {
	s := fmt.Sprintf("SELECT * FROM user WHERE username = '%v'", str)
	rows, _ := user.Data.Query(s)
	var firstName, lastName, dateOfBirth, gender, username, email, password, image, status string
	var userTableRows UserFields
	if rows.Next() {
		rows.Scan(&firstName, &lastName, &dateOfBirth, &gender, &username, &email, &password, &image, &status)
		userTableRows = UserFields{
			FirstName:   firstName,
			LastName:    lastName,
			DateOfBirth: dateOfBirth,
			Gender:      gender,
			Username:    username,
			Email:       email,
			Password:    password,
			Image:       image,
			Status:      status,
		}
	}
	rows.Close()
	return userTableRows
}
