package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"learn.01founders.co/git/jasonasante/real-time-forum.git/web/sessions"
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
		_, msg, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		messageToRecieve := string(msg)
		m := message{messageToRecieve, s.room}
		h.broadcast <- m
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
			if err := c.write(websocket.TextMessage, []byte(messageToSend)); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

//wont read any code on the receive of a channel until data is sent into it.
//problem: send data into a channel that contains the uuid of the chat
//then create a subscritption with that data.
//will probably have to use a method that runs on a go routine like h.run().

type uuidOfChat struct {
	id   chan string
	used map[string]map[int]int
}

var jsIdOut = make(chan string)

// ranging over the current sessions find the session with the javascript username and store the uuid into that session from the store of chat maps
func StoreChatIdInJsUsername(chats <-chan *storeMapOfChats, sessionWithMap <-chan *sessions.Session, sessionWithoutMap <-chan *sessions.Session) <-chan string {
	mapChat := mapOfChats{ChatId: make(map[string]map[string]string)}
	// waitForId.Wait()
	go func(waitForId *sync.WaitGroup) {
		for session := range sessionWithMap {
			for sessionWithoutMap := range sessionWithoutMap {
				for chats := range chats {
					for uuid, mapStored := range chats.Chats {
						if len(chats.Chats[uuid]) < 2 {
							for username, map1 := range mapStored {
								if username == session.Username {
									for usernameWithNoMap, uuidOfMap := range map1.ChatId[username] {
										if uuidOfMap == uuid && usernameWithNoMap == sessionWithoutMap.Username {
											if mapChat.ChatId[sessionWithoutMap.Username] == nil {
												mapChat.ChatId[sessionWithoutMap.Username] = make(map[string]string)
											}
											sessionWithoutMap.ChatId = make(map[string]map[string]string)
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
										}
									}
								} else {
									break
								}
							}
						} else {
							jsIdOut <- uuid
							fmt.Println("two connected.")
							return
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

func getChatId(in <-chan *storeMapOfChats, sessionIn <-chan *sessions.Session, jsdata <-chan string, idOfChat uuidOfChat) <-chan string {
	wg.Wait()
	fmt.Println("comes here to get id")
	// waitForId.Add(1)
	go func(waitForId *sync.WaitGroup) {
		for session := range sessionIn {
			for jsdata := range jsdata {
				for mapStored := range in {
					for uuid, mapOfChats := range mapStored.Chats {
						if len(idOfChat.used[uuid]) != 2 || len(mapStored.Chats[uuid]) == 2 {
							for sessionUsername, chatMapOfSessionUser := range mapOfChats {
								if sessionUsername == session.Username {
									for jsUsername, uuidOfMap := range chatMapOfSessionUser.ChatId[sessionUsername] {
										if jsdata == jsUsername {
											if uuid == uuidOfMap {
												// waitForId.Done()
												sessionIdOut <- uuid
												fmt.Println("comes here for id from user1")
												return
											}
										}
									}
								}
							}
						} else {
							// waitForId.Done()
							sessionIdOut <- uuid
							fmt.Println("chats used 2ice. shouldnt come in here anyway.")
							return
						}
					}
				}
			}
		}
	}(&waitForId)
	return sessionIdOut
}

var idOfChat = &uuidOfChat{id: make(chan string), used: make(map[string]map[int]int)}

// serveWs handles websocket requests from the peer.
func serveWs(w http.ResponseWriter, r *http.Request, session *sessions.Session) {
	fmt.Println("running.")
	fmt.Println(session.ChatId, "session in serveWS")
	go func() {
		fmt.Println("count me.")
		time.Sleep(5000)
		select {
		case idFromSecondUser := <-StoreChatIdInJsUsername(uuidFromSecondUser, sessionWithMap, sessionWithoutMap):
			fmt.Print("id from second user ")
			if idOfChat.used[idFromSecondUser] == nil {
				fmt.Println("not same id being sent.")
				fmt.Println(idFromSecondUser, "what id is this")
				return
			}
			idOfChat.used[idFromSecondUser][2] = 2
			idOfChat.id <- idFromSecondUser
			return
		case idFromFirstUser := <-getChatId(uuidsFromChats, sessionInFromLogin, jsName, *idOfChat):
			fmt.Print("id from frist user ")
			if idOfChat.used[idFromFirstUser] == nil {
				idOfChat.used[idFromFirstUser] = make(map[int]int)
				idOfChat.used[idFromFirstUser][1] = 1
			}
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
	s := subscription{c, id}
	h.register <- s
	fmt.Println(id, "stored id in sub")
	go s.writePump()
	go s.readPump()

}
