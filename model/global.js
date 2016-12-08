export default class Global {

}

Global.archives = []
Global.bundle = {}
Global.courses = []

Global.getBundleByCourse = function(courseid) {
    var result = {}
    for (var k in Global.bundle) {
        result[k] = []
        for(var i = 0; i < Global.bundle[k].length; i++) {
            var tmp = Global.bundle[k][i]
            if (tmp.courseid == courseid) {
                result[k].push(tmp)
            }
        }
    }
    return result
}