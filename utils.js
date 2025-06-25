function getWebGLContext(canvas) {
  return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
}

function createShaderByScript(gl, type, source) {
  const shaderScript = document.querySelector(source).innerHTML;
  const shader = gl.createShader(type);
  gl.shaderSource(shader, shaderScript);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

function randomColor() {
  return {
    r: Math.random() * 255,
    g: Math.random() * 255,
    b: Math.random() * 255,
    a: 1.0,
  };
}
