package main

import (
	"fmt"

	"learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/chat"
	notif "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/notification"
	posts "learn.01founders.co/git/jasonasante/real-time-forum.git/internal/SQLTables/post"
)

type message struct {
	data chat.ChatFields
	room string
}

type subscription struct {
	conn      *connection
	room      string
	name      string
	sessionId string
}

// hub maintains the set of active connections and broadcasts messages to the
// connections.
type hub struct {
	// Registered connections.
	rooms map[string]map[*connection]bool

	// Inbound messages from the connections.
	broadcast chan message

	// Register requests from the connections.
	register chan subscription

	// Unregister requests from connections.
	unregister chan subscription
}

var h = hub{
	broadcast:  make(chan message),
	register:   make(chan subscription),
	unregister: make(chan subscription),
	rooms:      make(map[string]map[*connection]bool),
}

func (h *hub) run() {
	for {
		select {
		case s := <-h.register:
			connections := h.rooms[s.room]
			if connections == nil {
				connections = make(map[*connection]bool)
				h.rooms[s.room] = connections
			}
			h.rooms[s.room][s.conn] = true
		case s := <-h.unregister:
			connections := h.rooms[s.room]
			if connections != nil {
				if _, ok := connections[s.conn]; ok {
					fmt.Println(s.name, "this user closed the ws connection for chat.")
					delete(connections, s.conn)
					close(s.conn.send)
					if len(connections) == 0 {
						delete(h.rooms, s.room)
					}
				}
			}
		case m := <-h.broadcast:
			connections := h.rooms[m.room]
			for c := range connections {
				select {
				case c.send <- m.data:
				default:
					fmt.Println("comes in here to close ws for chat too?")
					close(c.send)
					delete(connections, c)
					if len(connections) == 0 {
						delete(h.rooms, m.room)
					}
				}
			}
		}
	}
}

type statusHub struct {
	// Registered clients.
	onlineClients map[*onlineClients]bool

	//write notification when a message is recieved
	notify chan map[string]*notif.NotifFields

	// Register requests from the clients.
	register chan *onlineClients

	// Unregister requests from clients.
	unregister chan *onlineClients

	//post data
	postArray chan posts.PostFields
}

var statusH = &statusHub{
	onlineClients: make(map[*onlineClients]bool),
	notify:        make(chan map[string]*notif.NotifFields),
	register:      make(chan *onlineClients),
	unregister:    make(chan *onlineClients),
	postArray:     make(chan posts.PostFields),
}

func (statusH *statusHub) run() {
	for {
		select {
		case client := <-statusH.register:
			statusH.onlineClients[client] = true
			fmt.Println("added client to map.")
		case client := <-statusH.unregister:
			if _, ok := statusH.onlineClients[client]; ok {
				delete(statusH.onlineClients, client)
				close(client.sendNotification)
				close(client.sendPostArray)
				fmt.Println("deleted this client off the maps:", client.name)
			}
		case notif := <-statusH.notify:
			for name := range notif {
				for onlineClient := range statusH.onlineClients {
					if name == onlineClient.name {
						onlineClient.sendNotification <- notif[onlineClient.name]
					}
				}
			}
		}
	}
}
