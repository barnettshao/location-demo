var _defaultAttributeType = { ASCIIHEXA:'AH', ASCIINUMBER:'AN', ASCII:'A', HEX:'H' };


exports.setJsonFieldValue = function( jsonField, value ) {
    jsonField.value = value;
}

exports.TextRightBlank = function(src, length) {
    var i = length - src.length;

    for(var l=0; l<i; l++) {
        src += src + ' ';
    }

    return src;
}

exports.getDateTimeString = function() {
    return this.dateFormat(new Date(), "%Y%m%d%H%M%S", false);
};

exports.getDateTimeForamtString = function(fstr) {
    return this.dateFormat(new Date(), fstr, false);
};

exports.dateFormat = function (date, fstr, utc) {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace (/%[YmdHMS]/g, function (m) {
        switch (m) {
            case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
            case '%m': m = 1 + date[utc + 'Month'] (); break;
            case '%d': m = date[utc + 'Date'] (); break;
            case '%H': m = date[utc + 'Hours'] (); break;
            case '%M': m = date[utc + 'Minutes'] (); break;
            case '%S': m = date[utc + 'Seconds'] (); break;
            default: return m.slice (1); // unknown code, remove %
        }
        return ('0' + m).slice (-2);
    });
}

exports.TextAttribute = function(src, attribute) {

    if(src.length >= attribute.length) return src;

    var i = attribute.length - src.length;

    if(_defaultAttributeType.ASCIIHEXA == attribute.type) {
        for(var l=0; l<i; l++) {
            src =+ '0' + src;
        }
        return src;
    } else if(_defaultAttributeType.ASCIINUMBER == attribute.type) {
        for(var l=0; l<i; l++) {
            src =+ '0' + src;
        }
        return src;
    } else if(_defaultAttributeType.ASCII == attribute.type) {
        for(var l=0; l<i; l++) {
            src += ' ';
        }
        return src;
    } else if(_defaultAttributeType.HEX == attribute.type) {
        console.log('TODO TextRightBlankForJson Attribute Type [%s]', attribute.type);
        return src;
    } else {
        console.error('TextRightBlankForJson Attribute Type Error. [%s]', attribute.type);
        return src;
    }

}

exports.bufferProtocol = function(jsonProtocol, protocolLength) {
    var buf = new Buffer(protocolLength);
    var locationProtocol = '';

    for(key in jsonProtocol) {
        console.info("field key[%s] comment[%s] value[%s] conv[%s]", key, jsonProtocol[key].comment, jsonProtocol[key].value,
            this.TextAttribute(jsonProtocol[key].value, jsonProtocol[key].attribute));
        locationProtocol += this.TextAttribute(jsonProtocol[key].value, jsonProtocol[key].attribute);
    }

    buf.write(locationProtocol, 'utf-8');
    return buf.toString('utf-8');
}

