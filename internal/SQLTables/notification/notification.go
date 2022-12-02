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
	n := fmt.Sprintf(`SELECT * FROM notifications WHERE receiver = '%v' AND id ='%v'`, user, chatroomId)
	rows, _ := notif.Data.Query(n)
	var receiver, id string
	var notifNum int

	for rows.Next() {
		err := rows.Scan(&receiver, &id, &notifNum)
		if err != nil {
			fmt.Println("error finding notifications", err)
		}
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
	n := fmt.Sprintf(`SELECT * FROM notifications WHERE receiver = '%v'`, user)
	rows, _ := notif.Data.Query(n)
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
	stmt, err := notif.Data.Prepare(`UPDATE "notifications" SET "notif" = ? WHERE "receiver" = ? AND "id"=?`)
	if err != nil {
		fmt.Println("update notification error", err)
	}
	stmt.Exec(item.NotifNum, item.Receiver, item.ChatroomId)
}
