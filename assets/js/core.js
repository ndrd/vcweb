var modes = [];
var info = []
window.modeIndex = 0;
var alturas = [];
var x = y = 0;

var anchoImagen, altoImagen;

var load = function () {
	
	modes[0] = function(data) {return data};
	modes[1] = function(data) {return data};
	modes[2] = function(data) {return Fuk.filtros.sobelV(data)};
	modes[3] = function(data) {return Fuk.filtros.sobelH(data)}; 
	modes[4] = function(data) {return data}; 
	modes[5] = function(data) {return data}; 
	modes[6] = function(data) {return Fuk.filtros.convolverN(data,[-1,-1,-1,-1,8,-1,-1,-1,-1])}
	modes[7] = function(data) {return Fuk.filtros.convolverN(data,[  0, -1,  0,-1,  5, -1, 0, -1,  0 ])}
	modes[8] = function(data) {return Fuk.filtros.convolverN(data,[1,1,1,1,0.7,-1,-1,-1,-1])}
	
	for(var i = 0; i < modes.length; i++) {
				$("#comandos_").append(makeCard(i,window.data[i].nombre));
				
			}

	$('#pic').change(function(e) {
		var file = e.target.files[0]; 
		var fr = new FileReader();
		fr.onload = function(ev) {
			$('#svg-image').attr('xlink:href', ev.target.result);
		  	$("#imgtmp").attr("src", ev.target.result);
		  	
		  	for(var i = 0; i < modes.length; i++) {
				Fuk.miniatura("imgtmp","c" + i,modes[i]);
				if(i==1){
					stackBlurCanvasRGB("c1",0,0,170,170,5)
				}
				if(i==4){
					dog("c4");
				}
			}
		  	stackBlurImage("imgtmp","tmp-canvas",10,true);
		  	var canvas = document.getElementById("tmp-canvas");

		  	$('#portaLienzo').css('background', 'url(' + canvas.toDataURL() + ')');
		  	$('#portaLienzo').css('background-size', 'cover');

		  	$('#overlay').css('background', 'url(' + canvas.toDataURL() + ')');
			$('#overlay').css('background-size', 'cover');

		  	var data = Fuk.getPixels("lienzo",0, 0, 50,50);
		  	Fuk.crearImagen("imgtmp","lienzo");
		  	mostrarInformacion(modeIndex);
		  	miniatura(x,y);
		  	$("#zoom").show();
		  	
		  	//Fuk.escala("tmp-canvas","mini-canvas",1/4);
		  }
		fr.readAsDataURL(file);
		
  	});



  	$("#zoom").draggable({ containment: "parent",
  		
    	stop:function(e,ui) {
    		var size = 100;
    		x = ui.position.left;
    		y = ui.position.top;
    		miniatura(x,y);
 			
    	}
    });


   	$("#comandos").delegate(".comando", "click", function(){
	 	var index = $(this).attr("mode");
	 	window.modeIndex = index;
	 	miniatura(x,y);
	 	mostrarInformacion(index);
	 	
	 });

   	$("#detalles").on("click", function(e){
   		$("#overlay").show();
   		
   	});

   	$("#cerrar").on("click", function(e){
   		$("#overlay").hide();
   	
   	});

   	$("#apply").on("click",function(e){ grandura();});
   	$("#restore").on("click",function(e){restore();});

	

}


var parseMode = function(data, modeIndex) {
	var d = data;
	if(modeIndex < 0 && modeIndex >= modes.length-1)
		d =  null;
	return modes[modeIndex](d);
	

}


var mostrarInformacion = function(index) {
	var info = data[index];
	gallery_data = info.slides;
	init();
	$("#title").text(info.nombre);
	info.tags.forEach(function(e){
		ref = "<a href='#"+ e +"'> "+ e +" ,  </a>"
		$("#tags").append(ref);

	});

		$("#dif").text(info.complejidad);
	$("#description").text(info.d);

	$("#web").attr("href",info.url);
	$("#web").text(info.url);


}

var miniatura =  function(x,y) {
	var data = Fuk.getPixels("lienzo",x,y, 200,150);
	 var d = modes[window.modeIndex](data);
	 Fuk.dibujaImagen(d,"td-canvas");
	 /*caso especial gauss */
	 if (window.modeIndex == 1)
	 	stackBlurCanvasRGB("td-canvas",0,0,200,150,5)
	 if(window.modeIndex == 4)
	 	dog("td-canvas");
	 return d;
	
}


var grandura =  function() {
	imagen = document.getElementById("lienzo");
	context = imagen.getContext("2d");
	ancho = (imagen.width) > 850 ? 850 : imagen.width;
	alto = (imagen.height) > 441 ? 441 : imagen.height;
	var data = context.getImageData(0,0,ancho,alto);
	var d = modes[window.modeIndex](data);
	if(window.modeIndex == 1) {
		console.log(ancho + " " + alto);
	 	stackBlurCanvasRGB("lienzo",ancho, alto,5);
	 	console.log("gausiaano");
	}
	if(window.modeIndex == 4)
	 	dog("lienzo");
	 else
	 	Fuk.dibujaImagen(d,"lienzo");

	 var canvas = document.getElementById("tmp-canvas");
	 $("#downloadUrl").attr("href",imagen.toDataURL());
	 
	 return d;
	
}

var restore = function() {
	Fuk.crearImagen("imgtmp","lienzo");
}

var makeCard =  function(i,name){
	return "<div class='comando little card' mode="+ i+"><div class='thumbnail'><canvas id='c"+i+"''></canvas><span class='title'>"+name+"</span></div></div>"
}


var dog = function(canvas) {
	var t1 = Date.now(); 
	var n = canvas;
	var canvas = document.getElementById(canvas);
	var d = canvas.getContext("2d");
	var img = d.getImageData(0,0,canvas.width, canvas.height);

	var g1 = document.getElementById("g1");
	var g2 = document.getElementById("g2");
	var g3 = document.getElementById("g3");
	var g4 = document.getElementById("g4");

	g1.width = g2.width = g3.width = g4.width = canvas.width;
	g1.height = g2.height = g3.height = g4.height  = canvas.height;

	var d1 = g1.getContext("2d");
	var d2 = g2.getContext("2d");
	var d3 = g3.getContext("2d");
	var d4 = g4.getContext("2d");

	d1.putImageData(img,0,0);
	d2.putImageData(img,0,0);
	d3.putImageData(img,0,0);
	d4.putImageData(img,0,0);


	stackBlurCanvasRGB("g1",0,0,canvas.width,canvas.height,1)
	stackBlurCanvasRGB("g2",0,0,canvas.width,canvas.height,4)
	stackBlurCanvasRGB("g3",0,0,canvas.width,canvas.height,8)
	stackBlurCanvasRGB("g4",0,0,canvas.width,canvas.height,16)

	var img1 = d1.getImageData(0,0,canvas.width, canvas.height);
	var img2 = d2.getImageData(0,0,canvas.width, canvas.height);
	var img3 = d3.getImageData(0,0,canvas.width, canvas.height);
	var img4 = d4.getImageData(0,0,canvas.width, canvas.height);

	/* aqui viene la DoG*/

	var dog1 = document.getElementById("dog1");
	var dog2 = document.getElementById("dog2");
	var dog3 = document.getElementById("dog3");

	dog1.width = dog2.width = dog3.width = canvas.width;
	dog1.height = dog2.height = dog3.height = canvas.height;

	var dd1 = dog1.getContext("2d");
	var dd2 = dog2.getContext("2d");
	var dd3 = dog3.getContext("2d");

	var imgd1 = Fuk.filtros.diferencia(img1,img2);
	var imgd2 = Fuk.filtros.diferencia(img2,img3);
	var imgd3 = Fuk.filtros.diferencia(img3,img4);

	imgd1 = Fuk.filtros.escalaGrises((imgd1));
	imgd2 = Fuk.filtros.escalaGrises((imgd2));
	imgd3 = Fuk.filtros.escalaGrises((imgd3));


	dd1.putImageData(imgd1,0,0);
	dd2.putImageData(imgd2,0,0);
	dd3.putImageData(imgd3,0,0);

	puntos = Fuk.filtros.puntosInteres(imgd2,imgd1,imgd3);

	Fuk.filtros.graficaPuntosImportantes(n,puntos);



	console.log("time:" + (Date.now()-t1))
}




