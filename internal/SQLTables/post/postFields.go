package posts

type PostFields struct {
	Id         string `json:"post-id"`
	Author     string `json:"author"`
	Image      string `json:"post-image"`
	ImageType  string `json:"post-image-type"`
	Text       string `json:"post-text-content"`
	Thread     string `json:"post-threads"`
	Likes      int    `json:"post-likes"`
	Dislikes   int    `json:"post-dislikes"`
	PostAuthor bool   `json:"post-author"`
	Error      string `json:"error"`
}
