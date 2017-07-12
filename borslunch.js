
var moment = require('moment')
var business = require('moment-business')
const request = require("request-promise");
const _ = require('lodash');

moment.locale('sv');

// --------------------------- Find the videos for the last 10 days
var day = new moment();
var days = 0;
var available = [];
var maxdays = 20;
var testUrlDone = _.after(maxdays*2, showFound);
var promises = [];
while (days < maxdays) {
    var dateStr = getDateStr(day);
    if (dateStr != null) {
        var url = 'https://www.efn.se/bors-finans/borslunch-'+dateStr+'/'
        console.log('Testing url: ' + url);
        promises.push(testUrl(url));
        url = 'https://www.efn.se/bors-finans/borslunch-special-'+dateStr+'/'
        console.log('Testing url: ' + url);
        promises.push(testUrl(url));
    }
    day.add(-1, 'day');
    days++;
}

Promise.all(promises).then(function (data) {
        showFound();
    }
);

function showFound() {
    available.forEach(function(element) {
        console.log(element);
    }, this);
}

function getDateStr(mom) {
    if (!business.isWeekDay(mom)) return null;
    return mom.format('DD')+'-'+mom.format('MMM')+'-'+mom.format('YYYY');
}

var includeHeaders = function(body, response, resolveWithFullResponse) {
    return {'headers': response.headers, 'data': body};
}
function testUrl(url) {
    return new Promise( function(resolve, reject) {
        request({
            uri: url, 
            transform: includeHeaders,
            resolveWithFullResponse: true
        })
            .then(function(resp) {
                if (resp.statusCode == 200) {
                    available.push(resp);
                    resolve({'ok': true, 'resp':resp});
                } else {
                    console.log("Something went wrong: " + resp.statusCode); // + ': '+ resp.Message);
                    //self.sendSocketNotification('SERVICE_FAILURE', resp); 
                    resolve({'ok': false, 'resp':"Something went wrong: " + resp.statusCode});
                }
            })
            .catch(function(err) {
                if (err.statusCode != 404) console.log('Problems: '+err);
                else console.log(err.options.uri + ' not found');
                //self.sendSocketNotification('SERVICE_FAILURE', {resp: {StatusCode: 600, Message: err}}); 
                resolve({'ok': false, 'resp': "Not found: " + err.statusCode});
            });
    });
}
