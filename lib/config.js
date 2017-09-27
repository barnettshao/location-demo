var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');
var xmlParse = new xml2js.Parser({
	explicitRoot: false,
	explicitArray: false,
	tagNameProcessors: [function(name) { return name.toLowerCase(); }]
});


exports.loadconfig = function (filename) {
	var xml = fs.readFileSync(path.resolve(__dirname) + '/' + filename, 'utf-8');
	var conf;

	xmlParse.parseString(xml, function(err, result) {
		if (err) {
			console.log('Configuration file open error!');
		} else {
			conf = result;
		}
	})
	return conf;
}

