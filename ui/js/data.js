const nav_buttons = document.getElementsByClassName('nav-buttons')

const sign_up_container = document.querySelector(".sign-up-container")
const signUpForm = document.querySelector('.sign-up-form');
const registration_inputs = document.getElementsByClassName("sign-up-input")

const loginForm = document.querySelector('.login-form');
const login_container = document.querySelector(".login-container")
const login_inputs = document.getElementsByClassName("login-input")



// https://www.learnwithjason.dev/blog/get-form-values-as-json

//handle sign up form data
signUpForm.addEventListener('submit', handleRegistrationSubmit);
function handleRegistrationSubmit(event) {
    event.preventDefault(); //prevents page from refreshing
    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries())

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
                    setTimeout(() => {
                        nav_buttons[0].children[1].style.display = "none"
                        nav_buttons[0].children[2].style.display = "none"
                        nav_buttons[0].children[3].style.display = "block"
                        nav_buttons[0].children[4].style.display = "block"
                        document.getElementsByClassName('profile-nav').value = response.username
                        console.log(document.getElementsByClassName('profile-nav').value, "has logged in")
                        login_container.style.display = "none"
                        loader.style.display = "none"
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
