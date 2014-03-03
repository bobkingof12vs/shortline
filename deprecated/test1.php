
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>three.js canvas - geometry - text</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
		<style>
			body {
				font-family: Monospace;
				background-color: #f0f0f0;
				margin: 0px;
				overflow: hidden;
			}
		</style>
	</head>
	<body>


		<script src="js/three.js"></script>

		<!-- load the font file from canvas-text -->

		<script src="js/helvetiker_regular.typeface.js"></script>


		<script>

			var container;

			var camera, scene, renderer;

			var text;

			init();
			animate();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, 0, 1000 );

				scene = new THREE.Scene();

				// Get text from hash
				var text3d = new THREE.TextGeometry( 'theText', {

					size: 80,
					height: 20,
					curveSegments: 6,
					font: "helvetiker"

				});

				var textMaterial = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
				text = new THREE.Mesh( text3d, textMaterial )

				scene.add( text );

				renderer = new THREE.WebGLRenderer();
				renderer.setSize( window.innerWidth, window.innerHeight );

				container.appendChild( renderer.domElement );

			}


			//

			function animate() {

				setTimeout(animate,1000/10)

				render();

			}

			function render() {

				renderer.render( scene, camera );

			}

		</script>

	</body>
</html>
