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
    // const loader=document.createElement('div')
    // const loader_container=document.createElement('div')
    // loader_container.classList.add("loader-container")
    // loader.classList.add("loader-window")
    // loader_container.appendChild(loader)
    // document.querySelector('body').appendChild(loader_container)
    fetch("http://localhost:8000/checklogin")
        .then((response) => response.json())
        .then((response) => {
            if (response["session-authorized"] === true) {
                openWs(JSON.stringify(response))
                const homepage = document.querySelector('.homepage')
                console.log(homepage, 'homepage.')
                nav_buttons[0].children[1].style.display = "none"
                nav_buttons[0].children[2].style.display = "none"
                nav_buttons[0].children[3].style.display = "block"
                nav_buttons[0].children[4].style.display = "block"
                document.getElementsByClassName('profile-nav').value = response["username"]
                console.log(document.getElementsByClassName('profile-nav').value)

                if (document.querySelector('.no-user-container') != undefined) {
                    document.querySelector('.no-user-container').remove()
                }

                const newProfileContainer = document.createElement('div')
                newProfileContainer.classList.add('new-profile-container')

                fetch("http://localhost:8000/profile")
                    .then(response => response.json())
                    .then(response => {

                        // dp image
                        const profileImage = document.createElement('img')
                        profileImage.src = response["user-image"]
                        // profileImage.innerHTML = response["username"] 
                        newProfileContainer.appendChild(profileImage)

                        const profileTitle = document.createElement('h1')
                        profileTitle.innerHTML = response["username"]
                        newProfileContainer.appendChild(profileTitle)

                        // const username = document.createElement('h3')
                        // username.innerHTML = "Username: " + response["username"]
                        // newProfileContainer.appendChild(username)


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
                        // console.log(document.querySelector('.new-profile-container').offsetWidth-75)
                        // profileImage.style.marginLeft=(document.querySelector('.new-profile-container').offsetWidth-70)+'px'
                    })
            }
        })
})

//open websocket if logged in data has been recieved
// document.addEventListener('DOMContentLoaded', () => {
//     if (document.getElementsByClassName('profile-nav').value !== '' || document.getElementsByClassName('profile-nav').value !== undefined) {

//         console.log('comes here please!!!!!')
//     }
// })
