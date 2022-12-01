package notif

import (
	"database/sql"
	"fmt"
)

type NotifData struct {
	Data *sql.DB
}

func CreateNotifTable(db *sql.DB) *NotifData {
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "notifications" (
			"receiver"	TEXT NOT NULL,
			"id"		TEXT NOT NULL,
			"notif"		NUMBER
		);
	`)
	stmt.Exec()
	return &NotifData{
		Data: db,
	}
}

func (notif *NotifData) Add(notifFields *NotifFields) error {
	stmt, err := notif.Data.Prepare(`
	INSERT INTO "notifications" (receiver,id,notif) values (?, ?, ?)
	`)
	if err != nil {
		fmt.Println("error preparing table:", err)
		return err
	}
	_, errorWithTable := stmt.Exec(notifFields.Receiver, notifFields.ChatroomId, notifFields.NotifNum)
	if errorWithTable != nil {
		fmt.Println("error adding to table:", errorWithTable)
		return errorWithTable
	}
	return nil
}

func (notif *NotifData) Get(user, chatroomId string) NotifFields {
	var friendNotif NotifFields
	rows, _ := notif.Data.Query(`SELECT * FROM "notifications" WHERE receiver= '%v' AND id='%v' `, user, chatroomId)
	var receiver, id string
	var notifNum int

	for rows.Next() {
		rows.Scan(&receiver, &id, &notifNum)
		friendNotif = NotifFields{
			Receiver:   receiver,
			ChatroomId: id,
			NotifNum:   notifNum,
		}
	}
	rows.Close()

	return friendNotif
}

func (notif *NotifData) TotalNotifs(user string) int {
	sliceOfNotifFields := []NotifFields{}

	rows, _ := notif.Data.Query(`SELECT * FROM "notifications" WHERE receiver= '%v'`, user)
	var receiver, id string
	var notifNum int

	for rows.Next() {
		rows.Scan(&receiver, &id, &notifNum)
		notifTableRows := NotifFields{
			Receiver:   receiver,
			ChatroomId: id,
			NotifNum:   notifNum,
		}
		sliceOfNotifFields = append(sliceOfNotifFields, notifTableRows)
	}
	rows.Close()

	var totalNotifsCounter int

	for i := range sliceOfNotifFields {
		totalNotifsCounter += sliceOfNotifFields[i].NotifNum
	}

	return totalNotifsCounter
}

func (notif *NotifData) Update(item NotifFields) {
	stmt, _ := notif.Data.Prepare(`UPDATE "notifications" SET "notifNum" = ? WHERE "receiver" = ? AND "id"=?`)
	stmt.Exec(item.NotifNum, item.Receiver, item.ChatroomId)
}
