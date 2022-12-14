package notif

type NotifFields struct {
	Sender        string `json:"sender"`
	Receiver      string `json:"receiver"`
	NumOfMessages int    `json:"numOfMessages"`
	Date          int    `json:"date"`
	TotalNumber   int    `json:"receiver-total-notifs"`
}

type NotifType struct {
	Type       string `json:"notification-type"`
	FriendName string `json:"friend-name"`
}
