import Moodle from './moodle'
import Promise from './promise'

import {resetMsgs} from './util.js'

let baseURL = 'https://qcloud.robinhan.xyz'
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
        resetMsgs()
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

    getDiscussions(forumid, callback) {
        this.moodle.getDiscussions(forumid, function(v){
            callback(v.map((u) => {return {id: u.id, subject: u.subject}}))
        })
    }

    getBundle(callback) {
      let assignments = null
      let assignmentsPromise = new Promise((resolve, reject) => {
        this.moodle.getAssignments((res) => {
          assignments = res
          resolve()
        })
      })

      let courses = null
      let notifications = null
      let discussions = null
      let coursesPromise = new Promise((resolve, reject) => {
        this.moodle.getUserCourses(44, res => { resolve(res) })
      }).then((data) => {

        courses = data
        return Promise.all(courses.map(c => {
          return new Promise((resolve, reject) => { this.moodle.getCourseContent(c.id, resolve) })
        })

        ).then(courses => {

          notifications = [].concat(...courses.map(c => {
            return c.notifications.map(n => {
              n.courseid = c.courseid
              return n
            })
          }))

          return Promise.all(courses.map(c => {
            return new Promise((resolve, reject) => { this.moodle.getDiscussions(c.forumid, resolve, { courseid: c.courseid }) })
          }))
        }).then(forums => {
          discussions = [].concat(...forums)
        })

      })

      Promise.all([assignmentsPromise, coursesPromise]).then(() => {
        callback({
          courses: courses,
          assignments: assignments,
          notifications: notifications,
          discussions: discussions
        })
      })
    }
}

User.sharedInstance = function() {
    if(sharedInstance == null) {
        sharedInstance = new User()
    }
    return sharedInstance
}
