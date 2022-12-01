import { displayProfile } from './profile.js'
import { displayPosts } from './post.js'

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
            const friendButtonDisplay = document.querySelectorAll('.friend-info')
            friendButtonDisplay.forEach(friend => {
                if (friend.value == notification.sender) {
                    const notifNum = document.createElement('p')
                    notifNum.classList.add('num-of-messages')
                    if (friend.children[0].childNodes.length == 2) {
                        notifNum.innerHTML = notification["numOfMessages"]
                        friend.children[0].appendChild(notifNum)
                    } else {
                        friend.children[0].childNodes[2].innerHTML = notification["numOfMessages"]
                    }
                }
            })
        })
    }
}, 1000)

async function openWs(data) {
    const gotData = await getData(data);
    console.log(gotData)

    if (gotData !== undefined) {
        statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
        //sending message to socket.
        setTimeout(() => {
            statusConn.onopen = function (evt) {
                statusConn.send(gotData)
            }
        }, 3000)
    }
}

window.addEventListener('load', () => {
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

                            const currentPosts = document.querySelectorAll('.post')
                            currentPosts.forEach(post => { post.remove() })
                            displayPosts()
                        }
                    })
            }
        })
})