export default class Moodle {

  constructor(baseURL, username, password) {
    this.baseURL = baseURL
    this.username = username
    this.password = password
    this.token = null

    this.getToken(() => {})
  }

  getUserInfo(callback) {
    this.invokeService('core_webservice_get_site_info', data => {
      callback({ id: data.userid, name: data.fullname })
    })
  }

  getUserCourses(userid, callback) {
    this.checkTokenAndAction(() => {
      this.invokeService('core_enrol_get_users_courses', data => {
        callback(data.map((course) => { return { name: course.fullname, id: course.id } }))
      }, { data: { userid: userid } })
    })
  }

  getCourseContent(courseid, callback) {
     this.invokeService('core_course_get_contents', data => {
       let content = { assignments: [], notifications: [], forumid: null }
       content.forumid = data[0].modules[0].id
       data[3].modules.forEach((a) => { content.assignments.push({ id: a.id, name: a.name }) })
       data[1].modules.forEach((n) => { content.notifications.push({ id: n.id, name: n.name }) })
       callback(content)
     }, {data: { courseid: courseid }})
  }

  getDiscussions(forumid, callback) {
    this.invokeService('mod_forum_get_forum_discussions_paginated', data => {
      callback(data.discussions.map((v) => {
        return {
          id: v.discussion,
          subject: v.subject,
          message: v.message,
          publisher: v.userfullname,
          createdTime: new Date(v.created * 1000),
          modifiedTime: new Date(v.modified * 1000)
        }
      }))
    }, { data: { forumid: forumid } })
  }

  checkTokenAndAction(callback) {
    if (this.token === null) {
      this.getToken(callback)
    } else {
      callback()
    }
  }

  invokeService(service, callback, options={}) {
    this.checkTokenAndAction(() => {
      let url = `${this.baseURL}/webservice/rest/server.php?wstoken=${this.token}&wsfunction=${service}&moodlewsrestformat=json&moodlewssettingfilter=true&moodlewssettingfileurl=true`
      let req = {
        url: url, method: 'POST', header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: resp => {
          callback(resp.data)
        }
      }

      for (let option in options) {
        req[option] = options[option]
      }

      wx.request(req)
    })
  }

}

// thread unsafed
Moodle.prototype.getToken = function() {
  let callbacks = []
  let status = 'UNINITIALIZED'
  return function(callback) {
    if (status === 'INITIALIZED') {
      callback()
      return
    }

    if (status === 'INITIALIZING') {
      callbacks.push(callback)
      return
    }

    status = 'INITIALIZING'
    callbacks.push(callback)
    let url = `${this.baseURL}/login/token.php?username=${this.username}&password=${this.password}&service=moodle_mobile_app`
    wx.request({
      url: url, method: 'POST',
      success: resp => {
        this.token = resp.data.token
        status = 'INITIALIZED'
        callbacks.forEach((c) => { c() })
        callbacks = []
      }
    })
  }
}()
