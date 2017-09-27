var fse = require('fs-extra');
var tokenHelper = require('./token_helper');


function tokenObject(conf) {
    this.conf = conf;
}

module.exports = tokenObject;

tokenObject.prototype.init = function () {
    var self = this;
    var obj = fse.readJsonSync('./static/token.json', {throws: false});
    if (obj) {
        console.log('get token info from file, data=%s', JSON.stringify(obj));
        global.token = obj;
        var now_time = Date.parse(new Date())/1000;
        var tick = obj.end_time - now_time;
        if (tick>0) {
            setTimeout(function () {
                getNewToken(self.conf.wechat.appid, self.conf.wechat.appsecret)
            }, tick * 1000)
        } else {
            getNewToken(self.conf.wechat.appid, self.conf.wechat.appsecret)
        }
    } else {
        getNewToken(self.conf.wechat.appid, self.conf.wechat.appsecret)
    }
};


function getNewToken(app_id, app_secret) {
    console.log('getNewToken starting...');
    console.log('input<->app_id=%s, app_secret=%s', app_id, app_secret);
    var obj = {};
    tokenHelper.api_getAccessToken(app_id, app_secret)
        .then(function (result) {
            obj.access_token = result;
            obj.end_time = Date.parse(new Date())/1000 + 7000;
            return tokenHelper.api_getJssdkTicket(obj.access_token);
        })
        .then(function (result) {
            obj.jssdk_ticket = result;
            return tokenHelper.api_getApiTicket(obj.access_token);
        })
        .then(function (result) {
            obj.api_ticket = result;
            global.token = obj;
            fse.writeJsonSync('./static/token.json', obj);
        })
        .catch(function (err) {
            console.log('get new token error, err=%s', JSON.stringify(err));
            setTimeout(function () {
                getNewToken(app_id, app_secret)
            }, 3000)
        })
}











