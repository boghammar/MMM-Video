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

        var iv = 0;
        var div =  document.createElement("div");
        div.className = "xsmall align-left";
        var date = new moment(this.currentFeed[iv].day);
        div.innerHTML = date.format('YYYY-MM-DD') + ': '  
            + this.currentFeed[iv].title;
        wrapper.appendChild(div);
        var video = document.createElement("video");
        video.setAttribute('autoplay', "");
        video.setAttribute('height', this.config.height);
        var source = document.createElement("source");
        source.setAttribute('src', this.currentFeed[iv].video);
        source.setAttribute('type', 'video/mp4');
        video.appendChild(source);
        wrapper.appendChild(video);
        for (var ix=0; ix < this.currentFeed.length; ix++) {
            var div = document.createElement("div");
            var date = new moment(this.currentFeed[ix].day);
            div.innerHTML = date.format('YYYY-MM-DD') + ': '  
                + this.currentFeed[ix].title;
			div.className = "xsmall  align-left";
            wrapper.appendChild(div);
        }
        return wrapper;
    },

    // --------------------------------------- Handle socketnotifications
    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEW_FEED") {
            this.loaded = true;
            this.failure = undefined;
            // Handle payload
            this.currentFeed = payload;
            Log.info("New feed updated: "+ this.currentFeed.length);
            this.updateDom();
        }
        if (notification == "SERVICE_FAILURE") {
            this.failure = payload;
            Log.info("Service failure: "+ this.failure.StatusCode + ':' + this.failure.Message);
            this.updateDom();
        }
    },
            
});