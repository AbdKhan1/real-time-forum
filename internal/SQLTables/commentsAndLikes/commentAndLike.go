package commentsAndLikes

import (
	"database/sql"
	"fmt"
)

type CommentsAndLikesData struct {
	Data *sql.DB
}

func CreateLikesAndCommentsTable(db *sql.DB) *CommentsAndLikesData {
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "likescom" (
			"comid"	TEXT NOT NULL,
			"username"	TEXT NOT NULL,
			"like"	TEXT
		);
	`)
	stmt.Exec()

	return &CommentsAndLikesData{
		Data: db,
	}
}

func (likes *CommentsAndLikesData) GetOne(id, user string) CommentsAndLikesFields {
	commentsAndLikesRows := CommentsAndLikesFields{}

	s := fmt.Sprintf("SELECT * FROM likescom WHERE comid = '%v' AND username = '%v'", id, user)

	rows, _ := likes.Data.Query(s)
	var comid string
	var author string
	var like string
	if rows.Next() {
		rows.Scan(&comid, &author, &like)
		commentsAndLikesRows = CommentsAndLikesFields{
			CommentId: comid,
			Username:  author,
			Like:      like,
		}
	}
	rows.Close()
	return commentsAndLikesRows
}

func (likes *CommentsAndLikesData) Add(commentLiked CommentsAndLikesFields) {
	likedComment := likes.GetOne(commentLiked.CommentId, commentLiked.Username)
	var s string
	if likedComment.Like == "" {
		s = "INSERT INTO likescom (like, comid, username) values (?, ?, ?)"
	} else if commentLiked.Like != likedComment.Like {
		s = "UPDATE likescom SET like = ? WHERE comid = ? AND username = ?"
	} else {
		s = "DELETE FROM likescom WHERE like = ? AND comid = ? AND username = ?"
	}
	stmt, _ := likes.Data.Prepare(s)
	stmt.Exec(commentLiked.Like, commentLiked.CommentId, commentLiked.Username)
}

func (likes *CommentsAndLikesData) Get(id, l string) []CommentsAndLikesFields {
	sliceOfCommentsAndLikesRows := []CommentsAndLikesFields{}
	var s string
	if l == "all" {
		s = fmt.Sprintf("SELECT * FROM likescom WHERE username = '%v'", id)

	} else {
		s = fmt.Sprintf("SELECT * FROM likescom WHERE comid = '%v' AND like = '%v'", id, l)

	}

	rows, _ := likes.Data.Query(s)
	var postid string
	var author string
	var like string
	for rows.Next() {
		rows.Scan(&postid, &author, &like)
		commentsAndLikesRows := CommentsAndLikesFields{
			CommentId: postid,
			Username:  author,
			Like:      like,
		}
		sliceOfCommentsAndLikesRows = append(sliceOfCommentsAndLikesRows, commentsAndLikesRows)
	}
	rows.Close()
	return sliceOfCommentsAndLikesRows
}

func (commentLikes *CommentsAndLikesData) Delete(id string) {
	stmt, _ := commentLikes.Data.Prepare(`DELETE FROM "likescom" WHERE "comid" = ?`)
	stmt.Exec(id)
}
