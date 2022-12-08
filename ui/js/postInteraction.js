import { statusConn } from "./data.js"
import { displayPosts } from "./post.js"

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


  addThread.addEventListener('click', () => {
    if (threadInput.value != '') {
      const threadText = document.createElement('p')
      threadText.classList.add('thread')
      threadText.innerHTML = "#" + threadInput.value
      addedThreadList.appendChild(threadText)
      threadInput.value = ""
    }
  })

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
            statusConn.connect(response)
            const currentPostList = document.querySelectorAll('.post')
            console.log(currentPostList)
            for (let r = 0; r < currentPostList.length; r++) {
              currentPostList[r].remove()
            }
            displayPosts()
            postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
            postPopUp.style.display = "none"
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

export function addCommentDisplay() {
  const postButton = document.querySelector('.create-post-button')
  const createCommentPopUp = document.createElement('div')
  createCommentPopUp.classList.add('create-comment-container')
  const createCommentForm = document.createElement('form')
  createCommentForm.classList.add('create-comment-form')
  createCommentForm.method = "POST"

  // close button
  const createCommentCLoseButton = document.createElement('button')
  createCommentCLoseButton.classList.add('create-comment-close-button')
  createCommentCLoseButton.classList.add('add-comment-input')
  createCommentCLoseButton.type = "button"
  const cross = document.createElement('span')
  cross.innerHTML = "&times;"
  createCommentCLoseButton.appendChild(cross)
  createCommentForm.appendChild(createCommentCLoseButton)

  //image input
  // https://stackoverflow.com/questions/65062363/displaying-picture-before-submitting-the-form-javascript
  // https://www.geeksforgeeks.org/how-to-convert-image-into-base64-string-using-javascript/
  const commentImage = document.createElement('input')
  commentImage.type = "file"
  commentImage.classList.add("upload-comment-image")
  commentImage.classList.add('add-comment-input')
  commentImage.setAttribute("name", "comment-image-content")
  const commentImageContent = document.createElement('img')
  commentImageContent.classList.add('comment-image-preview')
  commentImageContent.classList.add('add-comment-input')
  createCommentForm.appendChild(commentImageContent)
  createCommentForm.appendChild(commentImage)
  commentImage.onchange = function () {
    let image = new FileReader();
    image.onload = function (e) {
      commentImageContent.src = e.target.result;
      baseImage = image.result.replace("data:", "")
        .replace(/^.+,/, "");
    }
    image.readAsDataURL(this.files[0]);
    commentImageContent.style.display = "block"
  }

  // text input
  const textArea = document.createElement('input')
  textArea.type = "textarea"
  textArea.placeholder = "Put Your Two Cents In It!!!"
  textArea.classList.add("comment-text")
  textArea.classList.add('add-comment-input')
  textArea.setAttribute("name", "comment-text-content")
  createCommentForm.appendChild(textArea)

  //thread input
  const threadContainer = document.createElement('div')
  threadContainer.classList.add('comment-thread-container')

  const threadInput = document.createElement('input')
  threadInput.type = "text"
  threadInput.placeholder = "Add thread"
  threadInput.classList.add("comment-thread")
  threadInput.classList.add('add-comment-input')

  const addThread = document.createElement('button')
  addThread.type = "button"
  addThread.innerHTML = "+Add"
  addThread.classList.add("add-thread")
  addThread.classList.add('add-comment-input')

  const addedThreadList = document.createElement('div')
  addedThreadList.classList.add('list-of-thread')

  threadContainer.appendChild(threadInput)
  threadContainer.appendChild(addThread)


  addThread.addEventListener('click', () => {
    if (threadInput.value != '') {
      const threadText = document.createElement('p')
      threadText.classList.add('thread')
      threadText.innerHTML = "#" + threadInput.value
      addedThreadList.appendChild(threadText)
      threadInput.value = ""
    }
  })

  createCommentForm.appendChild(threadContainer)
  createCommentForm.appendChild(addedThreadList)



  //add send post button
  const postCommentButton = document.createElement('input')
  postCommentButton.type = "submit"
  postCommentButton.value = "Post Comment"
  postCommentButton.classList.add('submit-comment-button')
  postCommentButton.classList.add('add-comment-input')
  createCommentForm.setAttribute('id', "create-comment-form")
  createCommentForm.appendChild(postCommentButton)

  // createCommentForm.onsubmit = (event) => {
  //   event.preventDefault()
  //   const commentPopUp = document.querySelector('.create-comment-container')
  //   commentPopUp.style.backgroundColor = "rgb(255,255,255,0.6)"
  //   const data = new FormData(event.target);

  //   const receivedThreads = []
  //   const sentThreads = document.getElementsByClassName('thread')
  //   for (let t = 0; t < sentThreads.length; t++) {
  //     if (sentThreads.length === 0) {
  //       return
  //     } else {
  //       receivedThreads.push(sentThreads[t].innerHTML)
  //     }
  //   }
  //   data.append('comment-threads', receivedThreads)

  //   const comment_inputs = document.getElementsByClassName('add-comment-input')
  //   for (let l = 0; l < comment_inputs.length; l++) {
  //     comment_inputs[l].disabled = true
  //   }
  //   let values = Object.fromEntries(data.entries())

  //   const commentImageType = values['comment-image-content'].type
  //   values['comment-image'] = baseImage
  //   values['comment-image-type'] = commentImageType

  //   const dateNow = new Date();
  //   values['comment-time'] = dateNow.getTime()
  //   // console.log('v', values)
  //   setTimeout(() => {
  //     fetch("http://localhost:8000/createComment", {
  //       method: "POST",
  //       headers: {
  //         'Content-Type': "multipart/form-data"
  //       },
  //       body: JSON.stringify(values),
  //     })
  //       .then(response => response.json())
  //       .then((response) => {
  //         console.log(response)
  //         if (response.error != '') {

  //           for (let l = 0; l < comment_inputs.length; l++) {
  //             comment_inputs[l].disabled = false
  //           }

  //           const comment_error_mess = document.querySelector('.comment-error-message')
  //           if (comment_error_mess == undefined) {
  //             let errorMes = document.createElement('p')
  //             errorMes.classList.add("comment-error-message")
  //             createCommentForm.insertBefore(errorMes, postCommentButton)
  //             errorMes.innerHTML = response.error
  //           } else {
  //             comment_error_mess.innerHTML = comment_error_mess.innerHTML.replace(comment_error_mess.innerHTML, response.error)
  //           }

  //           commentPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"

  //         } else {
  //           for (let l = 0; l < comment_inputs.length; l++) {
  //             comment_inputs[l].disabled = false
  //           }
  //           const currentPostList = document.querySelectorAll('.post')
  //           console.log(currentPostList)
  //           for (let r = 0; r < currentPostList.length; r++) {
  //             currentPostList[r].remove()
  //           }
  //           displayPosts()
  //           commentPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
  //           commentPopUp.style.display = "none"
  //           postButton.disabled = false
  //         }
  //       })
  //   }, 2000)
  // }

  createCommentPopUp.style.display = "block"
  createCommentPopUp.appendChild(createCommentForm)
  document.body.appendChild(createCommentPopUp)
  createCommentCLoseButton.addEventListener('click', () => {
    createCommentPopUp.remove()
    postButton.disabled = false
  })
}

export function viewComments(id) {
  if (document.querySelector('.comment-container') != undefined) {
    document.querySelector('.comment-container').remove()
  }
  if (document.querySelector('.chat-container') != undefined) {
    document.querySelector('.chat-container').remove()
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
      const commentDiv = document.createElement('div')
      commentDiv.classList.add('comment-container')

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
      addCommentButton.onclick = () => { addCommentDisplay() }

      closeDiv.appendChild(viewCommentCloseButton)
      closeDiv.appendChild(addCommentButton)

      commentDiv.appendChild(closeDiv)

      const commentPost = document.createElement('div')
      commentPost.classList.add('post-comment')

      const postID = document.createElement('input')
      postID.type = "hidden"
      postID.name = "postID"
      postID.value = response["post-id"]
      commentPost.appendChild(postID)

      // post Author
      const postAuthorDiv = document.createElement('div')
      postAuthorDiv.classList.add('post-comment-author-container')
      //create img for dp
      const postAuthor = document.createElement('h2')
      postAuthor.classList.add('post-comment-author')
      postAuthor.innerHTML = response["author"]
      postAuthorDiv.appendChild(postAuthor)

      //time
      const postDateAndTime = new Date(response["post-time"])
      // console.log(postDateAndTime.toLocaleString())
      const postTime = document.createElement('p')
      postTime.classList.add('post-comment-time')
      postTime.innerHTML = postDateAndTime.toLocaleString()
      postAuthorDiv.appendChild(postTime)
      commentPost.appendChild(postAuthorDiv)


      const postImageDiv = document.createElement('div')
      postImageDiv.classList.add('post-comment-image-container')

      //image
      if (response['post-image'] !== '') {
        const postImage = document.createElement('img')
        postImage.classList.add('post-comment-image-display')
        postImage.style.display = 'none'
        postImage.onload = () => {
          postImage.style.display = 'block'
        }
        postImage.src = response['post-image']
        postImageDiv.appendChild(postImage)
        commentPost.appendChild(postImageDiv)
      }

      //text
      if (response['post-text-content'] !== '') {
        const postText = document.createElement('h3')
        postText.classList.add('post-comment-text-content')
        postText.innerHTML = response['post-text-content']
        commentPost.appendChild(postText)
      }

      const postThreadList = document.createElement('div')
      postThreadList.classList.add('post-comment-thread-list')
      commentPost.appendChild(postThreadList)

      if (response['post-threads'] != '') {
        let threadSplit = response['post-threads'].split('#')
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

      // ADD div undernthe post for the comments table.

      const postCommentDiv = document.createElement('div')
      postCommentDiv.classList.add('post-comment-container')

      // const noComments



      commentDiv.appendChild(postCommentDiv)
      commentDiv.appendChild(commentPost)
      document.querySelector('.homepage').appendChild(commentDiv)

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
      if (response > 0) {
        console.log(response)
        if (document.querySelector('.total-notif') != undefined) {
          if (response > 99) {
            document.querySelector('.total-notif').innerHTML = '99+'
          } else {
            document.querySelector('.total-notif').innerHTML = response
          }
        } else {
          const totalNotif = document.createElement('p')
          totalNotif.classList.add('total-notif')
          if (response > 99) {
            totalNotif.innerHTML = "99+"
          } else {
            totalNotif.innerHTML = response
          }
          document.body.appendChild(totalNotif)
        }
      } else {
        if (document.querySelector('.total-notif') != undefined) {
          document.querySelector('.total-notif').remove()
        }
      }
    })
}