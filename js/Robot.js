/**
    Program backend dari Robot.html
    Program ini dibuat untuk memenuhi tugas Worksheet 2 mata kuliah grafika komputer

    Dibuat oleh:
    Muhammad Azmi Malik Ariefa - 1406623184 - malik.ariefa@gmail.com
    Firas Atha Muhtadi - 1406579246 - vrasath@gmail.com
 */

"use strict";

var canvas, gl, program;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

var lightPosition = vec4(5.0, 5.0, 5.0, 0.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var viewerPos;

var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var snake = {
    render: renderSnake,
    length: 1.25,
    width: 0.5,
    pos: [0.0, 0.0, 0.0],
    rot: [0.0, 0.0, 0.0]
};

var robot = {
    render: renderRobot,
    base: {
        width: 5.0,
        height: 2.0
    },
    upperArm: {
        width: 0.5,
        height: 5.0
    },
    lowerArm: {
        height: 5.0,
        width: 0.5
    },
    pos: [0.0, 0.0, 0.0],
    rot: [0.0, 0.0, 0.0]
};


// Parameters controlling the size of the Robot's arm

var BASE_HEIGHT      = 2.0;
var BASE_WIDTH       = 5.0;
var LOWER_ARM_HEIGHT = 5.0;
var LOWER_ARM_WIDTH  = 0.5;
var UPPER_ARM_HEIGHT = 5.0;
var UPPER_ARM_WIDTH  = 0.5;

// Shader transformation matrices

var modelViewMatrix, projectionMatrix;

// Array of rotation angles (in degrees) for each rotation axis

var Base = 0;
var LowerArm = 1;
var UpperArm = 2;


var theta= [ 0, 0, 0];
var anim = 0;
var animSign=1;

var angle = 0;

var modelViewMatrixLoc;

var vBuffer, cBuffer;

//----------------------------------------------------------------------------

function quad(  a,  b,  c,  d ) {
    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    colorsArray.push(vertexColors[a]);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}


function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

// Remmove when scale in MV.js supports scale matrices

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}


//--------------------------------------------------


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    colorCube();

    // Load shaders and use the resulting shader program

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Create and initialize  buffer objects
    
    // normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // positions
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //colors
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // shades
    viewerPos = vec3(0.0, 0.0, -20.0 );

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);


    document.getElementById("snake1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("snake2").onchange = function(event) {
        theta[1] = event.target.value;
    };
    document.getElementById("snake3").onchange = function(event) {
        theta[2] =  event.target.value;
    };
    document.getElementById("robot1").onchange = function(event) {
        theta[0] = event.target.value;
    };
    document.getElementById("robot2").onchange = function(event) {
        theta[1] = event.target.value;
    };

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    display();
    
}

var display = function () {
    requestAnimFrame(display);
    var radios = document.getElementsByName('model');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked && radios[i].value == "robot") {
            // do whatever you want with the checked radio
            document.getElementById("robotParam").style.display = "block";
            document.getElementById("snakeParam").style.display = "none";
            renderRobot();
            
            // only one radio can be logically checked, don't check the rest
            break;
        } else if (radios[i].checked && radios[i].value == "snake") {
            document.getElementById("robotParam").style.display = "none";
            document.getElementById("snakeParam").style.display = "block";
            renderSnake();
            break;
        }
    }
}

//ROBOT FUNCTIONS--------------------------------------------------------------

function base() {
    var s = scale4(robot.base.width, robot.base.height, robot.base.width);
    var instanceMatrix = mult( translate( 0.0, 0.5 * robot.base.height, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

function upperArm() {
    var s = scale4(robot.upperArm.width, robot.upperArm.height, robot.upperArm.width);
    var instanceMatrix = mult(translate( 0.0, 0.5 * robot.upperArm.height, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//SNAKE FUNCTIONS------------------------------------------------------------------

function snakeBody() {
    var s = scale4(snake.width, snake.length, snake.width);
    var instanceMatrix = mult(translate( 0.0, 0.5 * snake.length, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//LIGHTBOX--------------------------------------------------------------------------

function lightBox() {
    var s = scale4(1.0, 1.0, 1.0);
    var instanceMatrix = mult( translate( 1.0, 1.0, 1.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------------

var renderRobot = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
        
    modelViewMatrix = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
    lightBox();

    var threshold = 45;

    anim=anim+animSign;
    if (anim>threshold){
        animSign=-1;
    }else if (anim<-threshold){
        animSign=1;
    }
    var wiggle = anim ;

    var baseViewMatrix= rotate(theta[0], 0, 1, 0 );
    var x=Number(theta[1]) + wiggle;
    modelViewMatrix = rotate(theta[0], 0, 1, 0 );
    base();
    //right front
    modelViewMatrix  = mult(baseViewMatrix, translate(robot.base.width/2, robot.base.height/2, robot.base.width/4));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x-90, 0, 0, 1) );
    upperArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0 ,robot.upperArm.height, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x-90, 0, 0, 1) );
    upperArm();

    //right back
    modelViewMatrix  = mult(baseViewMatrix, translate(robot.base.width/2, robot.base.height/2,-robot.base.width/4));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x-90, 0, 0, 1) );
    upperArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0 , robot.upperArm.height, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x-90, 0, 0, 1) );
    upperArm();

    //left front
    modelViewMatrix  = mult(baseViewMatrix, translate(-robot.base.width/2, robot.base.height/2, robot.base.width/4));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x+90, 0, 0, 1) );
    upperArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0 , robot.upperArm.height, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x+90, 0, 0, 1) );
    upperArm();

    //left back
    modelViewMatrix  = mult(baseViewMatrix, translate(-robot.base.width/2, robot.base.height/2,-robot.base.width/4));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x+90, 0, 0, 1) );
    upperArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0 , robot.upperArm.height, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x+90, 0, 0, 1) );
    upperArm();
}

var turnflag = false;
var renderSnake = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    modelViewMatrix = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
    lightBox();

    var threshold = 45;

    anim=anim+animSign;
    if (anim>threshold){
        animSign=-1;
    }else if (anim<-threshold){
        animSign=1;
    }
    var wiggle = anim ;
    //var wiggle =(anim % threshold*2) * Math.pow(-1,Math.floor(anim/threshold*2)) + threshold*2 * (Math.floor(anim/threshold*2)%2);
    //console.log(Math.pow(-1,Math.floor(anim/threshold*2)));
    var x=Number(theta[1]) + wiggle;
    //console.log(x);
    modelViewMatrix = rotate(theta[0], 0, 1, 0 );
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[2], 1, 0, 0) );
    modelViewMatrix  = mult(modelViewMatrix, rotate(x, 0, 0, 1) );
    snakeBody();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, snake.length, 0.0));
    snakeBody();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x, 0, 0, 1) );
    snakeBody();

    //pos
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x, 0, 0, 1) );
    snakeBody();
    
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0,  snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate( x, 0, 0, 1) );
    snakeBody();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-x, 0, 0, 1) );
    snakeBody();

    // //neg
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(-x, 0, 0, 1) );
    snakeBody();
    
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0,  snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x, 0, 0, 1) );
    snakeBody();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, snake.length, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(x, 0, 0, 1) );
    snakeBody();

}
