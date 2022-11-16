const friendsButton = document.querySelector('.friends-list-button')
friendsButton.addEventListener('click', () => {
    if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
        const noUserContainer = document.createElement('div')
        noUserContainer.classList.add('no-user-container')
        const noUser = document.createElement('div')
        noUser.classList.add('no-user')
        const noUserMessage = document.createElement('h1')
        noUserMessage.innerHTML = "Please Log In or Sign Up To See Your Friends"
        const noUserLoginButton = document.createElement('button')
        noUserLoginButton.classList.add('no-user-login-button')
        noUserLoginButton.innerHTML = 'Login'
        const noUserSignUpButton = document.createElement('button')
        noUserSignUpButton.classList.add('no-user-sign-up-button')
        noUserSignUpButton.innerHTML = 'Sign Up'

        noUser.appendChild(noUserMessage)
        noUser.appendChild(noUserLoginButton)
        noUser.appendChild(noUserSignUpButton)
        noUserContainer.appendChild(noUser)
        noUserContainer.style.display = 'block'

        noUserSignUpButton.addEventListener('click', () => {
            document.querySelector('.sign-up-container').style.display = 'block'
            noUserContainer.style.display = 'none'
        })
        noUserLoginButton.addEventListener('click', () => {
            document.querySelector('.login-container').style.display = 'block'
            noUserContainer.style.display = 'none'
        })

        body.appendChild(noUserContainer)


    } else {
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
                    body.appendChild(friendsListPopUp)
                } else {
                    for (let f = 0; f < response.length; f++) {
                        const friendButton = document.createElement('button')
                        friendButton.classList.add('friend-info')
                        friendButton.value = response[f].username
                        friendButton.innerHTML = response[f].username
                        friendsDiv.appendChild(friendButton)
                    }
                    const endOfFriends = document.createElement('p')
                    endOfFriends.classList.add('end-of-friends')
                    endOfFriends.innerHTML = "No More Friends"
                    friendsDiv.appendChild(endOfFriends)

                    friendsListPopUp.style.display = "block"
                    friendsListPopUp.appendChild(friendsDiv)
                    body.appendChild(friendsListPopUp)

                    if (document.querySelectorAll('.friend-info') != undefined) {
                        // console.log('check')
                        const homepage = document.querySelector('.homepage')

                        const friendsListButtons = document.querySelectorAll('.friend-info')
                        friendsListButtons.forEach(friend => {
                            friend.addEventListener('click', () => {
                                if (document.querySelector('.chat-container') != undefined) {
                                    document.querySelector('.chat-container').remove()
                                }

                                // do post fetch for live webchat HERE!
                                console.log(friend.innerHTML)
                                fetch("http://localhost:8000/chat", {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: (friend.innerHTML)
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
                                console.log(document.getElementsByClassName("chat-form"), "chat-form")

                                function appendChatContainer(item) {
                                    let doScroll = chatContainer.scrollTop > chatContainer.scrollHeight - chatContainer.clientHeight - 1;
                                    chatContainer.appendChild(item);
                                    if (doScroll) {
                                        chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;
                                    }
                                }

                                messageSend.addEventListener('click', (event) => {
                                    event.preventDefault();
                                    console.log("asdf", messageInput.value)
                                    if (!conn) {
                                        return false;
                                    }
                                    if (!messageInput.value) {
                                        return false;
                                    }
                                    conn.send(messageInput.value);
                                    messageInput.value = "";
                                    return false;
                                })

                                conn = new WebSocket("ws://" + document.location.host + "/ws");
                                conn.onclose = function (evt) {
                                    let item = document.createElement("div");
                                    item.innerHTML = "<b>Connection closed.</b>";
                                    appendChatContainer(item);
                                }
                                conn.onmessage = function (evt) {
                                    evt.preventDefault()
                                    let messages = evt.data.split('\n');
                                    for (let i = 0; i < messages.length; i++) {
                                        let item = document.createElement("div");
                                        item.innerText = messages[i];
                                        appendChatContainer(item);
                                    }
                                }
                            })
                        })
                    }
                }

                friendsCloseButton.addEventListener('click', () => {
                    friendsListPopUp.remove()
                })
            })
    }
})