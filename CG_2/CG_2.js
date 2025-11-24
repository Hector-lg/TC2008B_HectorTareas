/*
    Hector Lugo Gabino A01029811
    14/24/2025
    TC2008B
*/
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

function subtract(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function getPoint(index, totalSides, r, y) {
    const theta = (index / totalSides) * 2 * Math.PI;
    return { x: Math.cos(theta) * r, y: y, z: Math.sin(theta) * r };
}

// Caras laterales
for (let i = 0; i < sides; i++) {
    const current = i;
    const next = (i + 1) % sides;

    const pBL = getPoint(current, sides, rBase, 0.0);
    const pBR = getPoint(next, sides, rBase, 0.0);
    const pTL = getPoint(current, sides, rTop, height);
    const pTR = getPoint(next, sides, rTop, height);

    const vecU = subtract(pBR, pBL);
    const vecV = subtract(pTL, pBL);
    const normal = normalize(cross(vecU, vecV));

    const startIdx = objVertices.length + 1;
    objVertices.push(pBL, pBR, pTR, pTL);
    objNormals.push(normal, normal, normal, normal);

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

// Tapa superior
const normalTop = { x: 0.0, y: 1.0, z: 0.0 };
const centerTop = { x: 0.0, y: height, z: 0.0 };
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
        { v: idxCurr, vn: idxCurr },
        { v: idxNext, vn: idxNext }
    ]);
}

// Tapa inferior
const normalBottom = { x: 0.0, y: -1.0, z: 0.0 };
const centerBottom = { x: 0.0, y: 0.0, z: 0.0 };
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

// Escritura del archivo OBJ
const filename = `building_${sides}_${height}_${rBase}_${rTop}.obj`;
let content = `# OBJ File - Faceted Building\n`;
content += `# Specs: Sides=${sides}, H=${height}, RB=${rBase}, RT=${rTop}\n`;

content += `\n# Vertices\n`;
objVertices.forEach(v => {
    content += `v ${v.x.toFixed(4)} ${v.y.toFixed(4)} ${v.z.toFixed(4)}\n`;
});

content += `\n# Normals\n`;
objNormals.forEach(n => {
    content += `vn ${n.x.toFixed(4)} ${n.y.toFixed(4)} ${n.z.toFixed(4)}\n`;
});

content += `\n# Faces\n`;
objFaces.forEach(f => {
    content += `f ${f[0].v}//${f[0].vn} ${f[1].v}//${f[1].vn} ${f[2].v}//${f[2].vn}\n`;
});

fs.writeFileSync(filename, content);
console.log(`Archivo generado: ${filename}`);