import type { Footprint, RoadNetwork } from './streets';
export type Point = [
    number,
    number
];
export type CityBlock = {
    id: number;
    boundary: Point[];
    neighborhood: string;
};
export type BuildingParcel = Footprint & {
    blockId: number;
    neighborhood: string;
    /** Building yaw in radians, aligned with the rotated street grid. */
    rot: number;
};
/** Green reserves that the road graph must route around, like the reserved landmark campuses. */
export const parkSites = [
    { x: -2.05, z: -7.5, w: 1.7, d: 5.3 },
    { x: -1.35, z: -13.1, w: 2.2, d: 2 },
    { x: -1.95, z: -2.2, w: 0.7, d: 0.6 },
];
export function inPolygon(x: number, z: number, p: Point[]) { let yes = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const a = p[i], b = p[j];
    if ((a[1] > z) != (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0])
        yes = !yes;
} return yes; }
export function segmentDistance(x: number, z: number, a: Point, b: Point) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz); }
/**
 * The downtown grid of San Francisco is rotated against true north, with Market Street
 * cutting across it at its own angle. Both sets of grid lines are clipped to the
 * peninsula outline, so the plan stays road-first: graph, blocks, then parcels.
 */
export function planCity(reserved: Footprint[], inside: (x: number, z: number) => boolean) {
    const obstacles = [...reserved, ...parkSites.map((p) => ({ ...p, height: 0 }))];
    const margin = .18;
    const blocked = (p: Point) => obstacles.some(b => Math.abs(p[0] - b.x) < b.w / 2 + margin - .001 && Math.abs(p[1] - b.z) < b.d / 2 + margin - .001);
    const clear = (a: Point, b: Point) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / .025); for (let i = 0; i <= n; i++) {
        const p: Point = [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n];
        if (blocked(p) || !inside(...p))
            return false;
    } return true; };
    const corners: Point[] = obstacles.flatMap(b => [-1, 1].flatMap(s => [-1, 1].map(t => [b.x + s * (b.w / 2 + margin + .008), b.z + t * (b.d / 2 + margin + .008)] as Point))).filter(p => !blocked(p) && inside(...p));
    const snap = (p: Point): Point => { if (!blocked(p) || !corners.length)
        return p; return corners.reduce((a, b) => Math.hypot(a[0] - p[0], a[1] - p[1]) < Math.hypot(b[0] - p[0], b[1] - p[1]) ? a : b); };
    const segments: {
        a: Point;
        b: Point;
        name: string;
        width: number;
    }[] = [];
    const route = (a: Point, b: Point, name: string, width: number) => { a = snap(a); b = snap(b); if (clear(a, b)) {
        segments.push({ a, b, name, width });
        return;
    } const points = [a, b, ...corners], dist = points.map(() => Infinity), prev = points.map(() => -1), done = new Set<number>(); dist[0] = 0; for (let k = 0; k < points.length; k++) {
        let u = -1;
        points.forEach((_, i) => { if (!done.has(i) && (u < 0 || dist[i] < dist[u]))
            u = i; });
        if (u < 0 || !isFinite(dist[u]))
            break;
        if (u === 1)
            break;
        done.add(u);
        for (let v = 0; v < points.length; v++) {
            const d = dist[u] + Math.hypot(points[v][0] - points[u][0], points[v][1] - points[u][1]);
            if (d < dist[v] && clear(points[u], points[v])) {
                dist[v] = d;
                prev[v] = u;
            }
        }
    } if (prev[1] < 0)
        return; let v = 1; while (prev[v] >= 0) {
        const u = prev[v];
        segments.push({ a: points[u], b: points[v], name, width });
        v = u;
    } };
    // Rotated grid: `u` runs along the avenues, `v` along the cross streets.
    const angle = -0.58, cos = Math.cos(angle), sin = Math.sin(angle);
    const world = (u: number, v: number): Point => [u * cos - v * sin, u * sin + v * cos];
    const runs = (fixed: number, alongU: boolean) => {
        const out: Point[][] = [];
        const point = (t: number): Point => alongU ? world(t, fixed) : world(fixed, t);
        let current: Point[] = [];
        const flush = () => {
            if (current.length > 1)
                out.push(current);
            current = [];
        };
        // Short chords only: a long line across the curved peninsula can leave the outline.
        for (let t = -26; t <= 26; t += .28) {
            const p = point(t);
            if (inside(...p))
                current.push(p);
            else
                flush();
        }
        flush();
        return out;
    };
    const streetNames = ['Filbert Street', 'Union Street', 'Green Street', 'Vallejo Street', 'Broadway', 'Pacific Avenue', 'Jackson Street', 'Washington Street', 'Clay Street', 'Sacramento Street', 'California Street', 'Pine Street', 'Bush Street', 'Sutter Street', 'Post Street', 'Geary Street', 'Turk Street', 'Eddy Street', 'Fulton Street'];
    const avenueNames = ['Van Ness Avenue', 'Franklin Street', 'Gough Street', 'Laguna Street', 'Buchanan Street', 'Webster Street', 'Fillmore Street', 'Steiner Street', 'Pierce Street', 'Scott Street', 'Divisadero Street'];
    // Cross streets, then avenues; each clipped to the longest inside runs.
    for (let i = 0, v = -18; v <= 18; v += 2.1, i++)
        for (const line of runs(v, true))
            for (let k = 1; k < line.length; k++)
                route(line[k - 1], line[k], streetNames[i % streetNames.length], .2);
    for (let i = 0, u = -12; u <= 12; u += 1.6, i++)
        for (const line of runs(u, false))
            for (let k = 1; k < line.length; k++)
                route(line[k - 1], line[k], avenueNames[i % avenueNames.length], .26);
    // Market Street: the diagonal that ignores the grid, from the Ferry Building to the Castro.
    const market: Point[] = [[2.28, -9.3], [1.1, -5.2], [-.1, -1.4], [-1.5, 2.9], [-2.85, 7.6]];
    for (let i = 1; i < market.length; i++)
        route(market[i - 1], market[i], 'Market Street', .3);
    // The Embarcadero follows the bay shoreline, past the Ferry Building and the piers.
    const embarcadero: Point[] = [[1.95, -13.4], [2.35, -10.6], [2.15, -7.2], [2.3, -4], [2.05, -.6], [2.15, 2.6], [1.5, 6.4]];
    for (let i = 1; i < embarcadero.length; i++)
        route(embarcadero[i - 1], embarcadero[i], 'The Embarcadero', .3);
    // Split every crossing and collinear endpoint so geometry and traffic share the same planar graph.
    const network: RoadNetwork = { nodes: [], edges: [], avenues: [], crossings: [] };
    const ids = new Map<string, number>();
    const node = (p: Point) => { const key = p.map(v => v.toFixed(4)).join(','); if (ids.has(key))
        return ids.get(key)!; const id = network.nodes.length; ids.set(key, id); network.nodes.push({ x: p[0], z: p[1], neighbors: [], signal: id % 2 }); return id; };
    const cross = (a: Point, b: Point) => a[0] * b[1] - a[1] * b[0];
    const used = new Set<string>();
    for (const s of segments) {
        const dx = s.b[0] - s.a[0], dz = s.b[1] - s.a[1], len2 = dx * dx + dz * dz;
        if (len2 < 1e-8)
            continue;
        const ts = [0, 1];
        for (const o of segments) {
            const q: Point = [o.a[0] - s.a[0], o.a[1] - s.a[1]], v: Point = [o.b[0] - o.a[0], o.b[1] - o.a[1]], r: Point = [dx, dz], den = cross(r, v);
            if (Math.abs(den) > 1e-8) {
                const t = cross(q, v) / den, u = cross(q, r) / den;
                if (t >= 0 && t <= 1 && u >= 0 && u <= 1)
                    ts.push(t);
            }
            else
                for (const p of [o.a, o.b])
                    if (segmentDistance(...p, s.a, s.b) < 1e-5) {
                        const t = ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dz) / len2;
                        if (t > 0 && t < 1)
                            ts.push(t);
                    }
        }
        ts.sort((a, b) => a - b);
        for (let i = 1; i < ts.length; i++) {
            if (ts[i] - ts[i - 1] < 1e-4)
                continue;
            const a = node([s.a[0] + dx * ts[i - 1], s.a[1] + dz * ts[i - 1]]), b = node([s.a[0] + dx * ts[i], s.a[1] + dz * ts[i]]), key = [a, b].sort((a, b) => a - b).join(',');
            if (used.has(key))
                continue;
            used.add(key);
            network.edges.push({ a, b, name: s.name, width: s.width });
            network.nodes[a].neighbors.push(b);
            network.nodes[b].neighbors.push(a);
        }
    }
    // Clipped grid lines can leave a detached stub; keep the largest connected component.
    {
        const adjacency: number[][] = network.nodes.map(() => []);
        network.edges.forEach((e) => { adjacency[e.a].push(e.b); adjacency[e.b].push(e.a); });
        const visitedAll = new Set<number>();
        let best: number[] = [];
        for (let start = 0; start < network.nodes.length; start++) {
            if (visitedAll.has(start))
                continue;
            const component = [start];
            visitedAll.add(start);
            for (let i = 0; i < component.length; i++)
                for (const next of adjacency[component[i]])
                    if (!visitedAll.has(next)) {
                        visitedAll.add(next);
                        component.push(next);
                    }
            if (component.length > best.length)
                best = component;
        }
        if (best.length < network.nodes.length) {
            const keep = new Set(best), remap = new Map<number, number>();
            best.forEach((id, i) => remap.set(id, i));
            network.nodes = best.map((id) => network.nodes[id]);
            network.edges = network.edges
                .filter((e) => keep.has(e.a) && keep.has(e.b))
                .map((e) => ({ ...e, a: remap.get(e.a)!, b: remap.get(e.b)! }));
            network.nodes.forEach((n) => (n.neighbors = []));
            network.edges.forEach((e) => {
                network.nodes[e.a].neighbors.push(e.b);
                network.nodes[e.b].neighbors.push(e.a);
            });
        }
    }
    const district = (z: number) => z < -10.5 ? 'Marina / Presidio' : z < -4.5 ? 'North Beach / Financial District' : z < .5 ? 'SoMa / Union Square' : z < 6 ? 'Mission / Hayes Valley' : 'Potrero Hill';
    const blocks: CityBlock[] = [], visited = new Set<string>();
    for (let a = 0; a < network.nodes.length; a++)
        for (const b of network.nodes[a].neighbors) {
            if (visited.has(`${a},${b}`))
                continue;
            const boundary: Point[] = [];
            let u = a, v = b;
            for (let k = 0; k < network.edges.length * 2; k++) {
                const key = `${u},${v}`;
                if (visited.has(key))
                    break;
                visited.add(key);
                const n = network.nodes[u];
                boundary.push([n.x, n.z]);
                const at = network.nodes[v], sorted = [...at.neighbors].sort((i, j) => Math.atan2(network.nodes[i].z - at.z, network.nodes[i].x - at.x) - Math.atan2(network.nodes[j].z - at.z, network.nodes[j].x - at.x)), next = sorted[(sorted.indexOf(u) - 1 + sorted.length) % sorted.length];
                u = v;
                v = next;
                if (u === a && v === b)
                    break;
            }
            const area = boundary.reduce((s, p, i) => { const q = boundary[(i + 1) % boundary.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
            if (area > .25) {
                const z = boundary.reduce((s, p) => s + p[1], 0) / boundary.length;
                blocks.push({ id: blocks.length, boundary, neighborhood: district(z) });
            }
        }
    // Street-aligned row parcels: sweep the peninsula in the rotated street frame and keep every
    // plot that stays inside the outline and clear of the road corridor and the reserved campuses.
    const parcels: BuildingParcel[] = [];
    const rot = angle, cr = Math.cos(rot), sr = Math.sin(rot);
    const bw = .32, bd = .3, pu = .38, pv = .36;
    for (let v = -20; v <= 20; v += pv)
        for (let u = -14; u <= 14; u += pu) {
            const x = u * cr + v * sr, z = -u * sr + v * cr;
            if (!inside(x, z))
                continue;
            const corners: Point[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz]) => {
                const lx = sx * bw / 2, lz = sz * bd / 2;
                return [x + lx * cr + lz * sr, z - lx * sr + lz * cr] as Point;
            });
            if (!corners.every(([px, pz]) => inside(px, pz)))
                continue;
            if (obstacles.some((b) => Math.abs(x - b.x) < (bw + b.w) / 2 + .04 && Math.abs(z - b.z) < (bd + b.d) / 2 + .04))
                continue;
            let blockedRoad = false;
            for (const e of network.edges) {
                const a = network.nodes[e.a], b = network.nodes[e.b], dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
                if (!len)
                    continue;
                const nu = Math.abs((-dz * cr - dx * sr) / len), nv = Math.abs((-dz * sr + dx * cr) / len);
                if (segmentDistance(x, z, [a.x, a.z], [b.x, b.z]) < (nu * bw + nv * bd) / 2 + (e.width ?? .24) / 2 + .01) {
                    blockedRoad = true;
                    break;
                }
            }
            if (blockedRoad)
                continue;
            // A parcel may sit in an area the graph never closed into a face (a dead-end stub);
            // it is still on land and clear of the road corridor, which is what matters.
            const block = blocks.find((b) => inPolygon(x, z, b.boundary));
            parcels.push({ x, z, w: bw, d: bd, rot, height: 0, blockId: block?.id ?? -1, neighborhood: district(z) });
        }
    // Reserved landmark campuses are explicit blocks even where a pedestrian edge
    // closes a superblock rather than a vehicle carriageway.
    for (const lot of reserved)
        if (!blocks.some(b => inPolygon(lot.x, lot.z, b.boundary))) {
            const w = lot.w / 2 + .04, d = lot.d / 2 + .04;
            blocks.push({ id: blocks.length, boundary: [[lot.x - w, lot.z - d], [lot.x + w, lot.z - d], [lot.x + w, lot.z + d], [lot.x - w, lot.z + d]], neighborhood: district(lot.z) });
        }
    return { network, blocks, parcels };
}
