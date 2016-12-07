var requests = []
var limit = 5
var running = 0

// thread unsafe
export default function request(rawObject) {
  let obj = rawObject
  let complete = rawObject.complete
  obj.complete = (...args) => {
    _next()
    if (complete && getClass.call(complete) == '[object Function]') complete(...args)
  }
  _exec(obj)
}

function _exec(obj) {
  if (running < limit) {
    running++
    wx.request(obj)
  } else {
    requests.push(obj)
  }
}

function _next() {
  running--
  if (requests.length === 0) return
  _exec(requests[0])
  requests = requests.slice(1)
}
