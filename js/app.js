

$(document).ready(function(){
});

(function() { 

'use strict'

var FishFinder = { 

	getPictures: function(tag) {
		$.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?",
	  		{
			    tags: tag,
			    tagmode: "any",
			    format: "json"
	  		},

			function(data) {
	    		$.each(data.items, function(i,item) {
	    		console.log(item);

	     		FishFinder.generateImageOutput(item);

	     		if ( i == 4 ) return false; //only return 5 images for now
	    	});
		});

		$('#resultsHeader').text('Images of ' + tag);
	},

	getVideos: function(tag) {
		var params = {
			part: 'snippet',
			q: tag,
			r: 'json',
			key: 'AIzaSyBvdTd6SJBWbM9AHytx3HBHfBK5FPXbwaA'
		};

		var endpointURL = 'https://www.googleapis.com/youtube/v3/search';

		$.getJSON(endpointURL, params, function(data) {
			//var data = data.items[0].snippet.title;
			console.log(data.items);
			FishFinder.generateVideoOutput(data.items);
			
		});
	},

	getInfo: function(tag) {
		var url = "http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + tag + "&callback=?";
		$.ajax({
	        type: "GET",
	        url: url,
	        contentType: "application/json; charset=utf-8",
	        async: false,
	        dataType: "json",
	        success: function (data, textStatus, jqXHR) {
	            console.log(data);
	        },
	        error: function (errorMessage) {
	        }
   		 });
	},

	generateImageOutput: function(item) {
		// images
		$("<img />").attr("src", item.media.m).appendTo("#images");	
	},

	generateVideoOutput: function(results) {
		// videos
		var html = '';

		$.each(results,function(index,value) {
			console.log(value.snippet.title);
			html += '<div>';
			html += '<p>' + value.snippet.title + '</p>';
			html += '<a href=https://www.youtube.com/watch?v=' + value.id.videoId + ' target="blank">';
			html += '<img src=' + value.snippet.thumbnails.medium.url + '></a>';
			html += '</div>';
		});

		$('#videos').html(html);
	}


}; // end of object

$('#btnSearch').click(function() {
	$('#images').empty();
	var tag = $('#inputFinder').val();
	FishFinder.getPictures(tag);
	FishFinder.getVideos(tag);
	FishFinder.getInfo(tag);
	$('#inputFinder').val('');
});

})();