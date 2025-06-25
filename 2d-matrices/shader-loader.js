/**
 * 加载着色器文件
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function loadShader(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load shader: ${url}`);
  }
  return response.text();
}

/**
 * 从文件中创建着色器程序
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexShaderUrl
 * @param {string} fragmentShaderUrl
 * @returns {WebGLProgram}
 */
export async function createProgramFromFiles(
  gl,
  vertexShaderUrl,
  fragmentShaderUrl
) {
  try {
    const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
      loadShader(vertexShaderUrl),
      loadShader(fragmentShaderUrl),
    ]);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    const program = createProgram(gl, vertexShader, fragmentShader);
    return program;
  } catch (error) {
    console.error("Error loading shaders:", error);
    return null;
  }
}

/**
 * 创建着色器
 * @param {WebGLRenderingContext} gl
 * @param {WebGLRenderingContext['VERTEX_SHADER'] | WebGLRenderingContext['FRAGMENT_SHADER']} type
 * @param {string} source
 * @returns {WebGLShader}
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * 创建着色器程序
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 * @returns {WebGLProgram}
 */
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}
