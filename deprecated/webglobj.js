
function glObj() {
	
	this.gl;
	
	function initGL(canvas) {
		try {
			 this.this.gl = canvas.getContext("webgl");
			this.gl.viewportWidth = canvas.width;
			this.gl.viewportHeight = canvas.height;
		} catch (e) {}
		if (!this.gl) {
			alert("Could not initialise WebGL, sorry :-(");
		}
	}
	
	
	function getShader(gl, id) {
		var shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}
		
		var str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}
		
		var shader;
		if (shaderScript.type == "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null;
		}
		
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}
		
		return shader;
	}
	
	
	this.shaderProgram;
	
	function initShaders() {
		var fragmentShader = getShader(gl, "shader-fs");
		var vertexShader = getShader(gl, "shader-vs");
	
		this.shaderProgram = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgram, vertexShader);
		this.gl.attachShader(this.shaderProgram, fragmentShader);
		this.gl.linkProgram(this.shaderProgram);
	
		if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
		
		this.gl.useProgram(this.shaderProgram);
		
		this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
		
		this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
		this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
		
		this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
	}
	
	
	this.mvMatrix = mat4.create();
	this.mvMatrixStack = [];
	this.pMatrix = mat4.create();
	
	function mvPushMatrix() {
		var copy = mat4.create();
		mat4.set(this.mvMatrix, copy);
		this.mvMatrixStack.push(copy);
	}
	
	function mvPopMatrix() {
		if (this.mvMatrixStack.length == 0) {
			throw "Invalid popMatrix!";
		}
		this.mvMatrix = this.mvMatrixStack.pop();
	}
	
	
	function setMatrixUniforms() {
		this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
		this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
	}
	
	
	function degToRad(degrees) {
		return degrees * Math.PI / 180;
	}
	
	var cubeVertexPositionBuffer;
	var cubeVertexColorBuffer;
	var cubeVertexIndexBuffer;
	
	function initBuffers() {
	
		cubeVertexPositionBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		vertices = [
		// Front face
		- 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
	
		// Back face
		- 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
	
		// Top face
		- 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
	
		// Bottom face
		- 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
	
		// Right face
		1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
	
		// Left face
		- 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
		cubeVertexPositionBuffer.itemSize = 3;
		cubeVertexPositionBuffer.numItems = 24;
	
		cubeVertexColorBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		colors = [
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0],
			[1.0, 0.0, 0.0, 1.0]
			];
		var unpackedColors = [];
		for (var i in colors) {
			var color = colors[i];
			for (var j = 0; j < 4; j++) {
				unpackedColors = unpackedColors.concat(color);
			}
		}
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(unpackedColors), this.gl.STATIC_DRAW);
		cubeVertexColorBuffer.itemSize = 4;
		cubeVertexColorBuffer.numItems = 24;
	
		cubeVertexIndexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		var cubeVertexIndices = [
		0, 1, 2, 0, 2, 3, // Front face
		4, 5, 6, 4, 6, 7, // Back face
		8, 9, 10, 8, 10, 11, // Top face
		12, 13, 14, 12, 14, 15, // Bottom face
		16, 17, 18, 16, 18, 19, // Right face
		20, 21, 22, 20, 22, 23 // Left face
		];
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), this.gl.STATIC_DRAW);
		cubeVertexIndexBuffer.itemSize = 1;
		cubeVertexIndexBuffer.numItems = 36;
	}
	
	
	var rCube = 0;
	
	function drawScene() {
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
		mat4.perspective(45, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0, this.pMatrix);
	
		mat4.identity(this.mvMatrix);
	
		mat4.translate(this.mvMatrix, [0, 0.0, -8.0]);
	
		mvPushMatrix();
		mat4.rotate(this.mvMatrix, degToRad(rCube), [-1, 0, 0]);
	
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
	
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeVertexColorBuffer);
		this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
	
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
		setMatrixUniforms();
		this.gl.drawElements(this.gl.TRIANGLES, cubeVertexIndexBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
	
		mvPopMatrix();
	
	}
	
	
	var lastTime = 0;
	
	function animate() {
		var timeNow = new Date().getTime();
		if (lastTime != 0) {
			var elapsed = timeNow - lastTime;
			rCube -= (75 * elapsed) / 1000.0;
		}
		lastTime = timeNow;
	}
	
	
	function tick() {
		requestAnimFrame(tick);
		drawScene();
		animate();
	}
	
	
	var canvas = document.getElementById("c");
	canvas.s
	initGL(canvas);
	initShaders()
	initBuffers();
	
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	
	tick();
}