Fuk = {};

/* devuelve los pixeles, almacena la canvas en un canvas
despues devuelve los pixeles */
Fuk.getPixels1 = function(canvas) {
	lienzo = document.getElementById(canvas);
	return this.getPixels(canvas,0,0, lienzo.width, lienzo.height);

}

Fuk.getPixels = function(canvas, dx,dy,sx,sy) {
	var  contexto, lienzo = null;
	lienzo = document.getElementById(canvas);
	if (lienzo != null)
		contexto = lienzo.getContext('2d');
	else
		return null;

	return contexto.getImageData(dx,dy, sx, sy);	
}

Fuk.getLienzo =  function(w, h) {
	var c = document.createElement('canvas');
	c.width = w;
	c.height = h;
	return c;
}

Fuk.crearImagen= function(img, idCanvas) {
	p = 1;
	var c = document.getElementById(idCanvas);
	var img = document.getElementById(img);
	var alto = 441;
	var ancho = 850;
	c.width = ancho;
	c.height =  alto;
	var ctx = c.getContext("2d");
	var dx = img.width - ancho;
	var dy = img.height - alto;
	if (dx > 0 && dy > 0) {
		dx /= 2;
		dy /= 2;
	} else {
		 dx = dy = 0;
	}
	ctx.drawImage(img,0,0);
		
	//ctx.drawImage(img, dx, dy, img.width, img.height, dx, dy, img.width, img.height);
	//
	//ctx.drawImage(img,0,0,ancho,alto,-dx,-dy,img.width, img.height);	
}

Fuk.miniatura =  function(img, idCanvas, filtro) {

	var c = document.getElementById(idCanvas);
	var img = document.getElementById(img);
	var alto = 170;
	var ancho = 170;
	c.width = ancho;
	c.height =  alto;
	var ctx = c.getContext("2d");
	ctx.drawImage(img,0,0,170,170);	
	var  d = ctx.getImageData(0,0,170,170);
	d = filtro(d);
	Fuk.dibujaImagen(d,idCanvas);
}

Fuk.dibujacanvas = function(img, canvas) {
	var c = document.getElementById(canvas);
	var ancho = 463;
	var alto = 374;

	c.width = (img.width > ancho) ? ancho : img.width;
	c.height = (img.height > alto) ? alto : img.height;
	var d = c.getContext('2d');
	d.clearRect(0,0,c.width,c.height)
	d.putImageData(img,0,0);
}

Fuk.dibujaImagen = function(img, canvas) {
	var c = document.getElementById(canvas);
	var ancho = img.width;
	var alto = img.height;

	c.width = (ancho > 850) ? 850 : ancho;
	c.height = (alto > 440) ? 440 : alto;
	var d = c.getContext('2d');
	d.putImageData(img,0,0);
}


Fuk.filtros = {};

Fuk.filtros.escalaGrises = function (pixels) {
	var data = pixels.data;
	for (var i = 0; i < data.length ; i = i + 4) {
		var r = data[i];
		var g = data[i+1];
		var b = data[i+2];
		var media = r * 0.33 + g * 0.33 + b * 0.33;
		data[i] = data[i+1] = data[i+2] = media;
	}
	return pixels;
}

Fuk.filtros.gaussiano = function(canvas,r) {
	var c = document.getElementById(canvas);
 	stackBlurCanvasRGB(canvas,0,0,c.width,c.height,r)
 	var d = c.getContext("2d");
 	
}

Fuk.filtros.diferencia =  function(px1, px2) {
	var d1 = px1.data;
	var d2 = px2.data;

	for (var i = 0; i < d1.length; i += 4) {
		d1[i] = Math.abs(d1[i] - d2[i]);
		d1[i+1] = Math.abs(d1[i+1] - d2[i+1]);
		d1[i+2] = Math.abs(d1[i+2] - d2[i+2]);

	};
	return px1;
}


Fuk.filtros.convolver  = function(pixels, kernel,canvas) {
  /* obtenenemos y limpiamos el lienzo */
 var c = document.getElementById(canvas);
 var d = c.getContext('2d');
 d.clearRect(0,0,c.width,c.height);

 /* calculamos las proposciones de la matriz de convolucion */
  var lado = Math.round(Math.sqrt(kernel.length));
  var medioLado = Math.floor(lado/2);
  var origen = pixels.data;
  var sancho = pixels.width;
  var salto = pixels.height;
  // creamos una nueva canvas con las mismas dimensiones 
  var w = sancho;
  var h = salto;
  var salida = d.createImageData(w,h);
  var destino = salida.data;
  
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dindex = ( y * w + x)*4;
      //sumamos el peso de los pixeles bajo la matriz de convolucion
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<lado; cy++) {
        for (var cx=0; cx<lado; cx++) {
          var dy = sy + cy - medioLado;
          var dx = sx + cx - medioLado;
          if (dy >= 0 && dy < salto && dx >= 0 && dx < sancho) {
            var findex = (dy * sancho + dx) * 4;
            var peso = kernel[cy * lado + cx];
            r += origen[findex] * peso;
            g += origen[findex+1] * peso;
            b += origen[findex+2] * peso;
            a += origen[findex+3] * peso;
          }
        }
      }
      destino[dindex] = r;
      destino[dindex+1] = g;
      destino[dindex+2] = b;
      destino[dindex+3] = a + 1*(255-a);
    }
  }
  return salida;
};

Fuk.filtros.puntosInteres  = function(main, up, down) {
 /* calculamos las proposciones de la matriz de convolucion */
  kernel = [1,1,1,
            1,1,1,
            1,1,1];

  var points = [];
  var umax = 100;
  var umin = 60;

  var lado = Math.round(Math.sqrt(kernel.length));
  var medioLado = Math.floor(lado/2);
  var origen = main.data;
  var mayor = up.data;
  var menor = down.data;
  var sancho = main.width;
  var salto = main.height;
  // creamos una nueva canvas con las mismas dimensiones 
  var w = sancho;
  var h = salto;
 
  
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dindex = ( y * w + x)*4;

      //suponemos que las imagenes ya vienen en escala de grises
      var px = origen[dindex];
      var maximo = true, minimo = true;
      //sumamos el peso de los pixeles bajo la matriz de convolucion
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<lado; cy++) {
        for (var cx=0; cx<lado; cx++) {
          var dy = sy + cy - medioLado;
          var dx = sx + cx - medioLado;
          if (dy >= 0 && dy < salto && dx >= 0 && dx < sancho) {
            var findex = (dy * sancho + dx) * 4;
            var pxUp = mayor[findex];
            var pxDown = menor[findex];
           
            maximo &= (px > pxDown && px > pxUp);
            minimo &= (px < pxDown && px < pxUp);

          }
        }
      }

      if( (maximo &&  px > 180)  || (minimo && px > 1) )
        points.push([x,y]);

    }
  }
  console.log(points.length)
  return points;
};

Fuk.filtros.sobelV =  function(pixels) {
	kernel = [ -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1 ];
	return Fuk.filtros.convolver(pixels, kernel,"td-canvas");
}

Fuk.filtros.sobelH = function(pixels) {
	kernel = [ -1, -2, -1,
     0,  0,  0,
     1,  2,  1 ];
     return Fuk.filtros.convolver(pixels,kernel,"td-canvas");
}

Fuk.filtros.fancySobel = function(pixels) {

	var p  = pixels;
	/*
	var data = Fuk.crearMetacanvas(pixels.width, pixels.height);
	console.log(data);
	var h = Fuk.filtros.sobelH(pixels);
	var v = Fuk.filtros.sobelV(p);
	console.log(h,v,data);
	for(var i = 0; i < data.length; i += 4) {
		var hi = Math.abs(h.data[i]);
		data.data[i] = hi;
		var vi = Math.abs(v.data[i]);
		data.data|[i+1] = vi;
		data.data[i+2] = (vi+hi)/2;
	}
	*/
	return data;

}

/*
* encuentra los puntos importantes dado un conjunton 
de pixeles con canvas 
*/
Fuk.filtros.puntosImportantes =  function(pixels, umbral) {
	var rango = 3;
	var data = pixels.data;
	var puntos = []
	var radio = 10;
	for (var i = 0; i < Math.floor(Math.random()*50); i++) {
		puntos.push([Math.floor(Math.random()*pixels.width),Math.floor(Math.random()*pixels.width)]);	/*
	for (var x = 0; x < pixels.width; x++) {
		for (var y = 0; y < pixels.height; y++) {
			var index = (x * pixels.width + y) * 4;
			var r = data[index];
			var g = data[index+1];
			var b = data[index+2];
			var media = r * 0.33 + g * 0.33 + b * 0.33; 
			if (media > umbral) {
				// checamos a sus vecinos en rango de 3
				for(i = 0; i <= rango; i++) {
						index = (x+i * pixels.width + y) * 4;
						var r = data[index];
						var g = data[index+1];
						var b = data[index+2];
						var media = r * 0.33 + g * 0.33 + b * 0.33; 
				}

			}
		};
	*/
	}
	return puntos;
}



Fuk.filtros.graficaPuntosImportantes = function(canvas,puntos) {
	var c = document.getElementById(canvas);
	var alto = c.height;
	var ancho = c.width;
	var ctx = c.getContext("2d");
	var  d = ctx.getImageData(0,0,ancho,alto);
	d = Fuk.filtros.escalaGrises(d);
	Fuk.dibujaImagen(d,canvas);
	var image = new Image();
	image.src = c.toDataURL();
	ctx.clearRect(0,0,ancho,alto);
	ctx.drawImage(image,0,0);
	// agregamos circulos al canvas 
	puntos.forEach(function(e) {
		ctx.beginPath();
		ctx.strokeStyle="#007AFF";
		ctx.arc(e[0], e[1], 1, 0, 2*Math.PI);
		ctx.stroke();
	});
	
}

Fuk.filtros.convolverN = function(pixels, kernel) {
	 return Fuk.filtros.convolver(pixels,kernel,"td-canvas");
}

Fuk.crearMetacanvas =  function(w,h) {
	img = new Image();
	img.width = w;
	img.height = h;
	var canvas = document.getElementById("td-canvas");
	var con = canvas.getContext("2d");
	con.drawImage(img,0,0);
	return con.getImageData(0,0,w,h);

}

Fuk.metadatos = {};

Fuk.metadatos.mapaAlturas = function(pixels) {
	var data = pixels.data;
	var p  = [];
	// ignoramos el rgba, tomamos solo uno
	var points = Math.floor(data/4);
	var j = 0;
	var x = 0, y = 0;
	for (var i = 0; i < data.length; i = i + 20) {
		var r = data[i];
		var g = data[i+1];
		var b = data[i+2];
		var z = r * 0.33 + g * 0.33 + b * 0.33;
		p.push([x+=5, y, z]);
		if (x % pixels.width == 0) {
			x = 0;
			y+=5;
		}

		
	}
	return p;
}

