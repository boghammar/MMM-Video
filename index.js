var borslunch = require('./borslunch');

borslunch.init({proxy: 'http://gia.sebank.se:8080'});

borslunch.findVideos(showAvailable);

function showAvailable() {
    borslunch.available.forEach(function(element) {
        console.log(element.day.format('YYYY-MM-DD') + ' Title : '  + element.title 
                + '\n\tVideo : ' + element.video 
                + '\n\tPoster: ' + element.poster 
                + '\n\tUrl   : ' + element.url
                );
        
    }, this);            
}
return;