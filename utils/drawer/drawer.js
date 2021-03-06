/**
 * wxml settings:
 *   drawer's style: (position: fixed; left:{{menuLeft}})
 *   drawer's animation: {{animationData}}
 *   should bind touchStart, touchEnd
 */

let kUpdatePeriod = 100
let kAnimationDuration = 400
let kSwipeDuration = 500
let kXDiff = 100

export function Drawer(drawerWidth, direction){
    this.width = drawerWidth
    this.direction = direction / Math.abs(direction) // +1, right; -1, left
    this.isOpen = false

    var that = this
    var menuLeft = -this.width
    var startX = 0
    var endX = -drawerWidth
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
            var diffX = (e.changedTouches[0].pageX - startX) * that.direction
            if(diffX > kXDiff && !that.isOpen){
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
        menuAnimation.translate(-endX * that.direction, 0).step()
        menuLeft = 0
        endX = 0
        that.isOpen = true
        return {
            animationData:menuAnimation.export()
        }
    }

    this.close = function(){
        menuAnimation.translate((-endX-that.width) * that.direction, 0).step()
        menuLeft = -that.width
        endX = -that.width
        that.isOpen = false
        return {
            animationData:menuAnimation.export()
        }
    }
}
