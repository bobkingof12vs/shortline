<? include('libs/lib.php'); ?>
<html>
  <head>
    <title>Train Station</title>
  <style>
  body {
    margin:0px;
    padding:0px;
  }
  canvas{
		cursor: none
  }
  </style>
	<script type="text/javascript" src="libs/glMatrix-0.9.5.min.js"></script>
	<script type="text/javascript" src="libs/webgl-utils.js"></script>
	
	<script id="shader-fs" type="x-shader/x-fragment">
			precision mediump float;
	
			varying vec4 vColor;
	
			void main(void) {
					gl_FragColor = vColor;
			}
	</script>
	
	<script id="shader-vs" type="x-shader/x-vertex">
			attribute vec3 aVertexPosition;
			attribute vec4 aVertexColor;
	
			uniform mat4 uMVMatrix;
			uniform mat4 uPMatrix;
	
			varying vec4 vColor;
	
			void main(void) {
					gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
					vColor = aVertexColor;
			}
	</script>
  </head>
  <body>
    <canvas id='c' style="position: absolute; z-index: 1">Canvas is not supported By this Browser</canvas>
		<script src="libs/gfunc.js"></script>
    <script src="libs/draw.js"></script>
		<script src="game.js"></script>
  </body>
</html>