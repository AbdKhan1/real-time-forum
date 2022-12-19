import { createPost, displayPosts } from "./post.js";
import { getTotalNotifications, liveNotifications, updateLikes } from "./postInteraction.js";
import { displayProfile } from "./profile.js";


const sign_up_container = document.querySelector(".sign-up-container")
const signUpForm = document.querySelector('.sign-up-form');
const registration_inputs = document.getElementsByClassName("sign-up-input")

const loginForm = document.querySelector('.login-form');
const login_container = document.querySelector(".login-container")
const login_inputs = document.getElementsByClassName("login-input")
const logOutButton = document.querySelector('.logout-nav')
logOutButton.addEventListener('click', () => {
    //make logout button display none and add log in.
    statusConn.close(1000, "user logged out.")
})
const deleteUserButton = document.querySelector('.delete-profile-button')
deleteUserButton.addEventListener('click', () => {
    statusConn.close(1000, "user logged out.")
})

let userBaseImage = ""
let statusConn

// https://www.learnwithjason.dev/blog/get-form-values-as-json
//open websocket if logged in data has been recieved
//handle sign up form data
signUpForm.addEventListener('submit', handleRegistrationSubmit);

function handleRegistrationSubmit(event) {
    event.preventDefault(); //prevents page from refreshing

    sign_up_container.style.backgroundColor = "rgb(255,255,255,0.6)"

    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries())
    values['user-image'] = userBaseImage
    const userImgType = values["user-image-content"].type
    values['user-image-type'] = userImgType
    values['status'] = "Online"

    let loader = document.createElement('div')
    loader.classList.add("loader")
    signUpForm.insertBefore(loader, document.querySelector('.sign-up-button'))
    loader.style.display = "block"

    for (let r = 0; r < registration_inputs.length; r++) {
        registration_inputs[r].disabled = true
    }

    setTimeout(() => {
        fetch("http://localhost:8000/signup", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values),
        })
            .then((response) => response.json())
            .then((response) => {
                if (response.success == true) {
                    openWs(response)
                    setTimeout(() => {
                        displayProfile(response)
                        loader.style.display = "none"
                        sign_up_container.style.backgroundColor = "rgb(0,0,0,0.4)"
                        sign_up_container.style.display = "none"
                        // sign_up_container.remove()
                        for (let r = 0; r < registration_inputs.length; r++) {
                            registration_inputs[r].disabled = false
                        }
                        getTotalNotifications()
                    }, 2000)
                } else {
                    sign_up_container.style.backgroundColor = "rgb(0,0,0,0.4)"
                    loader.style.display = "none"
                    for (let r = 0; r < registration_inputs.length; r++) {
                        registration_inputs[r].disabled = false
                    }
                    sign_up_container.style.backgroundColor = "rgb(0,0,0,0.4)"
                    loader.style.display = "none"
                    const sign_up_error_mes = document.querySelector('.sign-up-error-message')
                    if (sign_up_error_mes == undefined) {
                        let errorMes = document.createElement('p')
                        errorMes.classList.add("sign-up-error-message")
                        signUpForm.insertBefore(errorMes, document.querySelector('.sign-up-button'))
                        errorMes.innerHTML = response.error
                    } else {
                        sign_up_error_mes.innerHTML = sign_up_error_mes.innerHTML.replace(sign_up_error_mes.innerHTML, response.error)
                    }
                }
            })
    }, 2000)
}

//handle log in form data
loginForm.addEventListener('submit', handleLoginSubmit);

function handleLoginSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries())
    values['status'] = "Online"

    let loader = document.createElement('div')
    loader.classList.add("loader")
    loginForm.insertBefore(loader, document.querySelector('.login-button'))
    loader.style.display = "block"

    for (let l = 0; l < login_inputs.length; l++) {
        login_inputs[l].disabled = true
    }

    setTimeout(() => {
        fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values),
        })
            .then((response) => response.json())
            .then((response) => {
                for (let l = 0; l < login_inputs.length; l++) {
                    login_inputs[l].disabled = false
                }
                if (response.success == true) {
                    setTimeout(() => {
                        openWs(response)

                        displayProfile(response)
                        const currentPosts = document.querySelectorAll('.post')
                        currentPosts.forEach(post => { post.remove() })
                        displayPosts()
                        loader.style.display = "none"
                        login_container.style.display = "none"
                        // login_container.remove()
                        getTotalNotifications()
                    }, 2000)
                } else {
                    loader.style.display = "none"
                    for (let l = 0; l < login_inputs.length; l++) {
                        login_inputs[l].disabled = false
                    }
                    loader.style.display = "none"
                    const login_error_mes = document.querySelector('.login-error-message')
                    if (login_error_mes == undefined) {
                        let errorMes = document.createElement('p')
                        errorMes.classList.add("login-error-message")
                        loginForm.insertBefore(errorMes, document.querySelector('.login-button'))
                        errorMes.innerHTML = response.error
                    } else {
                        login_error_mes.innerHTML = login_error_mes.innerHTML.replace(login_error_mes.innerHTML, response.error)
                    }
                }
            })
    }, 2000)
}

const userImage = document.querySelector('.user-image')
const userImageContent = document.querySelector('.user-image-preview')
userImage.onchange = function () {
    let image = new FileReader();
    image.onload = function (e) {
        userImageContent.src = e.target.result;
        userBaseImage = image.result.replace("data:", "")
            .replace(/^.+,/, "");

        imageBase64Stringsep = userBaseImage;
    }
    image.readAsDataURL(this.files[0]);
    userImageContent.style.display = "block"
}

export function openWs(response) {
    console.log("check", { response })
    statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
    statusConn.onopen = () => {
        console.log("statusCOnn")
        statusConn.send(JSON.stringify(response))
    }
    statusConn.onmessage = (eve) => {
        console.log("status Conn message")
        // console.log("notif notif", JSON.parse(eve.data))
        if (JSON.parse(eve.data).hasOwnProperty('sender')) {
            const notification = JSON.parse(eve.data)
            liveNotifications(notification)
        } else if (JSON.parse(eve.data).hasOwnProperty('post-id')) {
            const newPost = JSON.parse(eve.data)
            console.log("new post", newPost)
            createPost("add", newPost)
        } else if (JSON.parse(eve.data).hasOwnProperty('postID')) {
            const postLikes = JSON.parse(eve.data)
            console.log({ postLikes })
            updateLikes(postLikes)
        } else if (JSON.parse(eve.data).hasOwnProperty('comment-id')) {
            const commentLikes = JSON.parse(eve.data)
            console.log({ commentLikes })
            if (document.querySelector('.comment-container') != undefined) {
                if (document.querySelectorAll('.comment').length != 0) {
                    Array.from(document.querySelectorAll('.comment')).forEach(comments => {
                        if (Array.from(comments.children)[0].value == commentLikes["comment-id"]) {
                            console.log(Array.from(document.getElementsByClassName(commentLikes["comment-id"])))
                            Array.from(document.getElementsByClassName(commentLikes["comment-id"])).forEach(button => {
                                if (button.classList[0] == "comment-like-button") {
                                    button.firstChild.innerHTML = commentLikes["comment-likes"]
                                }
                                if (button.classList[0] == "comment-dislike-button") {
                                    button.firstChild.innerHTML = commentLikes["comment-dislikes"]
                                }
                            })
                        }
                    })
                }
            }
        }
    }
}

export const debounce = (func, wait) => {
    let debounceTimer
    return function (eve) {
        // console.log({ eve })
        const context = this
        // console.log({ context })
        const args = arguments
        // console.log({ args })
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => func.apply(context, args), wait)
    }
}