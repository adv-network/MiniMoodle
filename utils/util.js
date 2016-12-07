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

function initReadStatus(msgType, msgIds){
  try {
    var key = keyAssemble(msgType,ReadMsgKey)
    var readMsgs = wx.getStorageSync(key)
    if (!readMsgs.length) {  
      wx.setStorageSync(key, Array.from(new Set(msgIds)))
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


function initArchive(msgIds){
  try {
    var key = keyAssemble(msgType,ArchivedMsgKey)
    var archivedMsgs = wx.getStorageSync(key)
    if (!archivedMsgs.length) {  // if the set is empty, then it should be initialized
      wx.setStorageSync(key, Array.from(new Set(msgIds)))
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
  ifMsgRead:ifMsgRead
}
