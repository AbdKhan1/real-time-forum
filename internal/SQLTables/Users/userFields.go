package users 

type UserFields struct{
	FirstName   string `json:"first-name"`
	LastName    string `json:"last-name"`
	DateOfBirth string `json:"date-of-birth"`
	Gender      string `json:"gender"`
	Username    string `json:"username-register"`
	Email       string `json:"email-register"`
	Password    string `json:"password-register"`
}