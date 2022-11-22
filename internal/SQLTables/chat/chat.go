package chat

import (
	"database/sql"
	"fmt"
)

type ChatData struct {
	Data *sql.DB
}

func CreateChatTable(db *sql.DB) *ChatData {
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "chat" (
			"id"		TEXT NOT NULL UNIQUE,
			"user1"	TEXT NOT NULL,
			"user2"		TEXT NOT NULL,
			"message"	TEXT,
			PRIMARY KEY("id")
		);
	`)
	stmt.Exec()
	return &ChatData{
		Data: db,
	}
}

func (chat *ChatData) Add(chatFields ChatFields) error {
	stmt, err := chat.Data.Prepare(`
	INSERT INTO "chat" (id,user1,user2,message) values (?, ?, ?, ?)
	`)
	if err != nil {
		fmt.Println("error preparing table:", err)
		return err
	}
	_, errorWithTable := stmt.Exec(chatFields.Id,chatFields.User1,chatFields.User2,chatFields.Message)
	if errorWithTable != nil {
		fmt.Println("error adding to table:", errorWithTable)
		return errorWithTable
	}
	return nil
}
