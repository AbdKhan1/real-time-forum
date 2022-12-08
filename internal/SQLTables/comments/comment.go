package comments

import (
	"database/sql"
	"fmt"
)

type CommentData struct {
	Data *sql.DB
}

func NewCommentTable(db *sql.DB) *CommentData {
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "comments" (
			"commentid" TEXT NOT NULL UNIQUE,
			"postid"	TEXT NOT NULL,
			"author"	TEXT NOT NULL,
			"image"		TEXT,
			"text"		TEXT,
			"time"		NUMBER,
		);
	`)
	stmt.Exec()
	return &CommentData{
		Data: db,
	}
}

func (comment *CommentData) Add(commentFields CommentFields) {
	stmt, _ := comment.Data.Prepare(`INSERT INTO "comments" (commentid, postid, author, image, text, time) values(?, ?, ?, ?, ?, ?)`)
	_, err := stmt.Exec(commentFields.CommentId, commentFields.PostId, commentFields.Author, commentFields.Image, commentFields.Text,commentFields.Time)
	fmt.Println(commentFields)
	fmt.Println(err)
}

func (comment *CommentData) Get(commentsLikesData , str string) []CommentFields {
	s := fmt.Sprintf("SELECT * FROM comments WHERE postid = '%v'", str)

	sliceOfCommentRows := []CommentFields{}
	rows, _ := comment.Data.Query(s)
	var commentid, postid, author,image, text string
	var time int

	for rows.Next() {
		rows.Scan(&commentid, &postid, &author, &image, &text, &time)
		commentRows := CommentFields{
			CommentId: commentid,
			PostId:    postid,
			Author:    author,
			Image:   image,
			Text: text,
			Time: time,
			// Likes:     len(commentsLikesData.Get(commentid, "l")),
			// Dislikes:  len(commentsLikesData.Get(commentid, "d")),
		}
		sliceOfCommentRows = append(sliceOfCommentRows, commentRows)
	}
	rows.Close()
	return sliceOfCommentRows
}

func (comment *CommentData) Delete(id string) {
	stmt, _ := comment.Data.Prepare(`DELETE FROM "comments" WHERE "commentid" = ?`)
	stmt.Exec(id)
}
