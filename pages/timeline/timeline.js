import User from '../../utils/user'
import {Drawer} from '../../utils/drawer/drawer'
import {initReadStatus, MsgType, readMsg, ifMsgRead, initArchive, archiveMsg, ifMsgArchived, unreadMsg, unArchiveMsg} from '../../utils/util'



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
        str: "assignment",
        badge: 0
    },
    notification: {
        open: false,
        content: [],
        description: "通知",
        str: "notification",
        badge: 0
    },
    discussion: {
        open: false,
        content: [],
        description: "讨论",
        str: "discussion",
        badge: 0
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
        blockHeight: itemHeight,
        itemHeight: itemHeight
    },
    onLoad:function(){
        page = this

        if(User.sharedInstance().isAuthorized()){
            displayLoading()
            fetchAllData()
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
    tapAllCourse:function(e) {
        // displayLoading()
        // fetchAllData()
    },
    tapCourse:function(e) {
        displayLoading()
        let courseid = e.currentTarget.id
        refreshByCourse(courseid)
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
            triggerBlock(name)
        }
    },
    touchStart:drawer.touchStart,
    touchEnd:drawer.touchEnd
})

var displayLoading = function(){
    wx.showToast({
        title: '请稍等',
        icon: 'loading',
        duration: 10000
    })
}

var triggerBlock = function(name) {
    var animationHeight = data[name].open ? itemHeight : (data[name].content.length + 1) * itemHeight
    var animationObj = {}
    animationObj[name + "Animation"] = blockAnimation.height(animationHeight).step().export()
    data[name].open = !data[name].open
    page.setData(animationObj)
}

var resetBlocks = function() {
    var refreshData = {}
    for (var d in data) {
        data[d].open = false
        var animationObj = {}
        animationObj[data[d].str + "Animation"] = blockAnimation.height(itemHeight).step().export()
        refreshData = Object.assign(refreshData, animationObj)
    }
    return refreshData
}

var fetchAllData = function() {
    User.sharedInstance().getBundle(function(v){
        wx.hideToast()
        console.log(v)
        data.assignment.content = v.assignments
        data.discussion.content = v.discussions
        data.notification.content = v.notifications

        // init read status 
        initReadStatus(MsgType.NOTIFY, v.notifications)
        initReadStatus(MsgType.ASSIGNMENT, v.assignments)
        initReadStatus(MsgType.DISCUSS, v.discussions)
        initArchive(MsgType.NOTIFY, v.notifications)
        initArchive(MsgType.ASSIGNMENT, v.assignments)
        initArchive(MsgType.DISCUSS, v.discussions)  

        page.setData(Object.assign({courses: v.courses}, data))
    })
}

var refreshByCourse = function(courseid) {
    User.sharedInstance().getCourseContent(courseid, function(v){   

        data.assignment.content = v.assignments
        data.notification.content = v.notifications

        User.sharedInstance().getDiscussions(v.forumid, function(v2){
            wx.hideToast()
            data.discussion.content = v2

            page.setData(Object.assign(data, blockAnimations, drawer.close()))
            var blockAnimations = resetBlocks()
        })
    })
}
