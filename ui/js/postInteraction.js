import { displayPosts } from "./post.js"

export function likeDislike(likeNumber, dislikeNumber, id, like) {
  const likeObj = { "postID": id, "like": like, "type": "like/dislike" }
  fetch("http://localhost:8000/post-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(likeObj),
  })
    .then((response) => response.json())
    .then(response => {
      likeNumber.innerHTML = response['post-likes']
      dislikeNumber.innerHTML = response['post-dislikes']
    })
}

export function viewComments(commentId) {

}

export function deletePost(id) {
  const deletePostObj = { "postID": id, "type": "delete" }
  fetch("http://localhost:8000/post-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deletePostObj),
  }).then(response => {
    if (response.ok === true) {
      const currentPosts = document.querySelectorAll('.post')
      currentPosts.forEach(post => { post.remove() })
      displayPosts()
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
    .then(response => response.json())
    .then(response => {
      console.log({ response })
      if (document.getElementsByClassName('total-notif') != undefined) {
        document.getElementsByClassName('total-notif').innerHTML=response
      } else {
      } const totalNotif = document.createElement('p')
      totalNotif.classList.add('total-notif')
      totalNotif.innerHTML = response
      document.body.appendChild(totalNotif)

    })
}