package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	users "learn.01founders.co/git/gymlad/real-time-forum.git/internal/SQLTables/Users"
	chat "learn.01founders.co/git/gymlad/real-time-forum.git/internal/SQLTables/chat"
	"learn.01founders.co/git/gymlad/real-time-forum.git/web/misc"
	"learn.01founders.co/git/gymlad/real-time-forum.git/web/sessions"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
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
	send chan string
}

// readPump pumps messages from the websocket connection to the hub.
func (s subscription) readPump() {
	c := s.conn
	defer func() {
		h.unregister <- s
		c.ws.Close()
	}()
	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error { c.ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		fmt.Println("how many times here.?")
		var chatFields chat.ChatFields
		err := c.ws.ReadJSON(&chatFields)
		chatFields.Id = s.room
		chatFields.MessageId=sessions.Generate()
		//if the chat does not exist, error will return no rows, therefore add the chat.
		// if chatFields.User1 != "" || chatFields.User2 != "" {
		// 	chatFields, err2 := misc.VerifyTableExists(ChatTable, chatFields)
		// 	if err2 != nil {
		// 		ChatTable.Add(chatFields)
		// 	}
		// }

		if err != nil {
			fmt.Println("whats the err buddy?", err)
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		m := message{chatFields.Message, s.room}
		h.broadcast <- m
		//update table per message sent through.
		ChatTable.Add(chatFields)
	}
}

// write writes a message with the given message type and payload.
func (c *connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}

// writePump pumps messages from the hub to the websocket connection.
func (s *subscription) writePump() {
	c := s.conn
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			messageToSend := message
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			err := c.write(websocket.TextMessage, []byte(messageToSend))
			if err != nil {
				return
			}

		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
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
	go func(waitForId *sync.WaitGroup) {
		for session := range sessionWithMap {
			for sessionWithoutMap := range sessionWithoutMap {
				for chats := range chats {
					for uuid, mapStored := range chats.Chats {
						for username, map1 := range mapStored {
							if username == session.Username {
								for usernameWithNoMap, uuidOfMap := range map1.ChatId[username] {
									if uuidOfMap == uuid && usernameWithNoMap == sessionWithoutMap.Username {
										if len(chats.Chats[uuid]) < 2 {
											sessionWithoutMap.ChatId = make(map[string]map[string]string)
											mapChat.ChatId[sessionWithoutMap.Username] = make(map[string]string)

											if sessionWithoutMap.ChatId[sessionWithoutMap.Username] == nil {
												sessionWithoutMap.ChatId[sessionWithoutMap.Username] = make(map[string]string)

												mapChat.ChatId[sessionWithoutMap.Username][session.Username] = uuid
												sliceOfChats = append(sliceOfChats, &mapChat)

												//store uuid into session
												sessionWithoutMap.ChatId[sessionWithoutMap.Username][session.Username] = uuid
												//store the map of chat into a storage of chats
												//there should only be two users associated with the uuid
												storedChats.Chats[uuid][sessionWithoutMap.Username] = mapChat
												jsIdOut <- uuid
												fmt.Println("sending js user id")
												return
											}
										} else {
											jsIdOut <- uuid
											fmt.Println("sent js user id again as two users connected.")
											return
										}
									} else {
										break
									}
								}
							}
						}
					}
				}
			}
		}
		fmt.Println("could not find any matches.")
	}(&waitForId)
	return jsIdOut
}

var sessionIdOut = make(chan string)
var waitForId sync.WaitGroup

func getChatId(in <-chan *storeMapOfChats, sessionIn <-chan *sessions.Session, jsdata <-chan string) <-chan string {
	wg.Wait()
	go func(waitForId *sync.WaitGroup) {
		for session := range sessionIn {
			for jsdata := range jsdata {
				for mapStored := range in {
					for uuid, mapOfChats := range mapStored.Chats {
						for sessionUsername, chatMapOfSessionUser := range mapOfChats {
							if sessionUsername == session.Username {
								for jsUsername, uuidOfMap := range chatMapOfSessionUser.ChatId[sessionUsername] {
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
						}
					}
				}
			}
		}
	}(&waitForId)
	return sessionIdOut
}

var idOfChat = &uuidOfChat{id: make(chan string)}

// serveWs handles websocket requests from the peer.
func serveWs(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
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
	c := &connection{send: make(chan string, 1), ws: ws}
	s := subscription{c, id, session.Username}
	h.register <- s
	fmt.Println("sent off subscription with id:", s.room)
	go s.writePump()
	go s.readPump()
}

type onlineClients struct {
	ws   *websocket.Conn
	name string
}

func (onlineC *onlineClients) readPump() {
	//find the user connected on the websocket.
	for {
		var loginData users.UserFields
		err := onlineC.ws.ReadJSON(&loginData)
		if onlineC.name == loginData.Username {
			loginData = misc.VerifyStatus(UserTable, loginData)
		}
		loginData.Status = "Online"
		UserTable.UpdateStatus(loginData)

		if err != nil || websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) || loginData.Status == "Offline" {
			fmt.Println("closed ws because:", err)
			//update the sql table of the users to make their online status offline
			loginData.Status = "Offline"
			UserTable.UpdateStatus(loginData)
			statusH.unregister <- onlineC
			break
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
		sessionOnline := &onlineClients{ws: ws, name: session.Username}
		statusMap[ws] = session.Username
		statusH.register <- sessionOnline
		go sessionOnline.readPump()
	}
}
