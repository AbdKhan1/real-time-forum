// import { displayProfile } from './profile.js'
// import { displayPosts } from './post.js'

// async function openWs(data) {
//     const gotData = await getData(data);
//     console.log(gotData)
//     let statusConn;

//     if (gotData !== undefined) {
//         statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
//         //sending message to socket.
//         setTimeout(() => {
//             statusConn.send(gotData)
//         }, 3000)

//         statusConn.onclose = function (evt) {
//             console.log(gotData)
//             statusConn.send(gotData)
//         }
//     }
// }

// window.addEventListener('load', () => {
//     console.log("this is the response.")
//     fetch("http://localhost:8000/checklogin")
//         .then((response) => response.json())
//         .then((response) => {
//             if (response["session-authorized"] === true) {
//                 openWs(JSON.stringify(response))
//                 fetch("http://localhost:8000/profile")
//                     .then(response => response.json())
//                     .then(response => {
//                         if (response.username != "") {
//                             displayProfile(response)
//                             document.querySelectorAll('.post')
//                             for (let p = 0; p < document.querySelectorAll('.post').length; p++) {
//                                 document.querySelectorAll('.post')[p].remove()
//                             }
//                             displayPosts()
//                         }
//                     })
//             }
//         })
// })
