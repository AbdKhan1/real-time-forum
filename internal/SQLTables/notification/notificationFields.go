package notif

type NotifFields struct{
	Receiver string `json:"receiver"`
	ChatroomId string `json:"chatroom-id"`
	NotifNum	int	`json:"notif"`
}
