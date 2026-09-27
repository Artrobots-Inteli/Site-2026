import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';

// The supplied STLs are separate printing exports, not an assembly. These
// transforms reconstruct a visual presentation from the supplied GIF. They
// must not be used as fabrication or assembly instructions.
const input = process.argv[2];
const output = resolve(process.argv[3] || 'assets/artrobots-robot-kaian.glb');
if (!input) throw new Error('Usage: node deploy/convert-kaian-robot.mjs <STL folder> [output.glb]');
const SCALE = .019;
const parts = [
  { file: '01_base.stl', name: 'base', color: [.18,.09,.33,1], transform: ([x,y,z]) => [(y-67)*SCALE,z*SCALE,(x-99.5)*SCALE], reflect: false },
  { file: '02_carapaca_aranha.stl', name: 'shell', color: [.48,.22,.78,1], transform: ([x,y,z]) => [(y-66.6)*SCALE,(83.25-z)*SCALE,(x-99.5)*SCALE], reflect: true },
  { file: '08_pernas_direito.stl', name: 'legs-right', color: [.34,.14,.63,1], transform: ([x,y,z]) => [(z+54)*SCALE,y*SCALE,(x-115.4)*SCALE], reflect: true },
  { file: '08_pernas_esquerdo.stl', name: 'legs-left', color: [.34,.14,.63,1], transform: ([x,y,z]) => [-(z+54)*SCALE,(54.1055-y)*SCALE,(x-115.4)*SCALE], reflect: true }
];
const json = {asset:{version:'2.0',generator:'Artrobots STL visual adapter',copyright:'Kaian Moura / Artrobots',extras:{author:'Kaian Moura',purpose:'Visual reconstruction from separate printing exports and supplied GIF; animation is artistic, not hardware simulation.'}},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'Artrobots robot, Kaian Moura',children:[]}],meshes:[],materials:[],buffers:[{byteLength:0}],bufferViews:[],accessors:[]};
const chunks=[];let offset=0;const report=[];
function bufferView(array,target){const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength);const pad=Buffer.alloc((4-bytes.length%4)%4);const id=json.bufferViews.length;json.bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});chunks.push(bytes,pad);offset+=bytes.length+pad.length;return id;}
function accessor(array,type,componentType,target,min,max){const view=bufferView(array,target);const n=type==='VEC3'?3:1;const id=json.accessors.length;json.accessors.push({bufferView:view,componentType,count:array.length/n,type,...(min?{min,max}:{})});return id;}
for(const part of parts){
  const data=await readFile(resolve(input,part.file)), faces=data.readUInt32LE(80);
  if(data.length!==84+faces*50)throw new Error(`Invalid binary STL: ${part.file}`);
  const points=[],indices=[],map=new Map();const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<faces;i++){
    const ids=[];
    for(let j=0;j<3;j++){
      const p=part.transform([0,1,2].map(k=>data.readFloatLE(84+i*50+12+j*12+k*4))).map(v=>Math.round(v*50000)/50000);
      const key=p.join(',');let id=map.get(key);
      if(id===undefined){id=points.length/3;map.set(key,id);points.push(...p);for(let k=0;k<3;k++){min[k]=Math.min(min[k],p[k]);max[k]=Math.max(max[k],p[k]);}}
      ids.push(id);
    }
    // X,Y,Z -> Y,Z,X is a proper rotation; shell vertical reflection changes winding.
    indices.push(...(part.reflect?[ids[0],ids[2],ids[1]]:ids));
  }
  const normals=new Float32Array(points.length);
  for(let i=0;i<indices.length;i+=3){
    const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
    const ux=points[b]-points[a],uy=points[b+1]-points[a+1],uz=points[b+2]-points[a+2];
    const vx=points[c]-points[a],vy=points[c+1]-points[a+1],vz=points[c+2]-points[a+2];
    const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];
    for(const vertex of [a,b,c])for(let k=0;k<3;k++)normals[vertex+k]+=n[k];
  }
  for(let i=0;i<normals.length;i+=3){const length=Math.hypot(normals[i],normals[i+1],normals[i+2])||1;for(let k=0;k<3;k++)normals[i+k]=Math.round(normals[i+k]/length*10000)/10000;}
  const positions=new Float32Array(points),index=points.length/3>65535?new Uint32Array(indices):new Uint16Array(indices);
  const attributes={POSITION:accessor(positions,'VEC3',5126,34962,min,max),NORMAL:accessor(normals,'VEC3',5126,34962)};
  const indexAccessor=accessor(index,'SCALAR',index instanceof Uint32Array?5125:5123,34963);
  const mat=json.materials.length;json.materials.push({name:part.name,pbrMetallicRoughness:{baseColorFactor:part.color,metallicFactor:.35,roughnessFactor:.3}});
  const mesh=json.meshes.length;json.meshes.push({name:part.name,primitives:[{attributes,indices:indexAccessor,material:mat}]});
  const node=json.nodes.length;json.nodes.push({name:part.name,mesh});json.nodes[0].children.push(node);
  report.push({part:part.name,file:part.file,sha256:createHash('sha256').update(data).digest('hex'),triangles:faces,vertices:points.length/3,min,max});
}
json.asset.extras.sources=report.map(({file,sha256})=>({file,sha256}));
json.buffers[0].byteLength=offset;
const text=Buffer.from(JSON.stringify(json)),jsonPad=Buffer.alloc((4-text.length%4)%4,32),jsonChunk=Buffer.concat([text,jsonPad]);const binary=Buffer.concat(chunks);
const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jsonChunk.length+8+binary.length,8);
const jh=Buffer.alloc(8);jh.writeUInt32LE(jsonChunk.length,0);jh.writeUInt32LE(0x4e4f534a,4);
const bh=Buffer.alloc(8);bh.writeUInt32LE(binary.length,0);bh.writeUInt32LE(0x004e4942,4);
const glb=Buffer.concat([header,jh,jsonChunk,bh,binary]);await mkdir(dirname(output),{recursive:true});await writeFile(output,glb);
console.log(JSON.stringify({output,bytes:glb.length,gzipBytes:gzipSync(glb).length,triangles:report.reduce((s,p)=>s+p.triangles,0),parts:report},null,2));
