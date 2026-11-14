const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const spine=require(process.env.NODE_PATH+'/@esotericsoftware/spine-canvas');
const official=path.join(__dirname,'../Validated/official');
const model=path.join(__dirname,'PeizhengHairMotion');
const source=fs.readFileSync(path.join(official,'model.skel'));
const specs=JSON.parse(fs.readFileSync(path.join(__dirname,'bindings.json'),'utf8'));
const atlas=file=>new spine.TextureAtlas(fs.readFileSync(file,'utf8'));
const vInt=value=>{
  const bytes=[];
  while(value>=128){bytes.push((value&127)|128);value>>>=7;}
  return Buffer.from([...bytes,value]);
};
const floats=values=>{
  const buffer=Buffer.alloc(values.length*4);
  values.forEach((v,i)=>buffer.writeFloatBE(v,i*4));
  return buffer;
};
const data=new Uint8Array(source);
const input=new spine.BinaryInput(data);
input.readInt32();input.readInt32();input.readString();
for(let i=0;i<5;i++)input.readFloat();
if(input.readBoolean()){input.readFloat();input.readString();input.readString();}
const countPosition=input.index;
const count=input.readInt(true);
const stringsStart=input.index;
for(let i=0;i<count;i++)input.readString();
const names=Object.values(specs).map(s=>s.path);
const ids=new Map(names.map((n,i)=>[n,count+i+1]));
const patches=[{start:countPosition,end:input.index,bytes:Buffer.concat([
  vInt(count+names.length),source.subarray(stringsStart,input.index),
  ...names.flatMap(name=>{const text=Buffer.from(name,'utf8');return [vInt(text.length+1),text];})
])}];
const uv=[[0,0],[.5,0],[1,0],[1,.5],[1,1],[.5,1],[0,1],[0,.5],[.5,.5]];
const triangles=Buffer.from(Array.from({length:8},(_,i)=>[8,(i+1)%8,i]).flat());
class Rewrite extends spine.SkeletonBinary{
  readAttachment(input,data,skin,index,placeholder,nonessential){
    const start=input.index;
    const old=super.readAttachment(input,data,skin,index,placeholder,nonessential);
    const spec=specs[data.slots[index].name];
    if(!old||!spec||old.path!==spec.source)return old;
    const [l,t,r,b]=spec.bounds, width=(r-l)*4.15,height=(b-t)*4.15;
    const weighted=spec.chain.length>1;
    const influences=[];
    const coords=uv.flatMap(([u,v])=>{
      const x=(l+u*(r-l)-234)*4.15,y=619+(281-(t+v*(b-t)))*4.15;
      if(!weighted)return toLocal(spec.chain[0],x,y);
      // Fix the root to its first bone and progressively transfer the tip
      // to the existing second and third physical bones.
      const weights=v===0?[1,0,0]:v===.5?[.45,.55,0]:[.08,.23,.69];
      const active=spec.chain.map((bone,n)=>({bone,w:weights[n]})).filter(x=>x.w>0);
      influences.push(vInt(active.length));
      for(const {bone,w} of active){
        influences.push(vInt(bone.i),floats([...toLocal(bone,x,y),w]));
      }
      return [];
    });
    const vertices=weighted?Buffer.concat([vInt((influences.length+9)/2),...influences]):floats(coords);
    const suffix=nonessential?[vInt(0),floats([width,height])]:[];
    const bytes=Buffer.concat([
      Buffer.from([2|16|(weighted?128:0)]),vInt(ids.get(spec.path)),vInt(8),vInt(9),
      vertices,floats(uv.flat()),triangles,vInt(0),...suffix
    ]);
    patches.push({start,end:input.index,bytes});
    return old;
  }
}
function toLocal({m:[a,b,c,d,tx,ty]},x,y){
  const det=a*d-b*c,dx=x-tx,dy=y-ty;
  return [(dx*d-b*dy)/det,(a*dy-c*dx)/det];
}
const original=new Rewrite(new spine.AtlasAttachmentLoader(atlas(path.join(official,'model.atlas')))).readSkeletonData(data);
let at=0;
const out=[];
for(const e of patches){out.push(source.subarray(at,e.start),e.bytes);at=e.end;}
out.push(source.subarray(at));
const result=Buffer.concat(out);
const parsed=new spine.SkeletonBinary(new spine.AtlasAttachmentLoader(atlas(path.join(model,'PeizhengHairMotion.atlas.txt')))).readSkeletonData(new Uint8Array(result));
assert.equal(parsed.animations.length,original.animations.length);
const actual=parsed.skins.flatMap(s=>s.getAttachments()).filter(x=>x.attachment.path?.startsWith('Peizheng/'));
assert.equal(new Set(actual.map(x=>x.attachment.path)).size,names.length);
assert.equal(actual.length,patches.length-1);
for(const item of actual){
  const spec=specs[parsed.slots[item.slotIndex].name];
  assert.equal(!!item.attachment.bones,spec.chain.length>1);
}
fs.writeFileSync(path.join(model,'PeizhengHairMotion.skel.bytes'),result);
console.log({attachments:actual.length,uniqueArt:names.length,animations:parsed.animations.length});

