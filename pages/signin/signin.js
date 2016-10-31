var user = require('../../utils/user.js')

Page({
    data:{
        hint: ''
    },
    formSubmit:function(e) {
        var input = e.detail.value
        var bindSuccess = user.bindAccount(input.username_input, input.password_input)
        if (bindSuccess) {
            this.setData({hint:''})
            wx.redirectTo({
              url: '../timeline/timeline',
            })
        } else {
            this.setData({hint:'绑定失败'})
        }
    }
})