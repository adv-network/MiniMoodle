var user = require('../../utils/user.js')
var tm = require('../../data/timeline_model.js')
import {Drawer} from '../../utils/drawer/drawer'

var menuWidth = 250
var drawer = new Drawer(menuWidth)

Page({
    data:{
        menuLeft: -menuWidth,
        menuWidth: menuWidth    
    },
    onLoad:function(){
        if(user.isAuthorized()){
            this.setData({
                timelines: getData()
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
    touchStart:drawer.touchStart,
    touchEnd:drawer.touchEnd
})

function getData(){
    return [
        {
            id: '1',
            description: '1'
        },
        {
            id: '2',
            description: '1'
        },
        {
            id: '3',
            description: '1'
        },
        {
            id: '4',
            description: '1'
        },
        {
            id: '5',
            description: '1'
        },
        {
            id: '6',
            description: '1'
        },
        {
            id: '7',
            description: '1'
        },
        {
            id: '8',
            description: '1'
        },
        {
            id: '9',
            description: '1'
        },
        {
            id: '10',
            description: '1'
        },
    ]
}

function getCourses(){
    return [
            {
                id: '1',
            description:'A'
            },
            {
                id: '2',
            description:'B'
            }
        ]
}