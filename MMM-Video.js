/* MMM-Video.js
 *
 * Magic Mirror module - Video integration. 
 * 
 * Magic Mirror
 * Module: MMM-Video
 * 
 * Magic Mirror By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 * 
 * Module MMM-Video By Anders Boghammar
 * 
 * The payload received is the "body" part of this message 
 * {
 *   "module" : "MMM-Video",
 *   "body": {
 *     "action": "play",
 *     "video": {"ix": "0"}
 *   }
 * }
 */

Module.register("MMM-Video", {
    // --------------------------------------- Define module defaults
    defaults: {
        height: 200,
        width: (16*200)/9
    },

    // --------------------------------------- Define required scripts
    getScripts: function() {
		return [
            'moment.js'
        ];
	},

    // --------------------------------------- Start the module
    start: function () {
        Log.info("Starting module: " + this.name);

        this.playingvideo = -1;
        this.failure = undefined;
        this.videos = [];

        this.loaded = false;
        this.sendSocketNotification('CONFIG', this.config); // Send config to helper and initiate an update
    },

    // --------------------------------------- Generate dom for module
    showAvailable: function() {
        this.updateDom();
    },

    // --------------------------------------- Generate dom for module
    getDom: function () {
        var wrapper = document.createElement("div");

        if (!this.loaded) {
			wrapper.innerHTML = this.name + " loading videos ...";
			wrapper.className = "dimmed light small";
			return wrapper;
        }

        if (this.playingvideo > -1 && this.playingvideo < this.videos.length) {
            var iv = this.playingvideo;
            var div = document.createElement("div");
            div.className = "xsmall ";
            var date = new moment(this.videos[iv].day);
            div.innerHTML = date.format('YYYY-MM-DD') + ': '
                + this.videos[iv].title;
            wrapper.appendChild(div);
            var video = document.createElement("video");
            video.setAttribute('autoplay', "");
            video.setAttribute('height', this.config.height);
            var source = document.createElement("source");
            source.setAttribute('src', this.videos[iv].video);
            source.setAttribute('type', 'video/mp4');
            video.appendChild(source);
            wrapper.appendChild(video);
        } else {
            for (var ix = 0; ix < this.videos.length; ix++) {
                var div = document.createElement("div");
                var date = new moment(this.videos[ix].day);
                div.innerHTML = ix + ': ' + date.format('YYYY-MM-DD') + ': '
                    + this.videos[ix].title;
                div.className = "xsmall";
                wrapper.appendChild(div);
            }
        }
        // ----- Show service failure if any
        if (this.failure !== undefined) {
            var div = document.createElement("div");
            div.innerHTML = "Service: "+ this.failure;
			div.className = "small";
            div.style.color = "red"; // TODO Change this to a custom style
            wrapper.appendChild(div);
        }
        return wrapper;
    },

    // --------------------------------------- Handle notifications
    notificationReceived: function(notification, payload, sender) {
        if (notification == "PLAYVIDEO") {
            this.failure = undefined;
            Log.info("Got notification "+ notification + " - " + payload + (sender ? ' ' + sender.name : ' system'));
            if (payload.action !== undefined) {
                switch (payload.action) {
                    case 'play':
                        if (payload.video !== undefined && payload.video.ix !== undefined) {
                            if (-1 < payload.video.ix && this.videos.length > payload.video.ix) {
                                this.playingvideo = payload.video.ix;
                                this.sendNotification("PLAYVIDEO_RESPONSE", {status: 'ok', playing: {}})
                            } else {
                                var msg = {status: 'error', message: 'There is no video with index '+payload.video.ix+'.'};
                                this.sendNotification("PLAYVIDEO_RESPONSE", msg);
                                this.failure = msg.message;
                            }
                        } else {
                            var msg = {status: 'error', message: 'invalid payload received. No video pointed out.'};
                            this.sendNotification("PLAYVIDEO_RESPONSE", msg);
                            this.failure = msg.message;
                        }
                        break;
                    case 'stop':
                        this.playingvideo = -1;
                        this.sendNotification("PLAYVIDEO_RESPONSE", {status: 'ok', playing: {}})
                        break;
                    default:
                        var msg = {status: 'error', message: 'Unknown action '+payload.action+'.'};
                        console.log(msg.message);
                        this.sendNotification("PLAYVIDEO_RESPONSE", msg)
                        this.failure = msg.message;
                        break;
                }
                this.updateDom();
            }
        }
    },

    // --------------------------------------- Handle socketnotifications
    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEW_FEED") {
            this.loaded = true;
            this.failure = undefined;
            // Handle payload
            this.videos = payload;
            Log.info("New feed updated: "+ this.videos.length);
            this.updateDom();
            this.sendNotification('SUBSCRIBETO', 'PLAYVIDEO'); // Tell the world that we want to get PLAYVIDEO messages
        }
        if (notification == "SERVICE_FAILURE") {
            this.failure = payload;
            Log.info("Service failure: "+ this.failure.StatusCode + ':' + this.failure.Message);
            this.updateDom();
        }
    },
            
});