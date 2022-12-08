package comments

type CommentFields struct {
	CommentId string `json:"comment-id"`
	PostId    string `json:"post-id"`
	Author    string `json:"comment-author"`
	Image     string `json:"comment-image"`
	ImageType string `json:"comment-image-type"`
	Text      string `json:"comment-text"`
	Thread    string `json:"comment-threads"`
	Time      int    `json:"comment-time"`
	Likes     int    `json:"comment-likes"`
	Dislikes  int    `json:"comment-dislikes"`
	Error     string `json:"comment-error"`
}
