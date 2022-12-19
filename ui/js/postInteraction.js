import { createComment, addCommentDisplay } from "./commentInteraction.js"
import { displayPosts } from "./post.js"
import { noUserDisplay } from "./profile.js"
import { debounce } from "./data.js"

let baseImage = ""
export function addPostDisplay() {
  const createPostPopUp = document.createElement('div')
  createPostPopUp.classList.add('create-post-container')
  const createPostForm = document.createElement('form')
  createPostForm.classList.add('create-post-form')
  createPostForm.method = "POST"

  // close button
  const createPostCloseButton = document.createElement('button')
  createPostCloseButton.classList.add('create-post-close-button')
  createPostCloseButton.classList.add('add-post-input')
  createPostCloseButton.type = "button"
  const cross = document.createElement('span')
  cross.innerHTML = "&times;"
  createPostCloseButton.appendChild(cross)
  createPostForm.appendChild(createPostCloseButton)

  //image input
  // https://stackoverflow.com/questions/65062363/displaying-picture-before-submitting-the-form-javascript
  // https://www.geeksforgeeks.org/how-to-convert-image-into-base64-string-using-javascript/
  const postImage = document.createElement('input')
  postImage.type = "file"
  postImage.classList.add("upload-post-image")
  postImage.classList.add('add-post-input')
  postImage.setAttribute("name", "post-image-content")
  const postImageContent = document.createElement('img')
  postImageContent.classList.add('post-image-preview')
  postImageContent.classList.add('add-post-input')
  createPostForm.appendChild(postImageContent)
  createPostForm.appendChild(postImage)
  postImage.onchange = function () {
    let image = new FileReader();
    image.onload = function (e) {
      postImageContent.src = e.target.result;
      baseImage = image.result.replace("data:", "")
        .replace(/^.+,/, "");
    }
    image.readAsDataURL(this.files[0]);
    postImageContent.style.display = "block"
  }

  // text input
  const textArea = document.createElement('input')
  textArea.type = "textarea"
  textArea.placeholder = "Watchyu Tryna Say!!!"
  textArea.classList.add("post-text")
  textArea.classList.add('add-post-input')
  textArea.setAttribute("name", "post-text-content")
  createPostForm.appendChild(textArea)

  //thread input
  const threadContainer = document.createElement('div')
  threadContainer.classList.add('post-thread-container')

  const threadInput = document.createElement('input')
  threadInput.type = "text"
  threadInput.placeholder = "Add thread"
  threadInput.classList.add("post-thread")
  threadInput.classList.add('add-post-input')

  const addThread = document.createElement('button')
  addThread.type = "button"
  addThread.innerHTML = "+Add"
  addThread.classList.add("add-thread")
  addThread.classList.add('add-post-input')

  const addedThreadList = document.createElement('div')
  addedThreadList.classList.add('list-of-thread')

  threadContainer.appendChild(threadInput)
  threadContainer.appendChild(addThread)


  addThread.addEventListener('click', debounce(() => {
    if (threadInput.value != '') {
      const threadText = document.createElement('p')
      threadText.classList.add('thread')
      threadText.innerHTML = "#" + threadInput.value
      addedThreadList.appendChild(threadText)
      threadInput.value = ""
    }
  }, 500))

  createPostForm.appendChild(threadContainer)
  createPostForm.appendChild(addedThreadList)



  //add send post button
  const addPostButton = document.createElement('input')
  addPostButton.type = "submit"
  addPostButton.value = "Add Post"
  addPostButton.classList.add('add-post-button')
  addPostButton.classList.add('add-post-input')
  createPostForm.setAttribute('id', "create-post-form")
  createPostForm.appendChild(addPostButton)

  createPostForm.onsubmit = (event) => {
    event.preventDefault()
    const postPopUp = document.querySelector('.create-post-container')
    postPopUp.style.backgroundColor = "rgb(255,255,255,0.6)"
    const data = new FormData(event.target);

    const receivedThreads = []
    const sentThreads = document.getElementsByClassName('thread')
    for (let t = 0; t < sentThreads.length; t++) {
      if (sentThreads.length === 0) {
        return
      } else {
        receivedThreads.push(sentThreads[t].innerHTML)
      }
    }
    data.append('post-threads', receivedThreads)

    const post_inputs = document.getElementsByClassName('add-post-input')
    for (let l = 0; l < post_inputs.length; l++) {
      post_inputs[l].disabled = true
    }
    let values = Object.fromEntries(data.entries())

    const postImageType = values['post-image-content'].type
    values['post-image'] = baseImage
    values['post-image-type'] = postImageType
    baseImage = ""

    const dateNow = new Date();
    values['post-time'] = dateNow.getTime()
    // console.log('v', values)
    setTimeout(() => {
      fetch("http://localhost:8000/createPost", {
        method: "POST",
        headers: {
          'Content-Type': "multipart/form-data"
        },
        body: JSON.stringify(values),
      })
        .then(response => response.json())
        .then((response) => {
          console.log(response)
          if (response.error != '') {

            for (let l = 0; l < post_inputs.length; l++) {
              post_inputs[l].disabled = false
            }

            const post_error_mes = document.querySelector('.post-error-message')
            if (post_error_mes == undefined) {
              let errorMes = document.createElement('p')
              errorMes.classList.add("post-error-message")
              document.forms['create-post-form'].insertBefore(errorMes, document.querySelector('.add-post-button'))
              errorMes.innerHTML = response.error
            } else {
              post_error_mes.innerHTML = post_error_mes.innerHTML.replace(post_error_mes.innerHTML, response.error)
            }

            postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"

          } else {
            for (let l = 0; l < post_inputs.length; l++) {
              post_inputs[l].disabled = false
            }
            postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
            postPopUp.remove()
            // postPopUp.style.display = "none"
            document.querySelector('.create-post-button').disabled = false
          }
        })
    }, 2000)
  }

  createPostPopUp.style.display = "block"
  createPostPopUp.appendChild(createPostForm)
  document.body.appendChild(createPostPopUp)
  createPostCloseButton.addEventListener('click', () => {
    createPostPopUp.remove()
    document.querySelector('.create-post-button').disabled = false
  })
}

export function likeDislike(id, like) {
  const likeObj = { "postID": id, "like": like, "type": "like/dislike" }
  console.log(likeObj)
  fetch("http://localhost:8000/post-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(likeObj),
  })
}

export function updateLikes(postLikes) {
  const input = document.getElementById(postLikes["postID"])
  console.log({ input })
  const postDiv = input.parentNode
  console.log({ postDiv })
  Array.from(postDiv.children).forEach(child => {
    if (child.className == "post-interaction") {
      Array.from(child.children).forEach(button => {
        if (button.className == "post-like-button") {
          button.firstChild.innerHTML = postLikes["post-likes"]
        }
        if (button.className == "post-dislike-button") {
          button.firstChild.innerHTML = postLikes["post-dislikes"]
        }
      })
    }
  })
}

export function viewComments(post, id) {
  if (document.querySelector('.comment-container') != undefined) {
    document.querySelector('.comment-container').remove()
  }

  const commentDiv = document.createElement('div')
  commentDiv.classList.add('comment-container')
  if (document.querySelector('.chat-container') != undefined) {
    commentDiv.style.zIndex = document.querySelector('.chat-container').style.zIndex++
  }
  const commentPostObj = { "postID": id, "type": "comment" }
  fetch("http://localhost:8000/post-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commentPostObj),
  })
    .then(response => response.json())
    .then(response => {
      console.log(response)


      const closeDiv = document.createElement('div')
      closeDiv.classList.add('close-comment-container')


      const viewCommentCloseButton = document.createElement('button')
      viewCommentCloseButton.classList.add('view-comment-close-button')
      viewCommentCloseButton.classList.add('view-comment-input')
      viewCommentCloseButton.type = "button"
      const cross = document.createElement('span')
      cross.innerHTML = "&times;"
      viewCommentCloseButton.appendChild(cross)
      viewCommentCloseButton.addEventListener('click', () => {
        closeDiv.appendChild(viewCommentCloseButton)
        commentDiv.remove()
      })

      const addCommentButton = document.createElement('button')
      addCommentButton.classList.add('add-comment-button')
      addCommentButton.classList.add('add-comment-input')
      addCommentButton.innerHTML = "Add Comment"
      addCommentButton.onclick = debounce(() => {
        if (document.getElementsByClassName('profile-nav').value == undefined) {
          noUserDisplay()
        } else {
          addCommentDisplay(id)
        }
      }, 500)

      closeDiv.appendChild(viewCommentCloseButton)
      closeDiv.appendChild(addCommentButton)

      commentDiv.appendChild(closeDiv)

      const commentPost = post.cloneNode(true)
      commentPost.classList.remove("post")
      commentPost.classList.add("post-comment")
      console.log(commentPost)

      Array.from(commentPost.children).forEach(child => {
        if (child.className == "post-author-container") {
          child.className = "post-comment-author-container"
        } else if (child.className == "post-time") {
          child.className = "post-comment-time"
        } else if (child.className == "post-image-container") {
          child.className = "post-comment-image-container"
          child.firstChild.className = "post-comment-image-display"
        } else if (child.className == "post-text-content") {
          child.className = "post-comment-text-content"
        } else if (child.className == "post-thread-list") {
          child.className = "post-comment-thread-list"
        } else if (child.className == "post-interaction") {
          commentPost.removeChild(child)
        }
      })

      const postCommentDiv = document.createElement('div')
      postCommentDiv.classList.add('post-comment-container')
      commentDiv.appendChild(postCommentDiv)
      commentDiv.appendChild(commentPost)
      document.querySelector('.homepage').appendChild(commentDiv)

      for (let p = response.length - 1; p >= 0; p--) {
        createComment("view", response[p])
      }


    })
}

export function deletePost(id) {
  const deletePostObj = { "postID": id, "type": "delete" }
  fetch("http://localhost:8000/post-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deletePostObj),
  })
}

export function removePost(deletePostId) {
  Array.from(document.querySelectorAll('.post')).forEach(post => {
    if (post.childNodes[0].id === deletePostId["delete-post-id"]) {
      post.remove()
    }
    if (document.querySelector('.comment-container') != undefined) {
      if (document.querySelector('.post-comment').childNodes[0].id === deletePostId["delete-post-id"]) {
        document.querySelector('.add-comment-button').disabled = true
      }
    }
  })
}

export function editPost(postId) {
  const postButton = document.querySelector('.create-post-button')
  const editObj = { "postID": postId, "type": "edit" }
  fetch("http://localhost:8000/post-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(editObj),
  })
    .then(response => response.json())
    .then(response => {
      console.log({ response })
      const editPostPopUp = document.createElement('div')
      editPostPopUp.classList.add('create-post-container')
      const editPostForm = document.createElement('form')
      editPostForm.classList.add('edit-post-form')
      editPostForm.setAttribute('id', "edit-post-form")
      editPostForm.method = "POST"

      // close button
      const editPostCloseButton = document.createElement('button')
      editPostCloseButton.classList.add('create-post-close-button')
      editPostCloseButton.classList.add('create-post-input')
      editPostCloseButton.type = "button"
      const cross = document.createElement('span')
      cross.innerHTML = "&times;"
      editPostCloseButton.appendChild(cross)
      editPostForm.appendChild(editPostCloseButton)

      const editPostId = document.createElement('input')
      editPostId.type = "hidden"
      editPostId.setAttribute('name', "post-id")
      editPostId.value = editObj.postID
      editPostForm.appendChild(editPostId)

      //image

      const postImageDiv = document.createElement('div')
      postImageDiv.classList.add('post-image-container')

      if (response['post-image'] !== '') {
        const postImage = document.createElement('img')
        postImage.classList.add('post-image-display')
        postImage.style.display = 'none'
        postImage.onload = () => {
          postImage.style.display = 'block'
        }
        postImage.src = response['post-image']
        postImageDiv.appendChild(postImage)
        editPostForm.appendChild(postImageDiv)
      }

      // text input
      const textArea = document.createElement('input')
      textArea.type = "textarea"
      textArea.placeholder = "Watchyu Tryna Edit!!!"
      textArea.value = response["post-text-content"]
      textArea.classList.add("post-text")
      textArea.classList.add('add-post-input')
      textArea.setAttribute("name", "post-text-content")
      editPostForm.appendChild(textArea)

      // //thread input
      const threadContainer = document.createElement('div')
      threadContainer.classList.add('post-thread-container')

      const threadInput = document.createElement('input')
      threadInput.type = "text"
      threadInput.placeholder = "Edit thread (#)"
      threadInput.classList.add("post-thread")
      threadInput.classList.add('add-post-input')

      const addThread = document.createElement('button')
      addThread.type = "button"
      addThread.innerHTML = "+Add"
      addThread.classList.add("add-thread")
      addThread.classList.add('add-post-input')

      const addedThreadList = document.createElement('div')
      addedThreadList.classList.add('list-of-thread')

      threadContainer.appendChild(threadInput)
      threadContainer.appendChild(addThread)

      const removeThreadMessage = document.createElement('p')
      removeThreadMessage.innerHTML = "Click thread to remove"
      removeThreadMessage.classList.add('remove-thread-message')

      if (response['post-threads'] != '') {
        let threadSplit = response['post-threads'].split('#')
        let removeEmptyThread = threadSplit.filter(thread => thread != '')
        removeEmptyThread.forEach((thread, i) => {
          const postThreads = document.createElement('p')
          if (i < removeEmptyThread.length - 1) {
            postThreads.innerHTML = '#' + thread.slice(0, - 1)
            postThreads.classList.add('edit-thread')
            addedThreadList.appendChild(postThreads)
          } else {
            postThreads.innerHTML = '#' + thread
            postThreads.classList.add('edit-thread')
            addedThreadList.appendChild(postThreads)
          }
          postThreads.onclick = () => {
            postThreads.remove()
          }
        });
      }

      addThread.addEventListener('click', () => {
        if (threadInput.value != '') {
          let threadSlice = threadInput.value.split(/(\s+)/).filter(t => t.trim().length > 0)
          console.log({ threadSlice })
          let newThread = threadSlice.join("_")
          console.log({ newThread })
          const threadText = document.createElement('p')
          threadText.classList.add('edit-thread')
          threadText.innerHTML = "#" + threadInput.value
          addedThreadList.appendChild(threadText)
          threadInput.value = ""
        }
      })
      editPostForm.appendChild(threadContainer)
      editPostForm.appendChild(removeThreadMessage)
      editPostForm.appendChild(addedThreadList)

      //edit send post button
      const editPostButton = document.createElement('input')
      editPostButton.type = "submit"
      editPostButton.value = "Edit Post"
      editPostButton.classList.add('add-post-button')
      editPostButton.classList.add('add-post-input')
      editPostForm.appendChild(editPostButton)

      editPostForm.onsubmit = (event) => {
        event.preventDefault()
        const postPopUp = document.querySelector('.create-post-container')
        postPopUp.style.backgroundColor = "rgb(255,255,255,0.6)"
        const data = new FormData(event.target);

        console.log({ data })
        const receivedThreads = []
        const sentThreads = document.getElementsByClassName('edit-thread')
        for (let t = 0; t < sentThreads.length; t++) {
          if (sentThreads.length === 0) {
            return
          } else {
            receivedThreads.push(sentThreads[t].innerHTML)
          }
        }
        data.append('post-threads', receivedThreads)

        const post_inputs = document.getElementsByClassName('add-post-input')
        for (let l = 0; l < post_inputs.length; l++) {
          post_inputs[l].disabled = true
        }
        let values = Object.fromEntries(data.entries())

        setTimeout(() => {
          fetch("http://localhost:8000/editPost", {
            method: "POST",
            headers: {
              'Content-Type': "multipart/form-data"
            },
            body: JSON.stringify(values),
          })
            .then(response => response.json())
            .then((response) => {
              console.log(response)
              if (response.error != '') {

                for (let l = 0; l < post_inputs.length; l++) {
                  post_inputs[l].disabled = false
                }

                const edit_err_message = document.querySelector('.post-error-message')
                if (edit_err_message == undefined) {
                  let errorMes = document.createElement('p')
                  errorMes.classList.add("post-error-message")
                  document.forms['edit-post-form'].insertBefore(errorMes, document.querySelector('.edit-post-button'))
                  errorMes.innerHTML = response.error
                } else {
                  edit_err_message.innerHTML = edit_err_message.innerHTML.replace(edit_err_message.innerHTML, response.error)
                }

                postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"

              } else {
                for (let l = 0; l < post_inputs.length; l++) {
                  post_inputs[l].disabled = false
                }
                const currentPostList = document.querySelectorAll('.post')
                console.log(currentPostList)
                for (let r = 0; r < currentPostList.length; r++) {
                  currentPostList[r].remove()
                }
                displayPosts()
                postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
                postPopUp.style.display = "none"
                postButton.disabled = false
              }
            })
        }, 2000)
      }

      editPostPopUp.style.display = "block"
      editPostPopUp.appendChild(editPostForm)
      document.body.appendChild(editPostPopUp)
      editPostCloseButton.addEventListener('click', () => {
        editPostPopUp.remove()
        postButton.disabled = false
      })
    })
}

export function getTotalNotifications() {
  const friendsObj = { "notification-type": "total" }
  fetch("http://localhost:8000/friendNotif", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(friendsObj)
  })
}

export function liveNotifications(notification) {
  if (notification["receiver-total-notifs"] > 0) {
    console.log(notification["receiver-total-notifs"])
    if (document.querySelector('.total-notif') != undefined) {
      if (notification["receiver-total-notifs"] > 99) {
        document.querySelector('.total-notif').innerHTML = '99+'
      } else {
        document.querySelector('.total-notif').innerHTML = notification["receiver-total-notifs"]
      }
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
      //add date to notification
      const notifDate = document.createElement('p')
      notifDate.classList.add("date")
      notifDate.innerHTML = notification["date"].toLocaleString();
      notifDate.style.display = "none";
      //...
      friend.children[0].appendChild(notifDate)
      const notifNum = document.createElement('p')
      notifNum.classList.add('num-of-messages')
      if (friend.children[0].childNodes.length == 2) {
        notifNum.innerHTML = notification["numOfMessages"]
        friend.children[0].appendChild(notifNum)
      } else {
        friend.children[0].childNodes[2].innerHTML = notification["numOfMessages"]
      }
      document.querySelector('.friends-button-container').insertBefore(friend, friendButtonDisplay[0])
    }
  })
}

export function recentNotif(element, len, index) {
  if (len === 1) {
    if (element.children[len].children[0].children.length > 1 && element.children[index].children[0].children.length <= 1) {
      element.insertBefore(element.children[len], element.firstChild)
      console.log('all arranged...')
      return
    }
  }
  if (index === len) {
    len = len - 1
    if (len === -1) {
      console.log('all arranged...')
      return
    }
    index = 0
    recentNotif(element, len, index)
  }
  if (element.children[len].children[0].children.length > 1 && element.children[index].children[0].children.length > 1) {
    let date = element.children[len].children[0].children[1].innerHTML
    let dateToCompare = element.children[index].children[0].children[1].innerHTML
    if (date > dateToCompare) {
      element.insertBefore(element.children[len], element.firstChild)
      recentNotif(element, len, index + 1)
    } else if (dateToCompare > date) {
      recentNotif(element, len, index + 1)
    }
  } else if (element.children[len].children[0].children.length > 1 && element.children[index].children[0].children.length <= 1) {
    element.insertBefore(element.children[len], element.firstChild)
    recentNotif(element, len, index + 1)
  } else {
    recentNotif(element, len, index + 1)
  }
}