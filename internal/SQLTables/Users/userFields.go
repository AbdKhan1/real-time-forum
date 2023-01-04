package users

type UserFields struct {
	FirstName   string `json:"first-name"`
	LastName    string `json:"last-name"`
	DateOfBirth string `json:"date-of-birth"`
	Gender      string `json:"gender"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Image       string `json:"user-image"`
	ImageType   string `json:"user-image-type"`
	Success     bool   `json:"success"`
	Error       string `json:"error"`
	Status      string `json:"status"`
}

type OnlineFriendsStatus struct {
	OnlineFriends []string     `json:"online-friends-list"`
	Friends       []UserFields `json:"friends-list"`
}

type LoginFields struct {
	UsernameOrEmail string `json:"username-email"`
	Password        string `json:"password"`
}
