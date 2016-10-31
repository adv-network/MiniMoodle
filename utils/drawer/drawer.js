/**
 * wxml settings:
 *   drawer's style: (position: fixed; left:{{menuLeft}})
 *   drawer's animation: {{animationData}}
 *   drawer's parent should bind touchStart, touchEnd
 */

var kUpdatePeriod = 100
var kAnimationDuration = 400
var kSwipeDuration = 300

export function Drawer(drawerWidth){
    this.width = drawerWidth

    this.isOpen = false

    var that = this
    var menuLeft = -this.width
    var startX = 0
    var endX = 0
    var lastUpdateTime = 0
    var startTime = 0

    var menuAnimation = wx.createAnimation({
        duration: kAnimationDuration,
        timingFunction: 'ease', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
        delay: 0,
        transformOrigin: '50% 50% 0',
    })

    this.touchStart = function(e){
        startX = e.changedTouches[0].pageX
        startTime = e.timeStamp
    }

    this.touchEnd = function(e){
        // var data = {}
        // if(endX < -that.width/2){ // close
        //     data = that.close()
        // } else { // open
        //     data = that.open()
        // }
        // this.setData(data)

        if(e.timeStamp - startTime < kSwipeDuration){
            var diffX = e.changedTouches[0].pageX - startX
            if(diffX > 0 && !that.isOpen){
                this.setData(that.open())
            } else if (diffX < 0 && that.isOpen) {
                this.setData(that.close())
            }
        }
    }

    // this.touchMove = function(e) {
    //     if(e.timeStamp - lastUpdateTime > kUpdatePeriod) {
    //         var diffX = e.changedTouches[0].pageX - startX
    //         endX = menuLeft + diffX

    //         if(endX < -that.width){
    //             endX = -that.width
    //         }
    //         if(endX > 0){
    //             endX = 0
    //         }
    //         this.setData({
    //             menuLeft: endX
    //         })
    //         lastUpdateTime = e.timeStamp
    //     }
    // }

    this.open = function(){
        menuAnimation.translate(-endX, 0).step()
        menuLeft = 0
        endX = 0
        that.isOpen = true
        return {
            animationData:menuAnimation.export()
        }
    }

    this.close = function(){
        menuAnimation.translate(-endX-that.width, 0).step()
        menuLeft = -that.width
        endX = -that.width
        that.isOpen = false
        return {
            animationData:menuAnimation.export()
        }
    }
}
