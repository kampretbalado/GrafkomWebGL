var canvas, gl;
var camera;

function initCanvas() {  
  canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  camera = new Camera(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, 5);

}

var shaders = [];
shaders[0] = new Shader("vertex-shader", "fragment-shader");
shaders[1] = new Shader("texture-vertex-shader", "texture-fragment-shader");

function initShaderVariables() {
  
  for (var i in shaders ) {
    shaders[i].program = initShaders( gl, shaders[i].vertexShader, shaders[i].fragmentShader );

    gl.useProgram( shaders[i].program );

    // attributes
    shaders[i].program.positionAttribute = gl.getAttribLocation(shaders[i].program, "a_pos");
    
    shaders[i].program.colorAttribute = gl.getAttribLocation(shaders[i].program, "a_color");
    
    //program.uvAttribute = gl.getAttribLocation(program, "a_uv");
    //program.normalAttribute = gl.getAttribLocation(program, "a_norm");
    //program.binormalAttribute = gl.getAttribLocation(program, "a_binorm");
    //program.tangentAttribute = gl.getAttribLocation(program, "a_tgt");
    shaders[i].program.textureCoordAttribute = gl.getAttribLocation(shaders[i].program, "a_texCoord");
    
    //texturebuffer
    /*
    for (var i = 0; i < sizeof(textureUniform) / sizeof(GLuint); i++) {
      var texturePrefix = "u_texture_";
      var number = i;
      textureLocation = texturePrefix + number;
      program.textureUniform[i] = gl.getUniformLocation(program, textureLocation.c_str());
    }
    */
    //uniforms
    shaders[i].program.worldMatrixUniform = gl.getUniformLocation(shaders[i].program, "u_worldMatrix");
    //program.modelMatrixUniform = gl.getUniformLocation(program, "u_modelMatrix");
    shaders[i].program.samplerUniform = gl.getUniformLocation(shaders[i].program, "u_sampler");

    //program.ambientWeightUniform = gl.getUniformLocation(program, "u_ambientStrength");
    //program.ambientColorUniform = gl.getUniformLocation(program, "u_lightColor");
  }
}

var models = [];
models[0] = new Model();
models[1] = new Model();

function initModels() {
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
  models[0].colorInfo.itemSize = 4;
  models[0].numItems = 12;
  models[0] = models[0];

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
  for (var i in models[1].colors) {
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

  models[1].textureInfo.buffer = gl.createBuffer();
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

}

var objects = [];
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
      gl.bindBuffer(gl.ARRAY_BUFFER, models[i].textureInfo.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(models[i].textureCoordinate), gl.STATIC_DRAW);
    }
    
  }
}

function initObjects () {
  objects[0] = new GameObject();
  objects[0].model = models[0];
  objects[0].shader = shaders[0];
  objects[0].position = vec3(-1.5, 0, -10 );
  //objects[0].scale = vec3(2,1,1);
  objects[1] = new GameObject();
  objects[1].model = models[1];
  objects[1].shader = shaders[1];
  objects[1].position = vec3(1.5, 0, -10.0 );

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
  models[1].textureInfo.address = gl.createTexture();
  models[1].textureInfo.image = new Image();
  models[1].textureInfo.image.onload = function() {
    handleLoadedTexture(models[1].textureInfo)
  }

  models[1].textureInfo.image.src = "img/sad.png";
}

var r = 0;
function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (var i in objects) {
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
    if (shader.program.textureCoordAttribute != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.textureInfo.buffer);
      gl.enableVertexAttribArray(shader.program.textureCoordAttribute);
      gl.vertexAttribPointer(shader.program.textureCoordAttribute, model.textureInfo.itemSize, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, model.textureInfo.address);
      gl.uniform1i(shader.program.samplerUniform, 0);
    }

    var worldMatrix = objects[i].getWorldMatrix();
    //var worldMatrix = translate(0,0,-10);

    mvp = mult(camera.getViewMatrix(), worldMatrix);
    //mvp = mult(camera.projectionMatrix, worldMatrix);
    mvp = mult(camera.projectionMatrix, mvp);
    //mvp = mult(mvp,rotate(r, [1,1,1]));
    
    //gl.uniformMatrix4fv(program.modelMatrixUniform, false, flatten(worldMatrix));
    gl.uniformMatrix4fv(shader.program.worldMatrixUniform, false, flatten(mvp));
    
    if (objects[i].model.indexInfo.buffer == 0) {
      gl.drawArrays(gl.TRIANGLES, 0, model.vertexInfo.numItems);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexInfo.buffer);
      
      gl.drawElements(gl.TRIANGLES, model.indexInfo.numItems, gl.UNSIGNED_SHORT, 0);
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
  var rotVector = scale(deltaTime/1000, vec3(lookdown - lookup, lookright - lookleft, rollforward - rollbackward));
  rotVector = vec4(rotVector, 1.0);
  camera.rotateCamera(rotVector);
  
}

function tick() {
  requestAnimFrame(tick);
  animate();
  draw();
  handleKeys();
  movement();
  
}

window.onload = function init() {
  initCanvas();
  initShaderVariables();
  initBuffers();
  initObjects();
  initTextures();

  gl.clearColor(0.4, 0.4, 0.4, 1.0);
  gl.enable(gl.DEPTH_TEST);

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

  tick();
}