import User from '../../utils/user'
import {Drawer} from '../../utils/drawer/drawer'
import {initReadStatus, MsgType, readMsg, ifMsgRead, initArchive, archiveMsg, ifMsgArchived} from '../../utils/util'
import Global from '../../model/global'

var timelineData = {
    assignment: {
        open : false,
        content: [],
        description: "作业",
        str: "assignment",
        badge: 0,
        msgType: MsgType.ASSIGNMENT
    },
    notification: {
        open: false,
        content: [],
        description: "通知",
        str: "notification",
        badge: 0,
        msgType: MsgType.NOTIFY
    },
    discussion: {
        open: false,
        content: [],
        description: "讨论",
        str: "discussion",
        badge: 0,
        msgType: MsgType.DISCUSS
    }
}

let itemMenu = ['已读', '归档']
let menuWidth = 250
let itemHeight = 50

var drawer = new Drawer(menuWidth, 1)
var page = null
var currentMsyType = ''
var currentItemID = 0

var itemMenuActionSheet = function(msgType, id) {
    var read = ifMsgRead(msgType, id)
    var archived = ifMsgArchived(msgType, id)

    return {
        itemList: [read ? '标记为未读' : '标记成已读', archived ? '取消归档' : '归档'],
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
            var idSplit = e.currentTarget.id.split('-')
            currentItemID = idSplit[1]
            currentMsyType = idSplit[0]
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
    var animationHeight = timelineData[name].open ? itemHeight : (timelineData[name].content.length + 1) * itemHeight
    var animationObj = {}
    animationObj[name + "Animation"] = blockAnimation.height(animationHeight).step().export()
    timelineData[name].open = !timelineData[name].open
    page.setData(animationObj)
}

var resetBlocks = function() {
    var refreshData = {}
    for (var d in timelineData) {
        timelineData[d].open = false
        var animationObj = {}
        animationObj[timelineData[d].str + "Animation"] = blockAnimation.height(itemHeight).step().export()
        refreshData = Object.assign(refreshData, animationObj)
    }
    return refreshData
}

var fetchAllData = function() {
    User.sharedInstance().getBundle(function(v){
        wx.hideToast()
        console.log(v)
        timelineData.assignment.content = v.assignments
        timelineData.discussion.content = v.discussions
        timelineData.notification.content = v.notifications

        // init read status 
        var notifications =  v.notifications.map(function (item, index, input){return item['id']})
        var assignments = v.assignments.map(function (item, index, input){return item['id']})
        var discussions = v.discussions.map(function (item, index, input){return item['id']})
        initReadStatus(MsgType.NOTIFY, notifications)
        initReadStatus(MsgType.ASSIGNMENT, assignments)
        initReadStatus(MsgType.DISCUSS, discussions)
        initArchive(MsgType.NOTIFY, notifications)
        initArchive(MsgType.ASSIGNMENT, assignments)
        initArchive(MsgType.DISCUSS, discussions)  

        filterData()
        page.setData(Object.assign({courses: v.courses}, timelineData))
    })
}

var refreshByCourse = function(courseid) {
    User.sharedInstance().getCourseContent(courseid, function(v){   

        timelineData.assignment.content = v.assignments
        timelineData.notification.content = v.notifications

        User.sharedInstance().getDiscussions(v.forumid, function(v2){
            wx.hideToast()
            timelineData.discussion.content = v2

            var blockAnimations = resetBlocks()
            filterReadData()
            page.setData(Object.assign(timelineData, blockAnimations, drawer.close()))
        })
    })
}

var filterData = function() {
    Global.archives = []
    for (var k in timelineData) {
        for (var i = 0; i < timelineData[k].content.length; i++) {
            var tmp = timelineData[k].content[i]

            if (ifMsgArchived(timelineData[k].msgType, tmp.id)) {
                console.log('archive')
                Global.archives.push(tmp)
                timelineData[k].content.splice(i, 1)
            }
        }
    }
    filterReadData()
}

var filterReadData = function() {
    for (var k in timelineData) {
        timelineData[k].badge = 0

        for (var i = 0; i < timelineData[k].content.length; i++) {
            var tmp = timelineData[k].content[i]

            if(ifMsgRead(timelineData[k].msgType, tmp.id)) {
                tmp.read = true
            } else {
                tmp.read = false
                timelineData[k].badge++
            }
        }
    }
}