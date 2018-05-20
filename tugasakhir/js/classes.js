
class GameObject {
  constructor() {
    this.worldMatrix = mat4();
    this.position = vec3(0,0,0);
    this.rotation = vec3(0,0,0);
    this.scale = vec3(1,1,1);
    this.isDirty = true;
    this.model = 0;
    this.shader = 0;
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

  getWorldMatrix() {
    if (this.isDirty) {
      var scaleMatrix = scalem(this._scale[0], this._scale[1], this._scale[2]);
      
      var rotX = rotateX(this._rotation[0]);
      var rotY = rotateY(this._rotation[1]);
      var rotZ = rotateZ(this._rotation[2]);

      var rotMatrix = mult(rotY, mult(rotX, rotZ));
      
      var transMatrix = translate(this._position[0], this._position[1], this._position[2]);
      
      var world = mult(rotMatrix, scaleMatrix);
      this._worldMatrix = mult(transMatrix, world);

      this.isDirty = false;
    }
    
    return this._worldMatrix;
  }
}


class Camera {
  constructor(fov, aspect, near, far) {
    this.viewMatrix = mat4();
    
    this.worldMatrix = mat4();
    
    this.projectionMatrix = perspective(fov, aspect, near, far);
    
    this.position = vec3(0,0,0);
    this.rotation = vec3(0,0,0);
    
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.isDirty = true;
    
    this.speed = 1.0;

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
  
    var invRotationX = rotateX(-this._rotation[0]);
    var invRotationY = rotateY(-this._rotation[1]);
    var invRotationZ = rotateZ(-this._rotation[2]);
  
    var invRotation = mult(invRotationZ, mult(invRotationX, invRotationY));
  
    this._viewMatrix = mult(invRotation, invTranslation);
  
    return this._viewMatrix;
  }
  
  applyWorldMatrix() {
         
    var rotX = rotateX(this._rotation[0]);
    var rotY = rotateY(this._rotation[1]);
    var rotZ = rotateZ(this._rotation[2]);

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
    var s = this.speed;
    var temp = scale(s , moveVector);
    
    temp = mult(this.getWorldMatrix(), temp);
    
    temp = vec3(temp);
    this._position = temp;
    this.isDirty = true;
  }

  rotateCamera(rotVector) {
    var rot = scale(this.speed*20, rotVector);
    this._rotation = add(vec3(rot), this._rotation);
    this.isDirty = true;
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
    
    this.vertices = [];
    this.indices = [];
    this.colors = [];
    this.textureCoordinate = [];
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
  constructor() {
    this.position = new vec4();
    this.ambient = new vec4();
    this.diffuse = new vec4();
    this.specular = new vec4();
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
    
    this.positionAttribute = 0;
    this.colorAttribute = 0;
    this.textureCoordAttribute = 0;

    this.worldMatrixUniform = 0;
    this.samplerUniform = 0;
  }
}