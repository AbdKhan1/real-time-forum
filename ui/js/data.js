const nav_buttons = document.getElementsByClassName('nav-buttons')

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

async function openWs(data) {
    const gotData = await getData(data);

    let statusConn;

    if (gotData !== undefined) {
        statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
        //sending message to socket.
        setTimeout(() => {
            statusConn.send(gotData)
        }, 2500)

        statusConn.onclose = function (evt) {
            //test to see if this works. looks like it doesnt.
            console.log(gotData)
            statusConn.send(gotData)
        }
    }
}
//handle sign up form data
signUpForm.addEventListener('submit', handleRegistrationSubmit);

function handleRegistrationSubmit(event) {
    event.preventDefault(); //prevents page from refreshing
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

    for (r = 0; r < registration_inputs.length; r++) {
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
                // console.log(response)
                if (response.success == true) {
                    setTimeout(() => {
                        nav_buttons[0].children[1].style.display = "none"
                        nav_buttons[0].children[2].style.display = "none"
                        nav_buttons[0].children[3].style.display = "block"
                        nav_buttons[0].children[4].style.display = "block"
                        document.getElementsByClassName('profile-nav').value = response.username
                        console.log(document.getElementsByClassName('profile-nav').value, "has signed up")
                        sign_up_container.style.display = "none"
                        loader.style.display = "none"
                        if (document.querySelector('no-user-container') != undefined) {
                            document.querySelector('.no-user-container').remove()
                        }
                        const homepage = document.querySelector('.homepage')
                        const newProfileContainer = document.createElement('div')
                        newProfileContainer.classList.add('new-profile-container')

                        // dp image
                        const profileImage = document.createElement('img')
                        profileImage.src = response["user-image"]
                        newProfileContainer.appendChild(profileImage)

                        const profileTitle = document.createElement('h1')
                        profileTitle.innerHTML = response["username"]
                        newProfileContainer.appendChild(profileTitle)

                        const name = document.createElement('h3')
                        name.innerHTML = "Name: " + response["first-name"] + " " + response["last-name"]
                        newProfileContainer.appendChild(name)

                        const email = document.createElement('h3')
                        email.innerHTML = "E-mail: " + response["email"]
                        newProfileContainer.appendChild(email)

                        const gender = document.createElement('h3')
                        gender.innerHTML = "Gender: " + response["gender"]
                        newProfileContainer.appendChild(gender)

                        const age = document.createElement('h3')
                        const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;
                        const dateNow = new Date();
                        const dobSplit = response["date-of-birth"].split("-")
                        const birthday = new Date(dobSplit[0], dobSplit[1], dobSplit[2])
                        const ageCalc = Math.floor((dateNow.getTime() - birthday.getTime()) / MS_PER_YEAR)
                        age.innerHTML = "Age: " + ageCalc
                        newProfileContainer.appendChild(age)

                        homepage.appendChild(newProfileContainer)

                    }, 2000)
                } else {
                    loader.style.display = "none"
                    for (r = 0; r < registration_inputs.length; r++) {
                        registration_inputs[r].disabled = false

                    }
                    const sign_up_error_mes = document.querySelector('.sign-up-error-message')
                    if (sign_up_error_mes == undefined) {
                        let errorMes = document.createElement('p')
                        errorMes.classList.add("sign-up-error-message")
                        form.insertBefore(errorMes, document.querySelector('.sign-up-button'))
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

    for (l = 0; l < login_inputs.length; l++) {
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
                        nav_buttons[0].children[1].style.display = "none"
                        nav_buttons[0].children[2].style.display = "none"
                        nav_buttons[0].children[3].style.display = "block"
                        nav_buttons[0].children[4].style.display = "block"
                        document.getElementsByClassName('profile-nav').value = response.username
                        console.log(document.getElementsByClassName('profile-nav').value, "has logged in")
                        login_container.style.display = "none"
                        loader.style.display = "none"

                        if (document.querySelector('.no-user-container') != undefined) {
                            document.querySelector('.no-user-container').remove()
                        }

                        const newProfileContainer = document.createElement('div')
                        newProfileContainer.classList.add('new-profile-container')

                        const homepage = document.querySelector('.homepage')
                        // dp image
                        const profileImage = document.createElement('img')
                        profileImage.src = response["user-image"]
                        newProfileContainer.appendChild(profileImage)

                        const profileTitle = document.createElement('h1')
                        profileTitle.innerHTML = response["username"]
                        newProfileContainer.appendChild(profileTitle)


                        const name = document.createElement('h3')
                        name.innerHTML = "Name: " + response["first-name"] + " " + response["last-name"]
                        newProfileContainer.appendChild(name)

                        const email = document.createElement('h3')
                        email.innerHTML = "E-mail: " + response["email"]
                        newProfileContainer.appendChild(email)

                        const gender = document.createElement('h3')
                        gender.innerHTML = "Gender: " + response["gender"]
                        newProfileContainer.appendChild(gender)

                        const age = document.createElement('h3')
                        const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;
                        const dateNow = new Date();
                        const dobSplit = response["date-of-birth"].split("-")
                        const birthday = new Date(dobSplit[0], dobSplit[1], dobSplit[2])
                        const ageCalc = Math.floor((dateNow.getTime() - birthday.getTime()) / MS_PER_YEAR)
                        age.innerHTML = "Age: " + ageCalc
                        newProfileContainer.appendChild(age)

                        homepage.appendChild(newProfileContainer)

                    }, 2000)
                } else {
                    loader.style.display = "none"
                    for (r = 0; r < login_inputs.length; r++) {
                        login_inputs[r].disabled = false

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