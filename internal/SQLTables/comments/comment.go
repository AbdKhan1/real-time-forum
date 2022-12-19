package comments

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/commentsAndLikes"
)

type CommentData struct {
	Data *sql.DB
}

func CreateCommentTable(db *sql.DB) *CommentData {
	// stmt, err := db.Prepare(`DROP TABLE IF EXISTS comments`)
	// if err != nil {
	// 	log.Fatal("drop table err:= ", err)
	// }
	// stmt.Exec()
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "comments" (
			"commentid" TEXT NOT NULL UNIQUE,
			"postid"	TEXT NOT NULL,
			"author"	TEXT NOT NULL,
			"image"		TEXT,
			"text"		TEXT,
			"thread"	TEXT,
			"time"		NUMBER
		);
	`)
	stmt.Exec()
	return &CommentData{
		Data: db,
	}
}

func (comment *CommentData) Add(commentFields CommentFields) {
	fmt.Println("comments", commentFields)
	stmt, err1 := comment.Data.Prepare(`INSERT INTO "comments" (commentid, postid, author, image, text, thread, time) values(?, ?, ?, ?, ?, ?, ?)`)
	if err1 != nil {
		log.Fatal("error preparing to comment table:= ", err1)
	}
	_, err := stmt.Exec(commentFields.CommentId, commentFields.PostId, commentFields.Author, commentFields.Image, commentFields.Text, commentFields.Thread, commentFields.Time)
	if err != nil {
		log.Fatal("Error adding comment to table", err)
	}
	fmt.Println("added comment to table")
}

func (comment *CommentData) Get(commentsLikesData *commentsAndLikes.CommentsAndLikesData, str string) []CommentFields {
	s := fmt.Sprintf("SELECT * FROM comments WHERE postid = '%v'", str)

	sliceOfCommentRows := []CommentFields{}
	rows, _ := comment.Data.Query(s)
	var commentid, postid, author, image, thread, text string
	var time int

	for rows.Next() {
		rows.Scan(&commentid, &postid, &author, &image, &text, &thread, &time)
		commentRows := CommentFields{
			CommentId: commentid,
			PostId:    postid,
			Author:    author,
			Image:     image,
			Text:      text,
			Thread:    thread,
			Time:      time,
			Likes:     len(commentsLikesData.Get(commentid, "l")),
			Dislikes:  len(commentsLikesData.Get(commentid, "d")),
		}
		sliceOfCommentRows = append(sliceOfCommentRows, commentRows)
	}
	rows.Close()
	return sliceOfCommentRows
}

func (comment *CommentData) GetComment(commentsLikesData *commentsAndLikes.CommentsAndLikesData, str string) CommentFields {
	s := fmt.Sprintf("SELECT * FROM comments WHERE commentid = '%v'", str)
	rows, _ := comment.Data.Query(s)
	var commentid, postid, author, image, thread, text string
	var time int
	var commentPost CommentFields

	for rows.Next() {
		rows.Scan(&commentid, &postid, &author, &image, &text, &thread, &time)
		commentPost = CommentFields{
			CommentId: commentid,
			PostId:    postid,
			Author:    author,
			Image:     image,
			Text:      text,
			Thread:    thread,
			Time:      time,
			Likes:     len(commentsLikesData.Get(commentid, "l")),
			Dislikes:  len(commentsLikesData.Get(commentid, "d")),
		}

	}
	rows.Close()
	return commentPost
}

func (comment *CommentData) Update(item CommentFields) {
	stmt, err := comment.Data.Prepare(`UPDATE "comments" SET "text" = ?, "thread" = ? WHERE "commentid" = ?`)
	if err != nil {
		log.Fatal("error updating comment:= ", err)
	}
	stmt.Exec(item.Text, item.Thread, item.CommentId)
}

func (comment *CommentData) Delete(commentLikes *commentsAndLikes.CommentsAndLikesData, id string) {
	stmt, _ := comment.Data.Prepare(`DELETE FROM "comments" WHERE "commentid" = ?`)
	stmt.Exec(id)
	_, err := os.Stat("ui/commentImages/" + id + ".png")
	if os.IsNotExist(err) {
		return
	} else {
		e := os.Remove("ui/commentImages/" + id + ".png")
		if e != nil {
			log.Fatal(e)
		}
	}
	commentLikes.Delete(id)

}
