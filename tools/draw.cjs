const fs=require('node:fs'),path=require('node:path');
const {createCanvas,loadImage}=require(process.env.NODE_PATH+'/canvas');
const ink='#1a1416',red='#cf5359',navy='#383964',cream='#ffedcf';
const p=(d,f,s=ink,w=6)=>'<path d="'+d+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'"/>';
const e=(x,y,r,f,s=ink,w=4)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'" stroke="'+s+'" stroke-width="'+w+'"/>';
const flip=s=>'<g transform="translate(468 0) scale(-1 1)">'+s+'</g>';
const lside=p('M157 149 Q179 150 184 172 Q169 195 156 209 Q147 226 157 252 Q162 266 169 273 Q151 283 127 267 Q116 260 122 236 Q106 262 115 288 Q105 286 101 274 Q87 268 95 239 Q104 210 129 175Z',red)
 +p('M122 237 Q120 255 133 267','none',ink,5)
;
const temple=p('M132 239 Q125 251 127 272 Q128 286 136 297 Q142 308 155 313 Q169 317 179 305 Q168 302 162 292 Q156 281 157 272 Q149 275 141 267 Q134 257 132 239Z',red)
 +p('M136 280 Q138 294 148 304','none',ink,4);
const templeRight=p('M132 239 Q125 251 126 268 Q126 286 135 299 Q143 310 155 309 Q149 302 150 293 Q156 308 168 315 Q180 320 190 307 Q178 305 170 296 Q160 286 157 272 Q148 276 141 267 Q134 257 132 239Z',red);
const ltail=p('M138 274 Q151 286 144 303 L141 317 Q137 324 132 342 Q127 357 142 360 Q130 370 117 364 Q101 355 104 332 Q98 339 99 350 Q78 342 81 326 Q86 309 101 304 Q109 293 121 289 Q128 281 138 274Z ',red)
 +p('M126 297 Q114 284 102 287 Q95 288 101 304 Q104 315 110 314 L125 307 L112 326 L126 334 L136 313 L140 335 L154 330 L144 307 Q139 299 126 297Z',navy,ink,5)
 +p('M100 289 Q111 286 120 298 L118 302 L104 305Z M115 323 L128 306 L134 307 L125 330Z',cream,'none')+e(132,305,7,cream,ink,4);
const flower=(x,y)=>{const pts=[[0,-7],[7,-2],[4,6],[-4,6],[-7,-2]];return pts.map(([u,v])=>e(x+u,y+v,6.5,'#d6a6ea',ink,4)).join('')+pts.map(([u,v])=>e(x+u,y+v,5.8,'#d6a6ea','none',0)).join('')+e(x,y,3.4,'#ffdf78','none',0)};
const parts={
 bangs:{box:[103,120,369,242],svg:p('M125 200 Q133 175 159 153 Q195 130 233 134 Q285 127 319 151 Q336 176 342 209 Q332 225 313 220 Q293 216 284 203 Q276 192 268 160 Q274 196 256 223 Q247 237 228 231 Q221 229 222 211 Q215 237 207 228 Q198 217 198 196 Q196 176 202 159 Q194 181 181 196 Q173 207 154 217 Q141 220 137 204 Q135 193 129 194 L125 200Z',red)},
 side_R:{box:[85,146,191,296],svg:lside},
 side_L:{box:[277,146,383,296],svg:flip(lside)},
 temple_R:{box:[112,225,200,330],svg:templeRight},
 temple_L:{box:[281,231,350,322],svg:flip(temple)},
 tail_R:{box:[72,267,158,376],svg:ltail},
 tail_L:{box:[310,267,396,376],svg:flip(ltail)},
 hat:{box:[86,59,373,207],svg:p('M99 187 Q86 170 102 146 Q122 117 153 101 Q184 75 223 69 Q271 61 299 89 Q326 111 336 130 Q296 124 255 130 Q208 132 167 153 Q131 170 110 201Z',navy)
 +p('M107 171 Q154 131 205 119 Q257 107 324 115 L331 131 Q269 121 208 137 Q155 151 117 184Z',red,ink,5)
 +p('M112 176 Q165 136 213 127 Q266 114 327 123','none',cream,7)
 +p('M156 138 Q130 140 117 154 Q119 164 128 170 L148 159 L124 184 L145 194 Q151 194 163 156Z',red,ink,5)
 +p('M121 156 L148 145 M129 184 L150 164','none',cream,7)+e(162,139,16,cream,ink,5)
 +p('M277 131 L281 96 L323 102 L319 138Z','#e9a46d',ink,5)
 +p('M278 97 L303 73 L328 101Z',red,ink,6)+p('M279 99 L325 104 M274 132 L319 140','none',cream,5)
 +e(301,119,11,cream,ink,4)+p('M302 112 L301 120 L307 117','none',ink,2.6)
 +p('M343 140 Q353 125 366 128 Q366 141 350 148Z','#92a95d',ink,4)+flower(333,135)+flower(351,156)},
 skirt:{box:[166,376,302,434],svg:p('M190 385 Q211 378 234 383 Q260 378 278 385 L294 414 Q299 420 290 423 Q232 435 178 423 Q169 421 173 413Z',red)
 +p('M177 413 Q228 432 293 413','none',cream,4)
 +p('M203 393 L195 424 M223 391 L219 428 M245 391 L249 428 M267 393 L275 424','none',ink,3.7)},
 body:{box:[178,300,291,414],svg:'<g transform="translate(234 0) scale(.88 1) translate(-234 0)">'+p('M208 316 Q217 302 225 310 L234 316 L244 307 Q255 305 262 315 L274 327 Q278 330 273 342 L287 384 Q287 393 262 396 L258 398 L235 400 L214 400 L208 394 Q194 398 181 389 L191 350 L187 335 Q193 324 208 316Z',navy)
 +p('M207 314 Q211 305 221 307 L234 317 L247 307 Q257 305 261 314 L255 321 L213 321Z',cream,ink,4)
 +p('M211 323 L233 329 L257 323 L248 358 L259 391 L247 399 L234 392 L220 399 L208 391 L219 359Z',cream,ink,4)
 +p('M202 319 L219 329 L212 366 L191 335Z M266 319 L249 329 L256 366 L277 335Z',cream,ink,4)
 +p('M198 329 L212 354 M270 329 L256 354','none',red,4)
 +p('M227 326 Q214 318 204 322 Q203 334 210 341 Q217 341 225 336 L210 347 L220 356 L234 341 L248 356 L258 348 L243 336 Q252 343 260 340 Q267 331 264 322 Q253 317 241 326Z',red,ink,4)+e(234,328,7,red,ink,3)
 +[356,370,384].map(y=>e(234,y,4,'#efb65d',ink,2.5)).join('')+p('M185 376 L201 379 L201 386 L183 384Z M283 376 L267 379 L267 386 L285 384Z',cream,ink,3)+'</g>'}

};
(async()=>{
 const out=path.join(__dirname,'art');
 const bounds={};
 for(const [name,{box,svg}] of Object.entries(parts)){
  const [x,y,r,b]=box,w=r-x,h=b-y;
  const doc='<svg xmlns="http://www.w3.org/2000/svg" width="'+(w*3)+'" height="'+(h*3)+'" viewBox="'+[x,y,w,h].join(' ')+'"><g stroke-linejoin="round" stroke-linecap="round">'+svg+'</g></svg>';
  const c=createCanvas(w*3,h*3);
  c.getContext('2d').drawImage(await loadImage(Buffer.from(doc)),0,0);
  fs.writeFileSync(path.join(out,name+'.svg'),doc);
  fs.writeFileSync(path.join(out,name+'.png'),c.toBuffer());
  bounds[name]=box;
 }
 fs.writeFileSync(path.join(__dirname,'bounds.json'),JSON.stringify(bounds,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});

