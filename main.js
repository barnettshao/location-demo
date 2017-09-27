/**
 * Location demo
 * Author: Kay
 * Copyright Kay 2016 All Rights Reserved.
 */
var log4js = require('log4js');
var configlib = require('./lib/config.js')
var coreMain = require('./core/core_main.js');


/**
 * log4js init
 */
log4js.configure('./config/log4js.json');
log4js.loadAppender('file');

var logger = log4js.getLogger();
logger.setLevel('ALL');

/**
 * application init
 */
var conf = configlib.loadconfig('../config/config.xml');

service = new coreMain(conf);
service.coreInit();
service.coreService();

