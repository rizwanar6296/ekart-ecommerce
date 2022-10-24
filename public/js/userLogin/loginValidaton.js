var errorEmail = document.getElementById('errorEmail')
var errorPassword = document.getElementById('errorPassword')



function validEmail() {
    const email = document.getElementById('email').value
    if (email == "") {
        errorEmail.innerHTML = "enter you email address"
       
        return false
    }
    if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
        errorEmail.innerHTML = 'enter a proper email address'
      
        return false
    }
    errorEmail.innerHTML = null
    return true
}


function validPassowrd() {
    const password = document.getElementById('password').value
    if (password == "") {
        errorPassword.innerHTML = "enter a password"      
        return false
    }
    if (password.length < 5) {      
        errorPassword.innerHTML = "password should be more than five characters"
        return false
    }
    errorPassword.innerHTML = null
    return true
}