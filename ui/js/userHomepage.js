window.addEventListener('load', () => {
    // const loader=document.createElement('div')
    // const loader_container=document.createElement('div')
    // loader_container.classList.add("loader-container")
    // loader.classList.add("loader-window")
    // loader_container.appendChild(loader)
    // document.querySelector('body').appendChild(loader_container)

    fetch("http://localhost:8000/checklogin")
        .then((response) => response.json())
        .then((response) => {
            if (response["session-authorized"] === true) {
                nav_buttons[0].children[1].style.display = "none"
                nav_buttons[0].children[2].style.display = "none"
                nav_buttons[0].children[3].style.display = "block"
                nav_buttons[0].children[4].style.display = "block"
                document.getElementsByClassName('profile-nav').value = response["session-username"]
                console.log(document.getElementsByClassName('profile-nav').value)
            }
        })

});
