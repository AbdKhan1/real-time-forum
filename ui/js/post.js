let baseImage = ""
const postButton = document.querySelector('.create-post-button')
postButton.addEventListener('click', () => {
  if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {
    const noUserContainer = document.createElement('div')
    noUserContainer.classList.add('no-user-container')
    const noUser = document.createElement('div')
    noUser.classList.add('no-user')
    const noUserMessage = document.createElement('h1')
    noUserMessage.innerHTML = "Please Log In or Sign Up To Create A Post"
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

    body.appendChild(noUserContainer)


  } else {
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

        imageBase64Stringsep = baseImage;
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

    // //error message
    // const errorMes = document.createElement('p')
    // errorMes.classList.add("post-error-message")
    // createPostForm.appendChild(errorMes)

    //add send post button
    const addPostButton = document.createElement('input')
    addPostButton.type = "submit"
    addPostButton.value = "Add Post"
    addPostButton.classList.add('add-post-button')
    addPostButton.classList.add('add-post-input')
    createPostForm.setAttribute('id', "create-post-form")
    createPostForm.appendChild(addPostButton)

    createPostPopUp.style.display = "block"
    createPostPopUp.appendChild(createPostForm)
    body.appendChild(createPostPopUp)
    createPostCloseButton.addEventListener('click', () => {
      createPostPopUp.remove()
    })

    // handle new post data
    document.forms['create-post-form'].onsubmit = (event) => {
      event.preventDefault()
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
      for (l = 0; l < post_inputs.length; l++) {
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
          // delete homepage reconstruct with new post included
          // make post container background colour= rgb(255,255,255,1)
          //make post form display=none
          //then when all is said and done revert back to rgb(0,0,0,0.4) 
          // make post container none
          // making post form display block
          // re-enable post buttons

          .then((response) => {
            console.log(response)
            if (response.error != '') {

              for (l = 0; l < post_inputs.length; l++) {
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
            } else {
              createPostPopUp.style.backgroundColor = "rgb(255,255,255,1)"
              for (l = 0; l < post_inputs.length; l++) {
                post_inputs[l].disabled = false
              }
              const currentPostList = document.querySelectorAll('.post')
              console.log(currentPostList)
              for (let r = 0; r < currentPostList.length; r++) {
                currentPostList[r].remove()
              }

              fetch("http://localhost:8000/getPosts")
                .then(response => response.json())
                .then(response => {
                  console.log(response)
                  const postDiv = document.querySelector(".homepage")

                  for (let p = response.length - 1; p >= 0; p--) {
                    //create post container
                    const post = document.createElement('div')
                    post.classList.add("post")

                    // create add post ID
                    const postID = document.createElement('input')
                    postID.type = "hidden"
                    postID.name = "postID"
                    postID.value = response[0]["post-id"]
                    post.appendChild(postID)

                    // post Author
                    const postAuthorDiv = document.createElement('div')
                    postAuthorDiv.classList.add('post-author-container')
                    //create img for dp
                    const postAuthor = document.createElement('h2')
                    postAuthor.classList.add('post-author')
                    postAuthor.innerHTML = response[p]["author"]
                    postAuthorDiv.appendChild(postAuthor)
                    post.appendChild(postAuthorDiv)

                    //time
                    const postDateAndTime = new Date(response[p]["post-time"])
                    // console.log(postDateAndTime.toLocaleString())
                    const postTime = document.createElement('p')
                    postTime.classList.add('post-time')
                    postTime.innerHTML = postDateAndTime.toLocaleString()
                    post.appendChild(postTime)

                    //image
                    if (response[p]['post-image'] !== '') {
                      const postImage = document.createElement('img')
                      postImage.classList.add('post-image-display')
                      postImage.style.display = 'none'
                      postImage.onload(() => {
                        postImage.style.display = 'block'
                      })
                      postImage.src = response[p]['post-image']
                      post.appendChild(postImage)
                    }

                    //text
                    if (response[p]['post-text-content'] !== '') {
                      const postText = document.createElement('h3')
                      postText.classList.add('post-text-content')
                      postText.innerHTML = response[p]['post-text-content']
                      post.appendChild(postText)
                    }

                    const postThreadList = document.createElement('div')
                    postThreadList.classList.add('post-thread-list')
                    post.appendChild(postThreadList)

                    // console.log(response[p]['post-threads'])
                    if (response[p]['post-threads'] != '') {
                      let threadSplit = response[p]['post-threads'].split('#')
                      console.log(threadSplit, 'split threads')
                      threadSplit.filter(thread => thread != '').forEach(thread => {
                        const postThreads = document.createElement('p')
                        postThreads.innerHTML ='#'+ thread.slice(0, - 1)
                        postThreadList.appendChild(postThreads)
                      });
                    }

                    const postInteractionDiv = document.createElement('div')
                    postInteractionDiv.classList.add('post-interaction')


                    const likeButton = document.createElement('button')
                    likeButton.classList.add('post-like-button')
                    likeButton.innerHTML = response[p]['post-likes'], "Like"
                    likeButton.setAttribute('id', postID.value)
                    const likeIcon = document.createElement('img')
                    likeIcon.src = "ui/img/like.png"
                    likeIcon.classList.add('post-like-icon')
                    likeButton.appendChild(likeIcon)
                    postInteractionDiv.appendChild(likeButton)

                    const dislikeButton = document.createElement('button')
                    dislikeButton.classList.add('post-dislike-button')
                    dislikeButton.innerHTML = response[p]['post-dislikes']
                    dislikeButton.setAttribute('id', postID.value)
                    const dislikeIcon = document.createElement('img')
                    dislikeIcon.src = "ui/img/dislike.png"
                    dislikeIcon.classList.add('post-dislike-icon')
                    dislikeButton.appendChild(dislikeIcon)
                    postInteractionDiv.appendChild(dislikeButton)

                    const commentButton = document.createElement('button')
                    commentButton.classList.add('post-comment-button')
                    commentButton.setAttribute('id', postID.value)
                    const commentIcon = document.createElement('img')
                    commentIcon.src = "ui/img/comment.png"
                    commentIcon.classList.add('post-comment-icon')
                    commentButton.appendChild(commentIcon)
                    postInteractionDiv.appendChild(commentButton)

                    const editButton = document.createElement('button')
                    editButton.classList.add('post-edit-button')
                    editButton.setAttribute('id', postID.value)
                    const editIcon = document.createElement('img')
                    editIcon.src = "ui/img/edit.png"
                    editIcon.classList.add('post-edit-icon')
                    editButton.appendChild(editIcon)
                    postInteractionDiv.appendChild(editButton)

                    post.appendChild(postInteractionDiv)

                    //if profile value !='' add like, dislike, edit and comment buttons
                    postDiv.appendChild(post)
                  }
                  document.querySelector('body').appendChild(postDiv)
                  createPostPopUp.style.backgroundColor = "rgb(0,0,0,0.4)"
                  createPostPopUp.style.display = "none"
                }
                )
            }
          })
      }, 2000)
    }
  }
})