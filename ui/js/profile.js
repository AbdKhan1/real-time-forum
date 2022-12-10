import { displayPosts } from "./post.js"
//remove profiile function and change to create pop up with two buttons
//1. Get my Posts display flex x-axis
// 2. Liked Posts display flex x-axis
// overflowX

// const profileButton = document.querySelector('.profile-nav')
// profileButton.addEventListener('click', () => {
//     if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
//         noUserDisplay()
//     } else {
//         profileButton.classList.add('active')
//         homeButton.classList.remove('active')
//     }
// })

export function noUserDisplay() {
    if (document.querySelector('.no-user-container') != undefined) {
        document.querySelector('.no-user-container').remove()
    }
    const noUserContainer = document.createElement('div')
    noUserContainer.classList.add('no-user-container')
    const noUser = document.createElement('div')
    noUser.classList.add('no-user')
    const noUserMessage = document.createElement('h1')
    noUserMessage.innerHTML = "Please Log In or Sign Up"
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
    document.body.appendChild(noUserContainer)

}

export function displayProfile(response) {
    const nav_buttons = document.getElementsByClassName('nav-buttons')
    nav_buttons[0].children[1].style.display = "none"
    nav_buttons[0].children[2].style.display = "none"
    nav_buttons[0].children[3].style.display = "block"
    nav_buttons[0].children[4].style.display = "block"
    document.getElementsByClassName('profile-nav').value = response.username
    console.log(document.getElementsByClassName('profile-nav').value, "has logged in")
    nav_buttons[0].children[4].onclick = () => {
        console.log(document.getElementsByClassName('profile-nav').value, "has logged out")
        document.getElementsByClassName('profile-nav').value = ""
        document.querySelector('.profile-container').remove()
        if (document.querySelector('.total-notif') != undefined) {
            document.querySelector('.total-notif').remove()
        }
        nav_buttons[0].children[1].style.display = "block"
        nav_buttons[0].children[2].style.display = "block"
        nav_buttons[0].children[3].style.display = "none"
        nav_buttons[0].children[4].style.display = "none"
        document.querySelector('.home-nav').classList.add('active')
        document.querySelector('.login-nav').classList.remove('active')
        const currentPosts = document.querySelectorAll('.post')
        currentPosts.forEach(post => { post.remove() })
        displayPosts()
    }
    if (document.querySelector('.no-user-container') != undefined) {
        document.querySelector('.no-user-container').remove()
    }
    if (document.querySelector('.profile-container') != undefined) {
        document.querySelector('.profile-container').remove()
    }

    const newProfileContainer = document.createElement('div')
    newProfileContainer.classList.add('profile-container')

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

    const deleteProfile = document.createElement('button')
    deleteProfile.type = 'button'
    deleteProfile.innerHTML = "Delete Profile"
    deleteProfile.classList.add('delete-profile-button')
    newProfileContainer.appendChild(deleteProfile)
    setTimeout(() => homepage.appendChild(newProfileContainer), 1000)

}
