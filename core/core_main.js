var cluster = require('cluster');
var Promise = require('bluebird');
var http = require('http');
var https = require('https');
var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');


var coreAPI = require('../core/core_api');

global.sessionArray = new Array();



function coreMain(conf) {
	this.conf = conf;
	global.appid = conf.wechat.appid;
	global.appsecret = conf.wechat.appsecret;
	this.was = {};
}

module.exports = coreMain;

coreMain.prototype.coreService = function() {
	var self = this;

	// if (cluster.isMaster) {
	// 	for (var i=0;i<1;i++) {
	// 		cluster.fork();
	// 	}
	// } else {
	// 	/**
	// 	redis configuration set
	// 	**/
    //
    //
	// 	/**
	// 	rabbitmq configuration set
	// 	**/
    //
    //
	// 	/**
	// 	http or https server start
	// 	**/
	// 	if (self.conf.server.mode === 'HTTP') this.coreWebServerStart();
	// 	else if (self.conf.server.mode === 'HTTPS') this.coreSslServerStart();
	// 	else {
	// 		console.log('http server mode not define [%s]', self.conf.server.mode);
	// 		process.exit(0);
	// 	}
	// }

    if (self.conf.server.mode === 'HTTP') this.coreWebServerStart();
    else if (self.conf.server.mode === 'HTTPS') this.coreSslServerStart();
    else {
        console.log('http server mode not define [%s]', self.conf.server.mode);
        process.exit(0);
    }

    var tokenManager = require('./token_manager');
    console.log('ready to new tokenManager, conf=%s', JSON.stringify(self.conf));
    var tokenObject = new tokenManager(self.conf);
    tokenObject.init();
};


/** =====================================================================
 *  HTTP Server Start
 ===================================================================== */
coreMain.prototype.coreWebServerStart = function () {
	var self = this;
    this.was = express();

    console.log('ready to new coreAPI, conf=%s', JSON.stringify(self.conf));
    var api = new coreAPI(self.conf);

    // setTimeout(function () {
    //     console.log('-------------' + JSON.stringify(global.token))
    // }, 5000)


    this.was.use(bodyParser.urlencoded({extended: true}));
    this.was.use(bodyParser.json());

    this.was.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, Access-Control-Request-Method');
        next();
    });

    this.was.post('/location/*', api.post);

    console.log('static server path: %s', path.join(__dirname, '../view'));

    this.was.use(express.static(path.join(__dirname, '../view')));

    this.was.get('/', function (req, res) {
        console.log('get post ...');
        res.status(200).send('OK!!!');   /* http code */
    });

    this.was.post('/', function (req, res) {
        console.log('http post ...');
        res.status(200).send('OK!!!');   /* http code */
    });

	http.createServer(this.was).listen(this.conf.server.port, function () {
		console.log('HTTP Server Mode Start');
	});
};

/** =====================================================================
 *  HTTPS Server Start
 ===================================================================== */
coreMain.prototype.coreSslServerStart = function() {
	this.was = express();
	https.createServer({
		key: fs.readFileSync(this.conf.server.key) , 
		cert: fs.readFileSync(this.conf.server.cert) },
		this.was)
	.listen(this.conf.server.port, function () {
		console.log('HTTP Server Mode Start');
	});
};

/** =====================================================================
 *  Location Demo Stop (Exit)
 ===================================================================== */
coreMain.prototype.coreServiceExit = function() {
    console.log('====================================================');
    console.log(' * Location Demo Service. Stop Exit.');
    console.log('====================================================');
    process.exit(0);
};

/** =====================================================================
 *  Location Demo Init (Exit)
 ===================================================================== */
coreMain.prototype.coreInit = function() {

    console.info('====================================================');
    console.info(' * Location Demo Service.');

    if(this.conf.log !== undefined) {
        console.info('----------------------------------------------------');
        console.info(' * LOG PATH       [ '+this.conf.log+' ]');
    } else {
        console.error('Configuration File Not Found!');
        this.coreServiceExit();
    }

    // if(this.conf.redis !== undefined) {
    //     console.info('----------------------------------------------------');
    //     console.info(' * REDIS HOST     [ '+this.conf.redis.host+' ]');
    //     console.info(' * REDIS PORT     [ '+this.conf.redis.port+' ]');
    //     console.info(' * REDIS DB       [ '+this.conf.redis.db+' ]');
    //     console.info(' * REDIS PASSWD   [ '+this.conf.redis.passwd+' ]');
    // }

    // if(this.conf.mq !== undefined) {
    //     console.info('----------------------------------------------------');
    //     console.info(' * RABBIT URL     [ '+this.conf.mq.url+' ]');
    //     console.info(' * RABBIT ID      [ '+this.conf.mq.id+' ]');
    //     console.info(' * RABBIT PW      [ '+this.conf.mq.pw+' ]');
    //     console.info(' * RABBIT PORT    [ '+this.conf.mq.port+' ]');
    //     console.info(' * RABBIT NAME    [ '+this.conf.mq.name+' ]');
    //     console.info(' * RABBIT QNAME   [ '+this.conf.mq.qname+' ]');
    //     console.info(' * RABBIT EXCHANGE[ '+this.conf.mq.exchange+' ]');
    //     console.info(' * RABBIT ROUTEKEY[ '+this.conf.mq.routekey+' ]');
    // } else {
    //     console.error('Not Find MQ in Configuration File!');
    //     this.coreServiceExit();
    // }
    
    // if(this.conf.server !== undefined) {
    //     console.info('----------------------------------------------------');
    //     console.info(' * MODE           [ '+this.conf.server.mode+' ]');
    //     console.info(' * PORT           [ '+this.conf.server.port+' ]');
    //     console.info(' * CERT           [ '+this.conf.server.cert+' ]');
    //     console.info(' * KEY            [ '+this.conf.server.key+' ]');
    // }

    String.prototype.format = function() {
        if (arguments.length == 0) {
            return this;
        }
        for (var StringFormat_s = this, StringFormat_i = 0; StringFormat_i < arguments.length; StringFormat_i++) {
            StringFormat_s = StringFormat_s.replace(new RegExp("\\{" + StringFormat_i + "\\}", "g"), arguments[StringFormat_i]);
        }
        return StringFormat_s;
    };

    console.info('====================================================');
};


