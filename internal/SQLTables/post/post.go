package posts

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/comments"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/likes"
)

type PostData struct {
	Data *sql.DB
}

func CreatePostTable(db *sql.DB) *PostData {
	stmt, _ := db.Prepare(`
		CREATE TABLE IF NOT EXISTS "posts" (
			"id"		TEXT NOT NULL UNIQUE,
			"author"	TEXT NOT NULL,
			"image"		TEXT,
			"text"		TEXT,
			"thread"	TEXT,
			"time"		NUMBER,
			PRIMARY KEY("id")
		);
	`)
	stmt.Exec()
	return &PostData{
		Data: db,
	}
}

func (postData *PostData) Add(postFields PostFields) {

	stmt, _ := postData.Data.Prepare(`INSERT into "posts" 
	(id,author,image,text,thread,time) VALUES (?,?,?,?,?,?);`)
	stmt.Exec(postFields.Id, postFields.Author, postFields.Image, postFields.Text, postFields.Thread, postFields.Time)
}

func (posts *PostData) Get(LD *likes.LikesData) []PostFields {
	sliceOfPostTableRows := []PostFields{}
	rows, _ := posts.Data.Query(`SELECT * FROM "posts"`)
	var id string
	var author string
	var image string
	var text string
	var thread string
	var time int

	for rows.Next() {
		rows.Scan(&id, &author, &image, &text, &thread, &time)
		postTableRows := PostFields{
			Id:       id,
			Author:   author,
			Image:    image,
			Text:     text,
			Thread:   thread,
			Time:     time,
			Likes:    len(LD.Get(id, "l")),
			Dislikes: len(LD.Get(id, "d")),
		}
		sliceOfPostTableRows = append(sliceOfPostTableRows, postTableRows)
	}
	rows.Close()
	return sliceOfPostTableRows
}

func (posts *PostData) GetPost(likedPost likes.LikesFields, LD *likes.LikesData) PostFields {
	s := fmt.Sprintf("SELECT * FROM posts WHERE id = '%v'", likedPost.PostId)
	rows, _ := posts.Data.Query(s)
	var id string
	var author string
	var image string
	var text string
	var thread string
	var time int
	var post PostFields

	for rows.Next() {
		rows.Scan(&id, &author, &image, &text, &thread, &time)
		post = PostFields{
			Id:       id,
			Author:   author,
			Image:    image,
			Text:     text,
			Thread:   thread,
			Time:     time,
			Likes:    len(LD.Get(id, "l")),
			Dislikes: len(LD.Get(id, "d")),
		}
	}
	rows.Close()
	return post
}
func (post *PostData) Delete(comment *comments.CommentData, LD *likes.LikesData, id string) {
	currentPost := post.GetPost(likes.LikesFields{PostId: id}, LD)
	fmt.Println("current Post", currentPost)
	stmt, _ := post.Data.Prepare("DELETE FROM posts WHERE id = ?")
	stmt.Exec(id)
	commentImages := comment.Get("", id)
	for _, comments := range commentImages {
		if comments.Image != "" {
			_, err := os.Stat(comments.Image)
			if os.IsNotExist(err) {
				return
			} else {
				e := os.Remove(comments.Image)
				if e != nil {
					log.Fatal(e)
				}
			}
		}
	}
	comment.Delete(id)
	LD.Delete(id)
	_, err := os.Stat(currentPost.Image)
	if os.IsNotExist(err) {
		return
	} else {
		e := os.Remove(currentPost.Image)
		if e != nil {
			log.Fatal(e)
		}
	}
}

func (post *PostData) Update(item PostFields, id string) {
	stmt, _ := post.Data.Prepare(`UPDATE "posts" SET "text" = ?, "thread" = ? WHERE "id" = ?`)
	stmt.Exec(item.Text, item.Thread, id)
}
