import { displayProfile } from './profile.js'
import { displayPosts } from './post.js'

const getData = (values) => {
    return new Promise((resolve) => {
        resolve(values)
    })
}

async function openWs(data) {
    const gotData = await getData(data);
    // console.log(gotData)
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
    fetch("http://localhost:8000/checklogin")
        .then((response) => response.json())
        .then((response) => {
            openWs(JSON.stringify(response))
            if (response["session-authorized"] === true) {
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