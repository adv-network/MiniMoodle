function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

if(typeof MsgType == "undefined"){
  var MsgType = {};
  MsgType.NOTIFY = 'notify';
  MsgType.ASSIGNMENT = 'assignment';
  MsgType.DISCUSS = 'discuss';
}

var ReadMsgKey = 'readMsgs'
var ArchivedMsgKey = 'archivedMsgs'

function ifMsgRead(msgType, id){
  var readMsgs = wx.getStorageSync(keyAssemble(msgType,ReadMsgKey))
  return new Set(readMsgs).has(id)
}

function readMsg(msgType, id){
  var key = keyAssemble(msgType, ReadMsgKey)
  var readMsgs = wx.getStorageSync(key)
  if(!(new Set(readMsgs).has(id))){
      readMsgs.push(id)
      wx.setStorageSync(key, readMsgs)
  }
}

function unreadMsg(msgType, id){
  var key = keyAssemble(msgType, ReadMsgKey)
  var readMsgs = new Set(wx.getStorageSync(key))
  if(readMsgs.delete(id)){
      wx.setStorageSync(key, Array.from(readMsgs))
  }
}

function initReadStatus(msgType, msgs){
  try {
    var key = keyAssemble(msgType,ReadMsgKey)
    if (!wx.getStorageSync(key).length) {  
      if(msgType == MsgType.ASSIGNMENT){
        var ids = msgs.map(function (item, index, input){
          var now = new Date()
          if(now>item['due']){
            return item['id']
          }
        })
      }else{
        var ids = msgs.map(function (item, index, input){return item['id']})
      }
      wx.setStorageSync(key, Array.from(new Set(ids)))
    }
  } catch (e) {
    // Do something when catch error
  }
}

function keyAssemble(msgType, keyType){
  return msgType+'_'+keyType
}


function ifMsgArchived(msgType, id){
  var archivedMsgs = wx.getStorageSync(keyAssemble(msgType,ArchivedMsgKey))
  return new Set(archivedMsgs).has(id)
}

function archiveMsg(msgType, id){
  var key = keyAssemble(msgType, ArchivedMsgKey)
  var archivedMsgs = wx.getStorageSync(key)
  if(!(new Set(archivedMsgs).has(id))){
      archivedMsgs.push(id)
      wx.setStorageSync(key, archivedMsgs)
  }
}

function unArchiveMsg(msgType, id){
  var key = keyAssemble(msgType, ArchivedMsgKey)
  var archivedMsgs = new Set(wx.getStorageSync(key))
  if(archivedMsgs.delete(id)){
      wx.setStorageSync(key, Array.from(archivedMsgs))
  }
}


function initArchive(msgType, msgs){
  try {
    var key = keyAssemble(msgType,ArchivedMsgKey)
    if (!wx.getStorageSync(key).length) {  // if the set is empty, then it should be initialized
      if(msgType == MsgType.ASSIGNMENT){
        var now = new Date()
        var ids = msgs.map(function (item, index, input){
          if(now > item['due']){
            return item['id']
          }else{
            return 
          }
        })
      }else{
        var ids = msgs.map(function (item, index, input){return item['id']})
      }
      wx.setStorageSync(key, Array.from(new Set(ids)))
    }
  } catch (e) {
    // Do something when catch error
  }
}



module.exports = {
  formatTime: formatTime,
  MsgType: MsgType,
  initReadStatus:initReadStatus,
  initArchive:initArchive,
  archiveMsg:archiveMsg,
  ifMsgArchived:ifMsgArchived,
  readMsg:readMsg,
  ifMsgRead:ifMsgRead,
  unreadMsg: unreadMsg,
  unArchiveMsg: unArchiveMsg
}
