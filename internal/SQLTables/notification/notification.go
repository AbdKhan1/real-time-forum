package notif

import (
	"database/sql"
	"fmt"
)

type NotifData struct {
	Data *sql.DB
}

func CreateNotifTable(db *sql.DB) *NotifData {
	stmt, err := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "notifications" (
			"sender" TEXT NOT NULL,
			"receiver"	TEXT NOT NULL,
			"numOfMessages"	NUMBER,
			"date" NUMBER
		);
	`)
	if err != nil {
		fmt.Println(err, "error creating notif table.")
		return &NotifData{}
	}
	stmt.Exec()
	return &NotifData{
		Data: db,
	}
}

func (notif *NotifData) Add(notifFields *NotifFields) error {
	stmt, err := notif.Data.Prepare(`
	INSERT INTO "notifications" (sender,receiver,numOfMessages,date) values (?,?,?,?)
	`)
	if err != nil {
		fmt.Println("error preparing table:", err)
		return err
	}
	_, errorWithTable := stmt.Exec(notifFields.Sender, notifFields.Receiver, notifFields.NumOfMessages, notifFields.Date)
	if errorWithTable != nil {
		fmt.Println("error adding to table:", errorWithTable)
		return errorWithTable
	}
	_, errorWithTable2 := stmt.Exec(notifFields.Receiver, notifFields.Sender, notifFields.NumOfMessages, notifFields.Date)
	if errorWithTable2 != nil {
		fmt.Println("error adding to table2:", errorWithTable2)
		return errorWithTable2
	}
	return nil
}

func (notif *NotifData) Get(user1, user2 string) NotifFields {
	var friendNotif NotifFields
	n := fmt.Sprintf(`SELECT * FROM notifications WHERE receiver = '%v' AND sender ='%v'`, user2, user1)
	rows, err := notif.Data.Query(n)
	var sender, receiver string
	var notifNum, date int
	if err != nil {
		fmt.Println(err, "error finding notifications in table.")
		return friendNotif
	}
	for rows.Next() {
		err := rows.Scan(&sender, &receiver, &notifNum, &date)
		if err != nil {
			fmt.Println("error finding notifications", err)
		}
		friendNotif = NotifFields{
			Sender:        sender,
			Receiver:      receiver,
			NumOfMessages: notifNum,
			Date:          date,
		}
	}
	rows.Close()
	return friendNotif
}

func (notif *NotifData) TotalNotifs(user string) int {
	sliceOfNotifFields := []NotifFields{}
	n := fmt.Sprintf(`SELECT * FROM notifications WHERE receiver = '%v'`, user)
	rows, err := notif.Data.Query(n)
	var sender, receiver string
	var notifNum, date int
	if err != nil {
		fmt.Println(err, "error getting TotalNs")
	}

	for rows.Next() {
		rows.Scan(&sender, &receiver, &notifNum, &date)
		notifTableRows := NotifFields{
			Sender:        sender,
			Receiver:      receiver,
			NumOfMessages: notifNum,
			Date:          date,
		}
		sliceOfNotifFields = append(sliceOfNotifFields, notifTableRows)
	}
	rows.Close()
	var totalNotifsCounter int
	for i := range sliceOfNotifFields {
		totalNotifsCounter += sliceOfNotifFields[i].NumOfMessages
	}
	return totalNotifsCounter
}

func (notif *NotifData) Update(item NotifFields) {
	result, err := notif.Data.Exec("UPDATE notifications SET numOfMessages = ?, date = ? WHERE sender = ? AND receiver = ?", item.NumOfMessages, item.Date, item.Sender, item.Receiver)
	if err != nil {
		fmt.Println(err, "error executing update notifications.")
	}
	fmt.Println(result.RowsAffected())
}
