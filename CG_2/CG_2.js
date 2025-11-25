/*
    Hector Lugo Gabino A01029811
    14/24/2025
    TC2008B
*/

class V3 {
    static create(x, y, z) {
        const v = new Float32Array(3);
        v[0] = x;
        v[1] = y;
        v[2] = z;
        return v;
    }

    static subtract(u, v, dest) {
        dest = dest || new Float32Array(3);
        dest[0] = u[0] - v[0];
        dest[1] = u[1] - v[1];
        dest[2] = u[2] - v[2];
        return dest;
    }

    static normalize(v, dest) {
        dest = dest || new Float32Array(3);
        const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (mag === 0) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            return dest;
        }
        dest[0] = v[0] / mag;
        dest[1] = v[1] / mag;
        dest[2] = v[2] / mag;
        return dest;
    }

    static cross(u, v, dest) {
        dest = dest || new Float32Array(3);
        dest[0] = u[1] * v[2] - u[2] * v[1];
        dest[1] = u[2] * v[0] - u[0] * v[2];
        dest[2] = u[0] * v[1] - u[1] * v[0];
        return dest;
    }
}

const fs = require('fs');

const args = process.argv.slice(2);
const sides = parseInt(args[0]) || 8;
const height = parseFloat(args[1]) || 6.0;
const rBase = parseFloat(args[2]) || 1.0;
const rTop = parseFloat(args[3]) || 0.8;

if (sides < 3) { console.error("Minimo 3 lados."); process.exit(1); }

const objVertices = [];
const objNormals = [];
const objFaces = [];

function getPoint(index, totalSides, r, y) {
    const theta = (index / totalSides) * 2 * Math.PI;
    return V3.create(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

const verticesBase = [];
const verticesCima = [];

for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI;
    const x = Math.cos(theta);
    const z = Math.sin(theta);
    
    verticesBase.push(V3.create(x * rBase, 0, z * rBase));
    verticesCima.push(V3.create(x * rTop, height, z * rTop));
}

const normalesLaterales = [];
for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI;
    const x = Math.cos(theta);
    const z = Math.sin(theta);
    
    const tangente = V3.create(-z, 0, x);
    const vectorPendiente = V3.subtract(verticesCima[i], verticesBase[i]);
    const normalLateral = V3.cross(tangente, vectorPendiente);
    V3.normalize(normalLateral, normalLateral);
    
    normalesLaterales.push(normalLateral);
}

for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    
    const normalActual = normalesLaterales[i];
    const normalSiguiente = normalesLaterales[next];
    
    objVertices.push(verticesBase[i], verticesBase[next], verticesCima[next], verticesCima[i]);
    objNormals.push(normalActual, normalSiguiente, normalSiguiente, normalActual);

    const startIdx = objVertices.length - 3;
    objFaces.push([
        { v: startIdx, vn: startIdx },
        { v: startIdx + 1, vn: startIdx + 1 },
        { v: startIdx + 2, vn: startIdx + 2 }
    ]);

    objFaces.push([
        { v: startIdx, vn: startIdx },
        { v: startIdx + 2, vn: startIdx + 2 },
        { v: startIdx + 3, vn: startIdx + 3 }
    ]);
}

const normalTop = V3.create(0.0, 1.0, 0.0);
const centerTop = V3.create(0.0, height, 0.0);
const idxCenterTop = objVertices.length + 1;
objVertices.push(centerTop);
objNormals.push(normalTop);

for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    const pCurrent = getPoint(i, sides, rTop, height);
    const pNext = getPoint(next, sides, rTop, height);

    const idxCurr = objVertices.length + 1;
    objVertices.push(pCurrent);
    objNormals.push(normalTop);

    const idxNext = objVertices.length + 1;
    objVertices.push(pNext);
    objNormals.push(normalTop);

    objFaces.push([
        { v: idxCenterTop, vn: idxCenterTop },
        { v: idxNext, vn: idxNext },
        { v: idxCurr, vn: idxCurr }
    ]);
}

const normalBottom = V3.create(0.0, -1.0, 0.0);
const centerBottom = V3.create(0.0, 0.0, 0.0);
const idxCenterBottom = objVertices.length + 1;
objVertices.push(centerBottom);
objNormals.push(normalBottom);

for (let i = 0; i < sides; i++) {
    const next = (i + 1) % sides;
    const pCurrent = getPoint(i, sides, rBase, 0.0);
    const pNext = getPoint(next, sides, rBase, 0.0);

    const idxCurr = objVertices.length + 1;
    objVertices.push(pCurrent);
    objNormals.push(normalBottom);

    const idxNext = objVertices.length + 1;
    objVertices.push(pNext);
    objNormals.push(normalBottom);

    objFaces.push([
        { v: idxCenterBottom, vn: idxCenterBottom },
        { v: idxNext, vn: idxNext },
        { v: idxCurr, vn: idxCurr }
    ]);
}

const filename = `building_${sides}_${height}_${rBase}_${rTop}.obj`;
let content = `# OBJ File - Faceted Building\n`;
content += `# Specs: Sides=${sides}, H=${height}, RB=${rBase}, RT=${rTop}\n`;

content += `\n# Vertices\n`;
objVertices.forEach(v => {
    content += `v ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}\n`;
});

content += `\n# Normals\n`;
objNormals.forEach(n => {
    content += `vn ${n[0].toFixed(4)} ${n[1].toFixed(4)} ${n[2].toFixed(4)}\n`;
});

content += `\n# Faces\n`;
objFaces.forEach(f => {
    content += `f ${f[0].v}//${f[0].vn} ${f[1].v}//${f[1].vn} ${f[2].v}//${f[2].vn}\n`;
});

fs.writeFileSync(filename, content);
console.log(`Archivo generado: ${filename}`);