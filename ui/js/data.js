import { displayPosts } from "./post.js";
import { displayProfile } from "./profile.js";


const sign_up_container = document.querySelector(".sign-up-container")
const signUpForm = document.querySelector('.sign-up-form');
const registration_inputs = document.getElementsByClassName("sign-up-input")

const loginForm = document.querySelector('.login-form');
const login_container = document.querySelector(".login-container")
const login_inputs = document.getElementsByClassName("login-input")

let userBaseImage = ""

// https://www.learnwithjason.dev/blog/get-form-values-as-json
//open websocket if logged in data has been recieved

const getData = (values) => {
    return new Promise((resolve) => {
        resolve(values)
    })
}

let statusConn;

setInterval(() => {
    if (statusConn !== undefined) {
        statusConn.addEventListener('message', (eve) => {
            let notification = JSON.parse(eve.data)
            console.log(notification, 'notif')
            const friendButtonDisplay = document.querySelectorAll('.friend-info')
            friendButtonDisplay.forEach(friend => {
                console.log({ friend })
                if (friend.value == notification.sender) {
                    if (friend.children[0].childNodes.length == 2) {
                        const notifNum = document.createElement('p')
                        notifNum.classList.add('num-of-messages')
                        notifNum.innerHTML = notification["numOfMessages"]
                        friend.children[0].appendChild(notifNum)
                    } else {
                        console.log(friend.children[0].childNodes.data, 'how many times is it here?')
                        friend.children[0].childNodes[2].data == notification["numOfMessages"]
                    }
                }
            })
        })
    }
}, 5000)


async function openWs(data) {
    const gotData = await getData(data);
    if (gotData !== undefined) {
        statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
        //sending message to socket.
        setTimeout(() => {
            statusConn.send(gotData)
        }, 2500)
    }
}
//handle sign up form data
signUpForm.addEventListener('submit', handleRegistrationSubmit);

function handleRegistrationSubmit(event) {
    event.preventDefault(); //prevents page from refreshing

    sign_up_container.style.backgroundColor = "rgb(255,255,255,0.6)"

    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries())
    console.log(values, "lets see what it looks like?")
    console.log(userBaseImage)
    values['user-image'] = userBaseImage
    const userImgType = values["user-image-content"].type
    values['user-image-type'] = userImgType
    values['status'] = "Online"
    console.log(values)

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
                openWs(JSON.stringify(values))
                if (response.success == true) {
                    setTimeout(() => {
                        displayProfile(response)
                        loader.style.display = "none"
                        sign_up_container.style.backgroundColor = "rgb(0,0,0,0.4)"
                        sign_up_container.remove()
                    }, 2000)
                } else {
                    sign_up_container.style.backgroundColor = "rgb(0,0,0,0.4)"
                    loader.style.display = "none"
                    for (let r = 0; r < registration_inputs.length; r++) {
                        registration_inputs[r].disabled = false

                    }
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
                // console.log(response)
                if (response.success == true) {
                    openWs(JSON.stringify(values));
                    setTimeout(() => {

                        displayProfile(response)
                        const currentPosts = document.querySelectorAll('.post')
                        console.log(currentPosts, currentPosts.length)
                        currentPosts.forEach(post => { post.remove() })
                        displayPosts()
                        loader.style.display = "none"
                        login_container.remove()

                    }, 2000)
                } else {
                    loader.style.display = "none"
                    for (let l = 0; l < login_inputs.length; l++) {
                        login_inputs[l].disabled = false

                    }
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