import User from '../../utils/user'
import {Drawer} from '../../utils/drawer/drawer'

var menuWidth = 250
var drawer = new Drawer(menuWidth)
var page = null

Page({
    data:{
        menuLeft: -menuWidth,
        menuWidth: menuWidth    
    },
    onLoad:function(){
        page = this

        if(User.sharedInstance().isAuthorized()){
            // get courses
            User.sharedInstance().getCourses(function(v){
                page.setData({'courses': v})
            })
        } else {
            wx.redirectTo({
              url: '../signin/signin',
            })
        }
    },
    tapTimeline:function(e){
        console.log(e.currentTarget.id)
    },
    tapCourse:function(e) {
        wx.showToast({
            title: '请稍等',
            icon: 'loading',
            duration: 10000
        })
        let courseid = e.currentTarget.id
        User.sharedInstance().getCourseContent(courseid, function(v){
            wx.hideToast()
            page.setData(Object.assign({
                'notifications': v.notifications,
                'assignments': v.assignments,
            }, drawer.close()))
        })

    },
    tapLogout:function(e){
        User.sharedInstance().logout()
        wx.redirectTo({
          url: '../signin/signin',
          success: function(res){
            // success
          },
          fail: function() {
            // fail
          },
          complete: function() {
            // complete
          }
        })
    },
    touchStart:drawer.touchStart,
    touchEnd:drawer.touchEnd
})
