package main

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/gorilla/websocket"
	users "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/Users"
	chat "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/chat"
	posts "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/post"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/sessions"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

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
	var notifMap = make(map[string]*notification)
	for {
		var chatFields chat.ChatFields
		err := c.ws.ReadJSON(&chatFields)
		chatFields.Id = s.room
		chatFields.MessageId = sessions.Generate()

		if err != nil {
			// fmt.Println("whats the err buddy?", err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				//reset the counter to 0
				if readAllMsg[s.name] != nil && counterMap[s.name] != nil {
					counterMap[s.name][s.room] = 0
					readAllMsg[s.name][s.room] = false
				}
				log.Printf("error: %v", err)
			}
			break
		}
		ChatTable.Add(chatFields)
		m := message{chatFields, s.room}
		h.broadcast <- m

		//send notifications if only one user has opened a chat and messaging
		receiverNotif := NotifTable.Get(chatFields.User2, s.room)
		if len(h.rooms[s.room]) == 2 {
			receiverNotif.NotifNum = 0
			NotifTable.Update(receiverNotif)
		}
		if len(h.rooms[s.room]) == 1 {
			receiverNotif.NotifNum++
			NotifTable.Update(receiverNotif)
			notifMap[chatFields.User2] = &notification{Sender: chatFields.User1, NumOfMessages: receiverNotif.NotifNum, TotalNumber: NotifTable.TotalNotifs(chatFields.User2)}
			statusH.notify <- notifMap
			fmt.Println("sent off to notify")
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
			if readAllMsg[s.name] != nil && counterMap[s.name] != nil {
				counterMap[s.name][s.room] = 0
				readAllMsg[s.name][s.room] = false
			}
			c.ws.WriteMessage(websocket.CloseMessage, []byte{})
			return
		}
		err := c.ws.WriteJSON(message)
		if err != nil {
			if readAllMsg[s.name] != nil && counterMap[s.name] != nil {
				counterMap[s.name][s.room] = 0
				readAllMsg[s.name][s.room] = false
			}
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
						mapChat.ChatId[sessionWithoutMap.Username] = make(map[string]string)
						mapChat.ChatId[sessionWithoutMap.Username][session.Username] = uuid
						sliceOfChats = append(sliceOfChats, &mapChat)

						//store the map of chat into a storage of chats
						//there should only be two users associated with the uuid
						storedChats.Chats[uuid][sessionWithoutMap.Username] = mapChat
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
		time.Sleep(5000)
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
	s := subscription{c, id, session.Username}
	h.register <- s
	fmt.Println("sent off subscription with id:", s.room)
	go s.writePump()
	go s.readPump()
}

type onlineClients struct {
	ws               *websocket.Conn
	name             string
	sendNotification chan *notification
	sendPostArray    chan posts.PostFields
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
				loginData.Status="Online"
				time.Sleep(5000)
				UserTable.UpdateStatus(loginData)
		}

		if err != nil || websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
			fmt.Println("closed ws because:", err)

			//convert the error type into a string type then find the number
			//in the error and check if it is a normal closure number from client side.
			errorString := fmt.Sprint(err)
			re := regexp.MustCompile("[0-9]+")
			if re.FindAllString(errorString, -1)[0] == "1000" {
				for key, currentSess := range sessions.SessionMap.Data {
					if currentSess.Username == onlineC.name {
						delete(sessions.SessionMap.Data, key)
					}
				}
			}
			//update the sql table of the user to make their online status offline
			loginData.Status = "Offline"
			UserTable.UpdateStatus(loginData)
			break
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (onlineC *onlineClients) writePump() {
	defer func() {
		onlineC.ws.Close()
	}()
	var counter int
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
			counter++
			fmt.Println(counter, "counts the writes sent.")
		}
	}
}

var statusMap = make(map[*websocket.Conn]string)

func serveOnline(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	if session.IsAuthorized {
		ws, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err.Error())
			return
		}
		sessionOnline := &onlineClients{ws: ws, name: session.Username, sendNotification: make(chan *notification), sendPostArray: make(chan posts.PostFields)}
		statusMap[ws] = session.Username
		statusH.register <- sessionOnline
		go sessionOnline.readPump()
		go sessionOnline.writePump()
	}
}
