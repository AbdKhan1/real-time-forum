package chat

type ChatFields struct {
	Id        string `json:"id"`
	User1     string `json:"user1"`
	User2     string `json:"user2"`
	MessageId string `json:"message-id"`
	Message   string `json:"message"`
	Date      int    `json:"date"`
}
