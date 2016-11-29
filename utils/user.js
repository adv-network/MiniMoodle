import Moodle from 'moodle'

let baseURL = 'https://172.17.215.201'
var sharedInstance = null

export default class User {
    constructor() {
        this.moodle = null
        this.remoteID = this.id()

        if(this.isAuthorized()){
            this.moodle = new Moodle(baseURL, this.username(), this.password())
        }
    }

    username() {
        return wx.getStorageSync('username')
    }

    password() {
        return wx.getStorageSync('password')
    }

    id() {
        return wx.getStorageSync('userid')
    }

    isAuthorized() {
        return this.remoteID != ''
    }

    bindAccount(username, password, callback) {
        // console.log(username + "\t" + password)
        this.moodle = new Moodle(baseURL, username, password)
        this.moodle.getUserInfo(function(v){
            console.log(v)
            let success = v.id != undefined
            if(success) {
                wx.setStorageSync('userid', v.id)
                wx.setStorageSync('username', username)
                wx.setStorageSync('password', password)
                sharedInstance.remoteID = v.id
            }
            callback(success)
        })
    }

    logout() {
        wx.removeStorageSync('userid')
        wx.removeStorageSync('username')
        wx.removeStorageSync('password')
    }

    getCourses(callback) {
        this.moodle.getUserCourses(this.remoteID, function(v){
            callback(v)
        })
    }

    getCourseContent(courseid, callback) {
        this.moodle.getCourseContent(courseid, function(v){
            callback(v)
        })
    }
}

User.sharedInstance = function() {
    if(sharedInstance == null) {
        sharedInstance = new User()
    }
    return sharedInstance
}