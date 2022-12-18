package chat

import (
	"database/sql"
	"fmt"
	"sync"
)

type ChatData struct {
	Data *sql.DB
}

func CreateChatTable(db *sql.DB) *ChatData {
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "chat" (
			"id"		TEXT NOT NULL,
			"user1"		TEXT NOT NULL,
			"user2"		TEXT NOT NULL,
			"messageId"	TEXT NOT NULL UNIQUE,
			"message" 	TEXT,
			"date"		NUMBER
		);
	`)
	stmt.Exec()
	return &ChatData{
		Data: db,
	}

}

func (chat *ChatData) Add(chatFields ChatFields, mutex *sync.RWMutex) error {
	stmt, err := chat.Data.Prepare(`
	INSERT INTO "chat" (id,user1,user2,messageId,message,date) values (?, ?, ?, ?,?,?)
	`)
	if err != nil {
		fmt.Println("error preparing table:", err)
		return err
	}
	mutex.Lock()
	_, errorWithTable := stmt.Exec(chatFields.Id, chatFields.User1, chatFields.User2, chatFields.MessageId, chatFields.Message, chatFields.Date)
	if errorWithTable != nil {
		fmt.Println("error adding to table:", errorWithTable)
		mutex.Unlock()
		return errorWithTable
	}
	mutex.Unlock()
	return nil
}

func (chats *ChatData) Get(chatroom string) []ChatFields {
	sliceOfChatFields := []ChatFields{}

	rows, _ := chats.Data.Query(`SELECT * FROM "chat" WHERE id= '%v'`, chatroom)
	var id string
	var user1 string
	var user2 string
	var messageId string
	var message string
	var date int

	for rows.Next() {
		rows.Scan(&id, &user1, &user2, &messageId, &message, &date)
		chatTableRows := ChatFields{
			Id:        id,
			User1:     user1,
			User2:     user2,
			MessageId: messageId,
			Message:   message,
			Date:      date,
		}
		sliceOfChatFields = append(sliceOfChatFields, chatTableRows)
	}
	rows.Close()
	return sliceOfChatFields
}

// maps to every user, their id and then their slice of storred messages.
// var previousChats = make(map[string][]string)
// var sent bool = false

func (chats *ChatData) GetChat(u1, u2 string) []ChatFields {
	chatFields := []ChatFields{}
	s := fmt.Sprintf("SELECT * FROM chat WHERE user1 = '%v' AND user2 = '%v' OR user2='%v' AND user1='%v'", u1, u2, u1, u2)
	rows, err := chats.Data.Query(s)
	var id string
	var user1 string
	var user2 string
	var messageId string
	var message string
	var date int
	if err != nil {
		fmt.Println(err)
		return chatFields
	}
	for rows.Next() {
		rows.Scan(&id, &user1, &user2, &messageId, &message, &date)
		chatTableRows := ChatFields{
			Id:        id,
			User1:     user1,
			User2:     user2,
			MessageId: messageId,
			Message:   message,
			Date:      date,
		}
		chatFields = append(chatFields, chatTableRows)
	}
	rows.Close()
	return chatFields
}

// func (chat *ChatData) Update(chatFields ChatFields) error {
// 	var previousMessages string

// 	if previousChats[chatFields.Id] != nil {
// 		for _, storredMessages := range previousChats[chatFields.Id] {
// 			previousMessages += storredMessages
// 		}
// 	}
// 	//add previous chats to stored messages.
// 	chatFields.StoredMessage = previousMessages + chatFields.StoredMessage

// 	stmt, err := chat.Data.Prepare(`
// 	UPDATE chat SET storedMessage=? WHERE user1=? AND user2=? AND id=?
// 	`)
// 	if err != nil {
// 		fmt.Println("error preparing table:", err)
// 		return err
// 	}
// 	_, errorWithTable := stmt.Exec(chatFields.StoredMessage, chatFields.User1, chatFields.User2, chatFields.Id)
// 	if errorWithTable != nil {
// 		fmt.Println("error adding to table:", errorWithTable)
// 		return errorWithTable
// 	}

// 	_, errorWithTable2 := stmt.Exec(chatFields.StoredMessage, chatFields.User2, chatFields.User1, chatFields.Id)
// 	if errorWithTable2 != nil {
// 		fmt.Println("error adding to table:", errorWithTable2)
// 		return errorWithTable2
// 	}
// 	return nil
// }
