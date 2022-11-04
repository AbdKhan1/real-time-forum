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

                if (response.length === 2) {
                    const noFriends = document.createElement('h3')
                    noFriends.classList.add('no-friends')
                    noFriends.innerHTML = "You Aint Got No Fwends!!!"
                    friendsDiv.appendChild(noFriends)
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
                }
                friendsListPopUp.style.display = "block"
                friendsListPopUp.appendChild(friendsDiv)
                body.appendChild(friendsListPopUp)
                friendsCloseButton.addEventListener('click', () => {
                    friendsListPopUp.remove()
                })
            })
    }
})