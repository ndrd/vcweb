var gallery_data = [];
var index = 0;
var imageContainer = "imagenActual";
var controlNext = "next";
var controlPrev ="prev";

var init = function() {
	index = 0;
	$("#"+imageContainer).attr("src","");
	$("#"+imageContainer).attr("src",gallery_data[index]);
	
	$("#"+controlPrev).on("click", function(e){
		slideAnterior();
	});

	$("#"+controlNext).on("click", function(e){
		slideSiguiente();
	});



}

var slideAnterior = function() {
	var i = Math.abs(++index%(gallery_data.length))
	console.log("siguiente " + i);
	$("#"+imageContainer).attr("src",gallery_data[i]);
}

var slideSiguiente = function() {
	var i = Math.abs((--index)%(gallery_data.length))
	console.log("anterior" + i);
	$("#"+imageContainer).attr("src",gallery_data[i]);
}

var addImageUrl = function(url) {
	gallery_data.push(url);
}


var showImage = function(index) {
	
}