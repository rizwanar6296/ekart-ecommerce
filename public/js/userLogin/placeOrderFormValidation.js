var errFirstName = document.getElementById('errFirstName')
var errLasttName = document.getElementById('errLastName')
var errEmail = document.getElementById('errEmail')
var errPhoneNumber = document.getElementById('errPhoneNumber')
// var errAddress=document.getElementById('errAddress')


function valFirstName() {
    
    const name = document.getElementById('firstName').value;
    if (name == "") {       
        errFirstName.innerHTML = 'Enter your First Name'
        return false
        }
    if (!name.match(/^[a-zA-Z]*$/)) {
        errFirstName.innerHTML = 'Enter a valid name'
        return false
    }
    errFirstName.innerHTML = null

    return true
}
function valLastName() {
    
    const name = document.getElementById('lastName').value;
    if (name == "") {       
        errLasttName.innerHTML = 'Enter your Last Name'
        return false
        }
    if (!name.match(/^[a-zA-Z]*$/)) {
        errLasttName.innerHTML = 'Enter a valid name'
        return false
    }
    errLasttName.innerHTML = null

    return true
}
function validEmail() {
    const email = document.getElementById('email').value
    if (email == "") {
        errEmail.innerHTML = "enter you email address"
       
        return false
    }
    if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
        errEmail.innerHTML = 'enter a proper email address'
      
        return false
    }
    errEmail.innerHTML = null
    return true
}

 function validPhoNeumber() {
    const mob = document.getElementById('phoneNumber').value
    if (mob == "") {
        errPhoneNumber.innerHTML = "enter a phonenumber"
        return false
    }
    if (mob.length < 10|| mob.length >10 || !mob.match(/^\d*$/)) {
        errPhoneNumber.innerHTML = "Please Enter the valid phone number"
        return false
    }
    errPhoneNumber.innerHTML = null
    return true
}
// function valAddress(){
//     let address=document.getElementById('address').value
//     if(address==""){
//         errAddress.innerHTML='enter your address'
//         return false
//     }else if(address.length<20){
//         errAddress.innerHTML='enter minimum 20 characters'
//         return false
//     }
//     errAddress.innerHTML=null
//     return true
// }

function validation() {
    var check = (element)=>{
        if(element){
            return true
        }else{
            return false
        }
    }
    var array =[valFirstName(),valLastName(),validEmail(),validPhoNeumber()]
    if (array.every(check)) {
       
        return true

    }
    return false
}