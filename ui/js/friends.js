import { noUserDisplay } from "./profile.js"

const friendsButton = document.querySelector('.friends-list-button')
friendsButton.addEventListener('click', () => {
    if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
        noUserDisplay()
    } else {
        friendsButton.disabled = true
        fetch("http://localhost:8000/friends")
            .then(response => response.json())
            .then(response => {
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

                    response.filter(users => users.username != document.getElementsByClassName('profile-nav').value).forEach(users => {
                        const friendButton = document.createElement('button')
                        friendButton.classList.add('friend-info')
                        friendButton.value = users.username
                        const friendButtonImage = document.createElement('div')
                        // friendButtonImage.src=
                        friendButton.appendChild(friendButtonImage)
                        friendButton.innerHTML = '<div class="friend-display"><img src=' + users["user-image"] + '/>' + users.username + '</div>'
                        friendUserDiv.appendChild(friendButton)
                    })

                    friendsDiv.appendChild(friendUserDiv)

                    const endOfFriends = document.createElement('p')
                    endOfFriends.classList.add('end-of-friends')
                    endOfFriends.innerHTML = "No More Friends"
                    friendsDiv.appendChild(endOfFriends)

                    friendsListPopUp.style.display = "block"
                    friendsListPopUp.appendChild(friendsDiv)
                    document.body.appendChild(friendsListPopUp)

                    if (document.querySelectorAll('.friend-info') != undefined) {
                        // console.log('check')
                        const homepage = document.querySelector('.homepage')

                        friendsUserFilter.addEventListener('input', (evt) => {
                            const friends = response.filter(users => users.username != document.getElementsByClassName('profile-nav').value)
                            const friendsInput = friends.filter(users =>
                                users.username
                                    .toLocaleLowerCase()
                                    .includes(evt.target.value.trim().toLocaleLowerCase())
                            )
                            document.querySelectorAll('.friend-info').forEach(button => { button.remove() })
                            friendsInput.forEach(users => {
                                const friendButton = document.createElement('button')
                                friendButton.classList.add('friend-info')
                                friendButton.value = users.username
                                const friendButtonImage = document.createElement('div')
                                friendButton.appendChild(friendButtonImage)
                                friendButton.innerHTML = '<div class="friend-display"><img src=' + users["user-image"] + '/>' + users.username + '</div>'
                                document.querySelector('.friends-button-container').appendChild(friendButton)
                            })
                        })

                        offlineFriendsFilter.addEventListener('click', (evt) => {
                            const friends = response.filter(users => users.username != document.getElementsByClassName('profile-nav').value)
                            const friendsOffline = friends.filter(users => users.status === 'Offline')
                            document.querySelectorAll('.friend-info').forEach(button => { button.remove() })
                            friendsOffline.forEach(users => {
                                const friendButton = document.createElement('button')
                                friendButton.classList.add('friend-info')
                                friendButton.value = users.username
                                const friendButtonImage = document.createElement('div')
                                friendButton.appendChild(friendButtonImage)
                                friendButton.innerHTML = '<div class="friend-display"><img src=' + users["user-image"] + '/>' + users.username + '</div>'
                                document.querySelector('.friends-button-container').appendChild(friendButton)
                            })
                        })

                        onlineFriendsFilter.addEventListener('click', (evt) => {
                            const friends = response.filter(users => users.username != document.getElementsByClassName('profile-nav').value)
                            const friendsOnline = friends.filter(users => users.status === 'Online')
                            document.querySelectorAll('.friend-info').forEach(button => { button.remove() })
                            friendsOnline.forEach(users => {
                                const friendButton = document.createElement('button')
                                friendButton.classList.add('friend-info')
                                friendButton.value = users.username
                                const friendButtonImage = document.createElement('div')
                                friendButton.appendChild(friendButtonImage)
                                friendButton.innerHTML = '<div class="friend-display"><img src=' + users["user-image"] + '/>' + users.username + '</div>'
                                document.querySelector('.friends-button-container').appendChild(friendButton)
                            })
                        })
                        const friendsListButtons = document.querySelectorAll('.friend-info')
                        friendsListButtons.forEach(friend => {
                            friend.addEventListener('click', () => {
                                if (document.querySelector('.chat-container') != undefined) {
                                    document.querySelector('.chat-container').remove()
                                }

                                // do post fetch for live webchat HERE!
                                console.log(friend.value)
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

                                const chatName = document.createElement('h3')
                                chatName.classList.add('chat-name')
                                chatName.innerHTML = "Chatting With...    " + friend.value

                                // const chatImage=document.createElement('img')
                                // chatImage.classList.add('chat-image')
                                // chatImage.src=response["user-image"]

                                chatReceiver.appendChild(chatName)
                                // chatReceiver.appendChild(chatImage)
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
                                console.log(document.getElementsByClassName("chat-form"), "chat-form")

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
                                    conn.send(JSON.stringify(chatData));
                                    console.log(chatData, "newobjting")
                                    messageInput.value = "";
                                    return false;
                                })

                                conn = new WebSocket("ws://" + document.location.host + "/ws/chat");

                                chatClose.addEventListener('click', () => {
                                    conn.close(1000, "user closed chat.")
                                })

                                conn.onopen = function (evt) {
                                    fetch("http://localhost:8000/previousChat", {
                                        method: "POST",
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: (friend.value)
                                    }).then(response => response.json())
                                        .then(response => {
                                            console.log(response)
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

                                                previousMessages.appendChild(item)
                                            })
                                        })
                                }

                                conn.onmessage = function (evt) {
                                    evt.preventDefault()
                                    let messages = evt.data.split('\n');
                                    for (let i = 0; i < messages.length; i++) {
                                        let item = document.createElement("div");
                                        item.classList.add('chat-message')

                                        const chatDateAndTime = new Date()
                                        const chatTime = document.createElement('p')
                                        chatTime.classList.add('chat-time')
                                        chatTime.innerHTML = chatDateAndTime.toLocaleString()
                                        item.appendChild(chatTime)

                                        const chatText = document.createElement('p')
                                        chatText.classList.add('chat-text-content')
                                        chatText.innerHTML = messages[i]
                                        item.appendChild(chatText)

                                        const chatUser = document.createElement('p')
                                        chatUser.classList.add('chat-user-content')
                                        chatUser.innerHTML = document.getElementsByClassName('profile-nav').value
                                        item.appendChild(chatUser)

                                        previousMessages.appendChild(item)
                                    }
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
