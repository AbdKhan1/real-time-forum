package notif

type NotifFields struct {
	Receiver   string `json:"receiver"`
	ChatroomId string `json:"chatroom-id"`
	NotifNum   int    `json:"notif"`
}

type NotifType struct {
	Type       string `json:"notification-type"`
	FriendName string `json:"friend-name"`
}
