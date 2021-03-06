$(document).ready(function(){
});

(function() { 

'use strict'

var FishFinder = {

	start: function() {
		$('#gallery').empty();
		$('#wiki').empty();

		var tag = $('#inputFinder').val();

		//debugging dummy value
		tag = 'moorish idol';

		FishFinder.getEverything(tag);

		$('#inputFinder').val('');

	},

	getEverything: function(tag) {


		var flickrAPIkey = '86033d438231b67be4d7a301d6eb3dde';
		var flickrAPIsecret = '0298f9549f161aaf';



		var promiseImages = $.Deferred();

		$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
	                {
	                  tags: tag,
	                  tagmode: "any",
	                  format: "json"
	                })
	                .done(function(data) {
	                	promiseImages.resolve(data);
	                })
	                .fail(function(){
	                 	promiseImages.reject();
	                });


		var promiseVideos = $.Deferred();

		$.getJSON('https://www.googleapis.com/youtube/v3/search', 
					{
						part: 'snippet',
						q: tag,
						r: 'json',
						key: 'AIzaSyBvdTd6SJBWbM9AHytx3HBHfBK5FPXbwaA'
					})		
					.done(function(data) {
						promiseVideos.resolve(data);
					});


		var promiseWiki = $.Deferred();

		$.getJSON("http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + tag + "&callback=?")
					.done(function(data) {
						promiseWiki.resolve(data);
					});
		
		$.when(promiseImages,promiseVideos,promiseWiki).done(function(imageData,videoData,wikiData) {	
			// success getting the data from the external API's - now use it 
			FishFinder.generateWiki(wikiData,tag);
			FishFinder.generateMasonryOutput(imageData,videoData);
		});

	},

	generateMasonryOutput: function(imageData,videoData) {
		// the APIs that populate imageData and videoData return vastly different JSON payloads
		// so define a class to store the relevant info from either to make it consistent
		function Gallery (source,thumbnail_url,fullsize_url,title,iframe) {
			this.source = source;
			this.thumbnail_url = thumbnail_url;
			this.fullsize_url = fullsize_url;
			this.title = title;
			this.iframe = iframe;
		};

		// array to store each Gallery object
		var collection = [];

		$.each(imageData.items, function(i,item) {		
			// read through each imageData item and extract the needed data
			// store in new instance of the Gallery object
			// API specific URL crafting is here 
			var objGallery = new Gallery();
		
			objGallery.source = 'flickr';
			objGallery.thumbnail_url = item.media.m;
			objGallery.fullsize_url = item.link;
			objGallery.title = item.title;

			collection.push(objGallery);	//store each object in collection array

			if ( i == 19 ) return false;	//only return 20 images for now
		});


		$.each(videoData.items, function(i,item) {
			// read through each videoData item and extract the needed data
			// store in new instance of the Gallery object
			// API specific URL crafting is here 
			var objGallery = new Gallery();

			objGallery.source = 'youtube';
			objGallery.thumbnail_url = item.snippet.thumbnails.medium.url;
			objGallery.fullsize_url = '';
			objGallery.title = item.snippet.title;
			objGallery.iframe = '<iframe width="420" height="315" src="https://www.youtube.com/watch?v=' + item.id.videoId + '"></iframe>';

			// console.log(objGallery.iframe);

			collection.push(objGallery);	//store each object in collection array
		});


		// create html version 1.0 - ordered by array index
		// this adds the FLICKR images first, then adds the YouTube thumbnails to the end
		// for (var i = 0; i < collection.length; i++) {
		// 	var html = '';
		// 	html += '<div class="grid-item">';
		// 	html += '<img src="' + collection[i].thumbnail_url + '" class="gallery-image" alt="' + collection[i].title;
		// 	// html += '" data-image="' + collection[i].fullsize_url;
		// 	// html += '" data-youtube="' + collection[i].iframe;
		// 	html += '">';
		// 	html += '</div>';
		// 	$('#gallery').append(html);
		// };


		// create html v2.0 - randomize
		// use the Fisher-Yates Shuffle to randomize the array of objects to make the grid more interesting
		function shuffle(array) {
  			var currentIndex = array.length, temporaryValue, randomIndex;

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {

			    // Pick a remaining element...
			    randomIndex = Math.floor(Math.random() * currentIndex);
			    currentIndex -= 1;

			    // And swap it with the current element.
			    temporaryValue = array[currentIndex];
			    array[currentIndex] = array[randomIndex];
			    array[randomIndex] = temporaryValue;
		  	}
			return array;
		};

		var newCollection = shuffle(collection);

		for (var i = newCollection.length - 1; i >= 0; i--) {
			var html = '';
			if (newCollection[i].source == 'youtube') {
				html += '<div class="grid-item grid-item--width2">';
				html += '<img src="' + newCollection[i].thumbnail_url + '" class="gallery-image" width="240" alt="' + newCollection[i].title;
			}
			else {
				html += '<div class="grid-item">';
				html += '<img src="' + newCollection[i].thumbnail_url + '" class="gallery-image" alt="' + newCollection[i].title;
			}
		 	html += '">';
			html += '</div>';
			$('#gallery').append(html);
		}


		// activate Masonry
		// using imagesLoaded to make sure this doesn't happen till after the images load in the DIV
		var elem = document.querySelector('.grid');
		imagesLoaded( elem, function() {
			var msnry = new Masonry( elem, {
				itemSelector: '.grid-item',
	 			gutter: 10,
	  			columnWidth: 240
			});
		});



		// ----------------------------- for version 2.0 --------------------------------------
		// // event handlers for the elements created after the AJAX calls
		// $('.gallery-image').on('click', function() {
		// 	// handler to activate modal overlay 
		// 	console.log('clicked image');
		// 	$('.gallery-modal').css('display', 'block');

		// 	console.log(this);

		// 	// var bigImageHTML = '';
		// 	// bigImageHTML += '<img src="images/x-close.gif" class="close">';

		// 	var iframeHTML = $(this).data("youtube");
		// 	$('.gallery-modal').append(iframeHTML);
			
		// 	console.log(iframeHTML);

		// 	// bigImageHTML += '<img src="' + url  + '">';

		// 	// console.log(bigImageHTML);

		// 	// $('.gallery-modal').append(bigImageHTML);
		// });

		// $('.close').on('click', function() {
		// 	$('.gallery-modal').css('display', 'none');
		// 	console.log('close');
		// 	// $('.gallery-modal').empty();
		// });
	},

	generateWiki: function(data,tag) {

		$('#resultsHeader').text(tag);
												// the wikipedia JSON isn't very...structured
		var wikiMarkup = data.parse.text["*"];	// so shove the returned Wikipedia HTML into a variable for processing
  
  		var wrapped = $('<div></div>').html(wikiMarkup);	// wrap the whole wiki markup in a div so we can use jQuery against it
       	wrapped.find('a').each(function() {			// rip out the links as they are dead ends
       		$(this).replaceWith($(this).html()); 
       	});
        $('#wiki').html($(wrapped).find('p'));	// the p tags hold the main article, find them, and put them in the DOM
	}

}; // end of object



$('#btnSearch').on('click', function() {
	FishFinder.start();
});

$('#inputFinder').keydown(function(event) {
	FishFinder.start();
});




})();