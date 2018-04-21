"use strict";

var gl, program, canvas;

function initGL() {
  canvas = $("#gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if ( !gl ) { 
    alert( "WebGL isn't available" ); 
  }

  gl.viewport( 0, 0, canvas.width, canvas.height );

}

function initShaders() {
  program = initShaders( gl, "vertex-shader", "fragment-shader" );

  gl.useProgram( program );
}

$(document).ready(function( ) {
  initGL();
  initShaders();
  initBuffers();

  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
  gl.enable( gl.DEPTH_TEST );

  animate();
});