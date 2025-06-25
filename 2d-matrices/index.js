"use strict";
import { createProgramFromFiles } from "./shader-loader.js";
import * as webglUtils from "./utils.js";

async function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  const program = await createProgramFromFiles(
    gl,
    "./vertex.glsl",
    "./fragment.glsl"
  );
  if (!program) {
    console.error("Failed to create shader program");
    return;
  }

  // look up where the vertex data needs to go.
  const positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer to put positions in
  const positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  const translation = [100, 150];
  const angleInRadians = 0;
  const scale = [1, 1];
  const color = [Math.random(), Math.random(), Math.random(), 1];

  drawScene();

  //   // Setup a ui.
  //   webglLessonsUI.setupSlider("#x", {
  //     value: translation[0],
  //     slide: updatePosition(0),
  //     max: gl.canvas.width,
  //   });
  //   webglLessonsUI.setupSlider("#y", {
  //     value: translation[1],
  //     slide: updatePosition(1),
  //     max: gl.canvas.height,
  //   });
  //   webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
  //   webglLessonsUI.setupSlider("#scaleX", {
  //     value: scale[0],
  //     slide: updateScale(0),
  //     min: -5,
  //     max: 5,
  //     step: 0.01,
  //     precision: 2,
  //   });
  //   webglLessonsUI.setupSlider("#scaleY", {
  //     value: scale[1],
  //     slide: updateScale(1),
  //     min: -5,
  //     max: 5,
  //     step: 0.01,
  //     precision: 2,
  //   });

  //   function updatePosition(index) {
  //     return function (event, ui) {
  //       translation[index] = ui.value;
  //       drawScene();
  //     };
  //   }

  //   function updateAngle(event, ui) {
  //     var angleInDegrees = 360 - ui.value;
  //     angleInRadians = (angleInDegrees * Math.PI) / 180;
  //     drawScene();
  //   }

  //   function updateScale(index) {
  //     return function (event, ui) {
  //       scale[index] = ui.value;
  //       drawScene();
  //     };
  //   }

  /**
   * 绘制场景
   */
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 将裁剪空间转换为像素空间
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清除画布
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 使用着色器程序
    gl.useProgram(program);

    // 启用属性
    gl.enableVertexAttribArray(positionLocation);

    // 绑定位置缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 告诉属性如何从位置缓冲区中获取数据
    const size = 2; // 每次迭代2个组件
    const type = gl.FLOAT; // 数据是32位浮点数
    const normalize = false; // 不归一化数据
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0; // 从缓冲区开始
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Compute the matrices
    var translationMatrix = m3.translation(translation[0], translation[1]);
    var rotationMatrix = m3.rotation(angleInRadians);
    var scaleMatrix = m3.scaling(scale[0], scale[1]);

    // Multiply the matrices.
    var matrix = m3.multiply(translationMatrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    offset = 0;
    const count = 18; // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
  }
}

/**
 * 矩阵运算
 */
const m3 = {
  translation: function (tx, ty) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  rotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [c, -s, 0, s, c, 0, 0, 0, 1];
  },

  scaling: function (sx, sy) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  multiply: function (a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

/**
 * 设置几何图形
 * @param {WebGLRenderingContext} gl
 */
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // left column
      0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150,

      // top rung
      30, 0, 100, 0, 30, 30, 30, 30, 100, 0, 100, 30,

      // middle rung
      30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
    ]),
    gl.STATIC_DRAW
  );
}

// 异步启动应用
(async () => {
  await main();
})().catch((error) => {
  console.error("Application startup failed:", error);
});
