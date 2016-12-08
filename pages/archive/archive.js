import User from '../../utils/user'
import Global from '../../model/global'


let itemHeight = 50
var page = null

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
    
})

var loadArchiveData = function() {
    var archive = {
                data: Global.archives,        
                badge: Global.archives.length,
                description: '归档',
            }
    page.setData(Object.assign(archive))
}