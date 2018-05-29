var canvas, gl;
var camera;

// switches
var lighting = true;
var wireframe = false;
var cameraOnBill=false;
var speed= [ 0, 0, 0];
var objects = [];
var shaders = [];
var models = [];
var lights = [];

var ambientColor = vec4(0.4, 0.4, 0.4,0.4);
var ambientWeight = 0.8;

function initCanvas() {  
  canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  camera = new Camera(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, 5);

}

function initShaderVariables() {


  var noLightVS = document.getElementById("vertex-shader");
  var noLightFS = document.getElementById("fragment-shader");

  var multiLightVS = document.getElementById("texture-vertex-shader");
  var multiLightFS = document.getElementById("texture-fragment-shader");

  multiLightFS.text = replaceParams(multiLightFS.text, {
    numLights: lights.length,
    useLight: lighting
  });
  multiLightVS.text = replaceParams(multiLightVS.text, {
    numLights: lights.length,
    useLight: lighting
  });

  //console.log(multiLightVS.text);
  shaders[0] = new Shader(noLightVS, noLightFS);
  shaders[1] = new Shader(multiLightVS, multiLightFS);

  for (var i = 0; i < shaders.length; i++ ) {
    shaders[i].program = initShaders( gl, shaders[i].vertexShader, shaders[i].fragmentShader );

    gl.useProgram( shaders[i].program );

    // attributes
    // vertex attributes
    shaders[i].program.positionAttribute = gl.getAttribLocation(shaders[i].program, "a_pos");
    shaders[i].program.colorAttribute = gl.getAttribLocation(shaders[i].program, "a_color");
    shaders[i].program.textureCoordAttribute = gl.getAttribLocation(shaders[i].program, "a_texCoord");
    shaders[i].program.normalAttribute = gl.getAttribLocation(shaders[i].program, "a_vertexNormal");
    
    //uniforms
    shaders[i].program.worldMatrixUniform = gl.getUniformLocation(shaders[i].program, "u_worldMatrix");
    shaders[i].program.cameraPositionUniform = gl.getUniformLocation(shaders[i].program, "u_cameraPosition");
    //shaders[i].program.projectionMatrixUniform = gl.getUniformLocation(shaders[i].program, "u_projectionMatrix");
    shaders[i].program.modelMatrixUniform = gl.getUniformLocation(shaders[i].program, "u_modelMatrix");
    shaders[i].program.samplerUniform = gl.getUniformLocation(shaders[i].program, "u_sampler");

    //shaders[i].program.useLightingUniform = gl.getUniformLocation(shaders[i].program, "u_useLight");
    if (lighting) {
      shaders[i].program.ambientColorUniform = gl.getUniformLocation(shaders[i].program, "u_ambientColor");
      shaders[i].program.ambientWeightUniform = gl.getUniformLocation(shaders[i].program, "u_ambientWeight");
      
      shaders[i].program.lightTypeUniform = [];
      shaders[i].program.lightingDirectionUniform = [];
      shaders[i].program.directionalColorUniform = [];
      shaders[i].program.specularPowerUniform = [];
      shaders[i].program.directionalColorUniform = [];
      shaders[i].program.specularPowerUniform = [];
      shaders[i].program.lightPositionUniform = [];
      shaders[i].program.spotLimitUniform = [];

      for (var j = 0; j < lights.length; j++) {
        var number = "[" + j + "]";
        shaders[i].program.lightTypeUniform[j] = gl.getUniformLocation(shaders[i].program, "u_lightType" + number);
        //lighting uniforms
        if (lights[j].type == 0) { // if spotlight
          shaders[i].program.lightingDirectionUniform[j] = gl.getUniformLocation(shaders[i].program, "u_lightDirection" + number);
          shaders[i].program.directionalColorUniform[j] = gl.getUniformLocation(shaders[i].program, "u_directionColor" + number);
          shaders[i].program.specularPowerUniform[j] = gl.getUniformLocation(shaders[i].program, "u_specularPower" + number);
          shaders[i].program.lightPositionUniform[j] = gl.getUniformLocation(shaders[i].program, "u_lightPosition" + number);
          shaders[i].program.spotLimitUniform[j] = gl.getUniformLocation(shaders[i].program, "u_spotLimit" + number);
        }

        if (lights[j].type == 1) { // if directional 
          shaders[i].program.lightingDirectionUniform[j] = gl.getUniformLocation(shaders[i].program, "u_lightDirection" + number);
          shaders[i].program.directionalColorUniform[j] = gl.getUniformLocation(shaders[i].program, "u_directionColor" + number);
          shaders[i].program.specularPowerUniform[j] = gl.getUniformLocation(shaders[i].program, "u_specularPower" + number);
        }

        if (lights[j].type == 2) { // if point
          shaders[i].program.directionalColorUniform[j] = gl.getUniformLocation(shaders[i].program, "u_directionColor" + number);
          shaders[i].program.specularPowerUniform[j] = gl.getUniformLocation(shaders[i].program, "u_specularPower" + number);
          shaders[i].program.lightPositionUniform[j] = gl.getUniformLocation(shaders[i].program, "u_lightPosition" + number);
        }

      }
    }
  }
}



function initModels() {
  models[0] = new Model();
  models[0].vertices = [
    // Front face
    0.0,  1.0,  0.0,
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,

    // Right face
    0.0,  1.0,  0.0,
    1.0, -1.0,  1.0,
    1.0, -1.0, -1.0,

    // Back face
    0.0,  1.0,  0.0, 
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,

    // Left face
    0.0,  1.0,  0.0,
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0
  ];
  models[0].vertexInfo.itemSize = 3;
  models[0].vertexInfo.numItems = 12;

  models[0].colors = [
    // Front face
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,

    // Right face
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0,

    // Back face
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,

    // Left face
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0
  ];

  models[0].indices = [
		0, 1, 2,     
		3,4,5,
		6,7,8,
		9,10,11
  ];

  models[0].colorInfo.itemSize = 4;
  models[0].colorInfo.numItems = 12;
	models[0].textureCoordinate = [
      // Front face
	0.25, 1.0,
	0.5,0,
	0.0, 0.0,

      // Back face
	0.75, 1.0,
	1.0,0,
	0.5, 0.0,

      // Top face
0.75, 1.0,
	1.0,0,
	0.5, 0.0,
      // Bottom face
0.75, 1.0,
	1.0,0,
	0.5, 0.0,
    ];
  models[0].textureInfo.itemSize = 2;
  models[0].textureInfo.numItems = 12;
  models[0].indexInfo.itemSize = 1;
  models[0].indexInfo.numItems = 12;
models[0].vertexNormal = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,


      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
    ];
    models[0].normalInfo.itemSize = 3;
    models[0].normalInfo.numItems = 12;

  models[1] = new Model();
  models[1].vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
  ];
  models[1].vertexInfo.itemSize = 3;
  models[1].vertexInfo.numItems = 24;

  models[1].colors = [
      [1.0, 0.0, 0.0, 1.0], // Front face
      [1.0, 1.0, 0.0, 1.0], // Back face
      [0.0, 1.0, 0.0, 1.0], // Top face
      [1.0, 0.5, 0.5, 1.0], // Bottom face
      [1.0, 0.0, 1.0, 1.0], // Right face
      [0.0, 0.0, 1.0, 1.0]  // Left face
  ];
  var unpackedColors = [];
  for (var i = 0; i < models[1].colors.length; i++) {
      var color = models[1].colors[i];
      for (var j=0; j < 4; j++) {
          unpackedColors = unpackedColors.concat(color);
      }
  }
  models[1].colors = unpackedColors;

  models[1].colorInfo.itemSize = 4;
  models[1].colorInfo.numItems = 24;

  models[1].indices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];
  models[1].indexInfo.itemSize = 1;
  models[1].indexInfo.numItems = 36;

  models[1].textureCoordinate = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];
    models[1].textureInfo.itemSize = 2;
    models[1].textureInfo.numItems = 24;

    models[1].vertexNormal = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,

      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,

      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
    ];
    models[1].normalInfo.itemSize = 3;
    models[1].normalInfo.numItems = 24;

    
    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    var indexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    models[2] = new Model();
    models[2].vertices = vertexPositionData;
    models[2].vertexNormal = normalData;
    models[2].textureCoordinate = textureCoordData;
    models[2].indices = indexData;

    models[2].normalInfo.itemSize = 3;
    models[2].normalInfo.numItems = normalData.length / 3;

    models[2].textureInfo.itemSize = 2;
    models[2].textureInfo.numItems = textureCoordData.length / 2;

    models[2].vertexInfo.itemSize = 3;
    models[2].vertexInfo.numItems = vertexPositionData.length / 3;

    models[2].indexInfo.itemSize = 1;
    models[2].indexInfo.numItems = indexData.length;

    models[3] = new Model();
  models[3].vertices = [
    // Front face
    0.0,  1.0,  0.0,
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,

    // Right face
    0.0,  1.0,  0.0,
    1.0, -1.0,  1.0,
    1.0, -1.0, -1.0,

    // Back face
    0.0,  1.0,  0.0, 
    1.0, -1.0, -1.0,
    -1.0, -1.0, -1.0,

    // Left face
    0.0,  1.0,  0.0,
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0
  ];
  models[3].vertexInfo.itemSize = 3;
  models[3].vertexInfo.numItems = 12;

  models[3].colors = [
    // Front face
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,

    // Right face
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0,

    // Back face
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,

    // Left face
    1.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0
  ];

  models[3].indices = [
		0, 1, 2,     
		3,4,5,
		6,7,8,
		9,10,11
  ];

  models[3].colorInfo.itemSize = 4;
  models[3].colorInfo.numItems = 12;
	models[3].textureCoordinate = [
      // Front face
	0.5, 0.0,
	1.0, 0.0,
	1.0, 1.0,

      // Back face
	0.5, 0.0,
	1.0, 0.0,
	1.0, 1.0,

      // Top face
	0.5, 0.0,
	1.0, 0.0,
	1.0, 1.0,

      // Bottom face
	0.5, 0.0,
	1.0, 0.0,
	1.0, 1.0,
    ];
  models[3].textureInfo.itemSize = 2;
  models[3].textureInfo.numItems = 12;
  models[3].indexInfo.itemSize = 1;
  models[3].indexInfo.numItems = 12;
models[3].vertexNormal = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,


      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
    ];
    models[3].normalInfo.itemSize = 3;
    models[3].normalInfo.numItems = 12;

    models[4] = new Model();
  models[4].vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
  ];
  models[4].vertexInfo.itemSize = 3;
  models[4].vertexInfo.numItems = 24;

  models[4].colors = [
      [1.0, 0.0, 0.0, 1.0], // Front face
      [1.0, 1.0, 0.0, 1.0], // Back face
      [0.0, 1.0, 0.0, 1.0], // Top face
      [1.0, 0.5, 0.5, 1.0], // Bottom face
      [1.0, 0.0, 1.0, 1.0], // Right face
      [0.0, 0.0, 1.0, 1.0]  // Left face
  ];
  var unpackedColors = [];
  for (var i = 0; i < models[1].colors.length; i++) {
      var color = models[1].colors[i];
      for (var j=0; j < 4; j++) {
          unpackedColors = unpackedColors.concat(color);
      }
  }
  models[4].colors = unpackedColors;

  models[4].colorInfo.itemSize = 4;
  models[4].colorInfo.numItems = 24;

  models[4].indices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
  ];
  models[4].indexInfo.itemSize = 1;
  models[4].indexInfo.numItems = 36;

  models[4].textureCoordinate = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];
    models[4].textureInfo.itemSize = 2;
    models[4].textureInfo.numItems = 24;

    models[4].vertexNormal = [
      // Front face
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,
       0.0,  0.0,  1.0,

      // Back face
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,
       0.0,  0.0, -1.0,

      // Top face
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       0.0,  1.0,  0.0,

      // Bottom face
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,
       0.0, -1.0,  0.0,

      // Right face
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,
       1.0,  0.0,  0.0,

      // Left face
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
    ];
    models[4].normalInfo.itemSize = 3;
    models[4].normalInfo.numItems = 24;

}


function initBuffers() {
  initModels();
  
  for (var i in models) {
    
    if (models[i].vertices != 0) {
      models[i].vertexInfo.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, models[i].vertexInfo.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(models[i].vertices), gl.STATIC_DRAW);
    }
    if (models[i].colors != 0) {
      models[i].colorInfo.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, models[i].colorInfo.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(models[i].colors), gl.STATIC_DRAW);
    }
    if (models[i].indices != 0) {
      models[i].indexInfo.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, models[i].indexInfo.buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[i].indices), gl.STATIC_DRAW);
    }
    if (models[i].textureCoordinate != 0) {
      models[i].textureInfo.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, models[i].textureInfo.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(models[i].textureCoordinate), gl.STATIC_DRAW);
    }
    if (models[i].vertexNormal != 0) {
      models[i].normalInfo.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, models[i].normalInfo.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(models[i].vertexNormal), gl.STATIC_DRAW);
      //console.log(models[i].vertexNormal);
    }
    
  }
}

function initObjects () {
	objects[0] = new GameObject();
	objects[0].model = models[2];
	objects[0].shader = shaders[1];
	objects[0].position = vec3(5, 0, -10 );
	objects[0].scale = vec3(0.5, 0.5, 0.5)
	//objects[0].scale = vec3(2,1,1);

	objects[1] = new GameObject();
	objects[1].model = models[1];
	objects[1].shader = shaders[1];
	objects[1].position = vec3(-5, 0, -10.0 );
	
  objects[2] = new GameObject();
	objects[2].model = models[3];
	objects[2].shader = shaders[1];
	objects[2].position = vec3(5, 1, -40.0 );

	objects[3] = new GameObject();
	objects[3].model = models[1];
	objects[3].shader = shaders[1];
	objects[3].position = vec3(0, -2.125, 0 );
	objects[3].father= objects[2];

	objects[4] = new GameObject();
	objects[4].model = models[1];
	objects[4].shader = shaders[1];
	objects[4].position = vec3(0, -2.125, 0 );
	objects[4].father= objects[3];

  objects[5] = new GameObject();
	objects[5].model = models[3];
	objects[5].shader = shaders[1];
	objects[5].position = vec3(0, -2.125, 0 );
	objects[5].father= objects[4];
  objects[5].rotation = vec3(180,0,0)


  objects[6] = new GameObject();
	objects[6].model = models[1];
	objects[6].shader = shaders[1];
	objects[6].position = vec3(-5, 1, -40.0 );

	objects[7] = new GameObject();
	objects[7].model = models[3];
	objects[7].shader = shaders[1];
	objects[7].position = vec3(0, 2.125, 0 );
	objects[7].father= objects[6];


  objects[8] = new GameObject();
	objects[8].model = models[3];
	objects[8].shader = shaders[1];
	objects[8].position = vec3(0, -2.125, 0 );
	objects[8].father= objects[6];
  objects[8].rotation = vec3(180,0,0)

	objects[9] = new GameObject();
	objects[9].model = models[3];
	objects[9].shader = shaders[1];
	objects[9].position = vec3(2.125,0,0 );
	objects[9].father= objects[6];
  objects[9].rotation = vec3(0,0,-90)


  objects[10] = new GameObject();
	objects[10].model = models[3];
	objects[10].shader = shaders[1];
	objects[10].position = vec3(-2.125,0,0 );
	objects[10].father= objects[6];
  objects[10].rotation = vec3(0,0,90);

  objects[11] = new GameObject();
	objects[11].model = models[0];
	objects[11].shader = shaders[1];
	objects[11].position =  vec3(0, 1, -25.0 );
	objects[11].scale = vec3(6, 6, 6);

  objects[12] = new GameObject();
	objects[12].model = models[4];
	objects[12].shader = shaders[1];
	objects[12].position = vec3(-0.5, -1.5, 0 );
	objects[12].father= objects[11];
  objects[12].scale = vec3(0.125, 0.5, 0.125);

  objects[13] = new GameObject();
	objects[13].model = models[4];
	objects[13].shader = shaders[1];
	objects[13].position = vec3(0.5, -1.5, 0 );
	objects[13].father= objects[11];
  objects[13].scale = vec3(0.125, 0.5, 0.125);

  objects[14] = new GameObject();
	objects[14].model = models[4];
	objects[14].shader = shaders[1];
	objects[14].position = vec3(1.125, 0.5, 0 );
	objects[14].father= objects[11];
  objects[14].scale = vec3(0.125, 0.75, 0.125);
  objects[14].rotation = vec3(0,0,-30);
  
  objects[15] = new GameObject();
	objects[15].model = models[4];
	objects[15].shader = shaders[1];
	objects[15].position = vec3(-1.125, 0.5, 0 );
	objects[15].father= objects[11];
  objects[15].scale = vec3(0.125, 0.75, 0.125);
  objects[15].rotation = vec3(0,0,30);

  objects[16] = new GameObject();
	objects[16].model = models[4];
	objects[16].shader = shaders[1];
	objects[16].position = vec3(0, 1, 0 );
	objects[16].father= objects[11];
  objects[16].scale = vec3(0.125, 0.5,0.5);
  objects[16].rotation = vec3(0,0,90);

  objects[17] = new GameObject();
	objects[17].model = models[4];
	objects[17].shader = shaders[1];
	objects[17].position = vec3(0, 1.5, 0 );
	objects[17].father= objects[11];
  objects[17].scale = vec3(0.25, 0.5,0.25);
  
}

function initLights() {
  
  lights[0] = new Light(1); // directional
  lights[0].lightColor = vec4(0.8, 0.0, 0.0, 1.0);
  lights[0].lightDirection = vec3(-1.0, -1.0, -1.0);
  
  lights[1] = new Light(2); // point
  lights[1].position = vec3(-10.0, 0.0, 0.0);
  lights[1].lightColor = vec4(0.0, 0.8, 0.0, 1.0);

  lights[2] = new Light(0); // spot
  lights[2].position = vec3(-1.5, 0.0, 0.0);
  lights[2].lightColor = vec4(0.0, 0.0, 0.8, 0.0);
  lights[2].lightDirection = vec3(0.0,0.0,-1.0);
  lights[2].spotLimit = 30.0;

}

function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture.address);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTextures() {
  models[0].textureInfo.address = gl.createTexture();
  models[0].textureInfo.image = new Image();
  models[0].textureInfo.image.onload = function() {
    handleLoadedTexture(models[0].textureInfo)
  }

  models[0].textureInfo.image.src = "img/bill2.jpg";

  models[1].textureInfo.address = gl.createTexture();
  models[1].textureInfo.image = new Image();
  models[1].textureInfo.image.onload = function() {
    handleLoadedTexture(models[1].textureInfo)
  }

  models[1].textureInfo.image.src = "img/floor.png";

  models[2].textureInfo.address = gl.createTexture();
  models[2].textureInfo.image = new Image();
  models[2].textureInfo.image.onload = function() {
    handleLoadedTexture(models[2].textureInfo)
  }

  models[2].textureInfo.image.src = "img/moon.gif";

   models[3].textureInfo.address = gl.createTexture();
  models[3].textureInfo.image = new Image();
  models[3].textureInfo.image.onload = function() {
    handleLoadedTexture(models[3].textureInfo)
  }

  models[3].textureInfo.image.src = "img/floor.png";

  models[4].textureInfo.address = gl.createTexture();
  models[4].textureInfo.image = new Image();
  models[4].textureInfo.image.onload = function() {
    handleLoadedTexture(models[3].textureInfo)
  }

  models[4].textureInfo.image.src = "img/black.gif";


  
}

var r = 0;
var ll = true;
function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (var i = 0; i < objects.length; i++) {
    var model = objects[i].model;
    var shader = objects[i].shader;
    
    gl.useProgram( shader.program );
    if (shader.program.positionAttribute != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexInfo.buffer);
      gl.enableVertexAttribArray(shader.program.positionAttribute);
      gl.vertexAttribPointer(shader.program.positionAttribute, model.vertexInfo.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (shader.program.colorAttribute != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.colorInfo.buffer);
      gl.enableVertexAttribArray(shader.program.colorAttribute);
      gl.vertexAttribPointer(shader.program.colorAttribute, model.colorInfo.itemSize, gl.FLOAT, false, 0, 0);
    }
    if (shader.program.textureCoordAttribute != -1 && !wireframe) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.textureInfo.buffer);
      gl.enableVertexAttribArray(shader.program.textureCoordAttribute);
      gl.vertexAttribPointer(shader.program.textureCoordAttribute, model.textureInfo.itemSize, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, model.textureInfo.address);
      gl.uniform1i(shader.program.samplerUniform, 0);
    }
    if (shader.program.normalAttribute != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.normalInfo.buffer);
      gl.enableVertexAttribArray(shader.program.normalAttribute);
      gl.vertexAttribPointer(shader.program.normalAttribute, model.normalInfo.itemSize, gl.FLOAT, false, 0, 0)
    }

    // boolean to check lighting is used or not
    gl.uniform1i(shader.program.useLightingUniform, lighting);

    if (lighting) {
      gl.uniform1i(shader.program.numLightsUniform, lights.length);
      gl.uniform4fv(shader.program.ambientColorUniform, ambientColor);
      gl.uniform1f(shader.program.ambientWeightUniform, ambientWeight);
      for (var j = 0; j < lights.length; j++) {
        gl.uniform1i(shader.program.lightTypeUniform[j], lights[j].type);
        if (lights[j].type == 0) {
          // SPOTLIGHTS
          var limit = radians(lights[j].spotLimit);
          limit = Math.cos(limit);
          gl.uniform1f(shader.program.spotLimitUniform[j], limit);

          gl.uniform3fv(shader.program.lightPositionUniform[j], lights[j].position);
          gl.uniform4fv(shader.program.directionalColorUniform[j], lights[j].lightColor);
          gl.uniform1f(shader.program.specularPowerUniform[j], lights[j].specularPower);
          gl.uniform3fv(shader.program.lightingDirectionUniform[j], lights[j].lightDirection);
        }
        if (lights[j].type == 1) {  
          // lighting direction
          gl.uniform3fv(shader.program.lightingDirectionUniform[j], lights[j].lightDirection);
          gl.uniform4fv(shader.program.directionalColorUniform[j], lights[j].lightColor);

          // specular power
          gl.uniform1f(shader.program.specularPowerUniform[j], lights[j].specularPower);
        } if (lights[j].type == 2) {
          // light position
          gl.uniform3fv(shader.program.lightPositionUniform[j], lights[j].position);
          gl.uniform4fv(shader.program.directionalColorUniform[j], lights[j].lightColor);
          gl.uniform1f(shader.program.specularPowerUniform[j], lights[j].specularPower);
        }
      }
    }

    var worldMatrix = objects[i].getWorldMatrix();

    var mv = mult(camera.getViewMatrix(), worldMatrix);
    var proj = camera.projectionMatrix;
    var mvp = mult(proj, mv);

    //console.log("cam: " + camera.position);

    gl.uniformMatrix4fv(shader.program.worldMatrixUniform, false, flatten(mvp));
    gl.uniform3fv(shader.program.cameraPositionUniform, camera.position);
    gl.uniformMatrix4fv(shader.program.modelMatrixUniform, false, flatten(worldMatrix));

    //mvp = mult(mvp,rotate(r, [1,1,1]));
    
    //gl.uniformMatrix4fv(program.modelMatrixUniform, false, flatten(worldMatrix));
    var mode = 0;
    if (wireframe) mode = gl.LINE_LOOP;
    else mode = gl.TRIANGLES;

    if (objects[i].model.indexInfo.buffer == 0) {
      gl.drawArrays(mode, 0, model.vertexInfo.numItems);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexInfo.buffer);
      
      gl.drawElements(mode, model.indexInfo.numItems, gl.UNSIGNED_SHORT, 0);
    }

  }
    
}


var lastTime = 0;
var deltaTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        deltaTime = timeNow - lastTime;

        r += (90 * deltaTime) / 1000.0;
    }
    lastTime = timeNow;
    
    objects[0].rotation = vec3(0, r % 360, 0);
    objects[11].rotation = vec3(0, speed[0]*r % 360, 0);
    objects[2].rotation = vec3(0,  0,speed[2]*r % 360);
    objects[6].rotation = vec3(0,  0,speed[1]*r % 360);
    // circle light around object[1]
    var pos = lights[1].position;
    var cent = objects[1].position;
    var deg = 1 * (Math.PI / 180);
    var x = Math.cos(deg) * (pos[0] - cent[0]) - Math.sin(deg) * (pos[2] - cent[2]) + cent[0];
    var y = Math.sin(deg) * (pos[0] - cent[0]) + Math.cos(deg) * (pos[2] - cent[2]) + cent[2];
    lights[1].position = vec3(x, 0, y);
}

var currentlyPressedKeys = {};

// 
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;

    // one press
    if (String.fromCharCode(event.keyCode) == "F") {
      //do something
    }

    console.log(String.fromCharCode(event.keyCode));
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

//keys
var forward = 0;
var backward = 0
var left = 0;
var right = 0;
var rise = 0;
var low = 0
var lookleft = 0;
var lookright = 0;
var lookup = 0;
var lookdown = 0;
var rollforward = 0;
var rollbackward = 0;


// multi press
// https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
function handleKeys() {
    if (currentlyPressedKeys[87]) {
      // W
      forward = 1.0;
    } else if (!currentlyPressedKeys[87]) {
      forward = 0.0;
    }

    if (currentlyPressedKeys[65]) {
      // A
      left = 1.0;
    } else if (!currentlyPressedKeys[65]) {
      left = 0.0;
    }

    if (currentlyPressedKeys[83]) {
      // S
      backward = 1.0;
    } else if (!currentlyPressedKeys[83]) {
      backward = 0.0;
    }

    if (currentlyPressedKeys[68]) {
      // D
      right = 1.0;
    } else if (!currentlyPressedKeys[68]) {
      right = 0.0;
    }

    if (currentlyPressedKeys[69]) {
      // E
      rise = 1.0;
    }
    else if (!currentlyPressedKeys[69]) {
      rise = 0.0;
    }

    if (currentlyPressedKeys[81]) {
      // Q
      low = 1.0;
    } else if (!currentlyPressedKeys[81]) {
      low = 0.0;
    }

    if (currentlyPressedKeys[38]) {
      // VK_UP
      lookup = 1.0;
    } else if (!currentlyPressedKeys[38]) {
      lookup = 0.0;
    }

    if (currentlyPressedKeys[40]) {
      // VK_DOWN
      lookdown = 1.0;
    } else if (!currentlyPressedKeys[40]) {
      lookdown = 0.0;
    }

    if (currentlyPressedKeys[37]) {
      // VK_LEFT
      lookleft = 1.0;
    } else if (!currentlyPressedKeys[37]) {
      lookleft = 0.0;
    }
    
    if (currentlyPressedKeys[39]) {
      // VK_RIGHT
      lookright = 1.0;
    } else if (!currentlyPressedKeys[39]) {
      lookright = 0.0;
    }

    if (currentlyPressedKeys[90]) {
      // Z
      rollforward = 1.0;
    } else if (!currentlyPressedKeys[90]) {
      rollforward = 0.0;
    }

    if (currentlyPressedKeys[67]) {
      // C
      rollbackward = 1.0;
    } else if (!currentlyPressedKeys[67]) {
      rollbackward = 0.0;
    }
}

function movement() {
  var moveVector = scale(deltaTime/1000, vec3(right - left, rise - low, backward - forward));
  //console.log("mov:"+ moveVector);
  camera.moveCamera(moveVector);
  
  //console.log(camera.getViewMatrix());
  //console.log(camera.getWorldMatrix());
  var rotVector = scale(deltaTime/1000, vec3(lookup - lookdown, lookleft - lookright, rollbackward - rollforward));
  rotVector = vec4(rotVector, 1.0);
  camera.rotateCamera(rotVector);
  
}

function tick() {
  requestAnimFrame(tick);
  animate();


  draw();
  handleKeys();
  if (cameraOnBill){
    camera.father=objects[11];
  }else{
    camera.father=null;
  }
  movement();
  
}

window.onload = function init() {
  initCanvas();
  initLights();
  initShaderVariables();
  initBuffers();
  initObjects();
  initTextures();

  gl.clearColor(0.4, 0.4, 0.4, 1.0);
  gl.enable(gl.DEPTH_TEST);

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

   document.getElementById("tri").onchange = function(event) {
        speed[0] = event.target.value;
    };
    document.getElementById("shuriken").onchange = function(event) {
        speed[1] = event.target.value;
    };
    document.getElementById("needle").onchange = function(event) {
        speed[2] =  event.target.value;
    };

  tick();
}



  /**
   * Replace %(id)s in strings with values in objects(s)
   * https://stackoverflow.com/questions/33299796/webgl-variables-array-sizes-over-vertex-shader-calls
   *
   * Given a string like `"Hello %(name)s from $(user.country)s"`
   * and an object like `{name:"Joe",user:{country:"USA"}}` would
   * return `"Hello Joe from USA"`.
   *
   * @function
   * @param {string} str string to do replacements in
   * @param {Object|Object[]} params one or more objects.
   * @returns {string} string with replaced parts
   * @memberOf module:Strings
   */
  var replaceParams = (function() {
    var replaceParamsRE = /%\(([^\)]+)\)s/g;

    return function(str, params) {
      if (!params.length) {
        params = [params];
      }

      return str.replace(replaceParamsRE, function(match, key) {
        var keys = key.split('.');
        for (var ii = 0; ii < params.length; ++ii) {
          var obj = params[ii];
          for (var jj = 0; jj < keys.length; ++jj) {
            var part = keys[jj];
            obj = obj[part];
            if (obj === undefined) {
              break;
            }
          }
          if (obj !== undefined) {
            return obj;
          }
        }
        console.error("unknown key: " + key);
        return "%(" + key + ")s";
      });
    };
  }());