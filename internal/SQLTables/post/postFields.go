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
	Time       int    `json:"post-time"`
	Error      string `json:"error"`
}

type MyPosts struct {
	MyPost    []PostFields `json:"my-posts"`
	LikedPost []PostFields `json:"my-liked-posts"`
}

type DeletePost struct {
	PostId    string `json:"delete-post-id"`
}
