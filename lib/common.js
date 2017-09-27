/**
 * Created by kay on 2017/3/9.
 */
var crypto = require('crypto');


/**
 * 生成随机字符串
 * @param n 位数
 * @returns {string} 随机字符串
 */
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
exports.api_generateNonceStr = function (n) {
    try {
        var res = "";
        for (var i = 0; i < n; i++) {
            var id = Math.ceil(Math.random() * 61);
            res += chars[id];
        }
        return res;
    }
    catch (e) {
        console.log('api_generateNonceStr error, err=%s, n=%s', e, n);
        return '';
    }
};

/**
 * 生成随机数
 * @param n 位数
 * @returns {string} 随机数（纯数字）
 */
exports.api_mathRand = function (n) {
    try {
        var num = '';
        for (var i = 0; i < n; i++) {
            num += Math.floor(Math.random() * 10);
        }
        return num;
    }
    catch (e) {
        console.log('api_mathRand error, err=%s, n=%s', e, n);
        return '';
    }
};

/**
 * 签名
 * @param str 原文字符串
 * @param type 加密类型，sha1、md5
 * @returns {*} 密文字符串
 */
exports.api_sign = function (str, type) {
    try {
        console.log('ready to sign, str=%s, type=%s', str, type);
        var crypto_type = 'sha1';
        if (type && type != null && type != 'undefined') {
            crypto_type = type;
        }
        var hash = crypto.createHash(crypto_type);
        hash.update(str, 'utf-8');
        str = hash.digest('hex');
        return str;
    }
    catch (e) {
        console.log('api_sign error, err=%s, str=%s, type=%s', e, str, type);
        return '';
    }
};

/**
 * 字典排序(根据key)
 * @param args JSON对象
 * @param key 签名key
 * @returns {string} 字符串
 */
exports.api_rawByKey = function (args, key) {
    try {
        var keys = Object.keys(args);
        keys = keys.sort();
        var newArgs = {};
        keys.forEach(function (k) {
            if (args[k] && args[k] != '' && args[k] != 'undefined' && args[k] != null) {
                newArgs[k] = args[k];
            }
        });
        var str = '';
        for (var k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        if (key) {
            str += '&key=' + key;
        }
        return str;
    }
    catch (e) {
        console.log('api_rawByKey error, err=%s, args=%s, key=%s', e, JSON.stringify(args), key);
        return '';
    }
};