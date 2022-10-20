package users

type UserFields struct {
	FirstName   string `json:"first-name"`
	LastName    string `json:"last-name"`
	DateOfBirth string `json:"date-of-birth"`
	Gender      string `json:"gender"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Success     bool   `json:"success"`
	Error       string `json:"error"`
}
