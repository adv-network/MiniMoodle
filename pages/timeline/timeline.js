import User from '../../utils/user'
import {Drawer} from '../../utils/drawer/drawer'
import {initReadStatus, MsgType, readMsg, ifMsgRead, initArchive, archiveMsg, ifMsgArchived, unreadMsg, unArchiveMsg} from '../../utils/util'
import Global from '../../model/global'

var timelineData = {
    assignment: {
        open : false,
        content: [],
        filteredContent:[],
        description: "作业",
        str: "assignment",
        badge: 0,
        msgType: MsgType.ASSIGNMENT
    },
    notification: {
        open: false,
        content: [],
        filteredContent:[],
        description: "通知",
        str: "notification",
        badge: 0,
        msgType: MsgType.NOTIFY
    },
    discussion: {
        open: false,
        content: [],
        filteredContent:[],
        description: "讨论",
        str: "discussion",
        badge: 0,
        msgType: MsgType.DISCUSS
    }
}

let menuWidth = 250
let itemHeight = 50

var drawer = new Drawer(menuWidth, 1)
var page = null

var itemMenuActionSheet = function(msgType, id) {
    var read = ifMsgRead(msgType, id)
    var archived = ifMsgArchived(msgType, id)
    var readAction = read ? unreadMsg : readMsg
    var archiveAction = archived ? unArchiveMsg : archiveMsg

    return {
        itemList: [read ? '标记为未读' : '标记成已读', archived ? '取消归档' : '归档'],
        success: function(res) {
            if (!res.cancel) {
                if (res.tapIndex == 0) {
                    // 已读
                    readAction(msgType, id)
                } else if(res.tapIndex == 1) {
                    // 归档
                    archiveAction(msgType, id)
                }
                filterData(false)
                // console.log(timelineData)
                page.setData(Object.assign(makeBlocksFit(), timelineData))
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
            // console.log(e.currentTarget.id)
            var idSplit = e.currentTarget.id.split('-')
            wx.showActionSheet(itemMenuActionSheet(idSplit[0], Number(idSplit[1])))
        }
    },
    tapAllCourse:function(e) {
        displayLoading()
        fetchAllData()
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
    var animationHeight = timelineData[name].open ? itemHeight : (timelineData[name].filteredContent.length + 1) * itemHeight
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

var makeBlocksFit = function() {
    var refreshData = {}
    for (var d in timelineData) {
        var animationHeight = timelineData[d].open ? (timelineData[d].filteredContent.length + 1) * itemHeight : itemHeight
        var animationObj = {}
        animationObj[timelineData[d].str + "Animation"] = blockAnimation.height(animationHeight).step().export()
        refreshData = Object.assign(refreshData, animationObj)
    }
    return refreshData
}

var fetchAllData = function() {
    User.sharedInstance().getBundle(function(v){
        wx.hideToast()
        console.log(v)
        Global.courses = v.courses
        Global.bundle.assignments = v.assignments
        Global.bundle.discussions = v.discussions
        Global.bundle.notifications = v.notifications
        timelineData.assignment.content = v.assignments
        timelineData.discussion.content = v.discussions
        timelineData.notification.content = v.notifications

        // init read status 
        initReadStatus(MsgType.NOTIFY, v.notifications)
        initReadStatus(MsgType.ASSIGNMENT, v.assignments)
        initReadStatus(MsgType.DISCUSS, v.discussions)
        initArchive(MsgType.NOTIFY, v.notifications)
        initArchive(MsgType.ASSIGNMENT, v.assignments)
        initArchive(MsgType.DISCUSS, v.discussions)  

       
        filterData(true)
        page.setData(Object.assign({courses: v.courses}, timelineData, drawer.close()))
    })
}

var refreshByCourse = function(courseid) {
    var bundle = Global.getBundleByCourse(courseid)
    timelineData.assignment.content = bundle.assignments
    timelineData.discussion.content = bundle.discussions
    timelineData.notification.content = bundle.notifications

    var blockAnimations = resetBlocks()
    filterData(false)
    wx.hideToast()
    page.setData(Object.assign(blockAnimations, timelineData, drawer.close()))

}

var filterData = function(updateArchives) {
    if(updateArchives) {
        Global.archives = []
    }

    for (var k in timelineData) {
        timelineData[k].badge = 0
        timelineData[k].filteredContent = []

        for (var i = 0; i < timelineData[k].content.length; i++) {
            var tmp = timelineData[k].content[i]

            if (ifMsgArchived(timelineData[k].msgType, tmp.id)) {
                // console.log('unarchive '+tmp.id)
                if(updateArchives) {
                    Global.archives.push(tmp)
                }

            } else {
                // console.log('unarchive')
                if(ifMsgRead(timelineData[k].msgType, tmp.id)) {
                    console.log(tmp.id)
                    tmp.read = true
                } else {
                    tmp.read = false
                    timelineData[k].badge++
                }
                timelineData[k].filteredContent.push(tmp)
            }
        }
    }
}
