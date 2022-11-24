const homeButton = document.querySelector('.home-nav')
const body = document.querySelector('body')


//
//// SIGN UP/////
//

// sign up page pop up
const signUpButton = document.querySelector('.sign-up-nav')
signUpButton.addEventListener('click', () => {
  signUpButton.classList.add('active')
  homeButton.classList.remove('active')
  const signupPopUp = document.querySelector('.sign-up-container')
  if (signupPopUp.style.display === "none" || signupPopUp.style.display === undefined || signupPopUp.style.display === '') {
    signupPopUp.style.display = "block"
  }
})


// close sign up page pop up
const signupCloseButton = document.querySelector('.signup-close-button')
signupCloseButton.addEventListener('click', () => {
  signUpButton.classList.remove('active')
  homeButton.classList.add('active')
  const signupPopUp = document.querySelector('.sign-up-container')
  signupPopUp.style.display = "none"
})

//
//// lOG IN/////
//

// log in pop up
const loginButton = document.querySelector('.login-nav')
loginButton.addEventListener('click', () => {
  loginButton.classList.add('active')
  homeButton.classList.remove('active')
  const loginPopUp = document.querySelector('.login-container')
  if (loginPopUp.style.display === "none" || loginPopUp.style.display === undefined || loginPopUp.style.display === '') {
    loginPopUp.style.display = "block"
  }
})


// close login page pop up
const loginCloseButton = document.querySelector('.login-close-button')
loginCloseButton.addEventListener('click', () => {
  loginButton.classList.remove('active')
  homeButton.classList.add('active')
  const loginPopUp = document.querySelector('.login-container')
  loginPopUp.style.display = "none"
})






fetch("http://localhost:8000/getPosts")
  .then(response => response.json())
  .then(response => {
    console.log(response)
    const postDiv = document.createElement('div')
    postDiv.classList.add('homepage')

    // const postUserFilter = document.createElement('input')
    // postUserFilter.type = "text"
    // postUserFilter.classList.add('post-user-filter')
    // postUserFilter.placeholder = "by User"
    // postDiv.appendChild(postUserFilter)

    // const postThreadFilter = document.createElement('input')
    // postThreadFilter.type = "text"
    // postThreadFilter.classList.add('post-thread-filter')
    // postThreadFilter.placeholder = "by Thread"
    // postDiv.appendChild(postThreadFilter)

    // const postOrderFilter = document.createElement('button')
    // postOrderFilter.type = "button"
    // postOrderFilter.classList.add('post-order-filter')
    // const orderIcon = document.createElement('img')
    // orderIcon.src = "ui/img/order.png"
    // orderIcon.classList.add('post-order-icon')
    // postOrderFilter.appendChild(orderIcon)
    // postDiv.appendChild(postOrderFilter)

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
  }
  )

//
//// lOG OUT/////
//
