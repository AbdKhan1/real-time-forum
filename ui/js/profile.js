const profileButton = document.querySelector('.profile-nav')
profileButton.addEventListener('click', () => {
    if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
        const noUserContainer = document.createElement('div')
        noUserContainer.classList.add('no-user-container')
        const noUser = document.createElement('div')
        noUser.classList.add('no-user')
        const noUserMessage = document.createElement('h1')
        noUserMessage.innerHTML = "Please Log In or Sign Up To See Your Profile"
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
        profileButton.classList.add('active')
        homeButton.classList.remove('active')
        fetch("http://localhost:8000/profile")
            .then(response => response.json())
            .then(response => {
                const profilePopUp = document.createElement('div')
                profilePopUp.classList.add('profile-container')
                const profileInfo = document.createElement('div')
                profileInfo.classList.add('profile-info')

                const profileCloseButton = document.createElement('button')
                profileCloseButton.classList.add('profile-close-button')
                profileCloseButton.type = "button"
                const cross = document.createElement('span')
                cross.innerHTML = "&times;"
                profileCloseButton.appendChild(cross)
                profileInfo.appendChild(profileCloseButton)


                const usernameDiv = document.createElement('div')
                usernameDiv.classList.add('profile-text')
                const username = document.createElement('h3')
                username.innerHTML = "Username: " + response["username"]
                usernameDiv.appendChild(username)
                profileInfo.appendChild(usernameDiv)


                const firstAndLastNameDiv = document.createElement('div')
                firstAndLastNameDiv.classList.add('profile-text')
                const firstName = document.createElement('h3')
                firstName.innerHTML = "First Name: " + response["first-name"]
                const lastName = document.createElement('h3')
                lastName.innerHTML = "Last Name: " + response["last-name"]

                firstAndLastNameDiv.appendChild(firstName)
                firstAndLastNameDiv.appendChild(lastName)
                profileInfo.appendChild(firstAndLastNameDiv)

                const emailDiv = document.createElement('div')
                emailDiv.classList.add('profile-text')
                const email = document.createElement('h3')
                email.innerHTML = "E-mail: " + response["email"]
                emailDiv.appendChild(email)
                profileInfo.appendChild(emailDiv)


                const genderAndAgeDiv = document.createElement('div')
                genderAndAgeDiv.classList.add('profile-text')
                const gender = document.createElement('h3')
                gender.innerHTML = "Gender: " + response["gender"]
                const age = document.createElement('h3')
                const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;
                const dateNow = new Date();
                const dobSplit = response["date-of-birth"].split("-")
                const birthday = new Date(dobSplit[0], dobSplit[1], dobSplit[2])
                const ageCalc = Math.floor((dateNow.getTime() - birthday.getTime()) / MS_PER_YEAR)
                age.innerHTML = "Age: " + ageCalc
                genderAndAgeDiv.appendChild(gender)
                genderAndAgeDiv.appendChild(age)
                profileInfo.appendChild(genderAndAgeDiv)

                const deleteButton = document.createElement('button')
                deleteButton.classList.add('delete-profile-button')
                deleteButton.type = "button"
                deleteButton.innerHTML = "Delete"
                profileInfo.appendChild(deleteButton)
                profilePopUp.appendChild(profileInfo)
                body.appendChild(profilePopUp)
                profilePopUp.style.display = "block"

                profileCloseButton.addEventListener('click', () => {
                    console.log("hit")
                    profileButton.classList.remove('active')
                    homeButton.classList.add('active')
                    profilePopUp.style.display = "none"
                })
            })
    }
})