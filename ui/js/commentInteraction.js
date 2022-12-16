
export function createComment(action, newComment) {
  let commentContainer = document.querySelector(".post-comment-container")
  console.log(commentContainer)

  //create post holder
  const comment = document.createElement('div')
  comment.classList.add("comment")

  // create add post ID
  const commentID = document.createElement('input')
  commentID.type = "hidden"
  commentID.name = "commentID"
  commentID.value = newComment["comment-id"]
  comment.appendChild(commentID)

  // post Author
  const commentAuthorDiv = document.createElement('div')
  commentAuthorDiv.classList.add('comment-author-container')
  //create img for dp
  const commentAuthor = document.createElement('h2')
  commentAuthor.classList.add('comment-author')
  commentAuthor.innerHTML = newComment["comment-author"]
  commentAuthorDiv.appendChild(commentAuthor)
  comment.appendChild(commentAuthorDiv)

  //time
  const commentDateAndTime = new Date(newComment["comment-time"])
  const commentTime = document.createElement('p')
  commentTime.classList.add('comment-time')
  commentTime.innerHTML = commentDateAndTime.toLocaleString()
  comment.appendChild(commentTime)

  const commentImageDiv = document.createElement('div')
  commentImageDiv.classList.add('comment-image-container')

  //image
  if (newComment['comment-image'] !== '') {
    const commentImage = document.createElement('img')
    commentImage.classList.add('comment-image-display')
    commentImage.style.display = 'none'
    commentImage.onload = () => {
      commentImage.style.display = 'block'
    }
    commentImage.src = newComment['comment-image']
    commentImageDiv.appendChild(commentImage)
    comment.appendChild(commentImageDiv)
  }

  //text
  const commentText = document.createElement('h3')
  commentText.classList.add('comment-text')
  commentText.innerHTML = newComment['comment-text']
  comment.appendChild(commentText)

  const commentThreadList = document.createElement('div')
  commentThreadList.classList.add('comment-thread-list')
  comment.appendChild(commentThreadList)

  if (newComment['comment-threads'] != '') {
    let threadSplit = newComment['comment-threads'].split('#')
    let removeEmptyThread = threadSplit.filter(thread => thread != '')
    removeEmptyThread.forEach((thread, i) => {
      if (i < removeEmptyThread.length - 1) {
        const postThreads = document.createElement('p')
        postThreads.innerHTML = '#' + thread.slice(0, - 1)
        commentThreadList.appendChild(postThreads)
      } else {
        const postThreads = document.createElement('p')
        postThreads.innerHTML = '#' + thread
        commentThreadList.appendChild(postThreads)
      }
    });
  }

  const commentInteractionDiv = document.createElement('div')
  commentInteractionDiv.classList.add('comment-interaction')

  const likeButton = document.createElement('button')
  likeButton.classList.add('comment-like-button')
  const likeNumber = document.createElement('p')
  likeNumber.innerHTML = newComment['comment-likes']
  likeButton.setAttribute('id', commentID.value)
  const likeIcon = document.createElement('img')
  likeIcon.src = "ui/img/like.png"
  likeIcon.classList.add('comment-like-icon')
  likeButton.appendChild(likeNumber)
  likeButton.appendChild(likeIcon)
  commentInteractionDiv.appendChild(likeButton)

  const dislikeButton = document.createElement('button')
  dislikeButton.classList.add('comment-dislike-button')
  const dislikeNumber = document.createElement('p')
  dislikeNumber.innerHTML = newComment['comment-dislikes']
  dislikeButton.setAttribute('id', commentID.value)
  const dislikeIcon = document.createElement('img')
  dislikeIcon.src = "ui/img/dislike.png"
  dislikeIcon.classList.add('comment-dislike-icon')
  dislikeButton.appendChild(dislikeNumber)
  dislikeButton.appendChild(dislikeIcon)
  commentInteractionDiv.appendChild(dislikeButton)

  // likeButton.addEventListener('click', () => {
  //   if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined || document.getElementsByClassName('profile-nav').value === undefined) {
  //     noUserDisplay()
  //   } else {
  //     likeDislikeComment(likeNumber, dislikeNumber, likeButton.id, "l")
  //   }
  // })

  // dislikeButton.addEventListener('click', () => {
  //   if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
  //     noUserDisplay()
  //   } else {
  //     likeDislikeComment(likeNumber, dislikeNumber, likeButton.id, "d")
  //   }
  // })

  if (newComment['comment-author'] == document.getElementsByClassName('profile-nav').value) {

    const editButton = document.createElement('button')
    editButton.classList.add('comment-edit-button')
    editButton.setAttribute('id', commentID.value)
    const editIcon = document.createElement('img')
    editIcon.src = "ui/img/edit.png"
    editIcon.classList.add('comment-edit-icon')
    editButton.appendChild(editIcon)
    commentInteractionDiv.appendChild(editButton)

    editButton.addEventListener('click', () => {
      editComment(comment, editButton.id)
    })


    const deletePostButton = document.createElement('button')
    deletePostButton.classList.add('comment-delete-comment-button')
    deletePostButton.setAttribute('id', commentID.value)
    const deletePostIcon = document.createElement('img')
    deletePostIcon.src = "ui/img/deletePost.png"
    deletePostIcon.classList.add('comment-delete-comment-icon')
    deletePostButton.appendChild(deletePostIcon)
    commentInteractionDiv.appendChild(deletePostButton)

    deletePostButton.addEventListener('click', () => {
      if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
        noUserDisplay()
      } else {
        deleteComment(comment, deletePostButton.id)
      }
    })

  }
  comment.appendChild(commentInteractionDiv)
  //if profile value !='' add like, dislike, edit and comment buttons
  if (action == "add") {
    let currentComments = document.querySelectorAll('.comment')
    if (currentComments.length != 0) {
      commentContainer.insertBefore(comment, currentComments[0])
    } else {
      commentContainer.appendChild(comment)
    }
  } else {
    commentContainer.appendChild(comment)
  }

}
let baseImage = ""
export function addCommentDisplay(id) {
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

  const commentPostId = document.createElement('input')
  commentPostId.type = "hidden"
  commentPostId.name = "post-id"
  commentPostId.value = id
  createCommentForm.appendChild(commentPostId)

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
  textArea.classList.add("comment-text-form")
  textArea.classList.add('add-comment-input')
  textArea.setAttribute("name", "comment-text")
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


  addThread.addEventListener('click', debounce(() => {
    if (threadInput.value != '') {
      const threadText = document.createElement('p')
      threadText.classList.add('thread')
      threadText.innerHTML = "#" + threadInput.value
      addedThreadList.appendChild(threadText)
      threadInput.value = ""
    }
  }, 500))

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

  createCommentForm.onsubmit = debounce((event) => {
    event.preventDefault()
    const commentPopUp = document.querySelector('.create-comment-container')
    commentPopUp.style.backgroundColor = "rgb(255,255,255,0.6)"
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
    data.append('comment-threads', receivedThreads)

    const comment_inputs = document.getElementsByClassName('add-comment-input')
    for (let l = 0; l < comment_inputs.length; l++) {
      comment_inputs[l].disabled = true
    }
    let values = Object.fromEntries(data.entries())

    const commentImageType = values['comment-image-content'].type
    values['comment-image'] = baseImage
    baseImage = ""
    values['comment-image-type'] = commentImageType

    const dateNow = new Date();
    values['comment-time'] = dateNow.getTime()
    console.log('v', values)
    setTimeout(() => {
      fetch("http://localhost:8000/createComment", {
        method: "POST",
        headers: {
          'Content-Type': "multipart/form-data"
        },
        body: JSON.stringify(values),
      })
        .then(response => response.json())
        .then((response) => {
          console.log(response)
          if (response["comment-error"] != '') {

            for (let l = 0; l < comment_inputs.length; l++) {
              comment_inputs[l].disabled = false
            }

            const comment_error_mess = document.querySelector('.comment-error-message')
            if (comment_error_mess == undefined) {
              let errorMes = document.createElement('p')
              errorMes.classList.add("comment-error-message")
              createCommentForm.insertBefore(errorMes, postCommentButton)
              errorMes.innerHTML = response.error
            } else {
              comment_error_mess.innerHTML = comment_error_mess.innerHTML.replace(comment_error_mess.innerHTML, response["comment-error"])
            }

            commentPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"

          } else {
            for (let l = 0; l < comment_inputs.length; l++) {
              comment_inputs[l].disabled = false
            }
            createComment("add", response)
            commentPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
            commentPopUp.style.display = "none"
            commentPopUp.remove()
            postButton.disabled = false
          }
        })
    }, 2000)
  }, 500)

  createCommentPopUp.style.display = "block"
  createCommentPopUp.appendChild(createCommentForm)
  document.body.appendChild(createCommentPopUp)
  createCommentCLoseButton.addEventListener('click', () => {
    createCommentPopUp.remove()
    postButton.disabled = false
  })
}


export function editComment(comment, commentId) {
  const postButton = document.querySelector('.create-post-button')
  const editComment = comment.cloneNode(true)
  console.log({ editComment })
  const editPostPopUp = document.createElement('div')
  editPostPopUp.classList.add('create-comment-container')
  const editPostForm = document.createElement('form')
  editPostForm.classList.add('create-comment-form')
  editPostForm.setAttribute('id', "create-comment-form")
  editPostForm.method = "POST"

  // close button
  const editPostCloseButton = document.createElement('button')
  editPostCloseButton.classList.add('create-comment-close-button')
  editPostCloseButton.classList.add('add-comment-input')
  editPostCloseButton.type = "button"
  const cross = document.createElement('span')
  cross.innerHTML = "&times;"
  editPostCloseButton.appendChild(cross)
  editPostForm.appendChild(editPostCloseButton)

  const editPostId = document.createElement('input')
  editPostId.type = "hidden"
  editPostId.setAttribute('name', "comment-id")
  editPostId.value = commentId
  editPostForm.appendChild(editPostId)

  //image

  // text input
  const textArea = document.createElement('input')
  textArea.type = "textarea"
  textArea.placeholder = "Watchyu Tryna Edit!!!"
  textArea.classList.add("comment-text-form")
  textArea.classList.add('add-comment-input')
  textArea.setAttribute("name", "comment-text")
  editPostForm.appendChild(textArea)

  // //thread input
  const threadContainer = document.createElement('div')
  threadContainer.classList.add('comment-thread-container')

  const threadInput = document.createElement('input')
  threadInput.type = "text"
  threadInput.placeholder = "Edit thread (#)"
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

  const removeThreadMessage = document.createElement('p')
  removeThreadMessage.innerHTML = "Click thread to remove"
  removeThreadMessage.classList.add('remove-thread-message')

  addThread.addEventListener('click', debounce(() => {
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
  }, 500))
  editPostForm.appendChild(threadContainer)
  editPostForm.appendChild(removeThreadMessage)
  editPostForm.appendChild(addedThreadList)

  //edit send post button
  const editPostButton = document.createElement('input')
  editPostButton.type = "submit"
  editPostButton.value = "Edit Comment"
  editPostButton.classList.add('edit-comment-button')
  editPostButton.classList.add('add-comment-input')
  editPostForm.appendChild(editPostButton)

  editPostPopUp.style.display = "block"
  editPostPopUp.appendChild(editPostForm)
  document.body.appendChild(editPostPopUp)
  editPostCloseButton.addEventListener('click', () => {
    editPostPopUp.remove()
    postButton.disabled = false
  })
  const listOfChildren = editComment.children
  Array.from(listOfChildren).forEach(child => {
    if (child.className == "comment-image-container") {
      const postImage = document.createElement('img')
      postImage.classList.add('comment-image-preview')
      postImage.style.display = 'none'
      postImage.onload = () => {
        postImage.style.display = 'block'
      }
      postImage.src = child.firstChild.src
      editPostForm.insertBefore(postImage, textArea)
    } else if (child.className == "comment-text") {
      textArea.value = child.innerHTML
    } else if (child.className == "comment-thread-list") {
      Array.from(child.children).forEach(threads => {
        threads.className = "edit-thread"
        addedThreadList.appendChild(threads)
        threads.onclick = () => { threads.remove() }
      })
    }
  })

  editPostForm.onsubmit = debounce((event) => {
    event.preventDefault()
    const postPopUp = document.querySelector('.create-comment-container')
    postPopUp.style.backgroundColor = "rgb(255,255,255,0.6)"
    const data = new FormData(event.target);

    const receivedThreads = []
    const sentThreads = document.getElementsByClassName('edit-thread')
    for (let t = 0; t < sentThreads.length; t++) {
      if (sentThreads.length === 0) {
        return
      } else {
        receivedThreads.push(sentThreads[t].innerHTML)
      }
    }
    data.append('comment-threads', receivedThreads)

    const post_inputs = document.getElementsByClassName('add-comment-input')
    for (let l = 0; l < post_inputs.length; l++) {
      post_inputs[l].disabled = true
    }
    let values = Object.fromEntries(data.entries())
    console.log({ values })

    setTimeout(() => {
      fetch("http://localhost:8000/editComment", {
        method: "POST",
        headers: {
          'Content-Type': "multipart/form-data"
        },
        body: JSON.stringify(values),
      })
        .then(response => response.json())
        .then((response) => {
          console.log(response)
          if (response["comment-error"] != '') {

            for (let l = 0; l < post_inputs.length; l++) {
              post_inputs[l].disabled = false
            }

            const edit_err_message = document.querySelector('.comment-error-message')
            if (edit_err_message == undefined) {
              let errorMes = document.createElement('p')
              errorMes.classList.add("comment-error-message")
              document.forms['create-comment-form'].insertBefore(errorMes, editPostButton)
              errorMes.innerHTML = response["comment-error"]
            } else {
              edit_err_message.innerHTML = edit_err_message.innerHTML.replace(edit_err_message.innerHTML, response["comment-error"])
            }

            postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"

          } else {
            for (let l = 0; l < post_inputs.length; l++) {
              post_inputs[l].disabled = false
            }
            const originComment = comment.children
            Array.from(originComment).forEach(child => {
              if (child.className == "comment-text") {
                child.innerHTML = response["comment-text"]
              } else if (child.className == "comment-thread-list") {
                if (Array.from(child.children).length != 0) {
                  Array.from(child.children).forEach(thread => { thread.remove() })
                }
                let threadSplit = response['comment-threads'].split('#')
                let removeEmptyThread = threadSplit.filter(thread => thread != '')
                removeEmptyThread.forEach((thread, i) => {
                  if (i < removeEmptyThread.length - 1) {
                    const postThreads = document.createElement('p')
                    postThreads.innerHTML = '#' + thread.slice(0, - 1)
                    child.appendChild(postThreads)
                  } else {
                    const postThreads = document.createElement('p')
                    postThreads.innerHTML = '#' + thread
                    child.appendChild(postThreads)
                  }
                });
              }
            })

            postPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
            postPopUp.style.display = "none"
            postPopUp.remove()
            postButton.disabled = false
          }
        })
    }, 2000)
  }, 500)
}

export function deleteComment(comment, id) {
  const deletePostObj = { "comment-id": id, "type": "delete" }
  fetch("http://localhost:8000/comment-interactions", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deletePostObj),
  }).then(() => { comment.remove() })
}