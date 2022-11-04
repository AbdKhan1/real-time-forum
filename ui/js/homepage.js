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
    postDiv.classList.add('post-list')

    for (let p = 0; p < response.length; p++) {
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
        let threadSplit = response[p]['post-threads'].split(',')
        for (let t = 0; t < threadSplit.length; t++) {
          const postThreads = document.createElement('p')
          postThreads.innerHTML = threadSplit[t]
          postThreadList.appendChild(postThreads)
        }
      }
      //if profile value !='' add like, dislike, edit and comment buttons
      postDiv.appendChild(post)
    }
    document.querySelector('body').appendChild(postDiv)
  }
  )

//
//// lOG OUT/////
//
