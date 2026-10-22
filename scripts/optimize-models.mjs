// Usage: put bus.glb, car.glb, motorcycle.glb in models-src/, then: npm i -D @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions sharp meshoptimizer && node scripts/optimize-models.mjs
// Output goes to public/models/: real-world size, base at y=0, front facing +Z, metallic reflections removed (Cesium has none), 4 car colours.
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { flatten, join, prune, dedup, weld, simplify, textureCompress, getBounds } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer'; import sharp from 'sharp'; import fs from 'node:fs';
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
// Real-world size (metres), ground at y=0, centred on x/z, front facing +Z (glTF front). Cesium maps glTF +Z to the vehicle heading.
const SPEC = { bus: { len: 10.5, rotY: 0, tex: 256 }, car: { len: 4.4, rotY: -90, tex: 512, simplify: 0.5, bodyMat: 'Murphy92_Bodymat' }, motorcycle: { len: 1.85, rotY: 0, tex: 512 } };
const VARIANTS = { car: { red: [.72, .07, .08], white: [.9, .9, .9], silver: [.52, .55, .6], blue: [.07, .15, .38] } };
async function build(name, variant, rgb) {
  const sp = SPEC[name], doc = await io.read(`models-src/${name}.glb`), root = doc.getRoot(), scene = root.listScenes()[0];
  root.listAnimations().forEach(a => a.dispose());
  for (const e of root.listExtensionsUsed()) if (['KHR_materials_clearcoat', 'KHR_materials_specular'].includes(e.extensionName)) e.dispose();
  for (const m of root.listMaterials()) {
    m.setMetallicFactor(.05).setRoughnessFactor(.7).setMetallicRoughnessTexture(null).setNormalTexture(null).setOcclusionTexture(null).setEmissiveTexture(null);
    if (m.getAlphaMode() === 'BLEND') {
      if (/Glass/i.test(m.getName())) { m.setAlphaMode('OPAQUE').setBaseColorTexture(null).setBaseColorFactor([.06, .08, .11, 1]); }   // transparent glass: cheap dark glass, no sorting problems
      else { m.setAlphaMode('MASK').setAlphaCutoff(.5); m.getBaseColorTexture()?.setName('keep-alpha'); }                                   // badges, number plates: cut-outs
    }
    if (sp.bodyMat && m.getName() === sp.bodyMat) m.setBaseColorFactor([...rgb, 1]);
  }
  const b0 = getBounds(scene), ext = [0, 1, 2].map(i => b0.max[i] - b0.min[i]), along = Math.abs(sp.rotY) === 90 ? ext[0] : ext[2], s = sp.len / along;
  const c = [(b0.min[0] + b0.max[0]) / 2, b0.min[1], (b0.min[2] + b0.max[2]) / 2], t = sp.rotY * Math.PI / 180, co = Math.cos(t), si = Math.sin(t);
  const R = [[co, 0, si], [0, 1, 0], [-si, 0, co]], tr = [0, 1, 2].map(i => -s * (R[i][0] * c[0] + R[i][1] * c[1] + R[i][2] * c[2]));
  const wrap = doc.createNode('normalise').setMatrix([R[0][0] * s, R[1][0] * s, R[2][0] * s, 0, R[0][1] * s, R[1][1] * s, R[2][1] * s, 0, R[0][2] * s, R[1][2] * s, R[2][2] * s, 0, tr[0], tr[1], tr[2], 1]);
  for (const ch of scene.listChildren()) { scene.removeChild(ch); wrap.addChild(ch); } scene.addChild(wrap);
  await doc.transform(flatten(), join({ keepMeshes: false, keepNamed: false }), weld());
  if (sp.simplify) await doc.transform(simplify({ simplifier: MeshoptSimplifier, ratio: sp.simplify, error: .002 }));
  await doc.transform(
    textureCompress({ encoder: sharp, targetFormat: 'jpeg', resize: [sp.tex, sp.tex], pattern: /^(?!keep-alpha)/, quality: 80 }),
    textureCompress({ encoder: sharp, resize: [128, 128], pattern: /^keep-alpha/ }), dedup(), prune());
  const out = `public/models/${variant ? name + '_' + variant : name}.glb`; await io.write(out, doc);
  const b = getBounds(doc.getRoot().listScenes()[0]), tris = root.listMeshes().reduce((a, m) => a + m.listPrimitives().reduce((x, p) => x + (p.getIndices()?.getCount() ?? 0) / 3, 0), 0);
  console.log(out.split('/').pop().padEnd(22), (fs.statSync(out).size / 1024).toFixed(0).padStart(5), 'KB', '| tris', tris, '| prims', root.listMeshes().reduce((a, m) => a + m.listPrimitives().length, 0), '| size m', [0, 1, 2].map(i => +(b.max[i] - b.min[i]).toFixed(2)).join(' x '), '| y0', +b.min[1].toFixed(3), '| centre x,z', +((b.min[0] + b.max[0]) / 2).toFixed(2), +((b.min[2] + b.max[2]) / 2).toFixed(2));
}
await build('bus'); await build('motorcycle');
for (const [v, rgb] of Object.entries(VARIANTS.car)) await build('car', v, rgb);
