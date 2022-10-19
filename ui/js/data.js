// https://www.learnwithjason.dev/blog/get-form-values-as-json

//handle sign up form data
const form = document.querySelector('.sign-up-form');
form.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
    event.preventDefault(); //prevents page from refreshing
    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries())

    //check Date of birth object,if age is between 0-13, return with too young
    //if age is negative return wrong dob

    fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values),
    })
        .then((response) => response.json())
        // the first response will most likely be true or false

        //if false undo loader and present error message
        //make error message display none and the block if false

        //if true, display success on sign up page
        // change the entire html page to the forum and fetch post api
        .then((response) => {
            console.log(response)
            if (response.success == true) {
                console.log("we made it boysss")
            }
        })
}

//handle log in form data
const loginForm = document.querySelector('.login-form');
loginForm.addEventListener('submit', handleLoginSubmit);

function handleLoginSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const values = Object.fromEntries(data.entries())

    fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values),
    })
        .then((response) => console.log(response))
}