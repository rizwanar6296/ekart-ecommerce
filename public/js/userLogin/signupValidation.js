var errorName = document.getElementById('errorName')
var errorEmail = document.getElementById('errorEmail')
var errorPassword = document.getElementById('errorPassword')
var errorPhonenumber = document.getElementById('errorPhonenumber')
var errorConfirmPassword = document.getElementById('errorConfirmPassword')


function valName() {
    
    const name = document.getElementById('name').value;
    if (name == "") {       
        errorName.innerHTML = 'Enter your Name'
        return false
        }
    if (!name.match(/^[a-zA-Z]*$/)) {
        errorName.innerHTML = 'Enter a valid name'
        return false
    }
    errorName.innerHTML = null

    return true
}
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
function validConfirmPassword() {
   let password =document.getElementById('password').value
   let confirmPassword=document.getElementById('confirmPassword').value
    if (password==confirmPassword){   
        errorConfirmPassword.innerHTML = null
        return true     
    }else{      
        errorConfirmPassword.innerHTML = "password not matching"
        return false
    }
}
 function validPhoneumber() {
    const mob = document.getElementById('number').value
    if (mob == "") {
        errorPhonenumber.innerHTML = "enter a phonenumber"
        return false
    }
    if (mob.length < 10 && !mob.match(/^\d*$/)) {
        errorPhonenumber.innerHTML = "Please Enter the valid phone number"
        return false
    }
    errorPhonenumber.innerHTML = null
    return true
}


function validation() {
    var check = (element)=>{
        if(element){
            return true
        }else{
            return false
        }
    }
    var array =[valName(),validEmail(),validPassowrd(),validPhoneumber(),validConfirmPassword()]
    if (array.every(check)) {
       
        return true

    }
document.getElementById('alreadyUser').style.display='none'
    return false
}