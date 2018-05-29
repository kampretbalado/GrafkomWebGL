class GameObject {
  constructor() {
    this.worldMatrix = mat4();
    this.position = vec3(0,0,0);
    this.rotation = vec3(0,0,0);
    this.scale = vec3(1,1,1);
    this.isDirty = true;
    this.model = 0;
    this.shader = 0; // of Shader type
    this.angle = 0;
    this.axis = vec3(0,0,0);
	  this.father= null;
  }

  set position(pos) {
    this._position = pos;
    this.isDirty = true;
  }

  get position() {
    return this._position;
  }

  set rotation(rot) {
    this._rotation = rot;
    this.isDirty = true;
  }

  get rotation() {
    return this._rotation;
  }

  set scale(sc) {
    this._scale = sc;
    this.isDirty = true;
  }

  get scale() {
    return this._scale;
  }

  setTransform (pos, rot, sc) {
    this._position = pos;
    this._rotation = rot;
    this._scale = sc;
    this._isDirty = true;
  }

  rotateObj (angle, axis) {
    this.angle = angle;
    this._axis = axis;
    this._isDirty = true;
  }

	getWorldMatrix() {
		//f (this.isDirty) {
			var scaleMatrix = scalem(this._scale[0], this._scale[1], this._scale[2]);
			/*
			var rotX = rotateX(this._rotation[0]);
			var rotY = rotateY(this._rotation[1]);
			var rotZ = rotateZ(this._rotation[2]);

			var rotMatrix = mult(rotY, mult(rotX, rotZ));
			*/
			var rotX = rotate(this._rotation[0], vec3(1.0, 0.0, 0.0));
			var rotY = rotate(this._rotation[1], vec3(0.0, 1.0, 0.0));
			var rotZ = rotate(this._rotation[2], vec3(0.0, 0.0, 1.0));

			var rotMatrix = mult(rotY, mult(rotX, rotZ));

			var transMatrix = translate(this._position[0], this._position[1], this._position[2]);
			var world=mat4();
			if (this.father!=null){
				world= this.father.getWorldMatrix();
				world = mult(world,transMatrix);
				world = mult(world,rotMatrix);			
				world = mult(world,scaleMatrix);	
			}
			else{
				world = mult(world,transMatrix);
				world = mult(world,rotMatrix);
				world = mult(world,scaleMatrix);
			}
			this._worldMatrix=world;

			this.isDirty = false;
		//}

		return this._worldMatrix;
	}
}


class Camera {
  constructor(fov, aspect, near, far, speed) {
    this.viewMatrix = mat4();
    
    this.worldMatrix = mat4();
    
    this.projectionMatrix = perspective(fov, aspect, near, far);
    
    this.position = vec3(0,0,10);
    this.rotation = vec3(0,0,0);
    
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.isDirty = true;
    this.father=null;
    this.speed = speed;

    this.applyWorldMatrix();
    this.applyViewMatrix();
  }
  
  set position(pos){
    this._position = pos;
    this.isDirty = true;
  }

  get position() {
    return this._position;
  }

  set rotation(rot){
    this._rotation = rot;
    this.isDirty = true;
  }

  get rotation() {
    return this._rotation;
  }

  applyViewMatrix() {
  
    var invTranslation = translate(-this._position[0],-this._position[1],-this._position[2]);
  
    var invRotationX = rotate(-this._rotation[0], vec3(1.0, 0.0, 0.0));
    var invRotationY = rotate(-this._rotation[1], vec3(0.0, 1.0, 0.0));
    var invRotationZ = rotate(-this._rotation[2], vec3(0.0, 0.0, 1.0));
  
    var invRotation = mult(invRotationZ, mult(invRotationX, invRotationY));
  
    this._viewMatrix = mult(invRotation, invTranslation);
  
    return this._viewMatrix;
  }
  
  applyWorldMatrix() {
         
    var rotX = rotate(this._rotation[0], vec3(1.0, 0.0, 0.0));
    var rotY = rotate(this._rotation[1], vec3(0.0, 1.0, 0.0));
    var rotZ = rotate(this._rotation[2], vec3(0.0, 0.0, 1.0));

    var rotMatrix = mult(rotY, mult(rotX, rotZ));
    
    var transMatrix = translate(this._position[0], this._position[1], this._position[2]);
   
    this._worldMatrix = mult(transMatrix, rotMatrix);
    
    return this._worldMatrix;
  }

  getWorldMatrix() {
    if (this._isDirty) {
      this.applyViewMatrix();
      this.applyWorldMatrix();
    }
    this.isDirty = false;
    return this._worldMatrix;
  }

  getViewMatrix() {
    if (this.isDirty) {
      this.applyViewMatrix();
      this.applyWorldMatrix();
    }
    this.isDirty = false;
    return this._viewMatrix;
  }

  moveCamera(moveVector) {
    if (this.father==null){
      var s = this.speed;
      var temp = scale(s , moveVector);
      temp = vec4(temp, 1.0);
      
      temp = mult(this.getWorldMatrix(), temp);
      //temp = add(this._position, vec3(temp));
      
      temp = vec3(temp);
      this._position = temp;
      this.isDirty = true;
    }else{
      this._position = vec3(this.father.position[0],this.father.position[1],this.father.position[2]+3.75);
      this.isDirty = true;
    }
  }

  rotateCamera(rotVector) {
    if (this.father==null){
      var rot = scale(this.speed*20, rotVector);
      this._rotation = add(vec3(rot), this._rotation);
      this.isDirty = true;
    }else{
      this._rotation = vec3(this.father.rotation[0],this.father.rotation[1]+180,this.father.rotation[2]);
      this.isDirty = true;
    }
  }

}
class Model{
  constructor() {
    this.indexInfo = {
      buffer :0,
      itemSize : 0,
      numItems : 0
    };
    this.vertexInfo = {
      buffer : 0,
      itemSize : 0,
      numItems : 0
    };
    this.colorInfo = {
      buffer : 0,
      itemSize : 0,
      numItems : 0
    };
    this.textureInfo = {
      buffer : 0,
      itemSize : 0,
      numItems : 0,
      address : "",
      image : 0
    };
    this.normalInfo = {
      buffer : 0,
      itemSize : 0,
      numItems : 0
    }
    
    this.vertices = [];
    this.indices = [];
    this.colors = [];
    this.textureCoordinate = [];
    this.vertexNormal = [];
  }

  modelFromFile(path) {
    if (path != null) {
      return path;
    } else return false;
  }
}

class Vertex {
  constructor() {
    this.pos = new vec3();
    this.normal = new vec3();
    this.binormal = new vec3();
    this.tangent = new vec3();
    this.uv = new vec2();
  }
}

class Light {
  constructor(type) {
    this.position = new vec3(0.0, 0.0, 0.0);
    this.lightDirection = new vec3(1.0, 1.0, 1.0);
    this.lightColor = new vec4(0.8, 0.8, 0.8);
    this.specularPower = 5;
    this.spotLimit = 30.0; // in degrees
    
    // 0 = spot, 1 = directional, 2 = point
    this.type = type

  }
}

class Material {
  constructor() {
    this.ambient = new vec4();
    this.diffuse = new vec4();
    this.specular = new vec4();
    this.shininess = 0;
    this.ambient.color = new vec4();
    this.diffuse.color = new vec4();
    this.specular.color = new vec4();
  }
}

class Shader {
  constructor(vs, fs) {
    this.program = 0;

    this.vertexShader = vs;
    this.fragmentShader = fs;
  
  }
}