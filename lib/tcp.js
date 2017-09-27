var net = require('net');
var Promise = require('bluebird');


function tcpWrapper() {
    this.init();
};

var proto = tcpWrapper.prototype;
module.exports = tcpWrapper;

/** =====================================================================
 * TCP/IP Initialize.
 ===================================================================== */
proto.init = function () {
    this._tcpHandler = null;
};

/**
 * Server Connection
 * @param connInfo {host:'127.0.0.1', port:9011, timeout:5000, charset:'utf-8'}
 * @returns {*}
 */
proto.setServerConnection = function(connInfo) {
    var _self = this;

    return new Promise(function (resolve, reject) {
        _self._tcpHandler = net.connect(connInfo);

        try {
            _self._tcpHandler.on('connect', function () {
                this.setEncoding(connInfo.charset);
                resolve();
            });

            _self._tcpHandler.on('error', function (err) {
                reject({code:'9999',message:err.message});
            });
        } catch(e) {
            reject({code:'9999',message:e.message});
        }
    });
};

proto.send = function(data) {
    var _self = this;

    return new Promise(function (resolve, reject) {

        try {
            _self._tcpHandler.write(data, function () {
                _self._tcpHandler.end();
                resolve();
            });
        }
        catch(e) {
            reject({code:'9999',message:e.message});
        }
    });
}

proto.recv = function(timeout) {
    var _self = this;

    return new Promise(function (resolve, reject) {
       try {
           _self._tcpHandler.on('data', function(chunk) {  /* Socket Recv Event */
               resolve(chunk);
           });

           _self._tcpHandler.on('end', function() {
               _self._tcpHandler.end();      // tcp FIN ACK
           });

           _self._tcpHandler.setTimeout(timeout, function() {
               reject({code:'9999',message:'recv time out ['+timeout+']'});
           });
       }
       catch(e) {
            reject({code:'9999',message:e.message});
       }
    });
}

