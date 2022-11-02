const homeButton = document.querySelector('.home-nav')
const body = document.querySelector('body')


//
//// SIGN UP/////
//

// sign up page pop up
const signUpButton = document.querySelector('.sign-up-nav')
signUpButton.addEventListener('click', () => {
  signUpButton.classList.add('active')
  homeButton.classList.remove('active')
  const signupPopUp = document.querySelector('.sign-up-container')
  if (signupPopUp.style.display === "none" || signupPopUp.style.display === undefined || signupPopUp.style.display === '') {
    signupPopUp.style.display = "block"
  }
})


// close sign up page pop up
const signupCloseButton = document.querySelector('.signup-close-button')
signupCloseButton.addEventListener('click', () => {
  signUpButton.classList.remove('active')
  homeButton.classList.add('active')
  const signupPopUp = document.querySelector('.sign-up-container')
  signupPopUp.style.display = "none"
})

//
//// lOG IN/////
//

// log in pop up
const loginButton = document.querySelector('.login-nav')
loginButton.addEventListener('click', () => {
  loginButton.classList.add('active')
  homeButton.classList.remove('active')
  const loginPopUp = document.querySelector('.login-container')
  if (loginPopUp.style.display === "none" || loginPopUp.style.display === undefined || loginPopUp.style.display === '') {
    loginPopUp.style.display = "block"
  }
})


// close login page pop up
const loginCloseButton = document.querySelector('.login-close-button')
loginCloseButton.addEventListener('click', () => {
  loginButton.classList.remove('active')
  homeButton.classList.add('active')
  const loginPopUp = document.querySelector('.login-container')
  loginPopUp.style.display = "none"
})

//
//// Profile/////
//
const profileButton = document.querySelector('.profile-nav')
profileButton.addEventListener('click', () => {
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
  // }
})


//
//// FRIENDS LIST & DMs/////
//
const friendsButton = document.querySelector('.friends-list-button')
friendsButton.addEventListener('click', () => {
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

      if (response.length < 1) {
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
        friendsListPopUp.style.display = "block"
      }
      friendsListPopUp.appendChild(friendsDiv)
      body.appendChild(friendsListPopUp)
      friendsCloseButton.addEventListener('click', () => {
        friendsListPopUp.style.display = "none"
      })
    })
})


//
//// lOG OUT/////
//
