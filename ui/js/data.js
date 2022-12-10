import { displayPosts } from "./post.js";
import { getTotalNotifications, viewComments, likeDislike, editPost, deletePost } from "./postInteraction.js";
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
                        sign_up_container.remove()
                        getTotalNotifications()
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
                if (response.success == true) {
                    setTimeout(() => {
                        openWs(response)

                        displayProfile(response)
                        const currentPosts = document.querySelectorAll('.post')
                        currentPosts.forEach(post => { post.remove() })
                        displayPosts()
                        loader.style.display = "none"
                        login_container.remove()
                        getTotalNotifications()
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

export function openWs(response) {
    console.log("check", { response })
    statusConn = new WebSocket("ws://" + document.location.host + "/ws/status");
    statusConn.onopen = () => {
        console.log("statusCOnn")
        statusConn.send(JSON.stringify(response))
    }
    statusConn.onmessage = (eve) => {
        console.log("status Conn message")
        console.log("notif notif", JSON.parse(eve.data))
        if (JSON.parse(eve.data).hasOwnProperty('sender')) {
            const notification = JSON.parse(eve.data)

            if (notification["receiver-total-notifs"] > 0) {
                console.log(notification["receiver-total-notifs"])
                if (document.querySelector('.total-notif') != undefined) {
                    if (notification["receiver-total-notifs"] > 99) {
                        document.querySelector('.total-notif').innerHTML = '99+'
                    } else {
                        document.querySelector('.total-notif').innerHTML = notification["receiver-total-notifs"]
                    }
                } else {
                    const totalNotif = document.createElement('p')
                    totalNotif.classList.add('total-notif')
                    if (notification["receiver-total-notifs"] > 99) {
                        totalNotif.innerHTML = "99+"
                    } else {
                        totalNotif.innerHTML = notification["receiver-total-notifs"]
                    }
                    document.body.appendChild(totalNotif)
                }
            } else {
                if (document.querySelector('.total-notif') != undefined) {
                    document.querySelector('.total-notif').remove()
                }
            }

            const friendButtonDisplay = document.querySelectorAll('.friend-info')
            friendButtonDisplay.forEach(friend => {
                if (friend.value == notification.sender) {
                    const notifNum = document.createElement('p')
                    notifNum.classList.add('num-of-messages')
                    if (friend.children[0].childNodes.length == 1) {
                        notifNum.innerHTML = notification["numOfMessages"]
                        friend.children[0].appendChild(notifNum)
                    } else {
                        friend.children[0].childNodes[1].innerHTML = notification["numOfMessages"]
                    }
                    document.querySelector('.friends-button-container').insertBefore(friend, friendButtonDisplay[0])
                }
            })
        } else if (JSON.parse(eve.data).hasOwnProperty('post-id')) {
            const currentPosts = document.querySelectorAll('.post')
            const postContainer = document.querySelector(".post-container")
            const newPost = JSON.parse(eve.data)
            console.log("new post", newPost)

            //create post holder
            const post = document.createElement('div')
            post.classList.add("post")

            // create add post ID
            const postID = document.createElement('input')
            postID.type = "hidden"
            postID.name = "postID"
            postID.value = newPost["post-id"]
            post.appendChild(postID)

            // post Author
            const postAuthorDiv = document.createElement('div')
            postAuthorDiv.classList.add('post-author-container')
            //create img for dp
            const postAuthor = document.createElement('h2')
            postAuthor.classList.add('post-author')
            postAuthor.innerHTML = newPost["author"]
            postAuthorDiv.appendChild(postAuthor)
            post.appendChild(postAuthorDiv)

            //time
            const postDateAndTime = new Date(newPost["post-time"])
            const postTime = document.createElement('p')
            postTime.classList.add('post-time')
            postTime.innerHTML = postDateAndTime.toLocaleString()
            post.appendChild(postTime)

            const postImageDiv = document.createElement('div')
            postImageDiv.classList.add('post-image-container')

            //image
            if (newPost['post-image'] !== '') {
                const postImage = document.createElement('img')
                postImage.classList.add('post-image-display')
                postImage.style.display = 'none'
                postImage.onload = () => {
                    postImage.style.display = 'block'
                }
                postImage.src = newPost['post-image']
                postImageDiv.appendChild(postImage)
                post.appendChild(postImageDiv)
            }

            //text
            if (newPost['post-text-content'] !== '') {
                const postText = document.createElement('h3')
                postText.classList.add('post-text-content')
                postText.innerHTML = newPost['post-text-content']
                post.appendChild(postText)
            }

            const postThreadList = document.createElement('div')
            postThreadList.classList.add('post-thread-list')
            post.appendChild(postThreadList)

            if (newPost['post-threads'] != '') {
                let threadSplit = newPost['post-threads'].split('#')
                let removeEmptyThread = threadSplit.filter(thread => thread != '')
                removeEmptyThread.forEach((thread, i) => {
                    if (i < removeEmptyThread.length - 1) {
                        const postThreads = document.createElement('p')
                        postThreads.innerHTML = '#' + thread.slice(0, - 1)
                        postThreadList.appendChild(postThreads)
                    } else {
                        const postThreads = document.createElement('p')
                        postThreads.innerHTML = '#' + thread
                        postThreadList.appendChild(postThreads)
                    }
                });
            }

            const postInteractionDiv = document.createElement('div')
            postInteractionDiv.classList.add('post-interaction')

            const likeButton = document.createElement('button')
            likeButton.classList.add('post-like-button')
            const likeNumber = document.createElement('p')
            likeNumber.innerHTML = newPost['post-likes']
            likeButton.setAttribute('id', postID.value)
            const likeIcon = document.createElement('img')
            likeIcon.src = "ui/img/like.png"
            likeIcon.classList.add('post-like-icon')
            likeButton.appendChild(likeNumber)
            likeButton.appendChild(likeIcon)
            postInteractionDiv.appendChild(likeButton)

            const dislikeButton = document.createElement('button')
            dislikeButton.classList.add('post-dislike-button')
            const dislikeNumber = document.createElement('p')
            dislikeNumber.innerHTML = newPost['post-dislikes']
            dislikeButton.setAttribute('id', postID.value)
            const dislikeIcon = document.createElement('img')
            dislikeIcon.src = "ui/img/dislike.png"
            dislikeIcon.classList.add('post-dislike-icon')
            dislikeButton.appendChild(dislikeNumber)
            dislikeButton.appendChild(dislikeIcon)
            postInteractionDiv.appendChild(dislikeButton)

            likeButton.addEventListener('click', () => {
                if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined || document.getElementsByClassName('profile-nav').value === undefined) {
                    noUserDisplay()
                } else {
                    likeDislike(likeNumber, dislikeNumber, likeButton.id, "l")
                }
            })

            dislikeButton.addEventListener('click', () => {
                if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
                    noUserDisplay()
                } else {
                    likeDislike(likeNumber, dislikeNumber, likeButton.id, "d")
                }
            })

            const commentButton = document.createElement('button')
            commentButton.classList.add('post-comment-button')
            commentButton.setAttribute('id', postID.value)
            const commentIcon = document.createElement('img')
            commentIcon.src = "ui/img/comment.png"
            commentIcon.classList.add('post-comment-icon')
            commentButton.appendChild(commentIcon)
            postInteractionDiv.appendChild(commentButton)

            commentButton.addEventListener('click', () => {
                viewComments(commentButton.id)
            })

            if (newPost['author'] == document.getElementsByClassName('profile-nav').value) {

                const editButton = document.createElement('button')
                editButton.classList.add('post-edit-button')
                editButton.setAttribute('id', postID.value)
                const editIcon = document.createElement('img')
                editIcon.src = "ui/img/edit.png"
                editIcon.classList.add('post-edit-icon')
                editButton.appendChild(editIcon)
                postInteractionDiv.appendChild(editButton)

                editButton.addEventListener('click', () => {
                    // const currentPost = editButton.parentNode.parentNode
                    editPost(editButton.id)
                })


                const deletePostButton = document.createElement('button')
                deletePostButton.classList.add('post-delete-post-button')
                deletePostButton.setAttribute('id', postID.value)
                const deletePostIcon = document.createElement('img')
                deletePostIcon.src = "ui/img/deletePost.png"
                deletePostIcon.classList.add('post-delete-post-icon')
                deletePostButton.appendChild(deletePostIcon)
                postInteractionDiv.appendChild(deletePostButton)

                deletePostButton.addEventListener('click', () => {
                    if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
                        noUserDisplay()
                    } else {
                        deletePost(deletePostButton.id)
                    }
                })

            }

            post.appendChild(postInteractionDiv)
            //if profile value !='' add like, dislike, edit and comment buttons
            postContainer.insertBefore(post, currentPosts[0])
        }
    }
}