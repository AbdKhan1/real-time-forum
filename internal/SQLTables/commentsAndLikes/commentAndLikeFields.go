package commentsAndLikes

type CommentsAndLikesFields struct {
	CommentId string `json:"comment-id"`
	Username  string `json:"username"`
	Like      string `json:"comment-like"`
	Type      string `json:"type"`
}

type ReturnCommentLikesFields struct {
	CommentId string `json:"comment-id"`
	Like      int    `json:"comment-likes"`
	Dislike   int    `json:"comment-dislikes"`
}
