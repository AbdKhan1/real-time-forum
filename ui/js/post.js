import { deletePost, likeDislike, editPost } from './postInteraction.js'
import { noUserDisplay } from './profile.js'
let baseImage = ""
const postButton = document.querySelector('.create-post-button')
postButton.addEventListener('click', () => {
  if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined) {

    noUserDisplay()

  } else {
    postButton.disabled = true
    addPostDisplay()
    // handle new post data
    document.forms['create-post-form'].onsubmit = (event) => {
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
  }
})

function addPostDisplay() {
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

      let imageBase64Stringsep = baseImage;
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

  createPostPopUp.style.display = "block"
  createPostPopUp.appendChild(createPostForm)
  document.body.appendChild(createPostPopUp)
  createPostCloseButton.addEventListener('click', () => {
    createPostPopUp.remove()
    postButton.disabled = false
  })
}

export function displayPosts() {
  fetch("http://localhost:8000/getPosts")
    .then(response => response.json())
    .then(response => {
      console.log(response)
      let postDiv
      let postContainer
      if (document.querySelector('.homepage') == undefined) {

        postDiv = document.createElement('div')
        postDiv.classList.add('homepage')

        const filterDiv = document.createElement('div')
        filterDiv.classList.add('post-filter-container')
        const postUserFilter = document.createElement('input')
        postUserFilter.type = "text"
        postUserFilter.classList.add('post-user-filter')
        postUserFilter.placeholder = "by User"
        filterDiv.appendChild(postUserFilter)

        //   postUserFilter.addEventListener('input', (evt) => {
        //     const postsInput = response.filter(post =>
        //         post.author
        //             .toLocaleLowerCase()
        //             .includes(evt.target.value.trim().toLocaleLowerCase())
        //     )
        //     document.querySelectorAll('.post').forEach(post => { post.remove() })
        //     postsInput.forEach(post => {

        //     })
        // })

        const postThreadFilter = document.createElement('input')
        postThreadFilter.type = "text"
        postThreadFilter.classList.add('post-thread-filter')
        postThreadFilter.placeholder = "by Thread"
        filterDiv.appendChild(postThreadFilter)

        const postOrderFilter = document.createElement('button')
        postOrderFilter.type = "button"
        postOrderFilter.classList.add('post-order-filter')
        postOrderFilter.classList.add('descending')
        const orderIcon = document.createElement('img')
        orderIcon.src = "ui/img/order.png"
        orderIcon.classList.add('post-order-icon-descending')
        postOrderFilter.appendChild(orderIcon)
        filterDiv.appendChild(postOrderFilter)
        postDiv.appendChild(filterDiv)
        postContainer = document.createElement('div')
        postContainer.classList.add("post-container")

      } else {
        postDiv = document.querySelector(".homepage")
        postContainer = document.querySelector(".post-container")
      }


      for (let p = response.length - 1; p >= 0; p--) {
        //create post holder
        const post = document.createElement('div')
        post.classList.add("post")

        // create add post ID
        const postID = document.createElement('input')
        postID.type = "hidden"
        postID.name = "postID"
        postID.value = response[p]["post-id"]
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

        const postImageDiv = document.createElement('div')
        postImageDiv.classList.add('post-image-container')

        //image
        if (response[p]['post-image'] !== '') {
          const postImage = document.createElement('img')
          postImage.classList.add('post-image-display')
          postImage.style.display = 'none'
          postImage.onload = () => {
            postImage.style.display = 'block'
          }
          // postImage.readAsDataURL(this.files[0]);
          postImage.src = response[p]['post-image']
          postImageDiv.appendChild(postImage)
          post.appendChild(postImageDiv)
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

        if (response[p]['post-threads'] != '') {
          let threadSplit = response[p]['post-threads'].split('#')
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
        likeNumber.innerHTML = response[p]['post-likes']
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
        dislikeNumber.innerHTML = response[p]['post-dislikes']
        dislikeButton.setAttribute('id', postID.value)
        const dislikeIcon = document.createElement('img')
        dislikeIcon.src = "ui/img/dislike.png"
        dislikeIcon.classList.add('post-dislike-icon')
        dislikeButton.appendChild(dislikeNumber)
        dislikeButton.appendChild(dislikeIcon)
        postInteractionDiv.appendChild(dislikeButton)

        likeButton.addEventListener('click', () => {
          if (document.getElementsByClassName('profile-nav').value === '' || document.getElementsByClassName('profile-nav').value === undefined|| document.getElementsByClassName('profile-nav').value === undefined) {
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
          // const currentPost = editButton.parentNode.parentNode
          editPost(commentButton.id)
        })

        if (response[p]['author'] == document.getElementsByClassName('profile-nav').value) {

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
        postContainer.appendChild(post)
      }
      postDiv.appendChild(postContainer)
      document.querySelector('body').appendChild(postDiv)
    }
    )
}