var fs = require('fs');
var log4js = require('log4js');


exports.getLoggerJs = function (filename) {
	var js = fs.readFileSync(filename, 'utf-8');
	log4js.configure(eval(js.trim()));

	var logger = new log4js.getLogger('locationDemo');
	logger.setLevel(log4js.ALL);
	Object.defineProperty(exports, 'LOG', {value: logger});

	return logger;
}

