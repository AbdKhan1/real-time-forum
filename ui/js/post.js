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
      //
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
              for (l = 0; l < post_inputs.length; l++) {
                post_inputs[l].disabled = false
              }
            }
          })
      }, 2000)
    }
  }
})