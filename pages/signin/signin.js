import User from '../../utils/user'

Page({
    data:{
        hint: ''
    },
    formSubmit:function(e) {
        wx.showToast({
            title: '请稍等',
            icon: 'loading',
            duration: 10000
        })
        var input = e.detail.value
        let that = this
        User.sharedInstance().bindAccount(input.username_input, input.password_input, function(success){
            wx.hideToast()
            if(success) {
                wx.redirectTo({
                url: '../timeline/timeline',
                })
            } else {
                that.setData({hint:'绑定失败'})
            }
        })
    }
})