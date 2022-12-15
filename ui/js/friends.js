import { getTotalNotifications, recentNotif } from "./postInteraction.js"
import { noUserDisplay } from "./profile.js"

const friendsButton = document.querySelector('.friends-list-button')
const logOutButton = document.querySelector('.logout-nav')
let throttleTimer;
const throttle = (callback, time) => {
    if (throttleTimer) return;

    throttleTimer = true;
    setTimeout(() => {
        callback();
        throttleTimer = false;
    }, time);
};
let loader = document.createElement('div')
loader.classList.add("loader")
loader.setAttribute("id", "loader-for-chat")
friendsButton.addEventListener('click', () => {
    if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
        noUserDisplay()
    } else {
        friendsButton.disabled = true
        fetch("http://localhost:8000/friends")
            .then(response => response.json())
            .then(response => {
                let lenResponse = response.length
                const friendsListPopUp = document.createElement('div')
                friendsListPopUp.classList.add('friends-list-container')
                const friendsDiv = document.createElement('div')
                friendsDiv.classList.add('friends-list')

                const friendsCloseButton = document.createElement('button')
                friendsCloseButton.classList.add('friends-list-close-button')
                friendsCloseButton.type = "button"
                const cross = document.createElement('span')
                cross.innerHTML = "&times;"
                friendsCloseButton.appendChild(cross)
                friendsDiv.appendChild(friendsCloseButton)

                if (response.length === 0) {
                    const noFriends = document.createElement('h3')
                    noFriends.classList.add('no-friends')
                    noFriends.innerHTML = "You Aint Got No Fwends!!!"
                    friendsDiv.appendChild(noFriends)
                    friendsListPopUp.style.display = "block"
                    friendsListPopUp.appendChild(friendsDiv)
                    document.body.appendChild(friendsListPopUp)
                } else {
                    const filterDiv = document.createElement('div')
                    filterDiv.classList.add('friends-filter-container')

                    const friendsUserFilter = document.createElement('input')
                    friendsUserFilter.type = "text"
                    friendsUserFilter.classList.add('friends-user-filter')
                    friendsUserFilter.placeholder = "by User"
                    filterDiv.appendChild(friendsUserFilter)

                    const offlineFriendsFilter = document.createElement('button')
                    offlineFriendsFilter.type = "button"
                    offlineFriendsFilter.innerHTML = "Offline"
                    offlineFriendsFilter.classList.add('friends-offline-filter')
                    filterDiv.appendChild(offlineFriendsFilter)

                    const onlineFriendsFilter = document.createElement('button')
                    onlineFriendsFilter.type = "button"
                    onlineFriendsFilter.innerHTML = "Online"
                    onlineFriendsFilter.classList.add('friends-online-filter')
                    filterDiv.appendChild(onlineFriendsFilter)

                    friendsDiv.appendChild(filterDiv)

                    const friendUserDiv = document.createElement('div')
                    friendUserDiv.classList.add('friends-button-container')

                    response.filter(users => users.username != document.getElementsByClassName('profile-nav').value)
                        .sort((a, b) => {
                            var nameA = a.username.toLowerCase(), nameB = b.username.toLowerCase();
                            if (nameA < nameB)
                                return -1;
                            if (nameA > nameB)
                                return 1;
                            return 0;
                        })
                        .forEach((users, i) => {
                            const friendButton = document.createElement('button')
                            friendButton.classList.add('friend-info')
                            friendButton.value = users.username
                            const friendDisplayDiv = document.createElement('div')
                            friendDisplayDiv.classList.add('friend-display')

                            const friendDisplayUserDiv = document.createElement('div')
                            friendDisplayUserDiv.classList.add('friend-display-user')

                            const friendImg = document.createElement('img')
                            friendImg.src = users["user-image"]
                            friendDisplayUserDiv.appendChild(friendImg)

                            const friendButtonName = document.createElement('p')
                            friendButtonName.innerHTML += users.username
                            friendDisplayUserDiv.appendChild(friendButtonName)
                            friendDisplayDiv.appendChild(friendDisplayUserDiv)

                            const friendsObj = { "notification-type": "friend", "friend-name": users.username }
                            fetch("http://localhost:8000/friendNotif", {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(friendsObj)
                            }).then(response => response.json()).then(async response => {
                                if (response["numOfMessages"] != 0 && response["sender"] === friendButtonName.innerText) {
                                    //add date to notif
                                    const notifDateAndTime = response["date"]
                                    const notifDateEle = document.createElement('p')
                                    notifDateEle.classList.add("date")
                                    notifDateEle.innerHTML = notifDateAndTime.toLocaleString();
                                    notifDateEle.style.display = "none";
                                    friendDisplayDiv.appendChild(notifDateEle)
                                    //...
                                    const notifNum = document.createElement('p')
                                    notifNum.classList.add('num-of-messages')
                                    if (response["receiver-total-notifs"] <= 99) {
                                        notifNum.innerHTML = response["numOfMessages"]
                                    } else {
                                        notifNum.innerHTML = "99+"
                                    }
                                    friendDisplayDiv.appendChild(notifNum)
                                }
                                // if all the notifications and names have been added to the list then re-arrage
                                if (i === lenResponse - 2) {
                                    //wait for all rendering of usernames
                                    await new Promise(resolve => resolve(response)).then(() => {
                                        setTimeout(recentNotif(friendUserDiv, (friendUserDiv.childNodes.length - 1), 0), 500)
                                    })
                                }//done re-arrangement//
                            })
                            friendButton.appendChild(friendDisplayDiv)
                            friendUserDiv.appendChild(friendButton)
                        })
                    // friendUserDiv.children.forEach()
                    friendsDiv.appendChild(friendUserDiv)

                    const endOfFriends = document.createElement('p')
                    endOfFriends.classList.add('end-of-friends')
                    endOfFriends.innerHTML = "No More Friends"
                    friendsDiv.appendChild(endOfFriends)

                    friendsListPopUp.style.display = "block"
                    friendsListPopUp.appendChild(friendsDiv)
                    document.body.appendChild(friendsListPopUp)

                    if (document.querySelectorAll('.friend-info') != undefined) {
                        const homepage = document.querySelector('.homepage')

                        friendsUserFilter.addEventListener('input', (evt) => {
                            console.log(Array.from(document.querySelectorAll('.friend-info')))
                            const friendsInput = Array.from(document.querySelectorAll('.friend-info')).filter(users =>
                                users.firstElementChild.firstElementChild.lastElementChild.textContent
                                    .toLocaleLowerCase()
                                    .includes(evt.target.value.trim().toLocaleLowerCase())
                            )
                            Array.from(document.querySelectorAll('.friend-info')).some(r => {
                                if (!friendsInput.includes(r)) {
                                    r.style.display = "none"
                                } else {
                                    r.style.display = "block"
                                }
                            })
                        })

                        offlineFriendsFilter.addEventListener('click', () => {
                            //make fetch from sql table
                            fetch("http://localhost:8000/friends")
                                .then(response => response.json())
                                .then(response => {
                                    console.log(response)
                                    Array.from(document.querySelectorAll('.friend-info')).forEach(button => {
                                        response.forEach(user => {
                                            if (button.firstElementChild.firstElementChild.lastElementChild.textContent === user["username"]) {
                                                if (user["status"] != "Offline") {
                                                    button.style.display = "none"
                                                } else {
                                                    button.style.display = "block"
                                                }
                                            }
                                        })
                                    })

                                })
                        })

                        onlineFriendsFilter.addEventListener('click', (evt) => {
                            fetch("http://localhost:8000/friends")
                                .then(response => response.json())
                                .then(response => {
                                    Array.from(document.querySelectorAll('.friend-info')).forEach(button => {
                                        response.forEach(user => {
                                            if (button.firstElementChild.firstElementChild.lastElementChild.textContent === user["username"]) {
                                                if (user["status"] != "Online") {
                                                    button.style.display = "none"
                                                } else {
                                                    button.style.display = "block"
                                                }
                                            }
                                        })
                                    })

                                })
                        })
                        const friendsListButtons = document.querySelectorAll('.friend-info')
                        friendsListButtons.forEach(friend => {
                            friend.addEventListener('click', () => {
                                if (document.querySelector('.chat-container') != undefined) {
                                    // document.querySelector('.chat-container').remove()
                                    //add message to close chat first to open a new chat
                                }
                                if (document.querySelector('.comment-container') != undefined) {
                                    document.querySelector('.comment-container').remove()
                                }


                                fetch("http://localhost:8000/chat", {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: (friend.value)
                                })
                                let conn;
                                const chatContainer = document.createElement('div')
                                chatContainer.classList.add('chat-container')

                                const chatReceiver = document.createElement('div')
                                chatReceiver.classList.add('chat-friend')

                                //FETCH receiver info using getProfile
                                //get their name and image
                                const chatClose = document.createElement('button')
                                chatClose.type = 'button'
                                chatClose.innerHTML = 'Close'
                                chatClose.classList.add('chat-close')
                                chatReceiver.appendChild(chatClose)

                                chatClose.addEventListener('click', () => {
                                    document.querySelector('.chat-container').remove()
                                })
                                const chattingTo = document.createElement('h3')
                                chattingTo.classList.add('chatting-to')
                                chattingTo.innerHTML = "Chatting To:"

                                const chatName = document.createElement('h3')
                                chatName.classList.add('chat-name')
                                chatName.innerHTML = friend.value

                                const chatImage = document.createElement('img')
                                chatImage.classList.add('chat-image')
                                chatImage.src = friend.children[0].children[0].firstElementChild.src

                                const chatFriendInfo = document.createElement('div')
                                chatFriendInfo.classList.add('chat-friend-info')

                                chatFriendInfo.appendChild(chattingTo)
                                chatFriendInfo.appendChild(chatImage)
                                chatFriendInfo.appendChild(chatName)
                                chatReceiver.appendChild(chatFriendInfo)
                                chatContainer.appendChild(chatReceiver)
                                //fetch previous chat from sql

                                const previousMessages = document.createElement('div')
                                previousMessages.classList.add('previous-chat-messages')
                                chatContainer.appendChild(previousMessages)


                                //message form
                                const messageForm = document.createElement('form')
                                messageForm.classList.add('chat-form')

                                //message input
                                const messageInput = document.createElement('textarea')
                                messageInput.rows = '1'
                                messageInput.classList.add('chat-message')
                                messageInput.setAttribute('name', 'chat-message')

                                //message submit button
                                const messageSend = document.createElement('input')
                                messageSend.type = 'submit'
                                messageSend.classList.add('chat-send')
                                messageSend.setAttribute('name', 'chat-receiver')
                                messageSend.setAttribute('id', friend.value)
                                messageSend.setAttribute('value', 'Send')
                                messageForm.appendChild(messageInput)
                                messageForm.appendChild(messageSend)
                                chatContainer.appendChild(messageForm)
                                homepage.appendChild(chatContainer)
                                friendsListPopUp.remove()
                                friendsButton.disabled = false
                                conn = new WebSocket("ws://" + document.location.host + "/ws/chat");
                                
                                const chatData = new Object()
                                messageSend.addEventListener('click', (event) => {
                                    event.preventDefault();
                                    if (!conn) {
                                        return false;
                                    }
                                    if (!messageInput.value) {
                                        return false;
                                    }
                                    chatData["user1"] = document.getElementsByClassName('profile-nav').value
                                    chatData["user2"] = friend.value
                                    chatData["message"] = messageInput.value
                                    const dateNow = new Date();
                                    chatData['date'] = dateNow.getTime()
                                    // isOpen(conn, friend).then(response=>console.log(response))
                                    conn.send(JSON.stringify(chatData));
                                    messageInput.value = "";
                                    return false;
                                })
                                function appendChat(item) {
                                    let doScroll = previousMessages.scrollTop > previousMessages.scrollHeight - previousMessages.clientHeight - 1;
                                    previousMessages.appendChild(item);
                                    if (doScroll) {
                                        previousMessages.scrollTop = previousMessages.scrollHeight - previousMessages.clientHeight;
                                    }
                                }


                                chatClose.addEventListener('click', () => {
                                    conn.close(1000, "user closed chat.")
                                })
                                logOutButton.addEventListener('click', () => {
                                    conn.close(1000, "user logged out.")
                                })

                                conn.onopen = function () {
                                    console.log('reset')
                                    fetch("http://localhost:8000/previousChat", {
                                        method: "POST",
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: (friend.value)
                                    }).then(response => response.json())
                                        .then(response => {
                                            if (response != 'empty') {
                                                console.log({ response }, '...')
                                                response.forEach(chat => {
                                                    let item = document.createElement("div");
                                                    if (chat['user1'] === document.getElementsByClassName('profile-nav').value) {
                                                        item.classList.add('chat-message-sender')
                                                    } else {
                                                        item.classList.add('chat-message-receiver')
                                                    }

                                                    const chatDateAndTime = new Date(chat["date"])
                                                    const chatTime = document.createElement('p')
                                                    chatTime.classList.add('chat-time')
                                                    chatTime.innerHTML = chatDateAndTime.toLocaleString()
                                                    item.appendChild(chatTime)

                                                    const chatText = document.createElement('p')
                                                    chatText.classList.add('chat-text-content')
                                                    chatText.innerHTML = chat['message']
                                                    item.appendChild(chatText)

                                                    const chatUser = document.createElement('p')
                                                    chatUser.classList.add('chat-user-content')
                                                    chatUser.innerHTML = chat['user1']
                                                    item.appendChild(chatUser)

                                                    appendChat(item)
                                                })
                                            }
                                            getTotalNotifications()
                                        })
                                }
                                const endOfMessages = document.createElement('p')
                                endOfMessages.classList.add('end-of-messages')
                                endOfMessages.innerHTML = "End of messages."
                                endOfMessages.style.textAlign = "center"
                                const handleScroll = () => {
                                    throttle(() => {
                                        if (previousMessages.scrollTop === 0) {
                                            loader.style.display = "block";
                                            loader.style.marginLeft = "50%";
                                            previousMessages.insertBefore(loader, previousMessages.firstChild)
                                            setTimeout(() => {
                                                fetch("http://localhost:8000/previousChat", {
                                                    method: "POST",
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: (friend.value)
                                                }).then(response => response.json())
                                                    .then(response => {
                                                        if (response === 'read-all-msgs' || response === 'empty') {
                                                            if (previousMessages.childNodes[0].outerText !== "End of messages.") {
                                                                removeScroll()
                                                                previousMessages.insertBefore(endOfMessages, previousMessages.firstChild)
                                                                console.log(previousMessages.childNodes[0].outerText, 'childNodes.')
                                                                return
                                                            }
                                                            return
                                                        }
                                                        if (response != 'empty' || response != 'read-all-msgs') {
                                                            loader.style = "none";
                                                            const responseArray = Object.entries(response).reverse()
                                                            responseArray.forEach(chat => {
                                                                let item = document.createElement("div");
                                                                if (chat[1]['user1'] === document.getElementsByClassName('profile-nav').value) {
                                                                    item.classList.add('chat-message-sender')
                                                                } else {
                                                                    item.classList.add('chat-message-receiver')
                                                                }
                                                                const chatDateAndTime = new Date(chat[1]["date"])
                                                                const chatTime = document.createElement('p')
                                                                chatTime.classList.add('chat-time')
                                                                chatTime.innerHTML = chatDateAndTime.toLocaleString()
                                                                item.appendChild(chatTime)

                                                                const chatText = document.createElement('p')
                                                                chatText.classList.add('chat-text-content')
                                                                chatText.innerHTML = chat[1]['message']
                                                                item.appendChild(chatText)

                                                                const chatUser = document.createElement('p')
                                                                chatUser.classList.add('chat-user-content')
                                                                chatUser.innerHTML = chat[1]['user1']
                                                                item.appendChild(chatUser)
                                                                appendChat(item)
                                                                previousMessages.insertBefore(item, previousMessages.firstChild);
                                                            })
                                                        }
                                                    })
                                            }, 1000)
                                        }
                                    }, 1000);
                                }
                                const removeScroll = () => {
                                    loader.remove();
                                    previousMessages.removeEventListener("scroll", handleScroll);
                                };
                                setTimeout(previousMessages.addEventListener("scroll", handleScroll), 30000)

                                conn.onmessage = function (evt) {
                                    evt.preventDefault()
                                    const chat = JSON.parse(evt.data)
                                    console.log({ chat })

                                    let item = document.createElement("div");
                                    if (chat['user1'] === document.getElementsByClassName('profile-nav').value) {
                                        item.classList.add('chat-message-sender')
                                    } else {
                                        item.classList.add('chat-message-receiver')
                                    }

                                    const chatDateAndTime = new Date(chat["date"])
                                    const chatTime = document.createElement('p')
                                    chatTime.classList.add('chat-time')
                                    chatTime.innerHTML = chatDateAndTime.toLocaleString()
                                    item.appendChild(chatTime)

                                    const chatText = document.createElement('p')
                                    chatText.classList.add('chat-text-content')
                                    chatText.innerHTML = chat['message']
                                    item.appendChild(chatText)

                                    const chatUser = document.createElement('p')
                                    chatUser.classList.add('chat-user-content')
                                    chatUser.innerHTML = chat['user1']
                                    item.appendChild(chatUser)

                                    appendChat(item)

                                }
                            })
                        })
                    }

                }

                friendsCloseButton.addEventListener('click', () => {
                    friendsListPopUp.remove()
                    friendsButton.disabled = false
                })
            })
    }
})