/**
 * Created by kay on 2017/3/9.
 */
var comm = require('../lib/common');
var request = require('request');
var Promise = require('bluebird');
var fse = require('fs-extra');


function coreAPI(conf) {
    console.log('new coreAPI, conf=%s', JSON.stringify(conf));
    this.conf = conf;
}

module.exports = coreAPI;

coreAPI.prototype.post = function (req, res) {
    var self = this;
    console.log('------------------------------');
    console.log('request post api: %s', JSON.stringify(req.headers));
    console.log('request JSON data: %s', JSON.stringify(req.body));
    console.log('------------------------------');

    try {
        if (req.body.method === null) {
            res.status(400).send('method is empty');
            return;
        }

        switch (req.body.method) {
            case 'getjssdksign':
                var obj = getJssdkSign(req.body, global.appid);
                console.log('ready to response, data=%s', JSON.stringify(obj));
                res.status(200).send(obj);
                break;
            case 'getlocationdata':
                var obj = getLocationData(req.body);
                res.status(200).send(obj);
                break;
            case 'postlocationdata':
                var obj = postLocationData(req.body);
                res.status(200).send(obj);
                break;
            case 'getopenidbycode':
                getOpenIdByCode(req.body)
                    .then(function (data) {
                        console.log('ready to response, data=%s', JSON.stringify(data));
                        res.status(200).send(data);
                    })
                    .catch(function (err) {
                        res.status(200).send('');
                    })
                break;
            case 'getuserinfobyopenid':
                getUserInfoByOpenId(req.body)
                    .then(function (data) {
                        console.log('ready to response, data=%s', JSON.stringify(data));
                        res.status(200).send(data);
                    })
                    .catch(function (err) {
                        res.status(200).send('');
                    })
                break;
            default:
                res.status(400).send('no this method');
                break;
        }
        // if (req.body.method == 'getjssdksign') {
        //     var obj = getJssdkSign(req.body, global.appid);
        //     console.log('ready to response, data=%s', JSON.stringify(obj));
        //     res.status(200).send(obj);
        // } else {
        //     res.status(400).send('no this method');
        // }
    }
    catch (e) {
        console.log('do post function error, err=%s', JSON.stringify(e));
        res.status(400).send('error');
    }
};

var getJssdkSign = function (msg, appid) {
    console.log('getJssdkSign starting...');
    console.log('input<->msg=%s, appid=%s', JSON.stringify(msg), appid);
    var noncestr = comm.api_generateNonceStr(16);
    var jssdk_ticket = global.token.jssdk_ticket;
    var timestamp = Math.floor(Date.parse(new Date()) / 1000).toString();
    var urls = msg.url.split('#');
    var url = '';
    if (urls.length > 1) {
        url = urls[0];
    } else {
        url = msg.url;
    }
    var args = {
        noncestr: noncestr,
        jsapi_ticket: jssdk_ticket,
        timestamp: timestamp,
        url: url
    };
    console.log('ready to sign, args=%s', JSON.stringify(args));
    var sign = comm.api_sign(comm.api_rawByKey(args));
    var obj = {
        errcode: 0,
        errmsg: 'ok',
        result: {
            appid: appid,
            sign: sign,
            nonce_str: noncestr,
            timestamp: timestamp
        }
    };
    console.log('get jssdk sign success! data=%s', JSON.stringify(obj));
    console.log('getJssdkSign finished!');
    return obj;
};

var getOpenIdByCode = function (msg) {
    console.log('getOpenIdByCode starting...');
    console.log('input<->msg=%s', JSON.stringify(msg));
    return new Promise(function (resolve, reject) {
        var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type=authorization_code";
        url = url.format(global.appid, global.appsecret, msg.code);
        console.log('ready to request wechat, url=%s', url);
        var tick = Date.parse(new Date());
        request.post({
            url: url,
            timeout: 5000
        }, function (err, response, body) {
            if (err) {
                console.error('request wechat error, err=%s, time=%s', err, Date.parse(new Date()) - tick);
                reject(err);
            } else {
                console.log('request wechat success, result=%s, time=%s', body, Date.parse(new Date()) - tick);
                try {
                    var result = JSON.parse(body);
                    if (result.openid) {
                        resolve(result.openid);
                    } else {
                        reject(result.errcode + " | " + result.errmsg);
                    }
                } catch (e) {
                    console.error('get openid by code error, err=%s', e);
                    reject(e);
                }
            }
        });
    }).finally(function () {
        console.log('getOpenIdByCode finished!');
    })
};

var getUserInfoByOpenId = function (msg) {
    console.log('getUserInfoByOpenId starting...');
    console.log('input<->msg=%s', JSON.stringify(msg));
    return new Promise(function (resolve, reject) {
        var token = global.token.access_token;
        var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token={0}&openid={1}&lang={2}';
        url = url.format(token, msg.openid, 'zh_CN');
        console.log('ready to request wechat, url=%s', url);
        var tick = Date.parse(new Date());
        request({
            url: url,
            method: 'get',
            timeout: 5000
        }, function (err, request, body) {
            if (err) {
                console.error('request wechat error, err=%s, time=%s', err, Date.parse(new Date()) - tick);
                reject(err);
            } else {
                console.log('request wechat success, result=%s, time=%s', body, Date.parse(new Date()) - tick);
                try {
                    var result = JSON.parse(body);
                    if (result.nickname) {
                        resolve(result.nickname);
                    } else {
                        reject(result.errcode + " | " + result.errmsg);
                    }
                } catch (e) {
                    console.error('get user info by openid error, err=%s', e);
                    reject(e);
                }
            }
        });
    }).finally(function () {
        console.log('getUserInfoByOpenId finished!');
    })
};

var postLocationData = function (msg) {
    console.log('postLocationData starting...');
    console.log('input<->msg=%s', JSON.stringify(msg));
    try {
        var obj = {
            "openid": msg.openid,
            "goodsid": msg.goodsid,
            "latitude": msg.latitude,
            "longitude": msg.longitude
        };
        fse.writeJsonSync('./static/' + msg.goodsid + '.json', obj);
        return true
    } catch (e) {
        console.log('postLocationData error, err=%s', e);
        return false;
    } finally {
        console.log('postLocationData finished!');
    }
};

var getLocationData = function (msg) {
    console.log('getLocationData starting...');
    console.log('input<->msg=%s', JSON.stringify(msg));
    try {
        var obj = fse.readJsonSync('./static/' + msg.goodsid + '.json', {throws: false})
        if (obj) {
            return obj;
        } else {
            return false;
        }
    } catch (e) {
        console.log('postLocationData error, err=%s', e);
        return false;
    } finally {
        console.log('postLocationData finished!');
    }
};


