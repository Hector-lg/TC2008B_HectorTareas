/*
Hector Lugo Gabino
A01029811
 */

'use strict';

import * as twgl from 'twgl-base.js';
import { M3 } from './2d-libs.js';
import GUI from 'lil-gui';


const vsGLSL = `#version 300 es
in vec2 a_position;
in vec4 a_color;

uniform vec2 u_resolution;
uniform mat3 u_transforms;

out vec4 v_color;

void main() {
    // Multiply the matrix by the vector, adding 1 to the vector to make
    // it the correct size. Then keep only the two first components.
    vec2 position = (u_transforms * vec3(a_position, 1)).xy;

    // Convert the position from pixels to 0.0 - 1.0
    vec2 zeroToOne = position / u_resolution;

    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // Convert from 0->2 to -1->1 (clip space)
    vec2 clipSpace = zeroToTwo - 1.0;

    // Invert Y axis
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
    v_color = a_color;
}
`;

const fsGLSL = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = v_color;
}
`;



function createFace() {
    const positions = [];
    const colors = [];
    const indices = [];
    
    
    const faceRadius = 80;
    const faceSegments = 50;
    const faceCenter = { x: 0, y: 0 };
    
    
    const faceStartIndex = 0;
    positions.push(faceCenter.x, faceCenter.y);
    colors.push(1, 1, 0, 1);
    
    for (let i = 0; i <= faceSegments; i++) {
        const angle = (i / faceSegments) * Math.PI * 2;
        const x = faceCenter.x + Math.cos(angle) * faceRadius;
        const y = faceCenter.y + Math.sin(angle) * faceRadius;
        positions.push(x, y);
        colors.push(1, 1, 0, 1); 
    }
    
    // Indices para la cara
    for (let i = 1; i <= faceSegments; i++) {
        indices.push(0, i, i + 1);
    }
    
    // Ojo izquierdo
    const leftEyeRadius = 8;
    const leftEyeCenter = { x: -25, y: -20 };
    const leftEyeStartIndex = positions.length / 2;
    const eyeSegments = 20;
    
    positions.push(leftEyeCenter.x, leftEyeCenter.y);
    colors.push(0, 0, 0, 1); 
    
    for (let i = 0; i <= eyeSegments; i++) {
        const angle = (i / eyeSegments) * Math.PI * 2;
        const x = leftEyeCenter.x + Math.cos(angle) * leftEyeRadius;
        const y = leftEyeCenter.y + Math.sin(angle) * leftEyeRadius;
        positions.push(x, y);
        colors.push(0, 0, 0, 1); 
    }
    
    for (let i = 0; i < eyeSegments; i++) {
        indices.push(leftEyeStartIndex, leftEyeStartIndex + i + 1, leftEyeStartIndex + i + 2);
    }
    
    // Ojo derecho
    const rightEyeCenter = { x: 25, y: -20 };
    const rightEyeStartIndex = positions.length / 2;
    
    positions.push(rightEyeCenter.x, rightEyeCenter.y);
    colors.push(0, 0, 0, 1); 
    
    for (let i = 0; i <= eyeSegments; i++) {
        const angle = (i / eyeSegments) * Math.PI * 2;
        const x = rightEyeCenter.x + Math.cos(angle) * leftEyeRadius;
        const y = rightEyeCenter.y + Math.sin(angle) * leftEyeRadius;
        positions.push(x, y);
        colors.push(0, 0, 0, 1); 
    }
    
    for (let i = 0; i < eyeSegments; i++) {
        indices.push(rightEyeStartIndex, rightEyeStartIndex + i + 1, rightEyeStartIndex + i + 2);
    }
    
    
    const smileRadius = 45;
    const smileSegments = 30;
    const smileThickness = 5;
    const smileStartIndex = positions.length / 2;
    
    
    for (let i = 0; i <= smileSegments; i++) {
        const t = i / smileSegments;
        const angle = Math.PI * 0.2 + Math.PI * 0.6 * t;
        const x = Math.cos(angle) * smileRadius;
        const y = Math.sin(angle) * smileRadius + 10;
        positions.push(x, y);
        colors.push(0, 0, 0, 1); 
    }
    
    
    for (let i = 0; i <= smileSegments; i++) {
        const t = i / smileSegments;
        const angle = Math.PI * 0.2 + Math.PI * 0.6 * t;
        const x = Math.cos(angle) * (smileRadius - smileThickness);
        const y = Math.sin(angle) * (smileRadius - smileThickness) + 10;
        positions.push(x, y);
        colors.push(0, 0, 0, 1);
    }
    
    
    for (let i = 0; i < smileSegments; i++) {
        const base = smileStartIndex;
        indices.push(
            base + i, base + i + 1, base + smileSegments + 1 + i,
            base + i + 1, base + smileSegments + 2 + i, base + smileSegments + 1 + i
        );
    }
    
    return {
        a_position: {
            numComponents: 2,
            data: positions
        },
        a_color: {
            numComponents: 4,
            data: colors
        },
        indices: {
            numComponents: 3,
            data: indices
        }
    };
}


function createPivot() {
    const size = 10;
    const thickness = 2;
    
    const positions = [
        // linea vertica
        -thickness, -size,
        thickness, -size,
        thickness, size,
        -thickness, size,
        
        //linea horizontal
        -size, -thickness,
        size, -thickness,
        size, thickness,
        -size, thickness
    ];
    
    const colors = [
        // Vertical  (rojo)
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        
        //linea horizontal (rojo)
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1,
        1, 0, 0, 1
    ];
    
    const indices = [
         
        0, 1, 2,
        0, 2, 3,
        
    
        4, 5, 6,
        4, 6, 7
    ];
    
    return {
        a_position: {
            numComponents: 2,
            data: positions
        },
        a_color: {
            numComponents: 4,
            data: colors
        },
        indices: {
            numComponents: 3,
            data: indices
        }
    };
}




function main() {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2');

    const programInfo = twgl.createProgramInfo(gl, [vsGLSL, fsGLSL]);

    // Crear arreglos de la geometria
    const faceArrays = createFace();
    const pivotArrays = createPivot();

    
    const faceBufferInfo = twgl.createBufferInfoFromArrays(gl, faceArrays);
    const pivotBufferInfo = twgl.createBufferInfoFromArrays(gl, pivotArrays);

    
    const faceVAO = twgl.createVAOFromBufferInfo(gl, programInfo, faceBufferInfo);
    const pivotVAO = twgl.createVAOFromBufferInfo(gl, programInfo, pivotBufferInfo);

    // Parametros para las transformaciones
    const params = {
        // Posicion del pivote - independiente
        pivotX: 400,
        pivotY: 300,
        
        // Transformaciones de la cara - relativas al pivote
        faceTranslateX: 500,
        faceTranslateY: 350,
        faceRotation: 0,
        faceScaleX: 1.0,
        faceScaleY: 1.0
    };

    
    const gui = new GUI();
    
    const pivotFolder = gui.addFolder('Pivot Position (Independent)');
    pivotFolder.add(params, 'pivotX', 0, 800).name('Pivot X').onChange(() => render());
    pivotFolder.add(params, 'pivotY', 0, 600).name('Pivot Y').onChange(() => render());
    pivotFolder.open();
    
    const faceFolder = gui.addFolder('Face Transformations');
    faceFolder.add(params, 'faceTranslateX', 0, 800).name('World Position X').onChange(() => render());
    faceFolder.add(params, 'faceTranslateY', 0, 600).name('World Position Y').onChange(() => render());
    faceFolder.add(params, 'faceRotation', 0, 360).name('Rotation Around Pivot (deg)').onChange(() => render());
    faceFolder.add(params, 'faceScaleX', 0.1, 3.0).name('Scale X').onChange(() => render());
    faceFolder.add(params, 'faceScaleY', 0.1, 3.0).name('Scale Y').onChange(() => render());
    faceFolder.open();

    function render() {
        drawScene(gl, faceVAO, pivotVAO, programInfo, faceBufferInfo, pivotBufferInfo, params);
    }

    render();
}


function drawScene(gl, faceVAO, pivotVAO, programInfo, faceBufferInfo, pivotBufferInfo, params) {
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programInfo.program);

    // Dibujar el pivote - transformacion independiente
    let pivotTransform = M3.identity();
    pivotTransform = M3.multiply(M3.translation([params.pivotX, params.pivotY]), pivotTransform);

    let pivotUniforms = {
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_transforms: pivotTransform
    };

    twgl.setUniforms(programInfo, pivotUniforms);
    gl.bindVertexArray(pivotVAO);
    twgl.drawBufferInfo(gl, pivotBufferInfo);

    
    // 1. Calcular la posicion en el canvas de la cara basada en la posicion del pivote
    // 2. Rotar esa posicion alrededor del pivote
    // 3. Aplicar transformaciones locales (escala, rotacion sobre su propio centro)
    // 4. Trasladar a la posicion mundial final rotada
    
    const facePos = [params.faceTranslateX, params.faceTranslateY];
    const pivotPos = [params.pivotX, params.pivotY];
    const angle = params.faceRotation * Math.PI / 180;

    // Vector desde el pivote hasta la cara
    const vx = facePos[0] - pivotPos[0];
    const vy = facePos[1] - pivotPos[1];

    // Rotar el vector por el angulo
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const rx = vx * c - vy * s;
    const ry = vx * s + vy * c;

    // Nueva posicion en el canva, de la cara despues de rotar alrededor del pivote
    const faceWorldX = pivotPos[0] + rx;
    const faceWorldY = pivotPos[1] + ry;

    // Construir la matriz de transformacion para la cara
    let faceTransform = M3.identity();
    
    // Aplicar escala
    faceTransform = M3.multiply(M3.scale([params.faceScaleX, params.faceScaleY]), faceTransform);
    
    // Aplicar rotacion
    faceTransform = M3.multiply(M3.rotation(angle), faceTransform);
    
    
    faceTransform = M3.multiply(M3.translation([faceWorldX, faceWorldY]), faceTransform);

    let faceUniforms = {
        u_resolution: [gl.canvas.width, gl.canvas.height],
        u_transforms: faceTransform
    };

    twgl.setUniforms(programInfo, faceUniforms);
    gl.bindVertexArray(faceVAO);
    twgl.drawBufferInfo(gl, faceBufferInfo);
}

main();

