var authorized = true

function isAuthorized() {
    return authorized
}

function bindAccount(username, password) {
    if(username=='123' && password == '123'){
        authorized = true
    } else {
        authorized = false
    }
    return isAuthorized()
}

function logout() {
    authorized = false
}

module.exports={
    isAuthorized: isAuthorized,
    bindAccount: bindAccount,
    logout: logout
}