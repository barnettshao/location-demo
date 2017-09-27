var Promise = require("bluebird");
var request = require('request');


//获取AccessToken
exports.api_getAccessToken = function (appid, appsecret) {
    console.info('api_getAccessToken starting...');
    return new Promise(function (resolve, reject) {
        console.info('ready to request wechat, time=%s', Date.parse(new Date()));
        request({
            url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + appsecret,
            method: 'get',
            timeout: 5000
        }, function (err, response, body) {
            if (err) {
                console.error('request wechat error, err=%s, time=%s', err, Date.parse(new Date()));
                reject(err);
            } else {
                try {
                    console.info('request wechat success, result=%s, time=%s', body, Date.parse(new Date()));
                    if (JSON.parse(body).errcode && JSON.parse(body).errcode != 0) {
                        reject(body);
                    } else {
                        resolve(JSON.parse(body).access_token);
                    }
                }
                catch (e) {
                    console.error("get access token from wechat error, err=%s", e.stack);
                    reject(e.stack);
                }
            }
        })
    }).finally(function () {
        console.info('api_getAccessToken finished...');
    })
};
//获取JSSDK_Ticket
exports.api_getJssdkTicket = function (accesstoken) {
    console.info('api_getJssdkTicket starting...');
    return new Promise(function (resolve, reject) {
        console.info('ready to request wechat, time=%s', Date.parse(new Date()));
        request({
            url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accesstoken + '&type=jsapi',
            method: 'get',
            timeout: 5000
        }, function (err, response, body) {
            if (err) {
                console.error('request wechat error, err=%s, time=%s', err, Date.parse(new Date()));
                reject(err);
            } else {
                try {
                    console.info('request wechat success, result=%s, time=%s', body, Date.parse(new Date()));
                    if (JSON.parse(body).errcode && JSON.parse(body).errcode != 0) {
                        reject(body);
                    } else {
                        resolve(JSON.parse(body).ticket);
                    }
                }
                catch (e) {
                    console.error("get jssdk ticket from wechat error, err=%s", e.stack);
                    reject(e.stack);
                }
            }
        })
    }).finally(function () {
        console.info('api_getJssdkTicket finished...');
    })
};
//获取Api_Ticket
exports.api_getApiTicket = function (accesstoken) {
    console.info('api_getApiTicket starting...');
    return new Promise(function (resolve, reject) {
        console.info('ready to request wechat, time=%s', Date.parse(new Date()));
        request({
            url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accesstoken + '&type=wx_card',
            method: 'get',
            timeout: 5000
        }, function (err, response, body) {
            if (err) {
                console.error('request wechat error, err=%s, time=%s', err, Date.parse(new Date()));
                reject(err);
            } else {
                try {
                    console.info('request wechat success, result=%s, time=%s', body, Date.parse(new Date()));
                    if (JSON.parse(body).errcode && JSON.parse(body).errcode != 0) {
                        reject(body);
                    } else {
                        resolve(JSON.parse(body).ticket);
                    }
                }
                catch (e) {
                    console.error("get api ticket from wechat error, err=%s", e.stack);
                    reject(e.stack);
                }
            }
        })
    }).finally(function () {
        console.info('api_getApiTicket finished...');
    })
};



