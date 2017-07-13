const NodeHelper = require("node_helper");
const borslunch = require('./borslunch.js');

module.exports = NodeHelper.create({
    // --------------------------------------- Start the helper
    start: function() {

        console.log('Starting helper: '+ this.name);
        this.started = false;
    },

    getFeed: function() {
        var self = this;
        borslunch.init({proxy: 'http://gia.sebank.se:8080'});

        borslunch.findVideos(function() {
            console.log("Got "+borslunch.available.length+" videos");
            //console.log(self);
            self.sendSocketNotification('NEW_FEED', borslunch.available);
        });
    },

    // --------------------------------------- Handle notifications
    socketNotificationReceived: function(notification, payload) {
        const self = this;
        if (notification === 'CONFIG' && this.started == false) {
		    this.config = payload;	     
		    this.started = true;
		    //self.scheduleUpdate();
            self.getFeed(); // Get it first time
        };
    }

});
