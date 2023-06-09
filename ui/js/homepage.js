import { displayProfile } from './profile.js'
import { displayPosts } from './post.js'
import { getTotalNotifications } from './postInteraction.js'
import { openWs } from './data.js'

window.addEventListener('load', () => {
  displayPosts()
  fetch("http://localhost:8000/checklogin")
    .then((response) => response.json())
    .then((response) => {
      if (response["session-authorized"] === true) {
        openWs(response)
        fetch("http://localhost:8000/profile")
          .then(response => response.json())
          .then(response => {
            if (response.username != "") {
              const currentPosts = document.querySelectorAll('.post')
              currentPosts.forEach(post => { post.remove() })
              displayPosts()
              getTotalNotifications()
              displayProfile(response)
            }
          })
      }
    })
})


const homeButton = document.querySelector('.home-nav')


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
//// lOG OUT/////
//