



// var errAddress=document.getElementById('errAddress')


function valFirstName(addressId) {
    var errFirstName = document.getElementById('errFirstName'+addressId)
    const name = document.getElementById('firstName'+addressId).value;
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
function valLastName(addressId) {
    
    var errLasttName = document.getElementById('errLastName'+addressId)
    const name = document.getElementById('lastName'+addressId).value;
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
// function validEmail(addressId) {
//     var errEmail = document.getElementById('errEmail'+addressId)
//     const email = document.getElementById('email'+addressId).value
//     if (email == "") {
//         errEmail.innerHTML = "enter you email address"
       
//         return false
//     }
//     if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
//         errEmail.innerHTML = 'enter a proper email address'
      
//         return false
//     }
//     errEmail.innerHTML = null
//     return true
// }

 function validPhoNeumber(addressId) {
    var errPhoneNumber = document.getElementById('errPhoneNumber'+addressId)
    const mob = document.getElementById('phoneNumber'+addressId).value
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

function addressValidation(e,addressId) {
   
    var check = (element)=>{
        if(element){
            return true
        }else{
            return false
        }
    }
    var array =[valFirstName(addressId),valLastName(addressId),validPhoNeumber(addressId)]
    if (array.every(check)) {
        return true
    }
        e.preventDefault()
        return false
    
}





//add address validation
function valFirstNameAddAddress() {
    var errFirstName = document.getElementById('errFirstName')
    const name = document.getElementById('firstName').value;
    if (name == "") {       
        errFirstName.innerHTML = 'Enter yodasdasdasdasur First Name'
        return false
        }
    if (!name.match(/^[a-zA-Z]*$/)) {
        errFirstName.innerHTML = 'Enter a valid name'
        return false
    }
    errFirstName.innerHTML = null

    return true
}
function valLastNameAddAddress() {
    
    var errLasttName = document.getElementById('errLastName')
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
// function validEmail(addressId) {
//     var errEmail = document.getElementById('errEmail'+addressId)
//     const email = document.getElementById('email'+addressId).value
//     if (email == "") {
//         errEmail.innerHTML = "enter you email address"
       
//         return false
//     }
//     if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
//         errEmail.innerHTML = 'enter a proper email address'
      
//         return false
//     }
//     errEmail.innerHTML = null
//     return true
// }

 function validPhoNeumberAddAddress() {
    var errPhoneNumber = document.getElementById('errPhoneNumber')
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

function addressValidationAddAddress(e) {
   
    var check = (element)=>{
        if(element){
            return true
        }else{
            return false
        }
    }
    var array =[valFirstNameAddAddress(),valLastNameAddAddress(),validPhoNeumberAddAddress()]
    if (array.every(check)) {
        return true
    }
        e.preventDefault()
        return false
    
}