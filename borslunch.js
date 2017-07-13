
var moment = require('moment')
var business = require('moment-business')
const request = require("request-promise");
const _ = require('lodash');
const HttpsProxyAgent = require('https-proxy-agent');
const Url = require('url');

var borslunch = {
    init: function (cfg) {
        this.config = cfg;
        moment.locale('sv');
    },

        // --------------------------- Find the videos for the last 10 days
    findVideos: function(callback) {
        var self = this;

        var day = new moment();
        var days = 0;
        this.available = [];
        var maxdays = 20;

        this.promises = [];
        while (days < maxdays) {
            var dateStr = this.getDateStr(day);
            if (dateStr != null) {
                var url = 'https://www.efn.se/bors-finans/borslunch-' + dateStr + '/'
                console.log('Testing url: ' + url);
                this.promises.push(this.testUrl(url,day));
                url = 'https://www.efn.se/bors-finans/borslunch-special-' + dateStr + '/'
                console.log('Testing url: ' + url);
                this.promises.push(this.testUrl(url,day));
            }
            day.add(-1, 'day');
            days++;
        }

        Promise.all(this.promises).then(function (data) {
            callback();
            }
        );
    },

    // --------------------------------------------------------------------

    getDateStr: function (mom) {
        if (!business.isWeekDay(mom)) return null;
        return mom.format('DD') + '-' + mom.format('MMM') + '-' + mom.format('YYYY');
    },

    createVideo: function(today, url, body) {
        var video = {'day': today, 'url': url, 'body': body};
        // Test regex online https://regex101.com/
        var match = body.match(/<h1 .*>(.*)<\/h1>/);
        if (match != null && match.length > 1) {
            video.title = match[1];
        }
        // TODO?: An alternative is to find 'HB.video.mp4 = {...} 
        match = body.match(/data-android="(.*)"/);
        if (match != null  && match.length > 1) {
            video.video = match[1];
        }
        match = body.match(/data-poster="(.*)"/);
        if (match != null  && match.length > 1) {
            video.poster = 'https://www.efn.se'+ match[1];
        }
        return video;
    },

    testUrl: function (url, day) {
        var self = this;
        var today = day.clone();
        return new Promise(function (resolve, reject) {
            var opt = {
                uri: url,
                resolveWithFullResponse: true
            };
            if (self.config.proxy !== undefined) {
                opt.agent = new HttpsProxyAgent(Url.parse(self.config.proxy));
            }
            request(opt)
                .then(function (resp) {
                    if (resp.statusCode == 200) {
                        var video = self.createVideo(today, url, resp.body);
                        self.available.push(video);
                        resolve({ 'ok': true, 'resp': resp });
                    } else {
                        console.log("borslunch Something went wrong: " + resp.statusCode); // + ': '+ resp.Message);
                        //self.sendSocketNotification('SERVICE_FAILURE', resp); 
                        resolve({ 'ok': false, 'resp': "Something went wrong: " + resp.statusCode });
                    }
                })
                .catch(function (err) {
                    if (err.statusCode != 404) console.log('borslunch Problems: ' + err);
                    else console.log(err.options.uri + ' not found');
                    //self.sendSocketNotification('SERVICE_FAILURE', {resp: {StatusCode: 600, Message: err}}); 
                    resolve({ 'ok': false, 'resp': "Not found: " + err.statusCode });
                });
        });
    }
}

module.exports = borslunch;