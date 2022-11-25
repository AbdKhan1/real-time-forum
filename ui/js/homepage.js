import { displayPosts } from "./post.js"
import { displayProfile } from './profile.js'

displayPosts()

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


//
//// REFRESH/////
//

const getData = (values) => {
  return new Promise((resolve) => {
      resolve(values)
  })
}

async function openWs(data) {
    const gotData = await getData(data);
    console.log(gotData)
    let statusConn;

    if (gotData !== undefined) {
        statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
        //sending message to socket.
        setTimeout(() => {
            statusConn.send(gotData)
        }, 3000)

        statusConn.onclose = function (evt) {
            console.log(gotData)
            statusConn.send(gotData)
        }
    }
}

window.addEventListener('load', () => {
    console.log("this is the response.")
    fetch("http://localhost:8000/checklogin")
        .then((response) => response.json())
        .then((response) => {
            if (response["session-authorized"] === true) {
                openWs(JSON.stringify(response))
                fetch("http://localhost:8000/profile")
                    .then(response => response.json())
                    .then(response => {
                        if (response.username != "") {
                            displayProfile(response)
                            document.querySelectorAll('.post')
                            for (let p = 0; p < document.querySelectorAll('.post').length; p++) {
                                document.querySelectorAll('.post')[p].remove()
                            }
                            displayPosts()
                        }
                    })
            }
        })
})