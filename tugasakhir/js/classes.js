
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
    this._isDirty = true;
  }

  set rotation(rot) {
    this._rotation = rot;
    this._isDirty = true;
  }

  set scale(sc) {
    this._scale = sc;
    this._isDirty = true;
  }

  setTransform (pos, rot, sc) {
    this._position = pos;
    this._rotation = rot;
    this._scale = sc;
    this._isDirty = true;
  }

  getWorldMatrix() {
    if (this._isDirty) {
      var scaleMatrix = scalem(this._scale[0], this._scale[1], this._scale[2]);
      
      var rotX = rotateX(this._rotation[0]);
      var rotY = rotateY(this._rotation[1]);
      var rotZ = rotateZ(this._rotation[2]);

      var rotMatrix = mult(mult(rotZ, rotX), rotY);
      
      var transMatrix = translate(this._position[0], this._position[1], this._position[2]);
      
      var world = mult(rotMatrix, scaleMatrix);
      this._worldMatrix = mult(world, transMatrix);

      this._isDirty = false;
    }
    
    return this._worldMatrix;
  }
}


class Camera {
  constructor(fov, aspect, near, far) {
    this.viewMatrix = mat4();
    this.position = vec3(0,0,0);
    this.rotation = vec3(0,0,0);
    this.projectionMatrix = perspective(fov, aspect, near, far);
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.isDirty = true;
  }

  getViewMatrix() {
    if (this._isDirty) {
      var invTranslation = translate(-this._position[0],-this._position[1],-this._position[2]);
      invTranslation = transpose(invTranslation);
    
      var invRotationX = rotateX(-this._rotation[0]);
      var invRotationY = rotateY(-this._rotation[1]);
      var invRotationZ = rotateZ(-this._rotation[2]);
    
      var invRotation = mult(mult(invRotationY, invRotationX), invRotationZ);
    
      this._viewMatrix = mult(invTranslation, invRotation);

      this._isDirty = false;
    }
    return this._viewMatrix;
  }

  set position(pos){
    this._position = pos;
    this._isDirty = true;
  }

  set rotation(rot){
    this._rotation = rot;
    this._isDirty = true;
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