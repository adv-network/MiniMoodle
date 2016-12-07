import User from '../../utils/user'
import {Drawer} from '../../utils/drawer/drawer'
import {initReadStatus, MsgType, readMsg, ifMsgRead, initArchive, archiveMsg, ifMsgArchived} from '../../utils/util'



let itemMenu = ['已读', '归档']
let menuWidth = 250
let itemHeight = 50

var drawer = new Drawer(menuWidth, 1)
var page = null

var data = {
    assignment: {
        open : false,
        content: [],
        description: "作业",
        str: "assignment"
    },
    notification: {
        open: false,
        content: [],
        description: "通知",
        str: "notification"
    },
    discussion: {
        open: false,
        content: [],
        description: "讨论",
        str: "discussion"
    }
}

var itemMenuActionSheet = {
            itemList: itemMenu,
            success: function(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        // 已读

                    } else if(res.tapIndex == 1) {
                        // 归档

                    }
                }
            }
        }
var blockAnimation = wx.createAnimation({
            transformOrigin: "50% 50%",
            duration: 500,
            timingFunction: "ease",
            delay: 0
        })


Page({
    data:{
        menuLeft: -menuWidth,
        menuWidth: menuWidth,
        blockHeight:itemHeight
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
        if(!drawer.isOpen) {
            console.log(e.currentTarget.id)
            wx.showActionSheet(itemMenuActionSheet)
        }
    },
    tapCourse:function(e) {
        wx.showToast({
            title: '请稍等',
            icon: 'loading',
            duration: 10000
        })
        let courseid = e.currentTarget.id
        User.sharedInstance().getCourseContent(courseid, function(v){

            // should be moved to where all the notifications are shown
            // var notifications =  v.notifications.map(function (item, index, input){return item['id']})
            // var assignments = v.notifications.map(function (item, index, input){return item['id']})
            // initReadStatus(MsgType.NOTIFY, notifications)
            // initReadStatus(MsgType.ASSIGNMENT, assignments)
            // initArchive(MsgType.NOTIFY, notifications)
            // initArchive(MsgType.ASSIGNMENT, assignments)     

            data.assignment.content = v.assignments
            data.notification.content = v.notifications

            User.sharedInstance().getDiscussions(v.forumid, function(v2){
                wx.hideToast()
                data.discussion.content = v2

                var refreshData = Object.assign({
                    'notifications': v.notifications,
                    'assignments': v.assignments,
                    'discussions': v2
                }, drawer.close())
                resetBlocks(refreshData)
                page.setData(refreshData)
            })
        })

    },
    tapFileContent:function(e) {
        wx.navigateTo({
          url: '../archive/archive',
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
    tapHeader:function(e){
        if(!drawer.isOpen) {
            var name = e.currentTarget.id.split('-')[0]
            this.setData(triggerAnimation(name))
        }
    },
    touchStart:drawer.touchStart,
    touchEnd:drawer.touchEnd
})

var triggerAnimation = function(name) {
    var animationHeight = data[name].open ? itemHeight : (data[name].content.length + 1) * itemHeight
    var animationObj = {}
    animationObj[name + "Animation"] = blockAnimation.height(animationHeight).step().export()
    data[name].open = !data[name].open
    return animationObj
}

var resetBlocks = function(refreshData) {
    for (var d in data) {
        data[d].open = false
        var animationObj = {}
        animationObj[data[d].str + "Animation"] = blockAnimation.height(itemHeight).step().export()
        refreshData = Object.assign(refreshData, animationObj)
    }
}
