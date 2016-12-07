import request from './requests'

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
        callback(data.map(c => { return { name: c.fullname, id: c.id } }))
      }, { data: { userid: userid } })
    })
  }

  getCourseContent(courseid, callback) {
     this.invokeService('core_course_get_contents', data => {
       let content = { assignments: [], notifications: [], forumid: null, courseid: courseid }
       content.forumid = data[0].modules[0].id
       data[3].modules.forEach(a => { content.assignments.push({ id: a.id, title: a.name }) })
       data[1].modules.forEach(n => { content.notifications.push({ id: n.id, name: n.name }) })
       callback(content)
     }, {data: { courseid: courseid }})
  }

  getAssignments(callback) {
    this.invokeService('mod_assign_get_assignments', data => {
      let assignments = []
      data.courses.forEach(c => {
        c.assignments.forEach(a => {
          assignments.push({
            id: a.id,
            courseid: a.course,
            start: new Date(a.allowsubmissionsfromdate * 1000),
            due: new Date(a.duedate * 1000),
            title: a.name,
            content: a.intro
          })
        })
      });
      assignments.sort((a, b) => { return b.id - a.id })
      callback(assignments)
    })
  }

  getDiscussions(forumid, callback, optionData) {
    this.invokeService('mod_forum_get_forum_discussions_paginated', data => {
      if ('exception' in data) data = { discussions: [] }
      callback(data.discussions.map(v => {
        if (!(optionData instanceof Object)) optionData = {}
        let discussion = optionData
        return Object.assign(optionData, {
          id: v.discussion,
          subject: v.subject,
          message: v.message,
          publisher: v.userfullname,
          createdTime: new Date(v.created * 1000),
          modifiedTime: new Date(v.modified * 1000)
        })
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

      request(req)
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
    request({
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
