import assert from 'node:assert/strict';
import { planCity, inPolygon } from '../src/urbanPlan';
const outline: [
    number,
    number
][] = [[-1.55, -15.8], [-0.4, -15.2], [.9, -14.4], [2.1, -13.2], [2.7, -11.2], [2.4, -8.6], [2.9, -6.4], [2.5, -3.8], [3.1, -1.4], [2.6, 1.2], [2, 2.6], [2.4, 5.4], [1.8, 8.8], [1.2, 12.2], [.2, 15.4], [-1.1, 15.2], [-2.4, 13], [-3, 9.8], [-3.3, 6], [-3.5, 2], [-3.4, -2.2], [-3.2, -6.6], [-2.9, -10.4], [-2.4, -13.4]];
const icons = [{ x: -3.25, z: -15.35, w: 4.2, d: 1.6 }, { x: .95, z: -5.3, w: 1.9, d: 1.7 }, { x: 1.85, z: -2.4, w: 1.9, d: 1.9 }, { x: 1.95, z: -9.3, w: 1, d: 2.4 }, { x: -.15, z: -8.2, w: 1.5, d: 1.5 }, { x: -.95, z: -1.15, w: 2.2, d: .9 }, { x: -.85, z: 1.9, w: 1.8, d: 1.6 }, { x: 4.15, z: -12.6, w: 2, d: 1.6 }].map(b => ({ ...b, height: 0 }));
const p = planCity(icons, (x, z) => inPolygon(x, z, outline));
const seen = new Set<number>([0]), queue = [0];
while (queue.length) {
    for (const n of p.network.nodes[queue.shift()!].neighbors)
        if (!seen.has(n)) {
            seen.add(n);
            queue.push(n);
        }
}
assert.equal(seen.size, p.network.nodes.length, 'all road nodes reachable');
assert(p.parcels.length >= 60, 'sufficient coherent block parcels');
for (const icon of icons)
    assert(p.blocks.some(b => inPolygon(icon.x, icon.z, b.boundary)), 'each landmark belongs to a reserved or mixed block');
const cornersOf = (lot: { x: number; z: number; w: number; d: number; rot: number }) => {
    const c = Math.cos(lot.rot), s = Math.sin(lot.rot);
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => {
        const lx = sx * lot.w / 2, lz = sz * lot.d / 2;
        return [lot.x + lx * c + lz * s, lot.z - lx * s + lz * c] as [number, number];
    });
};
for (const lot of p.parcels) {
    const block = p.blocks.find(b => b.id === lot.blockId);
    // Parcels outside a closed face (a dead-end stub) still have to sit on the island.
    const boundary = block ? block.boundary : outline;
    for (const [x, z] of cornersOf(lot)) assert(inPolygon(x, z, boundary), 'parcel inside its block');
    for (const icon of icons)
        assert(!(Math.abs(lot.x - icon.x) < (lot.w + icon.w) / 2 && Math.abs(lot.z - icon.z) < (lot.d + icon.d) / 2));
}
for (let i = 0; i < p.parcels.length; i++)
    for (let j = i + 1; j < p.parcels.length; j++) {
        const a = p.parcels[i], b = p.parcels[j];
        const dx = a.x - b.x, dz = a.z - b.z, c = Math.cos(a.rot), s = Math.sin(a.rot);
        const lu = Math.abs(dx * c - dz * s), lv = Math.abs(dx * s + dz * c);
        assert(!(lu < (a.w + b.w) / 2 - .001 && lv < (a.d + b.d) / 2 - .001), 'parcels do not overlap');
    }
for (const e of p.network.edges) {
    const a = p.network.nodes[e.a], b = p.network.nodes[e.b];
    for (let i = 0; i <= 100; i++) {
        const t = i / 100, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
        for (const lot of [...icons, ...p.parcels]) {
            // Distance to the rotated footprint, in its own frame.
            const c = Math.cos((lot as { rot?: number }).rot ?? 0), s = Math.sin((lot as { rot?: number }).rot ?? 0);
            const dx2 = x - lot.x, dz2 = z - lot.z;
            const gx = Math.max(Math.abs(dx2 * c - dz2 * s) - lot.w / 2, 0), gz = Math.max(Math.abs(dx2 * s + dz2 * c) - lot.d / 2, 0);
            assert(Math.hypot(gx, gz) >= (e.width ?? .24) / 2 - 1e-9, 'road corridor clear of structures');
        }
    }
}
const cross = (a: number[], b: number[]) => a[0] * b[1] - a[1] * b[0];
for (let i = 0; i < p.network.edges.length; i++)
    for (let j = i + 1; j < p.network.edges.length; j++) {
        const e = p.network.edges[i], f = p.network.edges[j];
        if ([e.a, e.b].some(n => n === f.a || n === f.b))
            continue;
        const a = p.network.nodes[e.a], b = p.network.nodes[e.b], c = p.network.nodes[f.a], d = p.network.nodes[f.b], r = [b.x - a.x, b.z - a.z], s = [d.x - c.x, d.z - c.z], q = [c.x - a.x, c.z - a.z], den = cross(r, s);
        if (Math.abs(den) < 1e-7)
            continue;
        const t = cross(q, s) / den, u = cross(q, r) / den;
        assert(!(t > 1e-5 && t < 1 - 1e-5 && u > 1e-5 && u < 1 - 1e-5), 'every crossing is a declared graph node');
    }
console.log(JSON.stringify({ planning: 'pass', blocks: p.blocks.length, parcels: p.parcels.length, roads: p.network.edges.length, connectedNodes: seen.size }));
