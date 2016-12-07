import request from './requests'

export default class Moodle {

  constructor(baseURL, username, password) {
    this.getToken = getTokenWrapper()
    this.baseURL = baseURL
    this.username = username
    this.password = password
    this.token = null
    this.getToken(() => {})

  }

  getUserInfo(callback) {
    this.invokeService({
      service: 'core_webservice_get_site_info',
      success: data => { callback({ id: data.userid, name: data.fullname }) }
    })
  }

  getUserCourses(userid, callback) {
    this.invokeService({
      service: 'core_enrol_get_users_courses',
      success: data => {
        callback(data.map(c => { return { name: c.fullname, id: c.id } }))
      },
      data: { userid: userid }
    })
  }

  getCourseContent(courseid, callback) {
    this.invokeService({
      service: 'core_course_get_contents',
      data: { courseid: courseid },
      success: data => {
       let content = { assignments: [], notifications: [], forumid: null, courseid: courseid }
       content.forumid = data[0].modules[0].id
       data[3].modules.forEach(a => { content.assignments.push({ id: a.id, title: a.name }) })
       data[1].modules.forEach(n => { content.notifications.push({ id: n.id, name: n.name }) })
       callback(content)
      }
    })
  }

  getAssignments(callback) {
    this.invokeService({
      service: 'mod_assign_get_assignments',
      success: data => {
        let assignments = [].concat(...data.courses.map(c => {
          return c.assignments.map(a => {
            return {
              id: a.id,
              courseid: a.course,
              start: new Date(a.allowsubmissionsfromdate * 1000),
              due: new Date(a.duedate * 1000),
              title: a.name,
              content: a.intro
            }
          })
        })).sort((a, b) => { return b.id - a.id })
        callback(assignments)
      }
    })
  }

  getDiscussions(forumid, callback, optionData) {
    this.invokeService({
      service: 'mod_forum_get_forum_discussions_paginated',
      data: { forumid: forumid },
      success: data => {
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
      }
    })
  }

  checkTokenAndAction(callback) {
    if (this.token === null) {
      this.getToken(callback)
    } else {
      callback()
    }
  }

  invokeService(obj) {
    this.checkTokenAndAction(() => {
      let url = `${this.baseURL}/webservice/rest/server.php?wstoken=${this.token}&wsfunction=${obj.service}&moodlewsrestformat=json&moodlewssettingfilter=true&moodlewssettingfileurl=true`
      let req = {
        url: url,
        method: ('method' in obj) ? obj.method: Moodle.DEFAULT_METHOD,
        header: ('header' in obj) ? obj.header: Moodle.DEFAULT_HEADER,
        fail: obj.fail, complete: obj.complete, data: obj.data
      }
      let success = obj.success
      req.success = resp => { return success(resp.data) }
      request(req)
    })
  }

}

// thread unsafed
function getTokenWrapper() {
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
}

Moodle.DEFAULT_METHOD = 'POST'
Moodle.DEFAULT_HEADER = { 'content-type': 'application/x-www-form-urlencoded' }
