import User from '../../utils/user'
import Global from '../../model/global'
import {initReadStatus, MsgType, readMsg, ifMsgRead, initArchive, archiveMsg, ifMsgArchived, unreadMsg, unArchiveMsg} from '../../utils/util'

let itemHeight = 50
var page = null

var noArchiveActionSheet = function(msgType, id) {
    return {
        itemList: ['取消归档'],
        success: function(res) {
            if (!res.cancel) {
                if (res.tapIndex == 0) {
                    unArchiveMsg(msgType, id)
                    for (var i = 0; i < Global.archives.length; i++) {
                        if (Global.archives[i].id == id) {
                            Global.archives.splice(i, 1)
                            break
                        }
                    }
                }
                loadArchiveData()
            }
        }
    }
}

Page({
    data:{
        itemHeight: itemHeight,
        blockHeight: itemHeight,
    },
    onLoad:function(){
        page = this

        if(User.sharedInstance().isAuthorized()){
            loadArchiveData()
        } else {
            wx.redirectTo({
              url: '../signin/signin',
            })
        }
    },
    tapTimeline:function(e) {
        var idSplit = e.currentTarget.id.split('-')
        wx.showActionSheet(noArchiveActionSheet(idSplit[0], Number(idSplit[1])))
    }
})

var loadArchiveData = function() {
    var archive = {
                data: Global.archives,        
                badge: Global.archives.length,
                description: '归档',
            }
    page.setData(Object.assign(archive))
}