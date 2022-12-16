package likes

type LikesFields struct {
	PostId   string `json:"postID"`
	Username string `json:"username"`
	Like     string `json:"like"`
	Type     string `json:"type"`
}

type ReturnLikesFields struct {
	PostId  string `json:"postID"`
	Like    int    `json:"post-likes"`
	Dislike int    `json:"post-dislikes"`
}
