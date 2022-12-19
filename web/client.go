package main

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"sync"

	"github.com/gorilla/websocket"
	users "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/Users"
	chat "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/chat"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/commentsAndLikes"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/likes"
	notif "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/notification"
	posts "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/post"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/sessions"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}
var mutex = &sync.RWMutex{}

// connection is an middleman between the websocket connection and the hub.
type connection struct {
	// The websocket connection.
	ws *websocket.Conn

	// Buffered channel of outbound messages.
	send chan chat.ChatFields
}

// readPump pumps messages from the websocket connection to the hub.
func (s subscription) readPump() {
	c := s.conn
	defer func() {
		h.unregister <- s
		c.ws.Close()
	}()
	var notifMap = make(map[string]*notif.NotifFields)
	for {
		var chatFields chat.ChatFields
		err := c.ws.ReadJSON(&chatFields)
		chatFields.Id = s.room
		chatFields.MessageId = sessions.Generate()

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			filter.delete(s.sessionId)
			return
		}
		m := message{chatFields, s.room}
		ChatTable.Add(chatFields, mutex)
		h.broadcast <- m

		//send notifications if only one user has opened a chat and messaging
		receiverNotif := NotifTable.Get(chatFields.User1, chatFields.User2)
		if len(h.rooms[s.room]) == 2 || s.name == receiverNotif.Receiver {
			receiverNotif.NumOfMessages = 0
			NotifTable.Update(receiverNotif, mutex)
		}
		if len(h.rooms[s.room]) == 1 {
			receiverNotif.NumOfMessages++
			receiverNotif.Date = chatFields.Date
			NotifTable.Update(receiverNotif, mutex)
			receiverNotif.TotalNumber = NotifTable.TotalNotifs(receiverNotif.Receiver)
			notifMap[chatFields.User2] = &receiverNotif
			statusH.notify <- notifMap
		}

	}

}

// writePump pumps messages from the hub to the websocket connection.
func (s *subscription) writePump() {
	c := s.conn
	defer func() {
		c.ws.Close()
	}()
	for {
		message, ok := <-c.send
		if !ok {
			filter.delete(s.sessionId)
			c.ws.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}
		err := c.ws.WriteJSON(message)
		if err != nil {
			filter.delete(s.sessionId)
			fmt.Println("error writing to chat:", err)
			return
		}
	}
}

type uuidOfChat struct {
	id chan string
}

var jsIdOut = make(chan string)

// ranging over the current sessions find the session with the javascript username and store the uuid into that session from the store of chat maps
func StoreChatIdInJsUsername(chats <-chan *storeMapOfChats, sessionWithMap <-chan *sessions.Session, sessionWithoutMap <-chan *sessions.Session) <-chan string {
	mapChat := mapOfChats{ChatId: make(map[string]map[string]string)}
	go func() {
		session := <-sessionWithMap
		sessionWithoutMap := <-sessionWithoutMap
		chats := <-chats
		for uuid := range chats.Chats {
			mappedChatIdOfUser1 := chats.Chats[uuid][session.Username]
			if uuid == mappedChatIdOfUser1.ChatId[session.Username][sessionWithoutMap.Username] {
				if len(chats.Chats[uuid]) < 2 {
					if mapChat.ChatId[sessionWithoutMap.Username] == nil {
						storedChats.m.Lock()
						mapChat.ChatId[sessionWithoutMap.Username] = make(map[string]string)
						mapChat.ChatId[sessionWithoutMap.Username][session.Username] = uuid
						sliceOfChats = append(sliceOfChats, &mapChat)
						storedChats.Chats[uuid][sessionWithoutMap.Username] = mapChat
						storedChats.m.Unlock()
						jsIdOut <- uuid
						fmt.Println("sending js user id")

						return
					}
				} else {
					jsIdOut <- uuid
					fmt.Println("sent js user id again as two users already connected.")
					return
				}
			}
		}
		fmt.Println("could not find any matches.")
	}()
	return jsIdOut
}

var sessionIdOut = make(chan string)

func getChatId(in <-chan *storeMapOfChats, sessionIn <-chan *sessions.Session, jsdata <-chan string) <-chan string {
	wg.Wait()
	go func() {
		session := <-sessionIn
		jsdata := <-jsdata
		mapStored := <-in
		for uuid := range mapStored.Chats {
			mappedChat := mapStored.Chats[uuid][session.Username]
			for jsUsername, uuidOfMap := range mappedChat.ChatId[session.Username] {
				if jsdata == jsUsername {
					if len(mapStored.Chats[uuid]) < 2 {
						if uuid == uuidOfMap {
							sessionIdOut <- uuid
							return
						}
					} else {
						sessionIdOut <- uuid
						fmt.Println("chats used 2ice. shouldnt come in here anyway.")
						return
					}
				}
			}
		}
	}()
	return sessionIdOut
}

var idOfChat = &uuidOfChat{id: make(chan string)}

// serveWs handles websocket requests from the peer.
func serveChat(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	go func() {
		select {
		case idFromSecondUser := <-StoreChatIdInJsUsername(uuidFromSecondUser, sessionWithMap, sessionWithoutMap):
			fmt.Print("id from second user ")
			idOfChat.id <- idFromSecondUser
			return
		case idFromFirstUser := <-getChatId(uuidsFromChats, sessionInFromLogin, jsName):
			fmt.Print("id from frist user ")
			idOfChat.id <- idFromFirstUser
			return
		}
	}()

	id := <-idOfChat.id
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err.Error())
		return
	}

	c := &connection{send: make(chan chat.ChatFields, 1), ws: ws}
	s := subscription{c, id, session.Username, session.Id}
	h.register <- s
	fmt.Println("sent off subscription with id:", s.room)
	go s.writePump()
	go s.readPump()
}

type onlineClients struct {
	ws               *websocket.Conn
	name             string
	sessionId        string
	sendNotification chan *notif.NotifFields
	sendPostArray    chan posts.PostFields
	sendLikes        chan likes.ReturnLikesFields
	sendCommentLikes chan commentsAndLikes.ReturnCommentLikesFields
}

// find the user connected on the websocket.
func (onlineC *onlineClients) readPump() {
	defer func() {
		statusH.unregister <- onlineC
		onlineC.ws.Close()
	}()
	for {
		var loginData users.UserFields
		err := onlineC.ws.ReadJSON(&loginData)
		loginData = UserTable.GetUser(loginData.Username)
		if onlineC.name == loginData.Username {
			loginData.Status = "Online"
			UserTable.UpdateStatus(loginData, mutex)
		}

		if err != nil || websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
			fmt.Println("closed ws because:", err)

			//convert the error type into a string type then find the number
			//in the error and check if it is a normal closure number from client side.
			errorString := fmt.Sprint(err)
			re := regexp.MustCompile("[0-9]+")
			if re.FindAllString(errorString, -1)[0] == "1000" {
				for key, currentSess := range sessions.SessionMap.Data {
					if currentSess.Id == onlineC.sessionId {
						delete(sessions.SessionMap.Data, key)
					}
				}
			}
			//update the sql table of the user to make their online status offline
			loginData.Status = "Offline"
			UserTable.UpdateStatus(loginData, mutex)
			return
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (onlineC *onlineClients) writePump() {
	defer func() {
		onlineC.ws.Close()
	}()
	for {
		select {
		case notif, ok := <-onlineC.sendNotification:
			if !ok {
				fmt.Println("user is offline.")
				return
			}
			onlineC.ws.WriteJSON(notif)
		case post, ok := <-onlineC.sendPostArray:
			if !ok {
				fmt.Println("user is offline.")
				return
			}
			onlineC.ws.WriteJSON(post)

		case like, ok := <-onlineC.sendLikes:
			if !ok {
				fmt.Println("user is offline.")
				return
			}
			onlineC.ws.WriteJSON(like)
		
		case commentLike, ok := <-onlineC.sendCommentLikes:
			if !ok {
				fmt.Println("user is offline.")
				return
			}
			onlineC.ws.WriteJSON(commentLike)
		}
	}
}

var statusMap = make(map[*websocket.Conn]string)

func serveOnline(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if session.IsAuthorized {
		fmt.Println("comes to make user online...")
		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err.Error())
			return
		}
		sessionOnline := &onlineClients{ws: ws, name: session.Username, sendNotification: make(chan *notif.NotifFields), sendPostArray: make(chan posts.PostFields), sendLikes: make(chan likes.ReturnLikesFields),sendCommentLikes: make(chan commentsAndLikes.ReturnCommentLikesFields), sessionId: session.Id}
		statusMap[ws] = session.Id
		statusH.register <- sessionOnline
		go sessionOnline.readPump()
		go sessionOnline.writePump()
	}
}
