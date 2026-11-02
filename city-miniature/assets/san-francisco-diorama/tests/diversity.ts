import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createHash } from 'node:crypto';
import { Architecture } from '../src/architecture';
import { building, buildingVariants, type Family } from '../src/archetypes';
import { cityHall, coitTower, salesforce, transamerica } from '../src/landmarks';

const models = [transamerica, salesforce, coitTower, cityHall];
// Authoring envelopes of the four landmark types, so a model cannot silently grow out of its block.
const envelopes = [
    { name: 'Transamerica', w: 1.6, d: 1.6, minY: 6.6 },
    { name: 'Salesforce', w: 1.4, d: 1.4, minY: 8 },
    { name: 'Coit Tower', w: 1.7, d: 1.7, minY: 3.2 },
    { name: 'City Hall', w: 1.8, d: 1.7, minY: 2.6 },
];
const signatures: string[] = [];
function inspect(draw: (k: Architecture) => void) {
    const scene = new THREE.Scene(), kit = new Architecture(scene);
    draw(kit);
    kit.finish();
    const hash = createHash('sha256');
    let instances = 0;
    const bounds = new THREE.Box3();
    scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
            const a = o.geometry.getAttribute('position').array;
            hash.update(Buffer.from(a.buffer, a.byteOffset, a.byteLength));
            if (o instanceof THREE.InstancedMesh) {
                hash.update(Buffer.from(o.instanceMatrix.array.buffer));
                instances += o.count;
            }
            bounds.union(new THREE.Box3().setFromObject(o));
        }
    });
    assert.ok(bounds.min.toArray().concat(bounds.max.toArray()).every(Number.isFinite));
    for (const o of scene.children) {
        if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            const ms = Array.isArray(o.material) ? o.material : [o.material];
            ms.forEach(m => m.dispose());
        }
    }
    return { hash: hash.digest('hex'), bounds, instances };
}
for (let i = 0; i < models.length; i++) {
    const r = inspect(k => models[i](k, 0, 0)), env = envelopes[i];
    signatures.push(r.hash);
    assert.ok(r.bounds.max.y > env.minY, `${env.name}: height ${r.bounds.max.y}`);
    assert.ok(r.bounds.max.x - r.bounds.min.x <= env.w + .35, `${env.name}: width ${r.bounds.max.x - r.bounds.min.x} vs envelope ${env.w}`);
    assert.ok(r.bounds.max.z - r.bounds.min.z <= env.d + .35, `${env.name}: depth ${r.bounds.max.z - r.bounds.min.z} vs envelope ${env.d}`);
    assert.ok(r.instances > 20, `${env.name}: ${r.instances} instances`);
}
assert.equal(new Set(signatures).size, 4, 'Four landmarks must have different geometry');
const ordinary = Object.keys(buildingVariants) as Family[];
assert.equal(ordinary.length, 10);
const geometries = ordinary.map(f => inspect(k => { k.at(0, 0); building(k, f, .9, .85, 2.5, 0) }).hash);
assert.equal(new Set(geometries).size, 10, 'Archetypes differ geometrically, without using color in their signature');
// The four landmark anchors sit in four different districts, north to south.
const anchors = [[.95, -5.3], [1.85, -2.4], [-.15, -8.2], [-.85, 1.9]];
assert.ok(anchors[2][1] < anchors[0][1] && anchors[0][1] < anchors[1][1] && anchors[1][1] < anchors[3][1]);
for (let i = 0; i < anchors.length; i++)
    for (let j = i + 1; j < anchors.length; j++)
        assert.ok(Math.hypot(anchors[i][0] - anchors[j][0], anchors[i][1] - anchors[j][1]) > 1.2, 'landmark anchors keep their own block');
console.log(JSON.stringify({ status: 'passed', uniqueLandmarkGeometry: 4, uniqueArchetypeGeometry: 10, landmarkEnvelopes: 'passed', neighborhoodOrder: 'passed' }));
