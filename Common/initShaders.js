//
//  initShaders.js
// MODIFIKASI UNTUK MENERIMA DOM, bukan ID dari shader agar 
// dapat dimodifikasi pada saat runtime
//

function initShaders( gl, vertexShaderDOM, fragmentShaderDOM )
{
    var vertShdr;
    var fragShdr;

    var vertElem = vertexShaderDOM; 
    if ( !vertElem ) { 
        alert( "Unable to load vertex shader " + vertexShaderDOM.id );
        //console.log(vertexShaderDOM);
        return -1;
    }
    else {
        vertShdr = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertShdr, vertElem.text );
        gl.compileShader( vertShdr );
        if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
            var msg = "Vertex shader failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var fragElem = fragmentShaderDOM;
    if ( !fragElem ) { 
        alert( "Unable to load vertex shader " + fragmentShaderDOM.id );
        //console.log(fragmentShaderDOM);
        return -1;
    }
    else {
        fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragShdr, fragElem.text );
        gl.compileShader( fragShdr );
        if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
            var msg = "Fragment shader failed to compile.  The error log is:"
        	+ "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
            alert( msg );
            return -1;
        }
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertShdr );
    gl.attachShader( program, fragShdr );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
        alert( msg );
        return -1;
    }

    return program;
}
