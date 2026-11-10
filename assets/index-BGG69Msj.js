const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./arena-_jxDRWRo.js","./helpers-9VAWV_FG.js","./practice-DJ3ha5D_.js","./hub-pJscrpLP.js","./nightclub-DG0tSEBx.js","./docks-CAcpTRDL.js","./rooftop-C7fLbxMG.js"])))=>i.map(i=>d[i]);
(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`attached`,t=1e3,n=1001,r=1002,i=1003,a=1004,o=1005,s=1006,c=1007,l=1008,u=1009,d=1010,f=1011,p=1012,m=1013,h=1014,g=1015,_=1016,v=1017,y=1018,b=1020,x=35902,S=35899,C=1021,w=1022,T=1023,E=1026,D=1027,O=1028,k=1029,A=1030,ee=1031,te=1033,ne=33776,j=33777,re=33778,M=33779,ie=35840,ae=35841,oe=35842,se=35843,ce=36196,le=37492,ue=37496,N=37488,de=37489,fe=37490,pe=37491,me=37808,he=37809,ge=37810,_e=37811,ve=37812,ye=37813,be=37814,xe=37815,Se=37816,Ce=37817,we=37818,Te=37819,Ee=37820,De=37821,Oe=36492,ke=36494,Ae=36495,je=36283,Me=36284,Ne=36285,Pe=36286,Fe=2300,P=2301,Ie=2302,Le=2303,Re=2400,F=2401,ze=2402,I=3200,Be=`srgb`,L=`srgb-linear`,Ve=`linear`,He=`srgb`,Ue=7680,We=35044,Ge=35048,Ke=2e3;function qe(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Je(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Ye(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Xe(){let e=Ye(`canvas`);return e.style.display=`block`,e}var Ze={};function Qe(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function $e(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function R(...e){e=$e(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function z(...e){e=$e(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function et(...e){let t=e.join(` `);t in Ze||(Ze[t]=!0,R(...e))}function tt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var nt={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3},rt=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},it=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),at=Math.PI/180,ot=180/Math.PI;function st(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(it[e&255]+it[e>>8&255]+it[e>>16&255]+it[e>>24&255]+`-`+it[t&255]+it[t>>8&255]+`-`+it[t>>16&15|64]+it[t>>24&255]+`-`+it[n&63|128]+it[n>>8&255]+`-`+it[n>>16&255]+it[n>>24&255]+it[r&255]+it[r>>8&255]+it[r>>16&255]+it[r>>24&255]).toLowerCase()}function B(e,t,n){return Math.max(t,Math.min(n,e))}function ct(e,t){return(e%t+t)%t}function lt(e,t,n){return(1-n)*e+n*t}function ut(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function dt(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function ft(e,t){if(t.constructor===Float32Array)return e;let n=dt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function pt(e,t){if(t.constructor===Float32Array)return e;let n=dt(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}var V=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=B(this.x,e.x,t.x),this.y=B(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=B(this.x,e,t),this.y=B(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(B(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(B(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},mt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:R(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(B(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},H=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(gt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(gt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=B(this.x,e.x,t.x),this.y=B(this.y,e.y,t.y),this.z=B(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=B(this.x,e,t),this.y=B(this.y,e,t),this.z=B(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(B(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ht.copy(this).projectOnVector(e),this.sub(ht)}reflect(e){return this.sub(ht.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(B(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ht=new H,gt=new mt,U=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return et(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(_t.makeScale(e,t)),this}rotate(e){return et(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(_t.makeRotation(-e)),this}translate(e,t){return et(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(_t.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},_t=new U,vt=new U().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),yt=new U().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function bt(){let e={enabled:!0,workingColorSpace:L,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=xt(e.r),e.g=xt(e.g),e.b=xt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=St(e.r),e.g=St(e.g),e.b=St(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Ve:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[L]:{primaries:t,whitePoint:r,transfer:Ve,toXYZ:vt,fromXYZ:yt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Be},outputColorSpaceConfig:{drawingBufferColorSpace:Be}},[Be]:{primaries:t,whitePoint:r,transfer:He,toXYZ:vt,fromXYZ:yt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Be}}}),e}var W=bt();function xt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function St(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Ct,wt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ct===void 0&&(Ct=Ye(`canvas`)),Ct.width=e.width,Ct.height=e.height;let t=Ct.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Ct}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ye(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=xt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(xt(t[e]/255)*255):t[e]=xt(t[e]);return{data:t,width:e.width,height:e.height}}return R(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Tt=0,Et=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Tt++}),this.uuid=st(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Dt(r[t].image)):e.push(Dt(r[t]))}else e=Dt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Dt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?wt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(R(`Texture: Unable to serialize Texture.`),{})}var Ot=0,kt=new H,At=class e extends rt{constructor(t=e.DEFAULT_IMAGE,r=e.DEFAULT_MAPPING,i=n,a=n,o=s,c=l,d=T,f=u,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ot++}),this.uuid=st(),this.name=``,this.source=new Et(t),this.mipmaps=[],this.mapping=r,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=o,this.minFilter=c,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new V(0,0),this.repeat=new V(1,1),this.center=new V(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new U,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(kt).x}get height(){return this.source.getSize(kt).y}get depth(){return this.source.getSize(kt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){R(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?R(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case t:e.x-=Math.floor(e.x);break;case n:e.x=e.x<0?0:1;break;case r:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case t:e.y-=Math.floor(e.y);break;case n:e.y=e.y<0?0:1;break;case r:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};At.DEFAULT_IMAGE=null,At.DEFAULT_MAPPING=300,At.DEFAULT_ANISOTROPY=1;var jt=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=B(this.x,e.x,t.x),this.y=B(this.y,e.y,t.y),this.z=B(this.z,e.z,t.z),this.w=B(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=B(this.x,e,t),this.y=B(this.y,e,t),this.z=B(this.z,e,t),this.w=B(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(B(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Mt=class extends rt{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:s,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new jt(0,0,e,t),this.scissorTest=!1,this.viewport=new jt(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new At({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:s,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Et(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Nt=class extends Mt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Pt=class extends At{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Ft=class extends At{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},G=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/It.setFromMatrixColumn(e,0).length(),i=1/It.setFromMatrixColumn(e,1).length(),a=1/It.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Rt,e,zt)}lookAt(e,t,n){let r=this.elements;return Ht.subVectors(e,t),Ht.lengthSq()===0&&(Ht.z=1),Ht.normalize(),Bt.crossVectors(n,Ht),Bt.lengthSq()===0&&(Math.abs(n.z)===1?Ht.x+=1e-4:Ht.z+=1e-4,Ht.normalize(),Bt.crossVectors(n,Ht)),Bt.normalize(),Vt.crossVectors(Ht,Bt),r[0]=Bt.x,r[4]=Vt.x,r[8]=Ht.x,r[1]=Bt.y,r[5]=Vt.y,r[9]=Ht.y,r[2]=Bt.z,r[6]=Vt.z,r[10]=Ht.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],te=r[14],ne=r[3],j=r[7],re=r[11],M=r[15];return i[0]=a*x+o*T+s*k+c*ne,i[4]=a*S+o*E+s*A+c*j,i[8]=a*C+o*D+s*ee+c*re,i[12]=a*w+o*O+s*te+c*M,i[1]=l*x+u*T+d*k+f*ne,i[5]=l*S+u*E+d*A+f*j,i[9]=l*C+u*D+d*ee+f*re,i[13]=l*w+u*O+d*te+f*M,i[2]=p*x+m*T+h*k+g*ne,i[6]=p*S+m*E+h*A+g*j,i[10]=p*C+m*D+h*ee+g*re,i[14]=p*w+m*O+h*te+g*M,i[3]=_*x+v*T+y*k+b*ne,i[7]=_*S+v*E+y*A+b*j,i[11]=_*C+v*D+y*ee+b*re,i[15]=_*w+v*O+y*te+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=It.set(r[0],r[1],r[2]).length(),o=It.set(r[4],r[5],r[6]).length(),s=It.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Lt.copy(this);let c=1/a,l=1/o,u=1/s;return Lt.elements[0]*=c,Lt.elements[1]*=c,Lt.elements[2]*=c,Lt.elements[4]*=l,Lt.elements[5]*=l,Lt.elements[6]*=l,Lt.elements[8]*=u,Lt.elements[9]*=u,Lt.elements[10]*=u,t.setFromRotationMatrix(Lt),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Ke,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Ke,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},It=new H,Lt=new G,Rt=new H(0,0,0),zt=new H(1,1,1),Bt=new H,Vt=new H,Ht=new H,Ut=new G,Wt=new mt,Gt=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(B(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-B(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(B(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-B(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(B(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-B(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:R(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ut.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ut,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Wt.setFromEuler(this),this.setFromQuaternion(Wt,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Gt.DEFAULT_ORDER=`XYZ`;var Kt=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},qt=0,Jt=new H,Yt=new mt,Xt=new G,Zt=new H,Qt=new H,$t=new H,en=new mt,tn=new H(1,0,0),nn=new H(0,1,0),rn=new H(0,0,1),an={type:`added`},on={type:`removed`},sn={type:`childadded`,child:null},cn={type:`childremoved`,child:null},ln=class e extends rt{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:qt++}),this.uuid=st(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new H,n=new Gt,r=new mt,i=new H(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new G},normalMatrix:{value:new U}}),this.matrix=new G,this.matrixWorld=new G,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Kt,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Yt.setFromAxisAngle(e,t),this.quaternion.multiply(Yt),this}rotateOnWorldAxis(e,t){return Yt.setFromAxisAngle(e,t),this.quaternion.premultiply(Yt),this}rotateX(e){return this.rotateOnAxis(tn,e)}rotateY(e){return this.rotateOnAxis(nn,e)}rotateZ(e){return this.rotateOnAxis(rn,e)}translateOnAxis(e,t){return Jt.copy(e).applyQuaternion(this.quaternion),this.position.add(Jt.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tn,e)}translateY(e){return this.translateOnAxis(nn,e)}translateZ(e){return this.translateOnAxis(rn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Xt.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zt.copy(e):Zt.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),Qt.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Xt.lookAt(Qt,Zt,this.up):Xt.lookAt(Zt,Qt,this.up),this.quaternion.setFromRotationMatrix(Xt),r&&(Xt.extractRotation(r.matrixWorld),Yt.setFromRotationMatrix(Xt),this.quaternion.premultiply(Yt.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(z(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(an),sn.child=e,this.dispatchEvent(sn),sn.child=null):z(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(on),cn.child=e,this.dispatchEvent(cn),cn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Xt.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Xt.multiply(e.parent.matrixWorld)),e.applyMatrix4(Xt),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(an),sn.child=e,this.dispatchEvent(sn),sn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qt,e,$t),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Qt,en,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};ln.DEFAULT_UP=new H(0,1,0),ln.DEFAULT_MATRIX_AUTO_UPDATE=!0,ln.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var un=class extends ln{constructor(){super(),this.isGroup=!0,this.type=`Group`}},dn={type:`move`},fn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(dn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new un;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},pn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mn={h:0,s:0,l:0},hn={h:0,s:0,l:0};function gn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var K=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Be){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,W.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=W.workingColorSpace){return this.r=e,this.g=t,this.b=n,W.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=W.workingColorSpace){if(e=ct(e,1),t=B(t,0,1),n=B(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=gn(i,r,e+1/3),this.g=gn(i,r,e),this.b=gn(i,r,e-1/3)}return W.colorSpaceToWorking(this,r),this}setStyle(e,t=Be){function n(t){t!==void 0&&parseFloat(t)<1&&R(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:R(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);R(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Be){let n=pn[e.toLowerCase()];return n===void 0?R(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=xt(e.r),this.g=xt(e.g),this.b=xt(e.b),this}copyLinearToSRGB(e){return this.r=St(e.r),this.g=St(e.g),this.b=St(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Be){return W.workingToColorSpace(_n.copy(this),e),Math.round(B(_n.r*255,0,255))*65536+Math.round(B(_n.g*255,0,255))*256+Math.round(B(_n.b*255,0,255))}getHexString(e=Be){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=W.workingColorSpace){W.workingToColorSpace(_n.copy(this),t);let n=_n.r,r=_n.g,i=_n.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=W.workingColorSpace){return W.workingToColorSpace(_n.copy(this),t),e.r=_n.r,e.g=_n.g,e.b=_n.b,e}getStyle(e=Be){W.workingToColorSpace(_n.copy(this),e);let t=_n.r,n=_n.g,r=_n.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(mn),this.setHSL(mn.h+e,mn.s+t,mn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(mn),e.getHSL(hn);let n=lt(mn.h,hn.h,t),r=lt(mn.s,hn.s,t),i=lt(mn.l,hn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},_n=new K;K.NAMES=pn;var vn=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new K(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},yn=class extends ln{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Gt,this.environmentIntensity=1,this.environmentRotation=new Gt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},bn=new H,xn=new H,Sn=new H,Cn=new H,wn=new H,Tn=new H,En=new H,Dn=new H,On=new H,kn=new H,An=new jt,jn=new jt,Mn=new jt,Nn=class e{constructor(e=new H,t=new H,n=new H){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),bn.subVectors(e,t),r.cross(bn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){bn.subVectors(r,t),xn.subVectors(n,t),Sn.subVectors(e,t);let a=bn.dot(bn),o=bn.dot(xn),s=bn.dot(Sn),c=xn.dot(xn),l=xn.dot(Sn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Cn)!==null&&Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Cn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Cn.x),s.addScaledVector(a,Cn.y),s.addScaledVector(o,Cn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return An.setScalar(0),jn.setScalar(0),Mn.setScalar(0),An.fromBufferAttribute(e,t),jn.fromBufferAttribute(e,n),Mn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(An,i.x),a.addScaledVector(jn,i.y),a.addScaledVector(Mn,i.z),a}static isFrontFacing(e,t,n,r){return bn.subVectors(n,t),xn.subVectors(e,t),bn.cross(xn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return bn.subVectors(this.c,this.b),xn.subVectors(this.a,this.b),bn.cross(xn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;wn.subVectors(r,n),Tn.subVectors(i,n),Dn.subVectors(e,n);let s=wn.dot(Dn),c=Tn.dot(Dn);if(s<=0&&c<=0)return t.copy(n);On.subVectors(e,r);let l=wn.dot(On),u=Tn.dot(On);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(wn,a);kn.subVectors(e,i);let f=wn.dot(kn),p=Tn.dot(kn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Tn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return En.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(En,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(wn,a).addScaledVector(Tn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Pn=class{constructor(e=new H(1/0,1/0,1/0),t=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(In.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(In.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=In.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,In):In.fromBufferAttribute(r,t),In.applyMatrix4(e.matrixWorld),this.expandByPoint(In);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Ln.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Ln.copy(e.boundingBox)),Ln.applyMatrix4(e.matrixWorld),this.union(Ln)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,In),In.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Wn),Gn.subVectors(this.max,Wn),Rn.subVectors(e.a,Wn),zn.subVectors(e.b,Wn),Bn.subVectors(e.c,Wn),Vn.subVectors(zn,Rn),Hn.subVectors(Bn,zn),Un.subVectors(Rn,Bn);let t=[0,-Vn.z,Vn.y,0,-Hn.z,Hn.y,0,-Un.z,Un.y,Vn.z,0,-Vn.x,Hn.z,0,-Hn.x,Un.z,0,-Un.x,-Vn.y,Vn.x,0,-Hn.y,Hn.x,0,-Un.y,Un.x,0];return!Jn(t,Rn,zn,Bn,Gn)||(t=[1,0,0,0,1,0,0,0,1],!Jn(t,Rn,zn,Bn,Gn))?!1:(Kn.crossVectors(Vn,Hn),t=[Kn.x,Kn.y,Kn.z],Jn(t,Rn,zn,Bn,Gn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,In).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(In).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Fn)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Fn=[new H,new H,new H,new H,new H,new H,new H,new H],In=new H,Ln=new Pn,Rn=new H,zn=new H,Bn=new H,Vn=new H,Hn=new H,Un=new H,Wn=new H,Gn=new H,Kn=new H,qn=new H;function Jn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){qn.fromArray(e,a);let o=i.x*Math.abs(qn.x)+i.y*Math.abs(qn.y)+i.z*Math.abs(qn.z),s=t.dot(qn),c=n.dot(qn),l=r.dot(qn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Yn=new H,Xn=new V,Zn=0,Qn=class extends rt{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Zn++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=We,this.updateRanges=[],this.gpuType=g,this.version=0,this._normalizationScale=e===void 0?void 0:dt(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Xn.fromBufferAttribute(this,t),Xn.applyMatrix3(e),this.setXY(t,Xn.x,Xn.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix3(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyMatrix4(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.applyNormalMatrix(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Yn.fromBufferAttribute(this,t),Yn.transformDirection(e),this.setXYZ(t,Yn.x,Yn.y,Yn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?ft(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?pt(e,this.array):Math.round(e*t)}},$n=class extends Qn{constructor(e,t,n){super(new Uint16Array(e),t,n)}},er=class extends Qn{constructor(e,t,n){super(new Uint32Array(e),t,n)}},tr=class extends Qn{constructor(e,t,n){super(new Float32Array(e),t,n)}},nr=new Pn,rr=new H,ir=new H,ar=class{constructor(e=new H,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?nr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;rr.subVectors(e,this.center);let t=rr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(rr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ir.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(rr.copy(e.center).add(ir)),this.expandByPoint(rr.copy(e.center).sub(ir))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},or=0,sr=new G,cr=new ln,lr=new H,ur=new Pn,dr=new Pn,fr=new H,pr=class e extends rt{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:or++}),this.uuid=st(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(qe(e)?er:$n)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new U().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return sr.makeRotationFromQuaternion(e),this.applyMatrix4(sr),this}rotateX(e){return sr.makeRotationX(e),this.applyMatrix4(sr),this}rotateY(e){return sr.makeRotationY(e),this.applyMatrix4(sr),this}rotateZ(e){return sr.makeRotationZ(e),this.applyMatrix4(sr),this}translate(e,t,n){return sr.makeTranslation(e,t,n),this.applyMatrix4(sr),this}scale(e,t,n){return sr.makeScale(e,t,n),this.applyMatrix4(sr),this}lookAt(e){return cr.lookAt(e),cr.updateMatrix(),this.applyMatrix4(cr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(lr).negate(),this.translate(lr.x,lr.y,lr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new tr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&R(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Pn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)z(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];ur.setFromBufferAttribute(n),this.morphTargetsRelative?(fr.addVectors(this.boundingBox.min,ur.min),this.boundingBox.expandByPoint(fr),fr.addVectors(this.boundingBox.max,ur.max),this.boundingBox.expandByPoint(fr)):(this.boundingBox.expandByPoint(ur.min),this.boundingBox.expandByPoint(ur.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&z(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ar);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)z(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new H,1/0);else if(e){let n=this.boundingSphere.center;if(ur.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];dr.setFromBufferAttribute(n),this.morphTargetsRelative?(fr.addVectors(ur.min,dr.min),ur.expandByPoint(fr),fr.addVectors(ur.max,dr.max),ur.expandByPoint(fr)):(ur.expandByPoint(dr.min),ur.expandByPoint(dr.max))}ur.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)fr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(fr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)fr.fromBufferAttribute(a,t),o&&(lr.fromBufferAttribute(e,t),fr.add(lr)),r=Math.max(r,n.distanceToSquared(fr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&z(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){z(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new Qn(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new H,s[e]=new H;let l=new H,u=new H,d=new H,f=new V,p=new V,m=new V,h=new H,g=new H;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new H,b=new H,x=new H,S=new H;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new Qn(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new H,i=new H,a=new H,o=new H,s=new H,c=new H,l=new H,u=new H;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)fr.fromBufferAttribute(e,t),fr.normalize(),e.setXYZ(t,fr.x,fr.y,fr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new Qn(a,r,i)}if(this.index===null)return R(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},mr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=We,this.updateRanges=[],this.version=0,this.uuid=st()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=hr(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);let n=new this.array.constructor(e.arrayBuffers[t]),r=new this.constructor(n,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});let t=hr(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));let n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}};function hr(e){return e.buffer._uuid===void 0&&(e.buffer._uuid=st()),e.byteOffset===0&&e.byteLength===e.buffer.byteLength?e.buffer._uuid:e.buffer._uuid+`:`+e.byteOffset+`:`+e.byteLength}var gr=new H,_r=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r,this._normalizationScale=e===void 0?void 0:dt(e.array)}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyMatrix4(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.applyNormalMatrix(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gr.fromBufferAttribute(this,t),gr.transformDirection(e),this.setXYZ(t,gr.x,gr.y,gr.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Qe(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new Qn(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Qe(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){let t=this._normalizationScale;return t===void 0?ft(e,this.data.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?pt(e,this.data.array):Math.round(e*t)}},vr=new H,yr=new H,br=new U,xr=class{constructor(e=new H(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=vr.subVectors(n,t).cross(yr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(vr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||br.getNormalMatrix(e),r=this.coplanarPoint(vr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Sr=0,Cr=class extends rt{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sr++}),this.uuid=st(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new K(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ue,this.stencilZFail=Ue,this.stencilZPass=Ue,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){R(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?R(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new K().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new xr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new V().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new V().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},wr=class extends Cr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new K(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Tr,Er=new H,Dr=new H,Or=new H,kr=new V,Ar=new V,jr=new G,Mr=new H,Nr=new H,Pr=new H,Fr=new V,Ir=new V,Lr=new V,Rr=class extends ln{constructor(e=new wr){if(super(),this.isSprite=!0,this.type=`Sprite`,Tr===void 0){Tr=new pr;let e=new mr(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Tr.setIndex([0,1,2,0,2,3]),Tr.setAttribute(`position`,new _r(e,3,0,!1)),Tr.setAttribute(`uv`,new _r(e,2,3,!1))}this.geometry=Tr,this.material=e,this.center=new V(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&z(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Dr.setFromMatrixScale(this.matrixWorld),jr.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Or.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Dr.multiplyScalar(-Or.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;zr(Mr.set(-.5,-.5,0),Or,a,Dr,r,i),zr(Nr.set(.5,-.5,0),Or,a,Dr,r,i),zr(Pr.set(.5,.5,0),Or,a,Dr,r,i),Fr.set(0,0),Ir.set(1,0),Lr.set(1,1);let o=e.ray.intersectTriangle(Mr,Nr,Pr,!1,Er);if(o===null&&(zr(Nr.set(-.5,.5,0),Or,a,Dr,r,i),Ir.set(0,1),o=e.ray.intersectTriangle(Mr,Pr,Nr,!1,Er),o===null))return;let s=e.ray.origin.distanceTo(Er);s<e.near||s>e.far||t.push({distance:s,point:Er.clone(),uv:Nn.getInterpolation(Er,Mr,Nr,Pr,Fr,Ir,Lr,new V),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){let t=super.toJSON(e);return t.object.center=this.center.toArray(),t}};function zr(e,t,n,r,i,a){kr.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Ar.copy(kr):(Ar.x=a*kr.x-i*kr.y,Ar.y=i*kr.x+a*kr.y),e.copy(t),e.x+=Ar.x,e.y+=Ar.y,e.applyMatrix4(jr)}var Br=new H,Vr=new H,Hr=new H,Ur=new H,Wr=class{constructor(e=new H,t=new H(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Br)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Br.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Br.copy(this.origin).addScaledVector(this.direction,t),Br.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Vr.copy(e).add(t).multiplyScalar(.5),Hr.copy(t).sub(e).normalize(),Ur.copy(this.origin).sub(Vr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Hr),o=Ur.dot(this.direction),s=-Ur.dot(Hr),c=Ur.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Vr).addScaledVector(Hr,d),f}intersectSphere(e,t){if(e.radius<0)return null;Br.subVectors(e.center,this.origin);let n=Br.dot(this.direction),r=Br.dot(Br)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Br)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,ee,te,ne;if(y>=b&&y>=x?(w=s,D=u,A=p,ne=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,ee=_,te=v):(S=l,C=c,T=f,E=d,O=h,k=m,ee=v,te=_)):b>=x?(w=c,D=d,A=m,ne=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,ee=v,te=g):(S=s,C=l,T=u,E=f,O=p,k=h,ee=g,te=v)):(w=l,D=f,A=h,ne=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,ee=g,te=_):(S=c,C=s,T=d,E=u,O=m,k=p,ee=_,te=g)),w===0)return null;let j=S/w,re=C/w,M=1/w,ie=T-j*D,ae=E-re*D,oe=O-j*A,se=k-re*A,ce=ee-j*ne,le=te-re*ne,ue=ce*se-le*oe,N=ie*le-ae*ce,de=oe*ae-se*ie;if(r){if(ue<0||N<0||de<0)return null}else if((ue<0||N<0||de<0)&&(ue>0||N>0||de>0))return null;let fe=ue+N+de;if(fe===0)return null;let pe=M*(ue*D+N*A+de*ne);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Gr=class extends Cr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new K(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gt,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Kr=new G,qr=new Wr,Jr=new ar,Yr=new H,Xr=new H,Zr=new H,Qr=new H,$r=new H,ei=new H,ti=new H,ni=new H,ri=class extends ln{constructor(e=new pr,t=new Gr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){ei.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&($r.fromBufferAttribute(s,e),a?ei.addScaledVector($r,r):ei.addScaledVector($r.sub(t),r))}t.add(ei)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Jr.copy(n.boundingSphere),Jr.applyMatrix4(i),qr.copy(e.ray).recast(e.near),Jr.containsPoint(qr.origin)===!1&&(qr.intersectSphere(Jr,Yr)===null||qr.origin.distanceToSquared(Yr)>(e.far-e.near)**2)||(Kr.copy(i).invert(),qr.copy(e.ray).applyMatrix4(Kr),(n.boundingBox===null||qr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,qr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ai(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ai(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ai(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ai(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ii(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;ni.copy(s),ni.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(ni);return l<n.near||l>n.far?null:{distance:l,point:ni.clone(),object:e}}function ai(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Xr),e.getVertexPosition(c,Zr),e.getVertexPosition(l,Qr);let u=ii(e,t,n,r,Xr,Zr,Qr,ti);if(u){let e=new H;Nn.getBarycoord(ti,Xr,Zr,Qr,e),i&&(u.uv=Nn.getInterpolatedAttribute(i,s,c,l,e,new V)),a&&(u.uv1=Nn.getInterpolatedAttribute(a,s,c,l,e,new V)),o&&(u.normal=Nn.getInterpolatedAttribute(o,s,c,l,e,new H),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new H,materialIndex:0};Nn.getNormal(Xr,Zr,Qr,t.normal),u.face=t,u.barycoord=e}return u}var oi=new jt,si=new jt,ci=new jt,li=new jt,ui=new G,di=new H,fi=new ar,pi=new G,mi=new Wr,hi=class extends ri{constructor(t,n){super(t,n),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=e,this.bindMatrix=new G,this.bindMatrixInverse=new G,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Pn),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,di),this.boundingBox.expandByPoint(di)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ar),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,di),this.boundingSphere.expandByPoint(di)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),fi.copy(this.boundingSphere),fi.applyMatrix4(r),e.ray.intersectsSphere(fi)!==!1&&(pi.copy(r).invert(),mi.copy(e.ray).applyMatrix4(pi),(this.boundingBox===null||mi.intersectsBox(this.boundingBox)!==!1)&&this._computeIntersections(e,t,mi)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new jt,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():R(`SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;si.fromBufferAttribute(r.attributes.skinIndex,e),ci.fromBufferAttribute(r.attributes.skinWeight,e),t.isVector4?(oi.copy(t),t.set(0,0,0,0)):(oi.set(t.x,t.y,t.z,1),t.set(0,0,0)),oi.applyMatrix4(this.bindMatrix);for(let e=0;e<4;e++){let r=ci.getComponent(e);if(r!==0){let i=si.getComponent(e);ui.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector(li.copy(oi).applyMatrix4(ui),r)}}return t.isVector4&&(t.w=oi.w),t.applyMatrix4(this.bindMatrixInverse)}},gi=class extends ln{constructor(){super(),this.isBone=!0,this.type=`Bone`}},_i=class extends At{constructor(e=null,t=1,n=1,r,a,o,s,c,l=i,u=i,d,f){super(null,o,s,c,l,u,r,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},vi=new G,yi=new G,bi=class e{constructor(e=[],t=[]){this.uuid=st(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){R(`Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new G)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new G;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:yi;vi.multiplyMatrices(i,t[r]),vi.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new _i(t,e,e,T,g);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(R(`Skeleton: No bone found with UUID:`,r),i=new gi),this.bones.push(i),this.boneInverses.push(new G().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},xi=class extends Qn{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Si=new G,Ci=new G,wi=[],Ti=new Pn,Ei=new G,Di=new ri,Oi=new ar,ki=class extends ri{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new xi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ei)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Pn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Si),Ti.copy(e.boundingBox).applyMatrix4(Si),this.boundingBox.union(Ti)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ar),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Si),Oi.copy(e.boundingSphere).applyMatrix4(Si),this.boundingSphere.union(Oi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Di.geometry=this.geometry,Di.material=this.material,Di.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Oi.copy(this.boundingSphere),Oi.applyMatrix4(n),e.ray.intersectsSphere(Oi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Si),Ci.multiplyMatrices(n,Si),Di.matrixWorld=Ci,Di.raycast(e,wi);for(let e=0,n=wi.length;e<n;e++){let n=wi[e];n.instanceId=i,n.object=this,t.push(n)}wi.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new xi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new _i(new Float32Array(r*this.count),r,this.count,O,g));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ai=new ar,ji=new V(.5,.5),Mi=new H,Ni=class{constructor(e=new xr,t=new xr,n=new xr,r=new xr,i=new xr,a=new xr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ke,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ai)}intersectsSprite(e){return Ai.center.set(0,0,0),Ai.radius=.7071067811865476+ji.distanceTo(e.center),Ai.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ai)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Mi.x=r.normal.x>0?e.max.x:e.min.x,Mi.y=r.normal.y>0?e.max.y:e.min.y,Mi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Mi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Pi=new G,Fi=class e{constructor(){this.coordinateSystem=Ke,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];Pi.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new Ni),n[e].setFromProjectionMatrix(Pi,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new Ni),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},Ii=class extends Cr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new K(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Li=new H,Ri=new H,zi=new G,Bi=new Wr,Vi=new ar,Hi=new H,Ui=new H,Wi=class extends ln{constructor(e=new pr,t=new Ii){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Li.fromBufferAttribute(t,e-1),Ri.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Li.distanceTo(Ri);e.setAttribute(`lineDistance`,new tr(n,1))}else R(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Vi.copy(n.boundingSphere),Vi.applyMatrix4(r),Vi.radius+=i,e.ray.intersectsSphere(Vi)===!1)return;zi.copy(r).invert(),Bi.copy(e.ray).applyMatrix4(zi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Gi(this,e,Bi,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Gi(this,e,Bi,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Gi(this,e,Bi,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=Gi(this,e,Bi,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Gi(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Li.fromBufferAttribute(s,i),Ri.fromBufferAttribute(s,a),n.distanceSqToSegment(Li,Ri,Hi,Ui)>r)return;Hi.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Hi);if(!(c<t.near||c>t.far))return{distance:c,point:Ui.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Ki=new H,qi=new H,Ji=class extends Wi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Ki.fromBufferAttribute(t,e),qi.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Ki.distanceTo(qi);e.setAttribute(`lineDistance`,new tr(n,1))}else R(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Yi=class extends Cr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new K(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Xi=new G,Zi=new Wr,Qi=new ar,$i=new H,ea=class extends ln{constructor(e=new pr,t=new Yi){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Qi.copy(n.boundingSphere),Qi.applyMatrix4(r),Qi.radius+=i,e.ray.intersectsSphere(Qi)===!1)return;Xi.copy(r).invert(),Zi.copy(e.ray).applyMatrix4(Xi);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);$i.fromBufferAttribute(l,n),ta($i,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)$i.fromBufferAttribute(l,a),ta($i,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ta(e,t,n,r,i,a,o){let s=Zi.distanceSqToPoint(e);if(s<n){let n=new H;Zi.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var na=class extends At{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ra=class extends At{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},ia=class extends At{constructor(e,t,n=h,r,a,o,s=i,c=i,l,u=E,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Et(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},aa=class extends ia{constructor(e,t=h,n=301,r,a,o=i,s=i,c,l=E){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},oa=class extends At{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},sa=class e extends pr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new tr(c,3)),this.setAttribute(`normal`,new tr(l,3)),this.setAttribute(`uv`,new tr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new H;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},ca=class e extends pr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new tr(u,3)),this.setAttribute(`normal`,new tr(d,3)),this.setAttribute(`uv`,new tr(f,2));function _(){let a=new H,_=new H,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new V,m=new H,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},la=class e extends pr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new tr(p,3)),this.setAttribute(`normal`,new tr(m,3)),this.setAttribute(`uv`,new tr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},ua=class e extends pr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new H,d=new H,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new tr(p,3)),this.setAttribute(`normal`,new tr(m,3)),this.setAttribute(`uv`,new tr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},da=class e extends pr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new H,f=new H,p=new H;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new tr(c,3)),this.setAttribute(`normal`,new tr(l,3)),this.setAttribute(`uv`,new tr(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function fa(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(ma(i))i.isRenderTargetTexture?(R(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(ma(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function pa(e){let t={};for(let n=0;n<e.length;n++){let r=fa(e[n]);for(let e in r)t[e]=r[e]}return t}function ma(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function ha(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ga(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:W.workingColorSpace}var _a={clone:fa,merge:pa},va=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ya=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ba=class extends Cr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=va,this.fragmentShader=ya,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=fa(e.uniforms),this.uniformsGroups=ha(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new K().setHex(r.value);break;case`v2`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new H().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new jt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new U().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new G().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},xa=class extends ba{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Sa=class extends Cr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new K(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new K(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new V(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ca=class extends Cr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new K(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new K(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new V(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Gt,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},wa=class extends Cr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=I,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ta=class extends Cr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ea(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Da(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Oa=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},ka=class extends Oa{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Re,endingEnd:Re}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case F:i=e,o=2*t-n;break;case ze:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case F:a=e,s=2*n-t;break;case ze:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Aa=class extends Oa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},ja=class extends Oa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Ma=class extends Oa{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=Fa(n,t,g,y,r);i[p]=Na(x,o,_,b,m)}return i}};function Na(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Pa(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function Fa(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Na(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Pa(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Ia=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ea(t,this.TimeBufferType),this.values=Ea(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ea(e.times,Array),values:Ea(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Da(e.settings)&&(n.settings={inTangents:Ea(e.settings.inTangents,Array),outTangents:Ea(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ja(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Aa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ka(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ma(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Fe:t=this.InterpolantFactoryMethodDiscrete;break;case P:t=this.InterpolantFactoryMethodLinear;break;case Ie:t=this.InterpolantFactoryMethodSmooth;break;case Le:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return R(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Fe;case this.InterpolantFactoryMethodLinear:return P;case this.InterpolantFactoryMethodSmooth:return Ie;case this.InterpolantFactoryMethodBezier:return Le}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Da(this.settings)&&(La(this.settings.inTangents,e),La(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Da(this.settings)&&(Ra(this.settings.inTangents,e),Ra(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(z(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(z(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){z(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){z(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Je(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){z(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ie,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Da(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function La(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function Ra(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Ia.prototype.ValueTypeName=``,Ia.prototype.TimeBufferType=Float32Array,Ia.prototype.ValueBufferType=Float32Array,Ia.prototype.DefaultInterpolation=P;var za=class extends Ia{constructor(e,t,n){super(e,t,n)}};za.prototype.ValueTypeName=`bool`,za.prototype.ValueBufferType=Array,za.prototype.DefaultInterpolation=Fe,za.prototype.InterpolantFactoryMethodLinear=void 0,za.prototype.InterpolantFactoryMethodSmooth=void 0;var Ba=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}};Ba.prototype.ValueTypeName=`color`;var Va=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}};Va.prototype.ValueTypeName=`number`;var Ha=class extends Oa{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)mt.slerpFlat(i,0,a,c-o,a,c,s);return i}},Ua=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Ha(this.times,this.values,this.getValueSize(),e)}};Ua.prototype.ValueTypeName=`quaternion`,Ua.prototype.InterpolantFactoryMethodSmooth=void 0;var Wa=class extends Ia{constructor(e,t,n){super(e,t,n)}};Wa.prototype.ValueTypeName=`string`,Wa.prototype.ValueBufferType=Array,Wa.prototype.DefaultInterpolation=Fe,Wa.prototype.InterpolantFactoryMethodLinear=void 0,Wa.prototype.InterpolantFactoryMethodSmooth=void 0;var Ga=class extends Ia{constructor(e,t,n,r){super(e,t,n,r)}};Ga.prototype.ValueTypeName=`vector`;var Ka=class extends ln{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new K(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},qa=class extends Ka{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(ln.DEFAULT_UP),this.updateMatrix(),this.groundColor=new K(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Ja=new G,Ya=new H,Xa=new H,Za=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new V(512,512),this.mapType=u,this.map=null,this.mapPass=null,this.matrix=new G,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ni,this._frameExtents=new V(1,1),this._viewportCount=1,this._viewports=[new jt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Ya.setFromMatrixPosition(e.matrixWorld),t.position.copy(Ya),Xa.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Xa),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Ja.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Ja,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Ja)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Qa=new H,$a=new mt,eo=new H,to=class extends ln{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new G,this.projectionMatrix=new G,this.projectionMatrixInverse=new G,this.coordinateSystem=Ke,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Qa,$a,eo),eo.x===1&&eo.y===1&&eo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Qa,$a,eo.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Qa,$a,eo),eo.x===1&&eo.y===1&&eo.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Qa,$a,eo.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},no=new H,ro=new V,io=new V,ao=class extends to{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ot*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(at*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ot*2*Math.atan(Math.tan(at*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){no.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(no.x,no.y).multiplyScalar(-e/no.z),no.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(no.x,no.y).multiplyScalar(-e/no.z)}getViewSize(e,t){return this.getViewBounds(e,ro,io),t.subVectors(io,ro)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(at*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},oo=class extends Za{constructor(){super(new ao(90,1,.5,500)),this.isPointLightShadow=!0}},so=class extends Ka{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new oo}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},co=class extends to{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},lo=class extends Za{constructor(){super(new co(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},uo=class extends Ka{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ln.DEFAULT_UP),this.updateMatrix(),this.target=new ln,this.shadow=new lo}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},fo=class extends Ka{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},po=-90,mo=1,ho=class extends ln{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new ao(po,mo,e,t);r.layers=this.layers,this.add(r);let i=new ao(po,mo,e,t);i.layers=this.layers,this.add(i);let a=new ao(po,mo,e,t);a.layers=this.layers,this.add(a);let o=new ao(po,mo,e,t);o.layers=this.layers,this.add(o);let s=new ao(po,mo,e,t);s.layers=this.layers,this.add(s);let c=new ao(po,mo,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},go=class extends ao{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}},_o=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=vo.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function vo(){this._document.hidden===!1&&this.reset()}var yo=`\\[\\]\\.:\\/`,bo=RegExp(`[\\[\\]\\.:\\/]`,`g`),xo=`[^\\[\\]\\.:\\/]`,So=`[^`+yo.replace(`\\.`,``)+`]`,Co=`((?:WC+[\\/:])*)`.replace(`WC`,xo),wo=`(WCOD+)?`.replace(`WCOD`,So),To=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,xo),Eo=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,xo),Do=RegExp(`^`+Co+wo+To+Eo+`$`),Oo=[`material`,`materials`,`bones`,`map`],ko=class{constructor(e,t,n){let r=n||Ao.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ao=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(bo,``)}static parseTrackName(e){let t=Do.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Oo.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){R(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){z(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){z(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){z(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){z(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){z(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){z(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){z(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;z(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){z(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){z(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ao.Composite=ko,Ao.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Ao.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Ao.prototype.GetterByBindingType=[Ao.prototype._getValue_direct,Ao.prototype._getValue_array,Ao.prototype._getValue_arrayElement,Ao.prototype._getValue_toArray],Ao.prototype.SetterByBindingTypeAndVersioning=[[Ao.prototype._setValue_direct,Ao.prototype._setValue_direct_setNeedsUpdate,Ao.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ao.prototype._setValue_array,Ao.prototype._setValue_array_setNeedsUpdate,Ao.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ao.prototype._setValue_arrayElement,Ao.prototype._setValue_arrayElement_setNeedsUpdate,Ao.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ao.prototype._setValue_fromArray,Ao.prototype._setValue_fromArray_setNeedsUpdate,Ao.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function jo(e,t,n,r){let i=Mo(r);switch(n){case C:return e*t;case O:return e*t/i.components*i.byteLength;case k:return e*t/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case ee:return e*t*2/i.components*i.byteLength;case w:return e*t*3/i.components*i.byteLength;case T:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case ne:case j:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case re:case M:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ae:case se:return Math.max(e,16)*Math.max(t,8)/4;case ie:case oe:return Math.max(e,8)*Math.max(t,8)/2;case ce:case le:case N:case de:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ue:case fe:case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case me:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case he:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ge:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ve:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ye:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case be:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case xe:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Ce:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case we:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Te:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Ee:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case De:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Oe:case ke:case Ae:return Math.ceil(e/4)*Math.ceil(t/4)*16;case je:case Me:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ne:case Pe:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Mo(e){switch(e){case u:case d:return{byteLength:1,components:1};case p:case f:case _:return{byteLength:2,components:1};case v:case y:return{byteLength:2,components:4};case h:case m:case g:return{byteLength:4,components:1};case x:case S:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?R(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);function No(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Po(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var q={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},J={common:{diffuse:{value:new K(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new U},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new U}},envmap:{envMap:{value:null},envMapRotation:{value:new U},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new U}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new U}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new U},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new U},normalScale:{value:new V(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new U},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new U}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new U}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new U}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new K(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new K(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0},uvTransform:{value:new U}},sprite:{diffuse:{value:new K(16777215)},opacity:{value:1},center:{value:new V(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new U},alphaMap:{value:null},alphaMapTransform:{value:new U},alphaTest:{value:0}}},Fo={basic:{uniforms:pa([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.fog]),vertexShader:q.meshbasic_vert,fragmentShader:q.meshbasic_frag},lambert:{uniforms:pa([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new K(0)},envMapIntensity:{value:1}}]),vertexShader:q.meshlambert_vert,fragmentShader:q.meshlambert_frag},phong:{uniforms:pa([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new K(0)},specular:{value:new K(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:q.meshphong_vert,fragmentShader:q.meshphong_frag},standard:{uniforms:pa([J.common,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.roughnessmap,J.metalnessmap,J.fog,J.lights,{emissive:{value:new K(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag},toon:{uniforms:pa([J.common,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.gradientmap,J.fog,J.lights,{emissive:{value:new K(0)}}]),vertexShader:q.meshtoon_vert,fragmentShader:q.meshtoon_frag},matcap:{uniforms:pa([J.common,J.bumpmap,J.normalmap,J.displacementmap,J.fog,{matcap:{value:null}}]),vertexShader:q.meshmatcap_vert,fragmentShader:q.meshmatcap_frag},points:{uniforms:pa([J.points,J.fog]),vertexShader:q.points_vert,fragmentShader:q.points_frag},dashed:{uniforms:pa([J.common,J.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:q.linedashed_vert,fragmentShader:q.linedashed_frag},depth:{uniforms:pa([J.common,J.displacementmap]),vertexShader:q.depth_vert,fragmentShader:q.depth_frag},normal:{uniforms:pa([J.common,J.bumpmap,J.normalmap,J.displacementmap,{opacity:{value:1}}]),vertexShader:q.meshnormal_vert,fragmentShader:q.meshnormal_frag},sprite:{uniforms:pa([J.sprite,J.fog]),vertexShader:q.sprite_vert,fragmentShader:q.sprite_frag},background:{uniforms:{uvTransform:{value:new U},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:q.background_vert,fragmentShader:q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new U}},vertexShader:q.backgroundCube_vert,fragmentShader:q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:q.cube_vert,fragmentShader:q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:q.equirect_vert,fragmentShader:q.equirect_frag},distance:{uniforms:pa([J.common,J.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:q.distance_vert,fragmentShader:q.distance_frag},shadow:{uniforms:pa([J.lights,J.fog,{color:{value:new K(0)},opacity:{value:1}}]),vertexShader:q.shadow_vert,fragmentShader:q.shadow_frag}};Fo.physical={uniforms:pa([Fo.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new U},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new U},clearcoatNormalScale:{value:new V(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new U},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new U},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new U},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new U},sheen:{value:0},sheenColor:{value:new K(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new U},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new U},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new U},transmissionSamplerSize:{value:new V},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new U},attenuationDistance:{value:0},attenuationColor:{value:new K(0)},specularColor:{value:new K(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new U},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new U},anisotropyVector:{value:new V},anisotropyMap:{value:null},anisotropyMapTransform:{value:new U}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag};var Io={r:0,b:0,g:0},Lo=new G,Ro=new U;Ro.set(-1,0,0,0,1,0,0,0,1);function zo(e,t,n,r,i,a){let o=new K(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new ri(new sa(1,1,1),new ba({name:`BackgroundCubeMaterial`,uniforms:fa(Fo.backgroundCube.uniforms),vertexShader:Fo.backgroundCube.vertexShader,fragmentShader:Fo.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Lo.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Ro),l.material.toneMapped=W.getTransfer(i.colorSpace)!==He,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new ri(new la(2,2),new ba({name:`BackgroundMaterial`,uniforms:fa(Fo.background.uniforms),vertexShader:Fo.background.vertexShader,fragmentShader:Fo.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=W.getTransfer(i.colorSpace)!==He,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Io,ga(e)),n.buffers.color.setClear(Io.r,Io.g,Io.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Bo(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Vo(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Ho(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(R(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&R(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&R(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Uo(e){let t=this,n=null,r=0,i=!1,a=!1,o=new xr,s=new U,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Wo=class extends Nt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new na(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new sa(5,5,5),i=new ba({name:`CubemapFromEquirect`,uniforms:fa(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new ri(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=s),new ho(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Go=256,Ko=3,qo=20,Jo=256,Yo=16,Xo=3,Zo=new H,Qo=new K,$o=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new ho(1,10,null),this._boxMesh=new ri(new sa(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Zo}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(Qo));let h=new ho(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=os(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=as(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Go,ut(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Go:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=es(e,!1,!1),n=Math.log2(e)-Ko;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=es(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=os()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=as()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=ns(),this._integrationMaterial=rs());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/Yo);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Xo)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(Jo*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=is());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function es(e,t,n){return new Wo(e,{minFilter:l,generateMipmaps:t,type:_,colorSpace:L,depthBuffer:n})}function ts(e,t,n){return new ba({name:e,uniforms:t,vertexShader:q.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function ns(){return ts(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Jo}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function rs(){return ts(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Yo}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function is(){return ts(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${qo}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function as(){return ts(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function os(){return ts(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function ss(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new Wo(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new $o(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new $o(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function cs(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&et(`WebGLRenderer: `+e+` extension not supported.`),t}}}function ls(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?er:$n)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function us(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ds(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:z(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function fs(e,t,n){let r=new WeakMap,i=new jt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),_=new Pt(h,p,m,u);_.type=g,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new V(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function ps(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var ms={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function hs(e,t,n,r,i,a){let o=new Nt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,u=new pr;u.setAttribute(`position`,new tr([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute(`uv`,new tr([0,2,0,0,2,0],2));let d=new xa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new ri(u,d),p=new co(-1,1,1,-1,0,1),m=null,h=null,g=!1,v,y=null,x=[],S=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<x.length;n++){let r=x[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){x=e,S=x.length>0&&x[0].isRenderPass===!0;let t=o.width,n=o.height;x.length>0&&s===null&&(s=new Nt(t,n,{type:_,depthBuffer:!1,stencilBuffer:!1}),c=new Nt(t,n,{type:_,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&x.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new ia(t,n),a===!0&&(l.format=D,l.type=b)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<x.length;e++){let i=x[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(g||e.toneMapping===0&&x.length===0)return!1;if(y=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return S===!1&&e.setRenderTarget(o),v=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return S},this.end=function(e,t){e.toneMapping=v,g=!0;let n=o,r=s;for(let i=0;i<x.length;i++){let a=x[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(m!==e.outputColorSpace||h!==e.toneMapping){m=e.outputColorSpace,h=e.toneMapping,d.defines={},W.getTransfer(m)===`srgb`&&(d.defines.SRGB_TRANSFER=``);let t=ms[h];t&&(d.defines[t]=``),d.needsUpdate=!0}d.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(y),e.render(f,p),y=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),u.dispose(),d.dispose()}}var gs=new At,_s=new ia(1,1),vs=new aa(1),ys=new Pt,bs=new Ft,xs=new na,Ss=[],Cs=[],ws=new Float32Array(16),Ts=new Float32Array(9),Es=new Float32Array(4);function Ds(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Ss[i];if(a===void 0&&(a=new Float32Array(i),Ss[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Os(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function ks(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function As(e,t){let n=Cs[t];n===void 0&&(n=new Int32Array(t),Cs[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function js(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ms(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Os(n,t))return;e.uniform2fv(this.addr,t),ks(n,t)}}function Ns(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Os(n,t))return;e.uniform3fv(this.addr,t),ks(n,t)}}function Ps(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Os(n,t))return;e.uniform4fv(this.addr,t),ks(n,t)}}function Fs(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Os(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),ks(n,t)}else{if(Os(n,r))return;Es.set(r),e.uniformMatrix2fv(this.addr,!1,Es),ks(n,r)}}function Is(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Os(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),ks(n,t)}else{if(Os(n,r))return;Ts.set(r),e.uniformMatrix3fv(this.addr,!1,Ts),ks(n,r)}}function Ls(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Os(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),ks(n,t)}else{if(Os(n,r))return;ws.set(r),e.uniformMatrix4fv(this.addr,!1,ws),ks(n,r)}}function Rs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function zs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Os(n,t))return;e.uniform2iv(this.addr,t),ks(n,t)}}function Bs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Os(n,t))return;e.uniform3iv(this.addr,t),ks(n,t)}}function Vs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Os(n,t))return;e.uniform4iv(this.addr,t),ks(n,t)}}function Hs(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Us(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Os(n,t))return;e.uniform2uiv(this.addr,t),ks(n,t)}}function Ws(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Os(n,t))return;e.uniform3uiv(this.addr,t),ks(n,t)}}function Gs(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Os(n,t))return;e.uniform4uiv(this.addr,t),ks(n,t)}}function Ks(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function qs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Ks(_s):gs,n.setTexture2D(t||a,i)}function Js(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||bs,i)}function Ys(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Ks(vs):xs,n.setTextureCube(t||a,i)}function Xs(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ys,i)}function Zs(e){switch(e){case 5126:return js;case 35664:return Ms;case 35665:return Ns;case 35666:return Ps;case 35674:return Fs;case 35675:return Is;case 35676:return Ls;case 5124:case 35670:return Rs;case 35667:case 35671:return zs;case 35668:case 35672:return Bs;case 35669:case 35673:return Vs;case 5125:return Hs;case 36294:return Us;case 36295:return Ws;case 36296:return Gs;case 35678:case 36198:case 36298:case 36306:case 35682:return qs;case 35679:case 36299:case 36307:return Js;case 35680:case 36300:case 36308:case 36293:return Ys;case 36289:case 36303:case 36311:case 36292:return Xs}}function Qs(e,t){e.uniform1fv(this.addr,t)}function $s(e,t){let n=Ds(t,this.size,2);e.uniform2fv(this.addr,n)}function ec(e,t){let n=Ds(t,this.size,3);e.uniform3fv(this.addr,n)}function tc(e,t){let n=Ds(t,this.size,4);e.uniform4fv(this.addr,n)}function nc(e,t){let n=Ds(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function rc(e,t){let n=Ds(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function ic(e,t){let n=Ds(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ac(e,t){e.uniform1iv(this.addr,t)}function oc(e,t){e.uniform2iv(this.addr,t)}function sc(e,t){e.uniform3iv(this.addr,t)}function cc(e,t){e.uniform4iv(this.addr,t)}function lc(e,t){e.uniform1uiv(this.addr,t)}function uc(e,t){e.uniform2uiv(this.addr,t)}function dc(e,t){e.uniform3uiv(this.addr,t)}function fc(e,t){e.uniform4uiv(this.addr,t)}function pc(e,t,n){let r=this.cache,i=t.length,a=As(n,i);Os(r,a)||(e.uniform1iv(this.addr,a),ks(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Ks(_s):gs;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function mc(e,t,n){let r=this.cache,i=t.length,a=As(n,i);Os(r,a)||(e.uniform1iv(this.addr,a),ks(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||bs,a[e])}function hc(e,t,n){let r=this.cache,i=t.length,a=As(n,i);Os(r,a)||(e.uniform1iv(this.addr,a),ks(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Ks(vs):xs;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function gc(e,t,n){let r=this.cache,i=t.length,a=As(n,i);Os(r,a)||(e.uniform1iv(this.addr,a),ks(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ys,a[e])}function _c(e){switch(e){case 5126:return Qs;case 35664:return $s;case 35665:return ec;case 35666:return tc;case 35674:return nc;case 35675:return rc;case 35676:return ic;case 5124:case 35670:return ac;case 35667:case 35671:return oc;case 35668:case 35672:return sc;case 35669:case 35673:return cc;case 5125:return lc;case 36294:return uc;case 36295:return dc;case 36296:return fc;case 35678:case 36198:case 36298:case 36306:case 35682:return pc;case 35679:case 36299:case 36307:return mc;case 35680:case 36300:case 36308:case 36293:return hc;case 36289:case 36303:case 36311:case 36292:return gc}}var vc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Zs(t.type)}},yc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=_c(t.type)}},bc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},xc=/(\w+)(\])?(\[|\.)?/g;function Sc(e,t){e.seq.push(t),e.map[t.id]=t}function Cc(e,t,n){let r=e.name,i=r.length;for(xc.lastIndex=0;;){let a=xc.exec(r),o=xc.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Sc(n,l===void 0?new vc(s,e,t):new yc(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new bc(s),Sc(n,e)),n=e}}}var wc=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Cc(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Tc(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Ec=37297,Dc=0;function Oc(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var kc=new U;function Ac(e){W._getMatrix(kc,W.workingColorSpace,e);let t=`mat3( ${kc.elements.map(e=>e.toFixed(4))} )`;switch(W.getTransfer(e)){case Ve:return[t,`LinearTransferOETF`];case He:return[t,`sRGBTransferOETF`];default:return R(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function jc(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Oc(e.getShaderSource(t),r)}return i}function Mc(e,t){let n=Ac(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var Nc={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Pc(e,t){let n=Nc[t];return n===void 0?(R(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Fc=new H;function Ic(){return W.getLuminanceCoefficients(Fc),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Fc.x.toFixed(4)}, ${Fc.y.toFixed(4)}, ${Fc.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Lc(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Bc).join(`
`)}function Rc(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function zc(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Bc(e){return e!==``}function Vc(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function Hc(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Uc=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wc(e){return e.replace(Uc,Gc)}function Gc(e,t){let n=q[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return Wc(n)}var Kc=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function qc(e){return e.replace(Kc,Jc)}function Jc(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Yc(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Xc={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Zc(e){return Xc[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Qc={302:`ENVMAP_MODE_REFRACTION`};function $c(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Qc[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var el={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function tl(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:el[e.combine]||`ENVMAP_BLENDING_NONE`}function nl(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Zc(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=$c(n),d=tl(n),f=Lc(n),p=Rc(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Bc).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Bc).join(`
`),g.length>0&&(g+=`
`)):(h=[Yc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Bc).join(`
`),g=[Yc(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:q.tonemapping_pars_fragment,n.toneMapping===0?``:Pc(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,q.colorspace_pars_fragment,Mc(`linearToOutputTexel`,n.outputColorSpace),Ic(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Bc).join(`
`)),o=Wc(o),o=Vc(o,n),o=Hc(o,n),s=Wc(s),s=Vc(s,n),s=Hc(s,n),o=qc(o),s=qc(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=Tc(i,i.VERTEX_SHADER,v),x=Tc(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=jc(i,b,`vertex`),n=jc(i,x,`fragment`);z(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):R(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new wc(i,m),w=zc(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,Ec)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Dc++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var rl=0,il=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new al(e),t.set(e,n)),n}},al=class{constructor(e){this.id=rl++,this.code=e,this.usedTimes=0}};function ol(e){return e===1030||e===37490||e===36285}function sl(e,t,n,r,i,a){let o=new Kt,s=new il,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&R(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=Fo[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),te=m.isInstancedMesh===!0,ne=m.isBatchedMesh===!0,j=!!i.map,re=!!i.matcap,M=!!b,ie=M&&b.isPMREMTexture===!0,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,N=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.diffuseRoughness>0,he=i.dispersion>0,ge=i.retroreflectivity>0,_e=i.iridescence>0,ve=i.sheen>0,ye=i.transmission>0,be=fe&&!!i.anisotropyMap,xe=pe&&!!i.clearcoatMap,Se=pe&&!!i.clearcoatNormalMap,Ce=pe&&!!i.clearcoatRoughnessMap,we=me&&!!i.diffuseRoughnessMap,Te=_e&&!!i.iridescenceMap,Ee=_e&&!!i.iridescenceThicknessMap,De=ve&&!!i.sheenColorMap,Oe=ve&&!!i.sheenRoughnessMap,ke=!!i.specularMap,Ae=!!i.specularColorMap,je=!!i.specularIntensityMap,Me=ye&&!!i.transmissionMap,Ne=ye&&!!i.thicknessMap,Pe=!!i.gradientMap,Fe=!!i.alphaMap,P=i.alphaTest>0,Ie=!!i.alphaHash,Le=!!i.extensions,Re=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Re=e.toneMapping);let F=ie?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,ze={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:ne,batchingColor:ne&&m._colorsTexture!==null,instancing:te,instancingColor:te&&m.instanceColor!==null,instancingMorph:te&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:W.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:j,matcap:re,envMap:M,envMapMode:M&&b.mapping,envMapPMREM:ie,envMapMaxLod:ie?F.length-1:null,envMapSize:ie?F[0].width:null,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&ol(i.normalMap.format),metalnessMap:N,roughnessMap:de,anisotropy:fe,anisotropyMap:be,clearcoat:pe,clearcoatMap:xe,clearcoatNormalMap:Se,clearcoatRoughnessMap:Ce,diffuseRoughness:me,diffuseRoughnessMap:we,dispersion:he,retroreflection:ge,iridescence:_e,iridescenceMap:Te,iridescenceThicknessMap:Ee,sheen:ve,sheenColorMap:De,sheenRoughnessMap:Oe,specularMap:ke,specularColorMap:Ae,specularIntensityMap:je,transmission:ye,transmissionMap:Me,thicknessMap:Ne,gradientMap:Pe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Fe,alphaTest:P,alphaHash:Ie,combine:i.combine,mapUv:j&&p(i.map.channel),aoMapUv:ae&&p(i.aoMap.channel),lightMapUv:oe&&p(i.lightMap.channel),bumpMapUv:se&&p(i.bumpMap.channel),normalMapUv:ce&&p(i.normalMap.channel),displacementMapUv:le&&p(i.displacementMap.channel),emissiveMapUv:ue&&p(i.emissiveMap.channel),metalnessMapUv:N&&p(i.metalnessMap.channel),roughnessMapUv:de&&p(i.roughnessMap.channel),anisotropyMapUv:be&&p(i.anisotropyMap.channel),clearcoatMapUv:xe&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:Se&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ce&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:we&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:Te&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:De&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&p(i.sheenRoughnessMap.channel),specularMapUv:ke&&p(i.specularMap.channel),specularColorMapUv:Ae&&p(i.specularColorMap.channel),specularIntensityMapUv:je&&p(i.specularIntensityMap.channel),transmissionMapUv:Me&&p(i.transmissionMap.channel),thicknessMapUv:Ne&&p(i.thicknessMap.channel),alphaMapUv:Fe&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ce||fe),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(j||Fe),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Re,decodeVideoTexture:j&&i.map.isVideoTexture===!0&&W.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&W.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Le&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Le&&i.extensions.multiDraw===!0||ne)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return ze.vertexUv1s=c.has(1),ze.vertexUv2s=c.has(2),ze.vertexUv3s=c.has(3),c.clear(),ze}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=Fo[t];n=_a.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new nl(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function cl(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function ll(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ul(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function dl(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||ll),r.length>1&&r.sort(t||ul),i.length>1&&i.sort(t||ul)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function fl(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new dl,e.set(t,[i])):n>=r.length?(i=new dl,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function pl(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new H,color:new K};break;case`SpotLight`:n={position:new H,direction:new H,color:new K,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new H,color:new K,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new H,skyColor:new K,groundColor:new K};break;case`RectAreaLight`:n={color:new K,position:new H,halfWidth:new H,halfHeight:new H}}return e[t.id]=n,n}}}function ml(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var hl=0;function gl(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function _l(e){let t=new pl,n=ml(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new H);let i=new H,a=new G,o=new G;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(gl);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=J.LTC_FLOAT_1,r.rectAreaLTC2=J.LTC_FLOAT_2):(r.rectAreaLTC1=J.LTC_HALF_1,r.rectAreaLTC2=J.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=hl++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function vl(e){let t=new _l(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function yl(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new vl(e),t.set(n,[a])):r>=i.length?(a=new vl(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var bl=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xl=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Sl=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],Cl=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],wl=new G,Tl=new H,El=new H;function Dl(e,t,n){let r=new Ni,a=new V,o=new V,c=new jt,l=new wa,u=new Ta,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},m=new ba({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new V},radius:{value:4}},vertexShader:bl,fragmentShader:xl}),v=m.clone();v.defines.HORIZONTAL_PASS=1;let y=new pr;y.setAttribute(`position`,new Qn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new ri(y,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(R(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.state;m.setBlending(0),m.buffers.depth.getReversed()===!0?m.buffers.color.setClear(0,0,0,0):m.buffers.color.setClear(1,1,1,1),m.buffers.depth.setTest(!0),m.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){R(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),o.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(o.x=Math.floor(f/y.x),a.x=o.x*y.x,p.mapSize.x=o.x),a.y>f&&(o.y=Math.floor(f/y.y),a.y=o.y*y.y,p.mapSize.y=o.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){R(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Nt(a.x,a.y,{format:A,type:_,minFilter:s,magFilter:s,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new ia(a.x,a.y,g),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=E,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=i,p.map.depthTexture.magFilter=i}else d.isPointLight?(p.map=new Wo(a.x),p.map.depthTexture=new aa(a.x,h)):(p.map=new Nt(a.x,a.y),p.map.depthTexture=new ia(a.x,a.y,h)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=E,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=s,p.map.depthTexture.magFilter=s):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=i,p.map.depthTexture.magFilter=i);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);let S=p.camera.layers.mask&4294967294?p.camera.layers:l.layers;for(let t=0;t<x;t++){let i=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Tl.setFromMatrixPosition(d.matrixWorld),e.position.copy(Tl),El.copy(e.position),El.add(Sl[t]),e.up.copy(Cl[t]),e.lookAt(El),e.updateMatrixWorld(),n.makeTranslation(-Tl.x,-Tl.y,-Tl.z),wl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(wl,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),m.viewport(c)}r=p.getFrustum(t),T(n,l,i,d,S,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null?n.mapPass=new Nt(a.x,a.y,{format:A,type:_}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),m.uniforms.shadow_pass.value=n.map.depthTexture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,m,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=w(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)T(l[e],i,a,o,s,c)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Ol(e,t){function n(){let t=!1,n=new jt,r=null,i=new jt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?N(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=nt[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?N(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new K(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ne=!1,j=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),ne=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(re)[1]),ne=j>=1);let M=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new jt().fromArray(ae),ce=new jt().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),N(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),N(e.CULL_FACE),_e(0);function N(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(de(e.BLEND),g=!1);else if(g===!1&&(N(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:z(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:z(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:z(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:z(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):N(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?N(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(N(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function xe(t){t!==k&&(ne&&e.lineWidth(t),k=t)}function Se(t,n,r){t?(N(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?N(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+te-1),M!==t&&(e.activeTexture(t),M=t)}function Te(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+te-1:M);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){z(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){z(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Fe(){try{e.texImage2D(...arguments)}catch(e){z(`WebGLState:`,e)}}function P(){try{e.texImage3D(...arguments)}catch(e){z(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Re(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function F(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function ze(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function I(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},M=null,ie={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new K(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:N,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:Fe,texImage3D:P,pixelStorei:Le,getParameter:Ie,updateUBOMapping:ze,uniformBlockBinding:I,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:Re,viewport:F,reset:Be}}function kl(e,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new V,y=new WeakMap,b=new Set,x,S=new WeakMap,C=new Set,w=new FinalizationRegistry(e=>C.delete(e)),T=!1;try{T=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function E(e,t){return T?new OffscreenCanvas(e,t):Ye(`canvas`)}function O(e,t,n){let r=1,i=Be(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=E(n,a));let o=t?E(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),R(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&R(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function k(e){return e.generateMipmaps}function A(t){e.generateMipmap(t)}function ee(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function te(t,n,r,i,a,o=!1){if(t!==null){if(e[t]!==void 0)return e[t];R(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+t+`'`)}let s;i&&(s=u.get(`EXT_texture_norm16`),s||R(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let c=n;if(n===e.RED&&(r===e.FLOAT&&(c=e.R32F),r===e.HALF_FLOAT&&(c=e.R16F),r===e.UNSIGNED_BYTE&&(c=e.R8),r===e.UNSIGNED_SHORT&&s&&(c=s.R16_EXT),r===e.SHORT&&s&&(c=s.R16_SNORM_EXT)),n===e.RED_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.R8UI),r===e.UNSIGNED_SHORT&&(c=e.R16UI),r===e.UNSIGNED_INT&&(c=e.R32UI),r===e.BYTE&&(c=e.R8I),r===e.SHORT&&(c=e.R16I),r===e.INT&&(c=e.R32I)),n===e.RG&&(r===e.FLOAT&&(c=e.RG32F),r===e.HALF_FLOAT&&(c=e.RG16F),r===e.UNSIGNED_BYTE&&(c=e.RG8),r===e.UNSIGNED_SHORT&&s&&(c=s.RG16_EXT),r===e.SHORT&&s&&(c=s.RG16_SNORM_EXT)),n===e.RG_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.RG8UI),r===e.UNSIGNED_SHORT&&(c=e.RG16UI),r===e.UNSIGNED_INT&&(c=e.RG32UI),r===e.BYTE&&(c=e.RG8I),r===e.SHORT&&(c=e.RG16I),r===e.INT&&(c=e.RG32I)),n===e.RGB_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.RGB8UI),r===e.UNSIGNED_SHORT&&(c=e.RGB16UI),r===e.UNSIGNED_INT&&(c=e.RGB32UI),r===e.BYTE&&(c=e.RGB8I),r===e.SHORT&&(c=e.RGB16I),r===e.INT&&(c=e.RGB32I)),n===e.RGBA_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.RGBA8UI),r===e.UNSIGNED_SHORT&&(c=e.RGBA16UI),r===e.UNSIGNED_INT&&(c=e.RGBA32UI),r===e.BYTE&&(c=e.RGBA8I),r===e.SHORT&&(c=e.RGBA16I),r===e.INT&&(c=e.RGBA32I)),n===e.RGB&&(r===e.UNSIGNED_SHORT&&s&&(c=s.RGB16_EXT),r===e.SHORT&&s&&(c=s.RGB16_SNORM_EXT),r===e.UNSIGNED_INT_5_9_9_9_REV&&(c=e.RGB9_E5),r===e.UNSIGNED_INT_10F_11F_11F_REV&&(c=e.R11F_G11F_B10F)),n===e.RGBA){let t=o?Ve:W.getTransfer(a);r===e.FLOAT&&(c=e.RGBA32F),r===e.HALF_FLOAT&&(c=e.RGBA16F),r===e.UNSIGNED_BYTE&&(c=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),r===e.UNSIGNED_SHORT&&s&&(c=s.RGBA16_EXT),r===e.SHORT&&s&&(c=s.RGBA16_SNORM_EXT),r===e.UNSIGNED_SHORT_4_4_4_4&&(c=e.RGBA4),r===e.UNSIGNED_SHORT_5_5_5_1&&(c=e.RGB5_A1)}return(c===e.R16F||c===e.R32F||c===e.RG16F||c===e.RG32F||c===e.RGBA16F||c===e.RGBA32F)&&u.get(`EXT_color_buffer_float`),c}function ne(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,R(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function j(e,t){return k(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function re(e){let t=new WeakRef(e);f.get(e).__ref=t,C.add(t),w.register(e,t,t)}function M(e){let t=f.get(e).__ref;t!==void 0&&(C.delete(t),w.unregister(t))}function ie(e){oe(e.target)}function ae(e){se(e.target)}function oe(e){e.removeEventListener(`dispose`,ie),M(e),le(e),e.isVideoTexture&&y.delete(e),e.isHTMLTexture&&b.delete(e)}function se(e){e.removeEventListener(`dispose`,ae),M(e),N(e)}function ce(){for(let e of C){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?se(t):oe(t))}C.clear(),b.clear()}function le(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&ue(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function ue(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=S.get(r);delete i[n.__cacheKey],h.memory.textures--}function N(t){let n=f.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let r=t.depthTexture;if(r&&r.renderTarget===t&&oe(r),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=f.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(i[t])}f.remove(t)}let de=0;function fe(){de=0}function pe(){return de}function me(e){de=e}function he(){let e=de;return e>=p.maxTextures&&R(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),de+=1,e}function ge(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function _e(t,n){let r=f.get(t);if(t.isVideoTexture&&ze(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&r.__version!==t.version){let e=t.image;if(e===null)R(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)R(`WebGLRenderer: Texture marked for update but image is incomplete`);else{Oe(r,t,n);return}}else t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null);d.bindTexture(e.TEXTURE_2D,r.__webglTexture,e.TEXTURE0+n)}function ve(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?Oe(r,t,n):(t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null),d.bindTexture(e.TEXTURE_2D_ARRAY,r.__webglTexture,e.TEXTURE0+n))}function ye(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?Oe(r,t,n):d.bindTexture(e.TEXTURE_3D,r.__webglTexture,e.TEXTURE0+n)}function be(t,n){let r=f.get(t);t.version>0&&r.__version!==t.version?ke(r,t,n):d.bindTexture(e.TEXTURE_CUBE_MAP,r.__webglTexture,e.TEXTURE0+n)}let xe={[t]:e.REPEAT,[n]:e.CLAMP_TO_EDGE,[r]:e.MIRRORED_REPEAT},Se={[i]:e.NEAREST,[a]:e.NEAREST_MIPMAP_NEAREST,[o]:e.NEAREST_MIPMAP_LINEAR,[s]:e.LINEAR,[c]:e.LINEAR_MIPMAP_NEAREST,[l]:e.LINEAR_MIPMAP_LINEAR},Ce={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function we(t,n){if(n.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(n.magFilter===1006||n.magFilter===1007||n.magFilter===1005||n.magFilter===1008||n.minFilter===1006||n.minFilter===1007||n.minFilter===1005||n.minFilter===1008)&&R(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(t,e.TEXTURE_WRAP_S,xe[n.wrapS]),e.texParameteri(t,e.TEXTURE_WRAP_T,xe[n.wrapT]),(t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY)&&e.texParameteri(t,e.TEXTURE_WRAP_R,xe[n.wrapR]),e.texParameteri(t,e.TEXTURE_MAG_FILTER,Se[n.magFilter]),e.texParameteri(t,e.TEXTURE_MIN_FILTER,Se[n.minFilter]),n.compareFunction&&(e.texParameteri(t,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(t,e.TEXTURE_COMPARE_FUNC,Ce[n.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(n.magFilter===1003||n.minFilter!==1005&&n.minFilter!==1008||n.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(n.anisotropy>1||f.get(n).__currentAnisotropy){let r=u.get(`EXT_texture_filter_anisotropic`);e.texParameterf(t,r.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(n.anisotropy,p.getMaxAnisotropy())),f.get(n).__currentAnisotropy=n.anisotropy}}}function Te(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,ie),re(n));let i=n.source,a=S.get(i);a===void 0&&(a={},S.set(i,a));let o=ge(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&ue(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function Ee(e,t,n){return Math.floor(Math.floor(e/n)/t)}function De(t,n,r,i){let a=t.updateRanges;if(a.length===0)d.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,r,i,n.data);else{a.sort((e,t)=>e.start-t.start);let o=0;for(let e=1;e<a.length;e++){let t=a[o],r=a[e],i=t.start+t.count,s=Ee(r.start,n.width,4),c=Ee(t.start,n.width,4);r.start<=i+1&&s===c&&Ee(r.start+r.count-1,n.width,4)===s?t.count=Math.max(t.count,r.start+r.count-t.start):(++o,a[o]=r)}a.length=o+1;let s=d.getParameter(e.UNPACK_ROW_LENGTH),c=d.getParameter(e.UNPACK_SKIP_PIXELS),l=d.getParameter(e.UNPACK_SKIP_ROWS);d.pixelStorei(e.UNPACK_ROW_LENGTH,n.width);for(let t=0,o=a.length;t<o;t++){let o=a[t],s=Math.floor(o.start/4),c=Math.ceil(o.count/4),l=s%n.width,u=Math.floor(s/n.width),f=c;d.pixelStorei(e.UNPACK_SKIP_PIXELS,l),d.pixelStorei(e.UNPACK_SKIP_ROWS,u),d.texSubImage2D(e.TEXTURE_2D,0,l,u,f,1,r,i,n.data)}t.clearUpdateRanges(),d.pixelStorei(e.UNPACK_ROW_LENGTH,s),d.pixelStorei(e.UNPACK_SKIP_PIXELS,c),d.pixelStorei(e.UNPACK_SKIP_ROWS,l)}}function Oe(t,n,r){let i=e.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(i=e.TEXTURE_2D_ARRAY),n.isData3DTexture&&(i=e.TEXTURE_3D);let a=Te(t,n),o=n.source;d.bindTexture(i,t.__webglTexture,e.TEXTURE0+r);let s=f.get(o);if(o.version!==s.__version||a===!0){if(d.activeTexture(e.TEXTURE0+r),!(typeof ImageBitmap<`u`&&n.image instanceof ImageBitmap)){let t=W.getPrimaries(W.workingColorSpace),r=n.colorSpace===``?null:W.getPrimaries(n.colorSpace),i=n.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment);let t=O(n.image,!1,p.maxTextureSize);t=I(n,t);let c=m.convert(n.format,n.colorSpace),l=m.convert(n.type),u=te(n.internalFormat,c,l,n.normalized,n.colorSpace,n.isVideoTexture);we(i,n);let f,h=n.mipmaps,g=n.isVideoTexture!==!0,_=s.__version===void 0||a===!0,v=o.dataReady,y=j(n,t);if(n.isDepthTexture)u=ne(n.format===D,n.type),_&&(g?d.texStorage2D(e.TEXTURE_2D,1,u,t.width,t.height):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,null));else if(n.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data);n.generateMipmaps=!1}else g?(_&&d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height),v&&De(n,t,c,l)):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,t.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){g&&_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,t.depth);for(let r=0,i=h.length;r<i;r++)if(f=h[r],n.format!==1023){if(c!==null){if(g){if(v){if(n.layerUpdates.size>0){let t=jo(f.width,f.height,n.format,n.type);for(let i of n.layerUpdates){let n=f.data.subarray(i*t/f.data.BYTES_PER_ELEMENT,(i+1)*t/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,i,f.width,f.height,1,c,n)}}else d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,f.data)}}else d.compressedTexImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,f.data,0,0)}else R(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,l,f.data):d.texImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,c,l,f.data);n.layerUpdates.size>0&&n.clearLayerUpdates()}else{g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,r=h.length;t<r;t++)f=h[t],n.format===1023?g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data):c===null?R(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,f.data):d.compressedTexImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,f.data)}}else if(n.isDataArrayTexture){if(g){if(_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,t.width,t.height,t.depth),v){if(n.layerUpdates.size>0){let r=jo(t.width,t.height,n.format,n.type);for(let i of n.layerUpdates){let n=t.data.subarray(i*r/t.data.BYTES_PER_ELEMENT,(i+1)*r/t.data.BYTES_PER_ELEMENT);d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,i,t.width,t.height,1,c,l,n)}n.clearLayerUpdates()}else d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)}}else d.texImage3D(e.TEXTURE_2D_ARRAY,0,u,t.width,t.height,t.depth,0,c,l,t.data)}else if(n.isData3DTexture)g?(_&&d.texStorage3D(e.TEXTURE_3D,y,u,t.width,t.height,t.depth),v&&d.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)):d.texImage3D(e.TEXTURE_3D,0,u,t.width,t.height,t.depth,0,c,l,t.data);else if(n.isFramebufferTexture){if(_){if(g)d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height);else{let n=t.width,r=t.height;for(let t=0;t<y;t++)d.texImage2D(e.TEXTURE_2D,t,u,n,r,0,c,l,null),n>>=1,r>>=1}}}else if(n.isHTMLTexture){if(`texElementImage2D`in e){let r=e.canvas;if(r.hasAttribute(`layoutsubtree`)||r.setAttribute(`layoutsubtree`,`true`),t.parentNode!==r){r.appendChild(t),b.add(n),r.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},r.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let t=Be(h[0]);d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height)}for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,c,l,f):d.texImage2D(e.TEXTURE_2D,t,u,c,l,f);n.generateMipmaps=!1}else if(g){if(_){let n=Be(t);d.texStorage2D(e.TEXTURE_2D,y,u,n.width,n.height)}v&&d.texSubImage2D(e.TEXTURE_2D,0,0,0,c,l,t)}else d.texImage2D(e.TEXTURE_2D,0,u,c,l,t);k(n)&&n.mipmapsAutoUpdate===!0&&A(i),s.__version=o.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function ke(t,n,r){if(n.image.length!==6)return;let i=Te(t,n),a=n.source;d.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+r);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(e.TEXTURE0+r);let t=W.getPrimaries(W.workingColorSpace),s=n.colorSpace===``?null:W.getPrimaries(n.colorSpace),c=n.colorSpace===``||t===s?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let l=n.isCompressedTexture||n.image[0].isCompressedTexture,u=n.image[0]&&n.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!l&&!u?f[e]=O(n.image[e],!0,p.maxCubemapSize):f[e]=u?n.image[e].image:n.image[e],f[e]=I(n,f[e]);let h=f[0],g=m.convert(n.format,n.colorSpace),_=m.convert(n.type),v=te(n.internalFormat,g,_,n.normalized,n.colorSpace),y=n.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=j(n,h);we(e.TEXTURE_CUBE_MAP,n);let C;if(n.isDepthTexture){if(v=ne(n.format===D,n.type),b){if(y)d.texStorage2D(e.TEXTURE_CUBE_MAP,1,v,h.width,h.height);else for(let t=0;t<6;t++)d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,h.width,h.height,0,g,_,null)}}else if(l){y&&b&&d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?R(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):d.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=n.mipmaps,y&&b){C.length>0&&S++;let t=Be(f[0]);d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(u){y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let n=0;n<C.length;n++){let r=C[n].image[t].image;y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,r.width,r.height,g,_,r.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,r.width,r.height,0,g,_,r.data)}}else{y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let n=0;n<C.length;n++){let r=C[n];y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,g,_,r.image[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,g,_,r.image[t])}}}k(n)&&n.mipmapsAutoUpdate===!0&&A(e.TEXTURE_CUBE_MAP),o.__version=a.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function Ae(t,n,r,i,a,o){let s=m.convert(r.format,r.colorSpace),c=m.convert(r.type),l=te(r.internalFormat,s,c,r.normalized,r.colorSpace),u=f.get(n),p=f.get(r);if(p.__renderTarget=n,!u.__hasExternalTextures){let t=Math.max(1,n.width>>o),r=Math.max(1,n.height>>o);a===e.TEXTURE_3D||a===e.TEXTURE_2D_ARRAY?d.texImage3D(a,o,l,t,r,n.depth,0,s,c,null):d.texImage2D(a,o,l,t,r,0,s,c,null)}d.bindFramebuffer(e.FRAMEBUFFER,t),F(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,i,a,p.__webglTexture,0,Re(n)):(a===e.TEXTURE_2D||a>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&a<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,i,a,p.__webglTexture,o),d.bindFramebuffer(e.FRAMEBUFFER,null)}function je(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=ne(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;F(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Re(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Re(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=te(a.internalFormat,o,s,a.normalized,a.colorSpace);F(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Re(n),c,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Re(n),c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Me(t,n,r){let i=n.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(e.FRAMEBUFFER,t),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let a=f.get(n.depthTexture);a.__renderTarget=n;let o=i?n.depthTexture.image[0]:n.depthTexture.image;a.__webglTexture&&o.width===n.width&&o.height===n.height||(o.width=n.width,o.height=n.height,n.depthTexture.needsUpdate=!0),i?be(n.depthTexture,0):_e(n.depthTexture,0);let s=a.__webglTexture,c=Re(n),l=i?e.TEXTURE_CUBE_MAP_POSITIVE_X+r:e.TEXTURE_2D,u=n.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(n.depthTexture.format===1026)F(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else if(n.depthTexture.format===1027)F(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ne(t){let n=f.get(t),r=t.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),e){let t=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),n.__depthDisposeCallback=t}n.__boundDepthTexture=e}if(t.depthTexture&&!n.__autoAllocateDepthBuffer){if(r)for(let e=0;e<6;e++)Me(n.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?Me(n.__webglFramebuffer[0],t,0):Me(n.__webglFramebuffer,t,0)}else if(r){n.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[r]),n.__webglDepthbuffer[r]===void 0)n.__webglDepthbuffer[r]=e.createRenderbuffer(),je(n.__webglDepthbuffer[r],t,!1);else{let i=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[0]):d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=e.createRenderbuffer(),je(n.__webglDepthbuffer,t,!1);else{let r=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,r,e.RENDERBUFFER,i)}d.bindFramebuffer(e.FRAMEBUFFER,null)}function Pe(t,n,r){let i=f.get(t);n!==void 0&&Ae(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&Ne(t)}function Fe(t){let n=t.texture,r=f.get(t),i=f.get(n);t.addEventListener(`dispose`,ae),re(t);let a=t.textures,o=t.isWebGLCubeRenderTarget===!0,s=a.length>1;if(s||(i.__webglTexture===void 0&&(i.__webglTexture=e.createTexture()),i.__version=n.version,h.memory.textures++),o){r.__webglFramebuffer=[];for(let t=0;t<6;t++)if(n.mipmaps.length>0){r.__webglFramebuffer[t]=[];for(let i=0;i<n.mipmaps.length;i++)r.__webglFramebuffer[t][i]=e.createFramebuffer()}else r.__webglFramebuffer[t]=e.createFramebuffer()}else{if(n.mipmaps.length>0){r.__webglFramebuffer=[];for(let t=0;t<n.mipmaps.length;t++)r.__webglFramebuffer[t]=e.createFramebuffer()}else r.__webglFramebuffer=e.createFramebuffer();if(s)for(let t=0,n=a.length;t<n;t++){let n=f.get(a[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&F(t)===!1){r.__webglMultisampledFramebuffer=e.createFramebuffer(),r.__webglColorRenderbuffer=[],d.bindFramebuffer(e.FRAMEBUFFER,r.__webglMultisampledFramebuffer);for(let n=0;n<a.length;n++){let i=a[n];r.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.__webglColorRenderbuffer[n]);let o=m.convert(i.format,i.colorSpace),s=m.convert(i.type),c=te(i.internalFormat,o,s,i.normalized,i.colorSpace,t.isXRRenderTarget===!0),l=Re(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,r.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(r.__webglDepthRenderbuffer=e.createRenderbuffer(),je(r.__webglDepthRenderbuffer,t,!0)),d.bindFramebuffer(e.FRAMEBUFFER,null)}}if(o){d.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture),we(e.TEXTURE_CUBE_MAP,n);for(let i=0;i<6;i++)if(n.mipmaps.length>0)for(let a=0;a<n.mipmaps.length;a++)Ae(r.__webglFramebuffer[i][a],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,a);else Ae(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,0);k(n)?A(e.TEXTURE_CUBE_MAP):n.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,n.mipmaps.length-1),d.unbindTexture()}else if(s){for(let n=0,i=a.length;n<i;n++){let i=a[n],o=f.get(i),s=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(s=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(s,o.__webglTexture),we(s,i),Ae(r.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0+n,s,0),k(i)&&A(s)}d.unbindTexture()}else{let a=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(a=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(a,i.__webglTexture),we(a,n),n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)Ae(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,a,i);else Ae(r.__webglFramebuffer,t,n,e.COLOR_ATTACHMENT0,a,0);k(n)?A(a):n.mipmaps.length>0&&e.texParameteri(a,e.TEXTURE_MAX_LEVEL,n.mipmaps.length-1),d.unbindTexture()}t.depthBuffer&&Ne(t)}function P(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(k(r)&&r.mipmapsAutoUpdate===!0){let t=ee(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),A(t),d.unbindTexture()}}}let Ie=[];function Le(t){if(t.samples>0){if(F(t)===!1){let n=t.textures,r=t.width,i=t.height,a=e.COLOR_BUFFER_BIT,o=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,s=f.get(t),c=n.length>1;if(c)for(let t=0;t<n.length;t++)d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);d.bindFramebuffer(e.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let l=0;l<n.length;l++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(a|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(a|=e.STENCIL_BUFFER_BIT)),c){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,s.__webglColorRenderbuffer[l]);let t=f.get(n[l]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,r,i,0,0,r,i,a,e.NEAREST),_===!0&&(Ie.length=0,Ie.push(e.COLOR_ATTACHMENT0+l),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Ie.push(o),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ie))}if(d.bindFramebuffer(e.READ_FRAMEBUFFER,null),d.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),c)for(let t=0;t<n.length;t++){d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,s.__webglColorRenderbuffer[t]);let r=f.get(n[t]).__webglTexture;d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,r,0)}d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Re(e){return Math.min(p.maxSamples,e.samples)}function F(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function ze(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function I(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(W.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&R(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):z(`WebGLTextures: Unsupported texture color space:`,n)),t}function Be(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=he,this.resetTextureUnits=fe,this.getTextureUnits=pe,this.setTextureUnits=me,this.setTexture2D=_e,this.setTexture2DArray=ve,this.setTexture3D=ye,this.setTextureCube=be,this.rebindTextures=Pe,this.setupRenderTarget=Fe,this.updateRenderTargetMipmap=P,this.updateMultisampleRenderTarget=Le,this.setupDepthRenderbuffer=Ne,this.setupFrameBufferTexture=Ae,this.useMultisampledRTT=F,this.dispose=ce}function Al(e,t){function n(n,r=``){let i,a=W.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var jl=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ml=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Nl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new oa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new ba({vertexShader:jl,fragmentShader:Ml,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ri(new la(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Pl=class extends rt{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,d=null,f=null,p=null,m=null,g=typeof XRWebGLBinding<`u`,_=new Nl,v={},y=t.getContextAttributes(),x=null,S=null,C=[],w=[],O=new V,k=null,A=null,ee=new ao;ee.viewport=new jt;let te=new ao;te.viewport=new jt;let ne=[ee,te],j=new go,re=null,M=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new fn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new fn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new fn,C[e]=t),t.getHandSpace()};function ie(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ae(){r.removeEventListener(`select`,ie),r.removeEventListener(`selectstart`,ie),r.removeEventListener(`selectend`,ie),r.removeEventListener(`squeeze`,ie),r.removeEventListener(`squeezestart`,ie),r.removeEventListener(`squeezeend`,ie),r.removeEventListener(`end`,ae),r.removeEventListener(`inputsourceschange`,oe);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}re=null,M=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,N.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(O.width,O.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&R(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&R(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,ie),r.addEventListener(`selectstart`,ie),r.addEventListener(`selectend`,ie),r.addEventListener(`squeeze`,ie),r.addEventListener(`squeezestart`,ie),r.addEventListener(`squeezeend`,ie),r.addEventListener(`end`,ae),r.addEventListener(`inputsourceschange`,oe),y.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(O),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?D:E,a=y.stencil?b:h);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Nt(f.textureWidth,f.textureHeight,{format:T,type:u,depthTexture:new ia(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Nt(p.framebufferWidth,p.framebufferHeight,{format:T,type:u,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),N.setContext(r),N.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function oe(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}function se(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=te.near=ee.near=t,j.far=te.far=ee.far=n,(re!==j.near||M!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),re=j.near,M=j.far),j.layers.mask=e.layers.mask|6,ee.layers.mask=j.layers.mask&-5,te.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;se(j,i);for(let e=0;e<a.length;e++)se(a[e],i);j.projectionMatrix.copy(ee.projectionMatrix),j.projectionMatrixInverse.copy(ee.projectionMatrixInverse),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),ce(e,j,i)};function ce(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ot*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let le=null;function ue(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=ne[n];o===void 0&&(o=new ao,o.layers.enable(n),o.viewport=new jt,ne[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new oa,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}le&&le(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let N=new No;N.setAnimationLoop(ue),this.setAnimationLoop=function(e){le=e},this.dispose=function(){}}},Fl=new G,Il=new U;Il.set(-1,0,0,0,1,0,0,0,1);function Ll(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ga(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Fl.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Il),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Rl(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?R(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):R(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var zl=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Bl=null;function Vl(){return Bl===null&&(Bl=new _i(zl,16,16,A,_),Bl.name=`DFG_LUT`,Bl.minFilter=s,Bl.magFilter=s,Bl.wrapS=n,Bl.wrapT=n,Bl.generateMipmaps=!1,Bl.needsUpdate=!0),Bl}var Hl=class{constructor(e={}){let{canvas:t=Xe(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:m=!1,outputBufferType:g=u}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=g,C=new Set([te,ee,k]),w=new Set([u,h,p,b,v,y]),T=new Uint32Array(4),E=new Int32Array(4),D={textures:[],min:[],max:[],resolution:[]},O=null,A=null,ne=[],j=[],re=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ie=!1,ae=null,oe=null,se=null,ce=null;this._outputColorSpace=Be;let le=0,ue=0,N=null,de=-1,fe=null,pe=new jt,me=new jt,he=null,ge=new K(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new jt(0,0,ve,ye),we=new jt(0,0,ve,ye),Te=!1,Ee=new Ni,De=new Fi,Oe=!1,ke=!1,Ae=new G,je=new H,Me=new jt,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pe=!1;function Fe(){return N===null?be:1}let P=n;function Ie(e,n){return t.getContext(e,n)}let Le,Re,F,ze,I,L,Ve,He,Ue,We,Ge,qe,Je,Ye,Ze,$e,et,nt,rt,it,at,ot,st;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,lt,!1),t.addEventListener(`webglcontextrestored`,ut,!1),t.addEventListener(`webglcontextcreationerror`,dt,!1),P===null){let t=`webgl2`;if(P=Ie(t,e),P===null)throw Ie(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}B()}catch(e){throw t.removeEventListener(`webglcontextlost`,lt,!1),t.removeEventListener(`webglcontextrestored`,ut,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),z(`WebGLRenderer: `+e.message),e}function B(){Le=new cs(P),Le.init(),at=new Al(P,Le),Re=new Ho(P,Le,e,at),F=new Ol(P,Le),Re.reversedDepthBuffer&&m&&F.buffers.depth.setReversed(!0),oe=P.createFramebuffer(),se=P.createFramebuffer(),ce=P.createFramebuffer(),ze=new ds(P),I=new cl,L=new kl(P,Le,F,I,Re,at,ze),Ve=new ss(M),He=new Po(P),ot=new Bo(P,He),Ue=new ls(P,He,ze,ot),We=new ps(P,Ue,He,ot,ze),nt=new fs(P,Re,L),Ze=new Uo(I),Ge=new sl(M,Ve,Le,Re,ot,Ze),qe=new Ll(M,I),Je=new fl,Ye=new yl(Le),et=new zo(M,Ve,F,We,x,s),$e=new Dl(M,We,Re),st=new Rl(P,ze,Re,F),rt=new Vo(P,Le,ze),it=new us(P,Le,ze),ze.programs=Ge.programs,M.capabilities=Re,M.extensions=Le,M.properties=I,M.renderLists=Je,M.shadowMap=$e,M.state=F,M.info=ze}S!==1009&&(re=new hs(S,t.width,t.height,o,r,i));let ct=new Pl(M,P);this.xr=ct,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Le.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Le.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){ct.isPresenting?R(`WebGLRenderer: Can't change size while VR device is presenting.`):(ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),re!==null&&re.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009)z(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){R(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}re.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),F.viewport(pe.copy(Ce).multiplyScalar(Fe()).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),F.scissor(me.copy(we).multiplyScalar(Fe()).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){F.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy(et.getClearColor())},this.setClearColor=function(){et.setClearColor(...arguments)},this.getClearAlpha=function(){return et.getClearAlpha()},this.setClearAlpha=function(){et.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=C.has(t)}if(e){let e=N.texture.type,t=w.has(e),n=et.getClearColor(),r=et.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,P.clearBufferuiv(P.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,P.clearBufferiv(P.COLOR,0,E))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ae=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,lt,!1),t.removeEventListener(`webglcontextrestored`,ut,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),et.dispose(),Je.dispose(),Ye.dispose(),L.dispose(),I.dispose(),Ve.dispose(),We.dispose(),Ue.dispose(),ot.dispose(),st.dispose(),Ge.dispose(),ct.dispose(),ct.removeEventListener(`sessionstart`,U),ct.removeEventListener(`sessionend`,_t),vt.stop()};function lt(e){e.preventDefault(),Qe(`WebGLRenderer: Context Lost.`),ie=!0}function ut(){Qe(`WebGLRenderer: Context Restored.`),ie=!1;let e=ze.autoReset,t=$e.enabled,n=$e.autoUpdate,r=$e.needsUpdate,i=$e.type;B(),ze.autoReset=e,$e.enabled=t,$e.autoUpdate=n,$e.needsUpdate=r,$e.type=i}function dt(e){z(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ft(e){let t=e.target;t.removeEventListener(`dispose`,ft),pt(t)}function pt(e){V(e),I.remove(e)}function V(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ge.releaseProgram(e)}),e.isShaderMaterial&&Ge.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ne);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=kt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ot.setup(i,r,s,n,c);let h,g=rt;if(c!==null&&(h=He.get(c),g=it,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Fe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Fe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Le.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?He.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function mt(e,t,n,r){ae!==null&&e.isNodeMaterial&&ae.setObject(r,e),Oe===!0&&Ze.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Tt(e,t,r),e.side=0,e.needsUpdate=!0,Tt(e,t,r),e.side=2):Tt(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),ae!==null&&ae.renderStart(e,t,n),A=Ye.get(n),A.init(t),j.push(A),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(A.pushLight(e),e.castShadow&&A.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(A.pushLight(e),e.castShadow&&A.pushShadow(e))}),A.setupLights(),ae!==null&&ae.updateLights(A.state.lightsArray),ke=this.localClippingEnabled,Oe=Ze.init(this.clippingPlanes,ke),Oe===!0&&Ze.setGlobalState(this.clippingPlanes,t),ae!==null&&$e.render(A.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];mt(o,n,t,e),r.add(o)}else mt(i,n,t,e),r.add(i)}}),A=j.pop(),ae!==null&&ae.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=I.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Le.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ht=null;function gt(e){ht&&ht(e)}function U(){vt.stop()}function _t(){vt.start()}let vt=new No;vt.setAnimationLoop(gt),typeof self<`u`&&vt.setContext(self),this.setAnimationLoop=function(e){ht=e,ct.setAnimationLoop(e),e===null?vt.stop():vt.start()},ct.addEventListener(`sessionstart`,U),ct.addEventListener(`sessionend`,_t),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){z(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ie===!0)return;ae!==null&&ae.renderStart(e,t);let n=ct.enabled===!0&&ct.isPresenting===!0,r=re!==null&&(N===null||n)&&re.begin(M,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),ct.enabled===!0&&ct.isPresenting===!0&&(re===null||re.isCompositing()===!1)&&(ct.cameraAutoUpdate===!0&&ct.updateCamera(t),t=ct.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,N),A=Ye.get(e,j.length),A.init(t),A.state.textureUnits=L.getTextureUnits(),j.push(A),Ae.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?De.setFromArrayCamera(t):Ee.setFromProjectionMatrix(Ae,Ke,t.reversedDepth),ke=this.localClippingEnabled,Oe=Ze.init(this.clippingPlanes,ke),O=Je.get(e,ne.length),O.init(),ne.push(O),this.info.render.frame++,ct.enabled===!0&&ct.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&yt(e,t,-1/0,M.sortObjects)}yt(e,t,0,M.sortObjects),O.finish(),ae!==null&&ae.updateLights(A.state.lightsArray),M.sortObjects===!0&&O.sort(xe,Se),Pe=ct.enabled===!1||ct.isPresenting===!1||ct.hasDepthSensing()===!1,Pe&&et.addToRenderList(O,e),this.info.autoReset===!0&&this.info.reset(),Oe===!0&&Ze.beginShadows();let i=A.state.shadowsArray;if($e.render(i,e,t),Oe===!0&&Ze.endShadows(),(r&&re.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(A.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];xt(n,r,e,a)}Pe&&et.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];bt(O,e,n,n.viewport)}}else r.length>0&&xt(n,r,e,t),Pe&&et.render(e),bt(O,e,t)}N!==null&&ue===0&&(L.updateMultisampleRenderTarget(N),L.updateRenderTargetMipmap(N)),r&&re.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),ot.resetDefaultState(),de=-1,fe=null,j.pop(),j.length>0?(A=j[j.length-1],L.setTextureUnits(A.state.textureUnits),Oe===!0&&Ze.setGlobalState(M.clippingPlanes,A.state.camera)):A=null,ne.pop(),O=ne.length>0?ne[ne.length-1]:null,ae!==null&&ae.renderEnd()};function yt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)A.pushLight(e),e.castShadow&&A.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?De:Ee;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Ae);let i=We.update(e),a=e.material;a.visible&&O.push(e,i,a,n,Me.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?De:Ee;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=We.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Me.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Me.copy(e.boundingSphere.center)),Me.applyMatrix4(e.matrixWorld).applyMatrix4(Ae)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,Me.z,s,t)}}else a.visible&&O.push(e,i,a,n,Me.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)yt(i[e],t,n,r)}function bt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;A.setupLightsView(n),Oe===!0&&Ze.setGlobalState(M.clippingPlanes,n),r&&F.viewport(pe.copy(r)),i.length>0&&St(i,t,n),a.length>0&&St(a,t,n),o.length>0&&St(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function xt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(A.state.transmissionRenderTarget[r.id]===void 0){let e=Le.has(`EXT_color_buffer_half_float`)||Le.has(`EXT_color_buffer_float`);A.state.transmissionRenderTarget[r.id]=new Nt(1,1,{generateMipmaps:!0,type:e?_:u,minFilter:l,samples:Math.max(4,Re.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:W.workingColorSpace})}let a=A.state.transmissionRenderTarget[r.id],o=r.viewport||pe;a.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let s=M.getRenderTarget(),c=M.getActiveCubeFace(),d=M.getActiveMipmapLevel();M.setRenderTarget(a),M.getClearColor(ge),_e=M.getClearAlpha(),_e<1&&M.setClearColor(16777215,.5),M.clear(),Pe&&et.render(n);let f=M.toneMapping;M.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),A.setupLightsView(r),Oe===!0&&Ze.setGlobalState(M.clippingPlanes,r),St(e,n,r),L.updateMultisampleRenderTarget(a),L.updateRenderTargetMipmap(a),Le.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(L.updateMultisampleRenderTarget(a),L.updateRenderTargetMipmap(a))}M.setRenderTarget(s,c,d),M.setClearColor(ge,_e),p!==void 0&&(r.viewport=p),M.toneMapping=f}function St(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Ct(o,t,n,s,l,c)}}function Ct(e,t,n,r,i,a){ae!==null&&i.isNodeMaterial&&ae.setObject(e,i),e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function wt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Tt(e,t,n){t.isScene!==!0&&(t=Ne);let r=I.get(e),i=A.state.lights,a=A.state.shadowsArray,o=i.state.version,s=Ge.getParameters(e,i.state,a,t,n,A.state.lightProbeGridArray),c=Ge.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ve.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ft),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Ot(e,s),d}else s.uniforms=Ge.getUniforms(e),ae!==null&&e.isNodeMaterial&&ae.build(e,n,s),e.onBeforeCompile(s,M),d=Ge.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ze.uniform),Ot(e,s),r.needsLights=Mt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=wt(A.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Et(e,t,n,r,i){let a=I.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Tt(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function Dt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=wc.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Ot(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function kt(e,t,n,r,i){t.isScene!==!0&&(t=Ne),L.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?M.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:W.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ve.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=M.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=A.state.lights;if(Oe===!0&&(ke===!0||e!==fe)){let t=e===fe&&r.id===de;Ze.setState(r,e,t)}let b=!1,x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ze.numPlanes||v.numIntersection!==Ze.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===wt(A.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(x=!0):b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;(b===!0||x===!0)&&(S=x===!0?Et(r,t,i,s,h):Tt(r,t,i),ae&&r.isNodeMaterial&&ae.onUpdateProgram(r,S,v));let C=!1,w=!1,T=!1,E=S.getUniforms(),O=v.uniforms;if(F.useProgram(S.program)&&(C=!0,w=!0,T=!0),r.id!==de&&(de=r.id,w=!0),C||fe!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),E.setValue(P,`projectionMatrix`,e.projectionMatrix),E.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=E.map.cameraPosition;t!==void 0&&t.setValue(P,je.setFromMatrixPosition(e.matrixWorld)),Re.logarithmicDepthBuffer&&E.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&E.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),fe!==e&&(fe=e,w=!0,T=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&E.setValue(P,`sunShadowMap`,y.state.sunShadowMap,L),y.state.directionalShadowMap.length>0&&E.setValue(P,`directionalShadowMap`,y.state.directionalShadowMap,L),y.state.spotShadowMap.length>0&&E.setValue(P,`spotShadowMap`,y.state.spotShadowMap,L),y.state.pointShadowMap.length>0&&E.setValue(P,`pointShadowMap`,y.state.pointShadowMap,L)),i.isSkinnedMesh){E.setOptional(P,i,`bindMatrix`),E.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),E.setValue(P,`boneTexture`,e.boneTexture,L))}i.isBatchedMesh&&(E.setOptional(P,i,`batchingTexture`),E.setValue(P,`batchingTexture`,i._matricesTexture,L),E.setOptional(P,i,`batchingIdTexture`),E.setValue(P,`batchingIdTexture`,i._indirectTexture,L),E.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&E.setValue(P,`batchingColorTexture`,i._colorsTexture,L));let k=n.morphAttributes;if((k.position!==void 0||k.normal!==void 0||k.color!==void 0)&&nt.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,E.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(O.envMapIntensity.value=t.environmentIntensity),O.dfgLUT!==void 0&&(O.dfgLUT.value=Vl()),w){if(E.setValue(P,`toneMappingExposure`,M.toneMappingExposure),v.needsLights&&At(O,T),a&&r.fog===!0&&qe.refreshFogUniforms(O,a),qe.refreshMaterialUniforms(O,r,be,ye,A.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=D,t=0;for(let n of A.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;O.probesSH.value=e.textures,O.probesMin.value=e.min,O.probesMax.value=e.max,O.probesResolution.value=e.resolution}wc.upload(P,Dt(v),O,L)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(wc.upload(P,Dt(v),O,L),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&E.setValue(P,`center`,i.center),E.setValue(P,`modelViewMatrix`,i.modelViewMatrix),E.setValue(P,`normalMatrix`,i.normalMatrix),E.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];st.update(n,S),st.bind(n,S)}}return S}function At(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Mt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,F.viewport(pe),F.scissor(me),F.setScissorTest(he),de=-1;return}if(o.__webglFramebuffer===void 0)L.setupRenderTarget(e);else if(o.__hasExternalTextures)L.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);L.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&L.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(pe),F.scissor(me),F.setScissorTest(he),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}de=-1};function Pt(e){let t=I.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Re.textureFormatReadable(e.format),t.__typeReadable=Re.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){z(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=Pt(o);if(u.__formatReadable===!1){z(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){z(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,at.convert(c),at.convert(l),a)}finally{let e=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=Pt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,at.convert(l),at.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await tt(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;L.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=at.convert(t.format),_=at.convert(t.type),v;t.isData3DTexture?(L.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(L.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(L.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,se),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&L.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?L.setTextureCube(e,0):e.isData3DTexture?L.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?L.setTexture2DArray(e,0):L.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){le=0,ue=0,N=null,F.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Ke}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=W._getDrawingBufferColorSpace(e),t.unpackColorSpace=W._getUnpackColorSpace()}},Ul=Math.PI*2,Wl=Math.PI/180;function Gl(e,t,n){return e<t?t:e>n?n:e}function Kl(e,t,n){return e+(t-e)*n}function ql(e,t,n,r){return Kl(e,t,1-Math.exp(-n*r))}function Jl(e){let t=e%Ul;return t<=-Math.PI?t+=Ul:t>Math.PI&&(t-=Ul),t}function Yl(e,t){return Jl(t-e)}function Xl(e,t,n,r){return e+Yl(e,t)*(1-Math.exp(-n*r))}function Zl(e,t,n){let r=Yl(e,t);return Math.abs(r)<=n?t:e+Math.sign(r)*n}var Ql=1/60,$l=.25,eu=class{accumulator=0;timeScale=1;simTime=0;droppedTime=0;advance(e){let t=Gl(Number.isFinite(e)?e:0,0,$l)*this.timeScale;this.accumulator+=t;let n=0;for(;this.accumulator>=.016666666666666666&&n<5;)this.accumulator-=Ql,n++;if(this.accumulator>=.016666666666666666){let e=Math.floor(this.accumulator/Ql)*Ql;this.droppedTime+=e,this.accumulator-=e}return this.simTime+=n*Ql,n}get alpha(){return this.accumulator/Ql}reset(){this.accumulator=0}},tu=class{handlers;handle=0;last=-1;running=!1;constructor(e){this.handlers=e}start(){this.running||(this.running=!0,this.last=-1,this.handle=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.handle)}tick=e=>{if(!this.running)return;this.handle=requestAnimationFrame(this.tick);let t=this.last<0?0:Math.min((e-this.last)/1e3,$l);this.last=e,this.handlers.frame(t,e)}},nu=[`D`,`C`,`B`,`A`,`S`],ru={practice:{id:`practice`,name:`Simulacro de combate`,place:`Campo de práctica · sótano del Continental`,briefing:[`Tutorial de 3 minutos y, después, elimina a los 6 maniquíes armados del patio.`,`Aquí sí se dispara: es el único lugar del hotel donde se permite.`,`Rango objetivo: B o superior (el rango solo cuenta el simulacro).`],baseReward:2,requires:null,parTime:90,hasCivilians:!1,available:!0},nightclub:{id:`nightclub`,name:`Club Kairos`,place:`Club nocturno · distrito del puerto`,briefing:[`Sube al VIP y elimina a Vance. Sal por la puerta trasera.`,`Hay civiles: no pueden sufrir daño. Matar uno limita el rango a C.`,`Rango objetivo: A.`],baseReward:6,requires:`practice`,parTime:240,hasCivilians:!0,available:!0},docks:{id:`docks`,name:`Muelle 9`,place:`Patio de contenedores y bodega`,briefing:[`Destruye los 3 cargamentos y llega al bote.`,`El láser rojo de un tirador avisa su disparo: rompe la línea de visión.`,`Rango objetivo: A.`],baseReward:8,requires:`nightclub`,parTime:300,hasCivilians:!1,available:!0},rooftop:{id:`rooftop`,name:`Torre Meridian`,place:`Azoteas · tres alturas`,briefing:[`Sube, elimina a los tiradores, vence al Juez y escapa en 45 s.`,`El Juez solo cae con headshots o con un takedown cuando se arrodilla.`,`Rango objetivo: S.`],baseReward:10,requires:`docks`,parTime:360,hasCivilians:!1,available:!0},gauntlet:{id:`gauntlet`,name:`Gauntlet "Excomunicado"`,place:`El Continental · modo hostil`,briefing:[`Sobrevive a oleadas infinitas en el vestíbulo.`,`1 moneda por cada 2 oleadas. Récord local en el mostrador de Charon.`,`Rango objetivo: tu propio récord.`],baseReward:0,requires:`practice`,parTime:0,hasCivilians:!1,available:!0}},iu=[`practice`,`nightclub`,`docks`,`rooftop`,`gauntlet`],au=`excom.profile`,ou=`excom.settings`,su=[`extMag`,`suppressor`,`hollowPoint`,`compensator`,`suit1`,`suit2`,`suit3`,`tacticalKnife`,`shotgun`,`extraMarker`],cu=9999;function lu(e=Date.now()){return{version:1,createdAt:e,updatedAt:e,coins:8,upgrades:[],completed:[],best:{},achievements:[],flags:{},excommunicados:0,gauntlet:[],playtimeSec:0}}function uu(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function du(e,t,n,r){return typeof e!=`number`||!Number.isFinite(e)?t:Math.min(r,Math.max(n,Math.floor(e)))}function fu(e,t){if(!Array.isArray(e))return[];let n=[];for(let r of e)typeof r==`string`&&t.includes(r)&&!n.includes(r)&&n.push(r);return n}function pu(e,t=Date.now()){if(!uu(e)||typeof e.version!=`number`||e.version<1||e.version>1)return null;let n=lu(t);if(n.createdAt=du(e.createdAt,t,0,864e13),n.updatedAt=du(e.updatedAt,t,0,864e13),n.coins=du(e.coins,8,0,cu),n.upgrades=fu(e.upgrades,su),n.completed=fu(e.completed,iu),n.excommunicados=du(e.excommunicados,0,0,1e6),n.playtimeSec=du(e.playtimeSec,0,0,1e9),Array.isArray(e.achievements)&&(n.achievements=[...new Set(e.achievements.filter(e=>typeof e==`string`&&e.length<64))]),uu(e.flags))for(let[t,r]of Object.entries(e.flags))typeof r==`boolean`&&t.length<64&&(n.flags[t]=r);if(uu(e.best))for(let t of iu){let r=e.best[t];uu(r)&&typeof r.rank==`string`&&nu.includes(r.rank)&&(n.best[t]={rank:r.rank,score:du(r.score,0,0,1e9),timeSec:du(r.timeSec,0,0,1e7)})}return Array.isArray(e.gauntlet)&&(n.gauntlet=e.gauntlet.filter(uu).map(e=>({waves:du(e.waves,0,0,1e6),score:du(e.score,0,0,1e9),date:du(e.date,t,0,864e13)})).filter(e=>e.waves>0),mu(n.gauntlet),n.gauntlet.length=Math.min(n.gauntlet.length,10)),n}function mu(e){e.sort((e,t)=>t.waves-e.waves||t.score-e.score||e.date-t.date)}function hu(e,t){e.gauntlet.push(t),mu(e.gauntlet);let n=e.gauntlet.indexOf(t)+1;return e.gauntlet.length=Math.min(e.gauntlet.length,10),n<=10?n:0}function gu(e,t,n){let r=e.best[t],i=!r||nu.indexOf(n.rank)>nu.indexOf(r.rank)||n.rank===r.rank&&n.score>r.score;return i&&(e.best[t]={...n}),e.completed.includes(t)||e.completed.push(t),i}function _u(e,t=Date.now()){let n=e.get(au);if(n===null)return{profile:lu(t),status:`new`};let r;try{r=JSON.parse(n)}catch(r){return console.warn(`[save] perfil ilegible, se respalda y se reinicia:`,r instanceof Error?r.message:r),e.set(`${au}.corrupt`,n),{profile:lu(t),status:`reset-corrupt`}}let i=pu(vu(r),t);return i?{profile:i,status:uu(r)&&r.version!==1?`migrated`:`loaded`}:(console.warn(`[save] perfil inválido, se respalda y se reinicia`),e.set(`${au}.corrupt`,n),{profile:lu(t),status:`reset-corrupt`})}function vu(e){return uu(e)&&(typeof e.version==`number`?e.version:0)===0?{...e,version:1}:e}function yu(e,t,n=Date.now()){t.updatedAt=n,t.version=1,e.set(au,JSON.stringify(t))}function bu(e){e.remove(au)}var xu=class{map=new Map;get(e){return this.map.get(e)??null}set(e,t){this.map.set(e,t)}remove(e){this.map.delete(e)}},Su=class{fallback=null;warned=!1;fail(e){return this.warned||(this.warned=!0,console.warn(`[save] localStorage no disponible; la partida solo durará esta sesión:`,e instanceof Error?e.message:e)),this.fallback??=new xu,this.fallback}get(e){if(this.fallback)return this.fallback.get(e);try{return window.localStorage.getItem(e)}catch(t){return this.fail(t).get(e)}}set(e,t){if(this.fallback)this.fallback.set(e,t);else try{window.localStorage.setItem(e,t)}catch(n){this.fail(n).set(e,t)}}remove(e){if(this.fallback)this.fallback.remove(e);else try{window.localStorage.removeItem(e)}catch(t){this.fail(t).remove(e)}}},Cu=[{id:`extMag`,name:`Cargador extendido`,desc:`Carabina +8 balas, pistola +4.`,price:5},{id:`suppressor`,name:`Silenciador`,desc:`La pistola solo alerta a 8 m.`,price:6},{id:`hollowPoint`,name:`Punta hueca`,desc:`+15 % de daño con armas de fuego.`,price:7},{id:`compensator`,name:`Compensador`,desc:`−35 % de retroceso.`,price:5},{id:`suit1`,name:`Traje balístico I`,desc:`+20 de integridad del traje.`,price:4},{id:`suit2`,name:`Traje balístico II`,desc:`+20 de integridad (requiere el I).`,price:7,requires:`suit1`},{id:`suit3`,name:`Traje balístico III`,desc:`+20 de integridad (requiere el II).`,price:10,requires:`suit2`},{id:`tacticalKnife`,name:`Cuchillo táctico`,desc:`Alcance 2,2 m y golpe más rápido.`,price:4},{id:`shotgun`,name:`Escopeta "Sommelier"`,desc:`Nueva arma primaria (tecla 1 alterna con la carabina).`,price:8},{id:`extraMarker`,name:`Marcador adicional`,desc:`4 marcadores de sangre (vidas) por contrato.`,price:12}];function wu(e){return Cu.find(t=>t.id===e)}function Tu(e,t){let n=wu(t);return n?e.upgrades.includes(t)?`owned`:n.requires&&!e.upgrades.includes(n.requires)?`locked`:e.coins<n.price?`poor`:`ok`:`unknown`}function Eu(e,t){if(Tu(e,t)!==`ok`)return!1;let n=wu(t);return n?(e.coins-=n.price,e.upgrades.push(t),!0):!1}var Du={S:2,A:1.5,B:1.25,C:1,D:.75},Ou=.3;function ku(e,t,n){let r=ru[e].baseReward;return Math.round(r*Du[t])+(n?3:0)}function Au(e){return Math.floor(Math.max(0,e)/2)}function ju(e){let t=Math.floor(e.coins*Ou);return e.coins-=t,e.excommunicados++,t}function Mu(e,t){e.coins=Math.max(0,Math.min(9999,e.coins+Math.floor(t)))}function Nu(e){let t=[`sprint`,`aim`],n=()=>({deathVisible:!document.querySelector(`#hud .death`)?.hidden,reloadVisible:!document.querySelector(`#hud .reload`)?.hidden,hitmark:document.querySelector(`#hud .hitmark`)?.className??``,style:document.querySelector(`#hud .style-mult`)?.textContent??``,ammo:`${document.querySelector(`#hud .ammo-mag`)?.textContent??``}${document.querySelector(`#hud .ammo-res`)?.textContent??``}`,objective:document.querySelector(`#hud .objective`)?.textContent??``,zone:document.querySelector(`#hud .zone-label`)?.textContent??``,toast:document.querySelector(`#hud .toast`)?.hidden?``:document.querySelector(`#hud .toast`)?.textContent??``});window.__EXCOM__={get ready(){return e.ready},luminance:()=>e.renderer.sampleLuminance(),fps:()=>e.stats.fps(60),measureFps:t=>new Promise(n=>{e.stats.beginWindow(performance.now());let r=performance.now()+t*1e3,i=()=>{performance.now()>=r?n(e.stats.windowResult(performance.now())):requestAnimationFrame(i)};requestAnimationFrame(i)}),gpu:()=>e.renderer.gpuInfo(),debugText:()=>e.debugText(),setDebug:t=>e.debug.setVisible(t),runDebug:t=>e.debug.run(t),info:()=>{let t=e.renderer.renderer.info;return{calls:t.render.calls,triangles:t.render.triangles,programs:t.programs?.length??0,geometries:t.memory.geometries,textures:t.memory.textures,pixelRatio:e.renderer.pixelRatio,dynamicScale:e.renderer.dynamicScale,preset:e.renderer.preset,steps:e.steps}},state:()=>e.fsm.state,level:()=>e.currentLevel,playArena:()=>e.playArena(),playLevel:(t,n=!1)=>e.playLevel(t,{drill:n}),goToHub:()=>e.goToHub(),pause:()=>e.pause(),resume:()=>e.resume(),setManual:t=>{e.manual=t},step:(t,n={})=>{let r=e.input;r.setVirtualMove(n.moveX??0,n.moveY??0),r.virtualHold(`sprint`,n.sprint??!1),r.virtualHold(`aim`,n.aim??!1),n.crouch&&r.virtualPress(`crouch`),n.jump&&r.virtualPress(`jump`),n.dodge&&r.virtualPress(`dodge`),e.stepManual(Math.max(0,Math.floor(t)))},player:()=>{let t=e.session?.player;return t?{x:t.feet.x,y:t.feet.y,z:t.feet.z,state:t.state,posture:t.posture,grounded:t.grounded,speed:t.stepSpeed(Ql),yaw:t.yaw,invulnerable:t.invulnerable,aiming:t.aiming,cover:t.cover?.height??null,edge:t.cover?.edge??0,stats:{...t.stats}}:null},teleport:(t,n,r,i)=>{let a=e.session;a&&(a.respawnAt(new H(t,n+.02,r),i),e.camera.setYawPitch(i,e.camera.pitch),e.camera.snap())},checkpointIds:()=>(e.session?.data.checkpoints??[]).map(e=>e.id),checkpoint:t=>{let n=e.session,r=n?.data.checkpoints.find(e=>e.id===t);return!n||!r?!1:(n.respawnAt(new H(r.pos[0],r.pos[1]+.02,r.pos[2]),r.yaw),e.camera.setYawPitch(r.yaw,-.12),e.camera.snap(),!0)},setLook:(t,n)=>e.camera.setYawPitch(t,n),hold:(t,n)=>e.input.virtualHold(t,n),press:t=>e.input.virtualPress(t),move:(t,n)=>e.input.setVirtualMove(t,n),releaseAll:()=>{e.input.setVirtualMove(0,0);for(let n of t)e.input.virtualHold(n,!1)},invariants:()=>{let t=e.session?.player;return{...e.invariants,nanResets:t?.nanResets??0,killPlaneResets:t?.killPlaneResets??0,maxHorizontalSpeed:t?.maxHorizontalSpeed??0}},resetInvariants:()=>e.resetInvariants(),input:()=>({held:e.input.heldCount,locked:e.input.pointerLocked,capturing:e.input.capturing}),lagSpike:t=>{e.pendingLagMs=t},camera:()=>{let t=e.camera;return{x:t.position.x,y:t.position.y,z:t.position.z,dist:t.distanceToHead,fov:e.renderer.camera.fov,yaw:t.yaw,pitch:t.pitch}},canvas:()=>{let t=e.renderer.canvas;return{cssW:t.clientWidth,cssH:t.clientHeight,bufW:t.width,bufH:t.height,pixelRatio:e.renderer.pixelRatio}},prompt:()=>document.querySelector(`#hud .prompt:not([hidden]) .prompt-text`)?.textContent??``,combat:()=>{let t=e.session;if(!t)return null;let n=t.combat,r=n.weapon;return{health:n.vitals.health,armor:n.vitals.armor,maxArmor:n.vitals.maxArmor,weapon:n.current,loadout:[...n.loadout],mag:r.mag,magMax:r.def.mag,reserve:r.reserve,reloading:r.reloading,multiplier:n.style.multiplier,score:n.style.score,focus:n.focus,focusActive:n.focusActive,dead:n.dead,takedown:!!n.takedown,holstered:n.holstered,stats:{...n.stats},varietyCount:n.style.varietyCount,takedownTarget:n.takedownCandidate(t.ctx)?.id??null,blocked:n.blocked,hitKind:n.hitMarker.t>0?n.hitMarker.kind:`none`,aimOverEnemy:n.aimOver===`enemy`,recoil0:r.def.recoil[0]?.[0]??0}},enemies:()=>(e.session?.enemies.enemies??[]).map(e=>({id:e.id,type:e.def.type,state:e.state,alive:e.alive,x:e.feet.x,y:e.feet.y,z:e.feet.z,health:e.vitals.health,headY:e.feet.y+e.height-.15})),aiStats:()=>e.session?.enemies.qaStats()??null,aimAt:(t,n,r)=>{let i=e.camera;for(let a=0;a<4;a++){let a=t-i.position.x,o=n-i.position.y,s=r-i.position.z;i.setYawPitch(Math.atan2(-a,-s),Math.atan2(o,Math.hypot(a,s))),e.stepManualCameraOnly()}},spawnEnemy:(t,n,r,i,a)=>{let o=e.session;return o?o.enemies.spawnAt(t,new H(n,r,i),0,a?o.player.feet.clone():void 0).id:null},setGod:t=>{e.session&&(e.session.god=t)},pathTo:(t,n,r)=>{let i=e.session;if(!i)return[];let a=i.player.feet,o=i.nav.nearestNode(a.x,a.y,a.z,2),s=i.nav.nearestNode(t,n,r,3),c=i.nav.findPath(o,s);if(!c)return[];let l=new H;return i.nav.smooth(c).map(e=>(i.nav.pos(e,l),{x:l.x,y:l.y,z:l.z}))},combatInconsistencies:()=>e.combatInconsistencies,respawn:()=>e.qaRespawn(),hud:()=>(e.qaRefreshHud(),n()),profile:()=>JSON.parse(JSON.stringify(e.profile)),setCoins:t=>{e.profile.coins=0,Mu(e.profile,t),e.saveNow(),e.screens.refresh()},resetSave:()=>bu(e.store),hub:()=>{let t=e.director;if(!t)return null;let n=e.session?.level.alarmLights??[];return{state:t.state,wave:t.rules.wave,hostile:t.hostile,lostCoins:t.lostCoins,sirenOn:e.audio.sirenOn,alarmIntensity:n.reduce((e,t)=>Math.max(e,t.intensity),0)}},interact:()=>e.qaInteract(),nearestInteractable:()=>e.session?.nearestInteractable(e.camera.yaw)?.id??null,menu:()=>e.screens.current,dialogLine:()=>document.querySelector(`#screens .dialog-line`)?.textContent??``,advanceDialog:()=>e.screens.advanceDialog(),closeMenu:()=>e.closeMenu(),buy:t=>{let n=e.profile.coins;return document.querySelector(`#screens .shop-item[data-item="${t}"] button`)?.click(),e.profile.coins<n},startContract:t=>e.startContract(t),beginContract:()=>e.beginContract(),mission:()=>{let t=e.mission;if(!t)return null;let n=t.current,r=t.beacon(new H);return{id:t.id,index:t.index,total:t.objectives.length,objective:t.currentText,kind:n?.kind??``,finished:t.finished,markersUsed:t.markersUsed,markersTotal:t.markersTotal,time:t.time,alarmSounded:t.alarmSounded,alarmDisabled:t.alarmDisabled,civiliansHurt:t.civiliansHurt,civiliansKilled:t.civiliansKilled,escapeLeft:t.escapeLeft,wave:t.gauntletWave,wavesCleared:t.gauntletWaves,waveBreak:t.gauntletBreak,wavePending:t.gauntletPending,beacon:r?{x:r.x,y:r.y,z:r.z}:null,respawn:{x:t.respawnPos.x,y:t.respawnPos.y,z:t.respawnPos.z}}},outcome:()=>{let t=e.outcome;return t?{mission:t.mission,success:t.success,rank:t.rank.rank,total:t.rank.total,coins:t.coinsReward,achievements:t.achievements.map(e=>e.id),failReason:t.failReason,timeSec:t.timeSec,shotsFired:t.stats.shotsFired,gauntlet:t.gauntlet?{waves:t.gauntlet.waves,position:t.gauntlet.position}:null}:null},clickButton:e=>{let t=[...document.querySelectorAll(`#screens button`)].find(t=>t.textContent?.trim()===e);return t?.click(),!!t},settings:()=>({settings:e.settings,cameraFov:e.camera.settings.fov,mouseSens:e.camera.settings.mouseSens,brightness:e.renderer.canvas.style.filter,preset:e.renderer.preset,uiScale:document.documentElement.style.getPropertyValue(`--ui-scale`),volumes:e.audio.getVolumes()}),setSettings:t=>e.applySettings({...e.settings,...t}),skipTutorial:()=>e.mission?.skipLearn(),sceneStats:()=>{let t=0,n=0,r={};return e.renderer.scene.traverseVisible(e=>{t++,e.matrixAutoUpdate&&n++;let i=e.material;if(!i)return;let a=Array.isArray(i)?i[0]:i,o=`${e.type}:${a&&`name`in a&&a.name||(a&&`type`in a?a.type:`?`)}`;r[o]=(r[o]??0)+1}),{objects:t,autoUpdate:n,renderables:r}},cpuProfile:t=>new Promise(n=>{let r=e.prof;for(let e of Object.keys(r))r[e]=0;e.profiling=!0;let i=performance.now()+t*1e3,a=()=>{if(performance.now()<i){requestAnimationFrame(a);return}e.profiling=!1;let t=Math.max(1,r.frames),o=Math.max(1,r.steps);n({frames:r.frames,simPerFrame:r.sim/t,viewPerFrame:r.view/t,renderPerFrame:r.render/t,playerPerStep:r.player/o,enemiesPerStep:r.enemies/o,civiliansPerStep:r.civilians/o,physicsPerStep:r.physics/o,stepsPerFrame:r.steps/t})};requestAnimationFrame(a)}),audioMeter:t=>new Promise(n=>{let r=e.audio,i=performance.now()+t*1e3,a=0,o=0,s=0,c=0,l=()=>{let e=r.meter();a+=e.rms,o++,s=Math.max(s,e.rms),c=Math.max(c,e.peak),performance.now()<i?requestAnimationFrame(l):n({running:r.ready,rmsMean:o?a/o:0,rmsMax:s,peakMax:c,mood:r.musicState.mood,intensity:r.musicState.intensity})};requestAnimationFrame(l)}),killEnemy:t=>{let n=e.session,r=n?.enemies.enemies.find(e=>e.id===t||e.id.startsWith(`${t}#`));return!n||!r||!r.alive?!1:(r.applyHit(9999,`body`,n.player.feet,1,!0),!0)},civilians:()=>(e.session?.civilians?.list??[]).map(e=>({id:e.id,alive:e.alive,state:e.state,x:e.feet.x,z:e.feet.z,health:e.vitals.health}))}}var Pu=[0,2,3,5,7,8,10],Fu=[0,2,3,5,7,9,10],Iu=[0,1,3,5,7,8,10],Y=null,Lu={hub:{bpm:84,root:50,scale:Fu,progression:[0,3,5,4],bass:[0,Y,Y,Y,Y,Y,4,Y,0,Y,Y,Y,2,Y,Y,Y],hat:[0,0,.3,0,0,0,.3,0,0,0,.3,0,0,0,.3,0],kick:[.5,0,0,0,0,0,0,0,.4,0,0,0,0,0,0,0],lead:[0,6,10,14]},practice:{bpm:100,root:45,scale:Pu,progression:[0,0,5,6],bass:[0,Y,Y,0,Y,Y,0,Y,0,Y,Y,0,Y,Y,4,Y],hat:[.4,0,.6,0,.4,0,.6,0,.4,0,.6,0,.4,0,.6,0],kick:[1,0,0,0,0,0,0,0,1,0,.6,0,0,0,0,0],lead:[0,3,8,11]},club:{bpm:118,root:45,scale:Pu,progression:[0,5,2,6],bass:[0,Y,0,Y,0,Y,0,4,0,Y,0,Y,0,Y,4,2],hat:[0,0,.7,0,0,0,.7,.3,0,0,.7,0,0,0,.7,.3],kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],lead:[0,2,4,6,8,10,12,14]},docks:{bpm:96,root:43,scale:Iu,progression:[0,1,0,6],bass:[0,Y,Y,0,Y,Y,1,Y,0,Y,Y,0,Y,6,Y,Y],hat:[.5,0,.3,0,.5,0,.3,0,.5,0,.3,0,.5,0,.3,.3],kick:[1,0,0,.5,0,0,1,0,0,0,1,0,0,0,0,0],lead:[0,5,10]},tower:{bpm:110,root:47,scale:Pu,progression:[0,5,3,4],bass:[0,0,Y,0,Y,0,Y,0,0,0,Y,0,Y,4,Y,4],hat:[.6,.3,.6,.3,.6,.3,.6,.3,.6,.3,.6,.3,.6,.3,.6,.3],kick:[1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],lead:[0,3,6,9,12]},tension:{bpm:112,root:46,scale:Iu,progression:[0,1,0,1],bass:[0,Y,0,Y,0,Y,0,Y,0,Y,0,Y,1,Y,1,Y],hat:[.5,0,.5,.3,.5,0,.5,.3,.5,0,.5,.3,.5,0,.5,.3],kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,.6,0],lead:[0,4,8,12]},gauntlet:{bpm:128,root:45,scale:Iu,progression:[0,1,5,6],bass:[0,0,0,Y,0,0,1,Y,0,0,0,Y,6,Y,5,Y],hat:[.7,.3,.7,.3,.7,.3,.7,.3,.7,.3,.7,.3,.7,.3,.7,.3],kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0],lead:[0,2,3,6,8,10,11,14]}},Ru={pad:0,bass:.2,hat:.4,kick:.55,lead:.8};function zu(e){return 60/Lu[e].bpm/4}function Bu(e,t){let n=e.scale.length,r=Math.floor(t/n),i=(t%n+n)%n;return e.root+r*12+e.scale[i]}function Vu(e){return 440*2**((e-69)/12)}function Hu(e,t,n,r){let i=Lu[e],a=(t%16+16)%16,o=Math.floor(t/16),s=i.progression[(o%i.progression.length+i.progression.length)%i.progression.length],c=0,l=(e,t,n,i)=>{let a=r[c]??(r[c]={voice:e,midi:t,vel:n,steps:i});a.voice=e,a.midi=t,a.vel=n,a.steps=i,c++};if(a===0)for(let e of[0,2,4])l(`pad`,Bu(i,s+e)+12,.5,16);if(n>=Ru.bass){let e=i.bass[a];e!=null&&l(`bass`,Bu(i,s+e)-12,.6+.3*n,2)}return n>=Ru.hat&&(i.hat[a]??0)>0&&l(`hat`,0,i.hat[a]*(.5+.5*n),1),n>=Ru.kick&&(i.kick[a]??0)>0&&l(`kick`,0,i.kick[a],1),n>=Ru.lead&&i.lead.includes(a)&&l(`lead`,Bu(i,s+[0,2,4,7][i.lead.indexOf(a)%4])+24,.45,2),c}function Uu(e){let t=e.onMission?.3:.22;return e.searching>0&&(t=Math.max(t,.5)),e.fighting>0&&(t=Math.max(t,Math.min(.95,.62+.06*e.fighting))),e.hostile&&(t=Math.max(t,.82)),e.boss&&(t=Math.max(t,.96)),e.escape&&(t=1),Math.max(0,Math.min(1,t))}var Wu=.15,Gu=.1,Ku=.8,qu=1.2,Ju={pad:.09,bass:.16,kick:.5,hat:.07,lead:.06},Yu=class{ctx;bus;noise;mood=null;target=0;intensity=0;step=0;nextTime=0;out=null;events=[];lastUpdate=0;constructor(e,t,n){this.ctx=e,this.bus=t,this.noise=n}get currentMood(){return this.mood}get currentIntensity(){return this.intensity}setMood(e){if(e===this.mood)return;let t=this.ctx.currentTime;if(this.out){let e=this.out;e.gain.setTargetAtTime(1e-4,t,qu/4);let n=t+qu*2,r=this.ctx.createConstantSource();r.offset.value=0,r.connect(e),r.start(t),r.stop(n),r.addEventListener(`ended`,()=>e.disconnect())}if(this.mood=e,this.out=null,!e)return;let n=this.ctx.createGain();n.gain.setValueAtTime(1e-4,t),n.gain.exponentialRampToValueAtTime(1,t+qu),n.connect(this.bus),this.out=n,this.step=0,this.nextTime=t+.05}setIntensity(e){this.target=Math.max(0,Math.min(1,e))}update(){let e=this.ctx.currentTime,t=Math.min(.25,Math.max(0,e-this.lastUpdate));this.lastUpdate=e;let n=this.target-this.intensity;this.intensity+=Math.sign(n)*Math.min(Math.abs(n),Ku*t);let r=this.mood,i=this.out;if(!r||!i)return;this.nextTime<e-Gu&&(this.nextTime=e+.02);let a=zu(r);for(;this.nextTime<e+Wu;){let e=Hu(r,this.step,this.intensity,this.events);for(let t=0;t<e;t++)this.play(this.events[t],this.nextTime,a,i);this.step++,this.nextTime+=a}}play(e,t,n,r){let i=this.ctx,a=e.steps*n,o=i.createGain(),s=Ju[e.voice]*e.vel;switch(o.connect(r),e.voice){case`pad`:{let n=i.createOscillator();n.type=`sawtooth`,n.frequency.value=Vu(e.midi),n.detune.value=e.midi%3*4-4;let r=i.createBiquadFilter();r.type=`lowpass`,r.frequency.value=700+1400*this.intensity,o.gain.setValueAtTime(1e-4,t),o.gain.linearRampToValueAtTime(s,t+a*.25),o.gain.setTargetAtTime(1e-4,t+a*.8,a*.12),n.connect(r).connect(o),n.start(t),n.stop(t+a*1.3);break}case`bass`:{let n=i.createOscillator();n.type=`square`,n.frequency.value=Vu(e.midi);let r=i.createBiquadFilter();r.type=`lowpass`,r.frequency.value=420,o.gain.setValueAtTime(1e-4,t),o.gain.linearRampToValueAtTime(s,t+.008),o.gain.exponentialRampToValueAtTime(1e-4,t+a),n.connect(r).connect(o),n.start(t),n.stop(t+a+.02);break}case`kick`:{let e=i.createOscillator();e.type=`sine`,e.frequency.setValueAtTime(130,t),e.frequency.exponentialRampToValueAtTime(42,t+.12),o.gain.setValueAtTime(s,t),o.gain.exponentialRampToValueAtTime(1e-4,t+.22),e.connect(o),e.start(t),e.stop(t+.25);break}case`hat`:{let n=i.createBufferSource();n.buffer=this.noise;let r=i.createBiquadFilter();r.type=`highpass`,r.frequency.value=7e3,o.gain.setValueAtTime(s,t),o.gain.exponentialRampToValueAtTime(1e-4,t+.05),n.connect(r).connect(o),n.start(t,(e.midi+this.step*.37)%1),n.stop(t+.07);break}case`lead`:{let n=i.createOscillator();n.type=`triangle`,n.frequency.value=Vu(e.midi),o.gain.setValueAtTime(1e-4,t),o.gain.linearRampToValueAtTime(s,t+.01),o.gain.exponentialRampToValueAtTime(1e-4,t+a*1.5),n.connect(o),n.start(t),n.stop(t+a*1.6);break}}}},Xu=.8,Zu=.4,Qu=class{ctx=null;master;sfxBus;musicBus;uiBus;ambBus;lowpass;noise=null;volumes={master:.8,sfx:.9,music:.55,ui:.7};voices=0;maxVoices=28;muffle=0;music=null;pendingMood=null;pendingIntensity=0;musicDucked=!1;analyser=null;meterBuf=null;get ready(){return this.ctx!==null&&this.ctx.state===`running`}init(){if(this.ctx){this.ctx.state===`suspended`&&this.ctx.resume();return}let e=window.AudioContext;if(!e)return;let t=new e({latencyHint:`interactive`});this.ctx=t;let n=t.createDynamicsCompressor();n.threshold.value=-14,n.knee.value=12,n.ratio.value=4,n.attack.value=.004,n.release.value=.2,this.lowpass=t.createBiquadFilter(),this.lowpass.type=`lowpass`,this.lowpass.frequency.value=2e4,this.master=t.createGain(),this.master.connect(this.lowpass),this.lowpass.connect(n),n.connect(t.destination),this.analyser=t.createAnalyser(),this.analyser.fftSize=2048,this.meterBuf=new Float32Array(this.analyser.fftSize),n.connect(this.analyser),this.sfxBus=t.createGain(),this.musicBus=t.createGain(),this.uiBus=t.createGain(),this.ambBus=t.createGain();for(let e of[this.sfxBus,this.musicBus,this.uiBus,this.ambBus])e.connect(this.master);this.noise=$u(t,1.5),this.music=new Yu(t,this.musicBus,this.noise),this.music.setMood(this.pendingMood),this.music.setIntensity(this.pendingIntensity),this.applyVolumes(),this.applyAmbience()}setVolumes(e){this.volumes={...this.volumes,...e},this.applyVolumes()}getVolumes(){return{...this.volumes}}applyVolumes(){if(!this.ctx)return;let e=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.volumes.master,e,.02),this.sfxBus.gain.setTargetAtTime(this.volumes.sfx,e,.02),this.musicBus.gain.setTargetAtTime(this.volumes.music*Xu*(this.musicDucked?Zu:1),e,.15),this.uiBus.gain.setTargetAtTime(this.volumes.ui,e,.02),this.ambBus.gain.setTargetAtTime(this.volumes.sfx*.6,e,.05)}setMusic(e){this.pendingMood=e,this.music?.setMood(e)}setMusicIntensity(e){this.pendingIntensity=e,this.music?.setIntensity(e)}duckMusic(e){e!==this.musicDucked&&(this.musicDucked=e,this.applyVolumes())}updateMusic(){this.ready&&this.music?.update()}get musicState(){return{mood:this.music?.currentMood??this.pendingMood,intensity:this.music?.currentIntensity??0}}meter(){let e=this.analyser,t=this.meterBuf;if(!e||!t||!this.ready)return{rms:0,peak:0};e.getFloatTimeDomainData(t);let n=0,r=0;for(let e=0;e<t.length;e++){let i=t[e];n+=i*i;let a=Math.abs(i);a>r&&(r=a)}return{rms:Math.sqrt(n/t.length),peak:r}}setMuffle(e){if(!this.ctx)return;let t=Math.max(0,Math.min(1,e));Math.abs(t-this.muffle)<.01||(this.muffle=t,this.lowpass.frequency.setTargetAtTime(2e4*(1-t*.93)**2+300,this.ctx.currentTime,.05))}setListener(e,t){let n=this.ctx;if(!n)return;let r=n.listener,i=n.currentTime;r.positionX&&(r.positionX.setTargetAtTime(e.x,i,.02),r.positionY.setTargetAtTime(e.y,i,.02),r.positionZ.setTargetAtTime(e.z,i,.02),r.forwardX.setTargetAtTime(t.x,i,.02),r.forwardY.setTargetAtTime(t.y,i,.02),r.forwardZ.setTargetAtTime(t.z,i,.02),r.upX.value=0,r.upY.value=1,r.upZ.value=0)}out(e,t){let n=this.ctx;if(!t)return e;let r=n.createPanner();return r.panningModel=`equalpower`,r.distanceModel=`inverse`,r.refDistance=3,r.rolloffFactor=1.1,r.maxDistance=120,r.positionX.value=t.x,r.positionY.value=t.y,r.positionZ.value=t.z,r.connect(e),r}voice(){return!this.ready||this.voices>=this.maxVoices?!1:(this.voices++,!0)}release(e){e.addEventListener(`ended`,()=>{this.voices=Math.max(0,this.voices-1)})}noiseHit(e,t){let n=this.ctx;if(!this.noise||!this.voice())return;let r=n.currentTime+(t.delay??0),i=n.createBufferSource();i.buffer=this.noise,i.playbackRate.value=.9+Math.random()*.2;let a=n.createBiquadFilter();a.type=t.type??`bandpass`,a.frequency.value=t.freq,a.Q.value=t.q??.8;let o=n.createGain();o.gain.setValueAtTime(1e-4,r),o.gain.linearRampToValueAtTime(t.gain,r+(t.attack??.003)),o.gain.exponentialRampToValueAtTime(1e-4,r+(t.attack??.003)+t.decay),i.connect(a).connect(o).connect(e),i.start(r,Math.random()*.8),i.stop(r+t.decay+.05),this.release(i)}tone(e,t){let n=this.ctx;if(!this.voice())return;let r=n.currentTime+(t.delay??0),i=n.createOscillator();i.type=t.type??`sine`,i.frequency.setValueAtTime(t.f0,r),t.f1!==void 0&&i.frequency.exponentialRampToValueAtTime(Math.max(20,t.f1),r+t.decay);let a=n.createGain();a.gain.setValueAtTime(1e-4,r),a.gain.linearRampToValueAtTime(t.gain,r+(t.attack??.004)),a.gain.exponentialRampToValueAtTime(1e-4,r+(t.attack??.004)+t.decay),i.connect(a).connect(e),i.start(r),i.stop(r+t.decay+.05),this.release(i)}sirenNodes=null;ambNodes=[];ambGain=null;ambKind=`none`;siren(e){let t=this.ctx;if(!t)return;let n=t.currentTime;if(e){if(this.sirenNodes)return;let e=t.createOscillator();e.type=`sawtooth`,e.frequency.value=600;let r=t.createOscillator();r.type=`sine`,r.frequency.value=.55;let i=t.createGain();i.gain.value=170,r.connect(i).connect(e.frequency);let a=t.createBiquadFilter();a.type=`lowpass`,a.frequency.value=1600;let o=t.createGain();o.gain.setValueAtTime(1e-4,n),o.gain.exponentialRampToValueAtTime(.14,n+.4),e.connect(a).connect(o).connect(this.ambBus),e.start(n),r.start(n),this.sirenNodes={osc:e,lfo:r,gain:o}}else if(this.sirenNodes){let e=this.sirenNodes;this.sirenNodes=null,e.gain.gain.setTargetAtTime(1e-4,n,.15),e.osc.stop(n+.8),e.lfo.stop(n+.8)}}get sirenOn(){return this.sirenNodes!==null}ambience(e){this.ambKind=e,this.ctx&&this.applyAmbience()}applyAmbience(){let e=this.ctx;if(!e||!this.noise)return;let t=e.currentTime;if(this.ambGain){this.ambGain.gain.setTargetAtTime(1e-4,t,.3);for(let e of this.ambNodes)e.stop(t+1.5);this.ambNodes=[],this.ambGain=null}if(this.ambKind===`none`)return;let n=e.createGain();n.gain.setValueAtTime(1e-4,t),n.gain.exponentialRampToValueAtTime(1,t+1.5),n.connect(this.ambBus),this.ambGain=n;let r=e.createBufferSource();r.buffer=this.noise,r.loop=!0;let i=e.createBiquadFilter();i.type=`lowpass`;let a=e.createGain();switch(r.connect(i).connect(a).connect(n),r.start(t),this.ambNodes.push(r),this.ambKind){case`lobby`:i.frequency.value=650,a.gain.value=.05;for(let[r,i]of[73.42,110,174.61].entries()){let a=e.createOscillator();a.type=r===1?`sine`:`sawtooth`,a.frequency.value=i;let o=e.createBiquadFilter();o.type=`lowpass`,o.frequency.value=300;let s=e.createOscillator();s.frequency.value=.07+r*.03;let c=e.createGain();c.gain.value=110,s.connect(c).connect(o.frequency);let l=e.createGain();l.gain.value=.03,a.connect(o).connect(l).connect(n),a.start(t),s.start(t),this.ambNodes.push(a,s)}break;case`range`:{i.frequency.value=400,a.gain.value=.03;let r=e.createOscillator();r.type=`triangle`,r.frequency.value=50;let o=e.createGain();o.gain.value=.025,r.connect(o).connect(n),r.start(t),this.ambNodes.push(r);break}default:i.frequency.value=900,a.gain.value=.045}}shot(e,t){if(!this.ready)return;let n=this.out(this.sfxBus,t);switch(e){case`carbine`:this.noiseHit(n,{freq:1800,q:.5,gain:.55,decay:.12}),this.tone(n,{type:`triangle`,f0:160,f1:45,gain:.5,decay:.12});break;case`pistol`:this.noiseHit(n,{freq:2400,q:.6,gain:.5,decay:.1}),this.tone(n,{type:`triangle`,f0:210,f1:60,gain:.45,decay:.1});break;case`pistolSilenced`:this.noiseHit(n,{freq:900,q:1.2,gain:.35,decay:.07}),this.tone(n,{type:`sine`,f0:320,f1:120,gain:.15,decay:.05});break;case`shotgun`:this.noiseHit(n,{freq:900,q:.4,gain:.7,decay:.25}),this.tone(n,{type:`triangle`,f0:110,f1:35,gain:.7,decay:.22});break;case`enemyPistol`:this.noiseHit(n,{freq:2e3,q:.7,gain:.4,decay:.09}),this.tone(n,{type:`triangle`,f0:190,f1:60,gain:.3,decay:.08});break;case`enemySmg`:this.noiseHit(n,{freq:2600,q:.8,gain:.32,decay:.06});break;case`enemyRifle`:this.noiseHit(n,{freq:1300,q:.5,gain:.6,decay:.2}),this.tone(n,{type:`sawtooth`,f0:140,f1:40,gain:.35,decay:.18});break;case`enemyShotgun`:this.noiseHit(n,{freq:800,q:.4,gain:.6,decay:.24}),this.tone(n,{type:`triangle`,f0:100,f1:35,gain:.5,decay:.2})}}hit(e){if(!this.ready)return;let t=this.uiBus;e===`head`?this.tone(t,{type:`sine`,f0:1800,f1:1500,gain:.25,decay:.12}):e===`kill`?(this.tone(t,{type:`sine`,f0:900,gain:.22,decay:.08}),this.tone(t,{type:`sine`,f0:1350,gain:.2,decay:.12,delay:.06})):e===`armor`?this.tone(t,{type:`square`,f0:520,f1:400,gain:.08,decay:.05}):this.tone(t,{type:`triangle`,f0:1100,f1:900,gain:.14,decay:.05})}reload(e){if(!this.ready)return;let t=this.sfxBus;e===`start`?this.noiseHit(t,{freq:3200,q:4,gain:.18,decay:.05}):(this.noiseHit(t,{freq:2600,q:5,gain:.22,decay:.04}),this.noiseHit(t,{freq:1800,q:5,gain:.2,decay:.05,delay:.07}))}perfectReload(){this.ready&&(this.tone(this.uiBus,{type:`sine`,f0:1320,gain:.2,decay:.12}),this.tone(this.uiBus,{type:`sine`,f0:1980,gain:.16,decay:.18,delay:.05}))}jam(){this.ready&&this.tone(this.uiBus,{type:`square`,f0:140,f1:90,gain:.12,decay:.12})}empty(){this.ready&&this.noiseHit(this.sfxBus,{freq:4e3,q:6,gain:.15,decay:.03})}alert(e){if(!this.ready)return;let t=this.out(this.sfxBus,e);this.tone(t,{type:`triangle`,f0:520,f1:880,gain:.18,decay:.16})}laserBeep(e,t){if(!this.ready)return;let n=this.out(this.sfxBus,t);this.tone(n,{type:`square`,f0:700+e*900,gain:.07+e*.08,decay:.05})}takedown(){this.ready&&(this.tone(this.sfxBus,{type:`sine`,f0:120,f1:50,gain:.6,decay:.2}),this.noiseHit(this.sfxBus,{freq:400,q:.7,gain:.4,decay:.12}))}knife(){this.ready&&this.noiseHit(this.sfxBus,{freq:5e3,q:2,type:`highpass`,gain:.18,decay:.08})}hurt(e){this.ready&&this.tone(this.sfxBus,{type:`sine`,f0:e?90:140,f1:50,gain:e?.5:.3,decay:.18})}dodge(){this.ready&&this.noiseHit(this.sfxBus,{freq:700,q:.6,type:`lowpass`,gain:.22,attack:.04,decay:.2})}focus(e){this.ready&&this.tone(this.uiBus,{type:`sine`,f0:e?300:600,f1:e?120:900,gain:.25,decay:.35})}ui(e){if(!this.ready)return;let t=this.uiBus;switch(e){case`click`:this.tone(t,{type:`triangle`,f0:880,gain:.08,decay:.04});break;case`hover`:this.tone(t,{type:`sine`,f0:1200,gain:.03,decay:.03});break;case`coin`:for(let[e,n]of[2093,3135,4186].entries())this.tone(t,{type:`sine`,f0:n,gain:.12/(e+1),decay:.6,delay:e*.02});break;case`error`:this.tone(t,{type:`square`,f0:220,f1:160,gain:.1,decay:.18});break;case`confirm`:this.tone(t,{type:`sine`,f0:660,gain:.12,decay:.08}),this.tone(t,{type:`sine`,f0:990,gain:.12,decay:.12,delay:.07})}}};function $u(e,t){let n=Math.floor(e.sampleRate*t),r=e.createBuffer(1,n,e.sampleRate),i=r.getChannelData(0),a=22222;for(let e=0;e<n;e++)a=a*1664525+1013904223>>>0,i[e]=a/4294967296*2-1;return r}var ed=`modulepreload`,td=function(e,t){return new URL(e,t).href},nd={},rd=function(e){return e.pathname.endsWith(`.css`)},id=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},ad=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=td(t,n);let r=s(t),i=rd(r);return id(nd,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:ed,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},od=null;async function sd(){if(od)return od;let e=await ad(()=>import(`./rapier-BcnL-M2-.js`),[],import.meta.url);return await e.init(),od=e,e}var X={STATIC:1,PLAYER:2,ENEMY:4,CIVILIAN:8,QUERY:32768};function cd(e,t){return((e&65535)<<16|t&65535)>>>0}var ld={STATIC:cd(X.STATIC,65535),PLAYER:cd(X.PLAYER,X.STATIC|X.ENEMY|X.QUERY),ENEMY:cd(X.ENEMY,X.STATIC|X.PLAYER|X.ENEMY|X.QUERY),CIVILIAN:cd(X.CIVILIAN,X.STATIC|X.CIVILIAN|X.QUERY)},ud={STATIC:cd(X.QUERY,X.STATIC),PLAYER_SHOT:cd(X.QUERY,X.STATIC|X.ENEMY|X.CIVILIAN),ENEMY_SHOT:cd(X.QUERY,X.STATIC|X.PLAYER),CHARACTERS:cd(X.QUERY,X.PLAYER|X.ENEMY|X.CIVILIAN),ENEMIES:cd(X.QUERY,X.ENEMY),STATIC_AND_ENEMIES:cd(X.QUERY,X.STATIC|X.ENEMY)};function dd(){return{hit:!1,distance:0,point:{x:0,y:0,z:0},normal:{x:0,y:1,z:0},collider:null}}var fd={offset:.02,autostepHeight:.36,autostepMinWidth:.12,snapToGround:.4,maxSlopeClimbDeg:46,minSlopeSlideDeg:50},pd={x:0,y:0,z:0,w:1},md=class{R;world;ray;ball;capsule;staticCount=0;constructor(e){this.R=e,this.world=new e.World({x:0,y:0,z:0}),this.world.timestep=1/60,this.ray=new e.Ray({x:0,y:0,z:0},{x:0,y:0,z:1}),this.ball=new e.Ball(.2),this.capsule=new e.Capsule(.5,.3)}get staticColliderCount(){return this.staticCount}get colliderCount(){return this.world.colliders.len()}addStaticBox(e,t,n=pd){let r=this.R.ColliderDesc.cuboid(t.x,t.y,t.z).setTranslation(e.x,e.y,e.z).setRotation(n).setCollisionGroups(ld.STATIC).setSolverGroups(ld.STATIC);return this.staticCount++,this.world.createCollider(r)}createCharacter(e,t,n,r,i=fd){let a=this.world.createCollider(this.R.ColliderDesc.capsule(n,t).setTranslation(e.x,e.y,e.z).setCollisionGroups(r).setSolverGroups(r)),o=this.world.createCharacterController(i.offset);return o.setUp({x:0,y:1,z:0}),o.setSlideEnabled(!0),o.enableAutostep(i.autostepHeight,i.autostepMinWidth,!1),o.enableSnapToGround(i.snapToGround),o.setMaxSlopeClimbAngle(i.maxSlopeClimbDeg*Math.PI/180),o.setMinSlopeSlideAngle(i.minSlopeSlideDeg*Math.PI/180),o.setApplyImpulsesToDynamicBodies(!1),{collider:a,controller:o}}removeCharacter(e){this.world.removeCharacterController(e.controller),this.world.removeCollider(e.collider,!1)}step(){this.world.step()}raycast(e,t,n,r,i,a){let o=this.ray;o.origin.x=e.x,o.origin.y=e.y,o.origin.z=e.z,o.dir.x=t.x,o.dir.y=t.y,o.dir.z=t.z;let s=this.world.castRayAndGetNormal(o,n,!0,void 0,r,a);return s?(i.hit=!0,i.distance=s.timeOfImpact,i.point.x=e.x+t.x*s.timeOfImpact,i.point.y=e.y+t.y*s.timeOfImpact,i.point.z=e.z+t.z*s.timeOfImpact,i.normal.x=s.normal.x,i.normal.y=s.normal.y,i.normal.z=s.normal.z,i.collider=s.collider,!0):(i.hit=!1,i.distance=n,i.collider=null,!1)}lineOfSight(e,t,n,r){let i=t.x-e.x,a=t.y-e.y,o=t.z-e.z,s=Math.sqrt(i*i+a*a+o*o);if(s<1e-4)return!0;let c=this.ray;return c.origin.x=e.x,c.origin.y=e.y,c.origin.z=e.z,c.dir.x=i/s,c.dir.y=a/s,c.dir.z=o/s,this.world.castRay(c,s,!0,void 0,n,r)===null}sphereCast(e,t,n,r,i,a){this.ball.radius=r;let o=this.world.castShape(e,pd,t,this.ball,0,n,!0,void 0,i,a);return o?o.time_of_impact:n}overlapsCapsule(e,t,n,r,i){return this.capsule.radius=t,this.capsule.halfHeight=n,this.world.intersectionWithShape(e,pd,this.capsule,void 0,r,i)}overlapsBall(e,t,n,r){return this.ball.radius=t,this.world.intersectionWithShape(e,pd,this.ball,void 0,n,r)}debugLines(){let e=this.world.debugRender();return{vertices:e.vertices,colors:e.colors}}dispose(){this.world.free()}};function hd(e){return{health:e.health??e.maxHealth,maxHealth:e.maxHealth,armor:e.armor??e.maxArmor??0,maxArmor:e.maxArmor??0,regenDelay:e.regenDelay??4,regenRate:e.regenRate??20,sinceDamage:e.sinceDamage??99,heavyArmor:e.heavyArmor??e.maxHeavyArmor??0,maxHeavyArmor:e.maxHeavyArmor??0,dead:!1}}var gd=.75;function _d(e,t,n){return t===`head`?e*n:t===`limb`?e*gd:e}function vd(e,t,n,r=.6){return e<=t?1:e>=n?r:1-(1-r)*((e-t)/(n-t))}function yd(e,t,n={}){let r=n.zone??`body`,i={dealt:0,toArmor:0,toHealth:0,toHeavyArmor:0,killed:!1,zone:r};if(e.dead||!(t>0))return i;let a=_d(t,r,n.headMult??1);if(e.sinceDamage=0,!n.pierce&&e.heavyArmor>0&&r!==`head`){let t=Math.min(e.heavyArmor,a*(1-(n.heavyBodyFactor??.2)));e.heavyArmor-=t,i.toHeavyArmor=t,a-=t}if(!n.pierce&&e.armor>0){let t=Math.min(e.armor,a);e.armor-=t,i.toArmor=t,a-=t}let o=Math.min(e.health,a);return e.health-=o,i.toHealth=o,i.dealt=i.toArmor+i.toHealth+i.toHeavyArmor,e.health<=0&&(e.health=0,e.dead=!0,i.killed=!0),i}function bd(e,t){e.dead||(e.sinceDamage+=t,e.sinceDamage>=e.regenDelay&&e.armor<e.maxArmor&&(e.armor=Math.min(e.maxArmor,e.armor+e.regenRate*t)))}function xd(e,t){e.dead||(e.health=Math.min(e.maxHealth,e.health+t))}function Sd(e){e.health=e.maxHealth,e.armor=e.maxArmor,e.heavyArmor=e.maxHeavyArmor,e.sinceDamage=99,e.dead=!1}function Cd(e,t,n){let r=(e-t)/n;return r>=.8?`head`:r<=.42?`limb`:`body`}var wd={kill:100,headshot:150,takedown:250,perfectReload:80,dodgeKill:200,doubleTap:120,coverKill:120,noDamageKill:100,knifeKill:200,focusKill:80,multiKill:150,longShot:100},Td={kill:`Baja`,headshot:`Headshot`,takedown:`Takedown`,perfectReload:`Recarga perfecta`,dodgeKill:`Esquiva letal`,doubleTap:`Doble tap`,coverKill:`Desde cobertura`,noDamageKill:`Intocable`,knifeKill:`Filo`,focusKill:`Foco`,multiKill:`Multi-baja`,longShot:`Tiro largo`},Ed=[`Discreto`,`Preciso`,`Letal`,`Implacable`,`Despiadado`,`Mítico`,`Baba Yaga`,`Leyenda`],Dd=Object.keys(wd),Od=2.5,kd=.22,Ad=.35,jd=3,Md=class e{multiplier=1;gauge=0;score=0;bestMultiplier=1;sinceAction=99;used=new Set;counts=Object.fromEntries(Dd.map(e=>[e,0]));recent=[];static threshold(e){return 250+120*(e-1)}get rankName(){return Ed[Math.max(0,Math.min(Ed.length-1,this.multiplier-1))]??Ed[0]}varietyFor(e){let t=0;for(let n of this.recent)n===e&&t++;return t===0?1:t===1?.5:.25}register(t){let n=this.varietyFor(t),r=wd[t],i=this.multiplier,a=Math.round(r*n*i);this.score+=a,this.gauge+=r*n/e.threshold(this.multiplier);let o=!1;for(;this.gauge>=1&&this.multiplier<8;)--this.gauge,this.multiplier++,o=!0;return this.multiplier>=8&&(this.gauge=Math.min(this.gauge,1)),this.bestMultiplier=Math.max(this.bestMultiplier,this.multiplier),this.recent.push(t),this.recent.length>jd&&this.recent.shift(),this.used.add(t),this.counts[t]++,this.sinceAction=0,{action:t,points:a,variety:n,multiplier:i,leveledUp:o}}update(e){this.sinceAction+=e,this.sinceAction<=Od||(this.gauge-=kd*e,this.gauge<0&&(this.multiplier>1?(this.multiplier--,this.gauge=.6):this.gauge=0))}onDamage(e){e>0&&(this.gauge-=Ad*Math.min(1,e/25),this.gauge<0&&(this.multiplier>1?(this.multiplier--,this.gauge=.5):this.gauge=0))}get varietyCount(){return this.used.size}reset(){this.multiplier=1,this.gauge=0,this.score=0,this.bestMultiplier=1,this.sinceAction=99,this.used.clear(),this.recent.length=0;for(let e of Dd)this.counts[e]=0}},Nd=class{def;mag;reserve;cooldown=0;reloading=!1;reloadT=0;reloadDur=0;perfectTried=!1;lastReload=`none`;shotIndex=0;sinceShot=99;bloom=0;constructor(e){this.def=e,this.mag=e.mag,this.reserve=e.reserve}setDef(e){this.def=e,this.mag=Math.min(this.mag,e.mag)}get isGun(){return this.def.kind===`gun`}get interval(){return 60/this.def.rpm}canFire(){return this.cooldown>0?!1:!this.isGun||this.mag>0&&!this.reloading}fire(e){if(this.reloading&&this.mag>0&&this.cancelReload(),!this.canFire())return!1;if(this.cooldown=this.interval,this.sinceShot=0,this.isGun){this.mag--;let t=this.def.recoil,n=t[Math.min(this.shotIndex,t.length-1)]??[0,0];e[0]=n[0],e[1]=n[1],this.shotIndex++,this.bloom=Math.min(this.def.maxBloom,this.bloom+this.def.bloomPerShot)}else e[0]=0,e[1]=0;return!0}get needsReload(){return this.isGun&&this.mag<this.def.mag&&this.reserve>0}startReload(){return!this.isGun||this.reloading||!this.needsReload?!1:(this.reloading=!0,this.reloadT=0,this.reloadDur=this.def.reloadTime,this.perfectTried=!1,!0)}pressDuringReload(){if(!this.reloading||this.perfectTried)return`ignored`;this.perfectTried=!0;let e=this.reloadT/this.def.reloadTime;return e>=this.def.perfectStart&&e<=this.def.perfectEnd?(this.completeReload(),this.lastReload=`perfect`,`perfect`):(this.reloadDur+=this.def.jamPenalty,this.lastReload=`jammed`,`jammed`)}cancelReload(){this.reloading=!1,this.reloadT=0}completeReload(){let e=this.def.mag-this.mag,t=Math.min(e,this.reserve);this.mag+=t,this.reserve-=t,this.reloading=!1,this.reloadT=0}get reloadProgress(){return this.reloading?Gl(this.reloadT/this.reloadDur,0,1):-1}get perfectWindow(){let e=this.def.reloadTime/Math.max(1e-6,this.reloadDur);return[this.def.perfectStart*e,this.def.perfectEnd*e]}get perfectAvailable(){return this.reloading&&!this.perfectTried}update(e){this.cooldown=Math.max(0,this.cooldown-e),this.sinceShot+=e,this.sinceShot>this.def.recoilReset&&(this.shotIndex=0),this.bloom=Math.max(0,this.bloom-this.def.bloomDecay*e),this.reloading&&(this.reloadT+=e,this.reloadT>=this.reloadDur&&(this.completeReload(),this.lastReload!==`jammed`&&(this.lastReload=`normal`)))}spread(e,t,n){let r=this.def,i=(e?r.spreadAim:r.spreadHip)+r.spreadMove*Gl(t,0,1.6)*(e?.5:1)+this.bloom;return n&&(i*=.7),i}refill(e){this.cancelReload(),this.mag=this.def.mag,e&&(this.reserve=this.def.reserve)}addReserve(e){this.isGun&&(this.reserve=Math.min(this.def.reserve===1/0?1/0:this.def.reserve*2,this.reserve+e))}},Pd={carbine:{id:`carbine`,name:`Carabina TR-4`,slot:1,kind:`gun`,damage:30,headMult:3,pellets:1,rpm:540,auto:!0,mag:24,reserve:96,reloadTime:1.9,perfectStart:.42,perfectEnd:.56,jamPenalty:.35,spreadHip:3,spreadAim:.35,spreadMove:1.6,bloomPerShot:.35,bloomDecay:5,maxBloom:3,recoil:[[.9,.05],[1,.1],[1.1,.1],[1.1,.15],[1,.2],[.9,.25],[.8,.3],[.7,.35],[.6,.35],[.5,.3],[.5,.2],[.45,0],[.45,-.2],[.45,-.35],[.4,-.45],[.4,-.5],[.35,-.45],[.35,-.3],[.35,-.1],[.35,.1],[.35,.25],[.35,.35],[.35,.3],[.35,.2]],recoilReset:.35,range:120,falloffStart:35,falloffEnd:80,noise:32,model:`rifle`},shotgun:{id:`shotgun`,name:`Escopeta "Sommelier"`,slot:1,kind:`gun`,damage:14,headMult:1.5,pellets:8,rpm:70,auto:!1,mag:6,reserve:30,reloadTime:2.4,perfectStart:.4,perfectEnd:.55,jamPenalty:.4,spreadHip:5.5,spreadAim:3.2,spreadMove:1,bloomPerShot:0,bloomDecay:5,maxBloom:0,recoil:[[4,.3]],recoilReset:.5,range:40,falloffStart:8,falloffEnd:22,noise:35,model:`shotgun`},pistol:{id:`pistol`,name:`Pistola P-45`,slot:2,kind:`gun`,damage:34,headMult:3,pellets:1,rpm:360,auto:!1,mag:12,reserve:1/0,reloadTime:1.25,perfectStart:.45,perfectEnd:.62,jamPenalty:.3,spreadHip:2.2,spreadAim:.45,spreadMove:1.2,bloomPerShot:.5,bloomDecay:6,maxBloom:2.5,recoil:[[1.6,.1],[1.7,-.15],[1.8,.2],[1.8,-.2]],recoilReset:.3,range:80,falloffStart:20,falloffEnd:45,noise:28,model:`pistol`},knife:{id:`knife`,name:`Cuchillo`,slot:3,kind:`melee`,damage:120,headMult:1,pellets:0,rpm:110,auto:!1,mag:0,reserve:0,reloadTime:0,perfectStart:0,perfectEnd:0,jamPenalty:0,spreadHip:0,spreadAim:0,spreadMove:0,bloomPerShot:0,bloomDecay:0,maxBloom:0,recoil:[[0,0]],recoilReset:0,range:1.7,falloffStart:99,falloffEnd:99,noise:2,model:`knife`,meleeRange:1.7,meleeArcDeg:70}};function Fd(e,t){let n={...e,recoil:e.recoil};return n.kind===`gun`?(t.has(`extMag`)&&(n.id===`carbine`&&(n.mag+=8),n.id===`pistol`&&(n.mag+=4)),t.has(`hollowPoint`)&&(n.damage=Math.round(n.damage*1.15*10)/10),t.has(`compensator`)&&(n.recoil=n.recoil.map(([e,t])=>[e*.65,t*.65])),t.has(`suppressor`)&&n.id===`pistol`&&(n.noise=8)):t.has(`tacticalKnife`)&&(n.meleeRange=2.2,n.range=2.2,n.rpm=150),n}function Id(e){return 60+(e.has(`suit1`)?20:0)+(e.has(`suit2`)?20:0)+(e.has(`suit3`)?20:0)}function Ld(e){return e.has(`extraMarker`)?4:3}function Rd(e){return e.has(`shotgun`)?[`carbine`,`shotgun`,`pistol`,`knife`]:[`carbine`,`pistol`,`knife`]}function zd(){return{fireHeld:!1,firePressed:!1,aim:!1,reloadPressed:!1,takedownPressed:!1,focusPressed:!1,select:null,cycle:0}}var Bd=.95,Vd=.55,Hd=.75,Ud=1.9,Wd=.55,Gd=.28,Kd=30,qd=22,Jd=.35,Yd=new H,Xd=new H,Zd=new H,Qd=new H,$d=new H,ef=new H,tf=new H,nf=new H,rf=new H,af=new H,of=new H,sf=[0,0],cf=class{vitals;style=new Md;weapons=new Map;loadout;current;owned;switchT=0;holstered=!1;onFireWhileHolstered=null;focus=40;focusActive=!1;takedown=null;meleeT=0;dead=!1;time=0;stats={shotsFired:0,shotsHit:0,kills:0,headshots:0,takedowns:0,damageTaken:0,healthLost:0,reloads:0,perfectReloads:0,deaths:0,switches:0,focusUses:0,knifeKills:0};sinceDamage=99;sinceDodge=99;sinceCover=99;lastKillTime=-99;lastDamage=null;hitMarker={kind:`none`,t:0};damageDirs=Array.from({length:6},()=>({from:new H,t:0}));damageDirNext=0;feed=[];blocked=!1;aimOver=`none`;spreadDeg=0;recoilVis=0;lastHitEnemy=null;lastHitTime=-99;lastRolls=0;hit=dd();probeTimer=0;constructor(e,t=[`carbine`,`pistol`,`knife`]){this.owned=e,this.loadout=t;for(let n of t)this.weapons.set(n,new Nd(Fd(Pd[n],e)));this.current=t.includes(`pistol`)?`pistol`:t[0]??`pistol`,this.vitals=hd({maxHealth:100,maxArmor:Id(e),regenDelay:4,regenRate:20})}get weapon(){let e=this.weapons.get(this.current);if(!e)throw Error(`Arma no disponible: ${this.current}`);return e}applyOwned(e){this.owned=e,this.loadout=Rd(e);for(let t of this.loadout){let n=Fd(Pd[t],e),r=this.weapons.get(t);r?r.setDef(n):this.weapons.set(t,new Nd(n))}let t=Id(e);t!==this.vitals.maxArmor&&(this.vitals.maxArmor=t,this.vitals.armor=t)}get timeScale(){return this.focusActive?Jd:1}respawnReset(){Sd(this.vitals),this.dead=!1,this.takedown=null,this.switchT=0,this.meleeT=0,this.focusActive=!1,this.sinceDamage=99;for(let e of this.weapons.values())e.refill(!1);for(let e of this.damageDirs)e.t=0}award(e){let t=this.style.register(e);this.focus=Math.min(100,this.focus+t.points*.04),this.feed.unshift({text:Td[e],points:t.points,t:2.2}),this.feed.length>5&&this.feed.pop()}pushFeed(e){this.feed.unshift({text:e,points:0,t:2}),this.feed.length>5&&this.feed.pop()}frameUpdate(e,t){this.focusActive&&(this.focus-=qd*e,this.focus<=0&&(this.focus=0,this.focusActive=!1,t.focus(!1))),this.hitMarker.t=Math.max(0,this.hitMarker.t-e);for(let t of this.damageDirs)t.t=Math.max(0,t.t-e);for(let t of this.feed)t.t-=e;for(;this.feed.length&&this.feed[this.feed.length-1].t<=0;)this.feed.pop();this.recoilVis=Math.max(0,this.recoilVis-e*8)}fixedUpdate(e,t,n){if(this.time+=e,this.sinceDamage+=e,this.sinceDodge+=e,this.sinceCover+=e,this.meleeT=Math.max(0,this.meleeT-e),this.dead)return;bd(this.vitals,e),this.style.update(e);let r=n.player,i=r.stats.rolls+r.stats.dives;i!==this.lastRolls&&(this.lastRolls=i,this.sinceDodge=0),r.state===`cover`&&(this.sinceCover=0);for(let t of this.weapons.values())t.update(e);if(this.collectPickups(n),this.takedown){this.tickTakedown(e,n);return}if(t.focusPressed&&(this.focusActive?(this.focusActive=!1,n.audio.focus(!1)):this.focus>=Kd&&(this.focusActive=!0,this.stats.focusUses++,n.audio.focus(!0))),this.handleSwitch(t),this.switchT>0){this.switchT-=e;return}if(t.takedownPressed){let e=this.takedownCandidate(n);if(e){this.startTakedown(e,n);return}}let a=this.weapon;if(t.reloadPressed&&a.isGun){if(a.reloading){let e=a.pressDuringReload();e===`perfect`?(this.stats.perfectReloads++,n.audio.perfectReload(),this.award(`perfectReload`)):e===`jammed`&&n.audio.jam()}else a.startReload()&&(this.stats.reloads++,n.audio.reload(`start`))}a.isGun&&a.reloading&&a.reloadProgress>=0&&a.reloadT+e>=a.reloadDur&&n.audio.reload(`end`);let o=r.state!==`roll`&&r.state!==`vault`&&r.state!==`locked`&&r.state!==`dead`;(a.def.auto?t.fireHeld:t.firePressed)&&o&&(this.holstered?t.firePressed&&this.onFireWhileHolstered?.():a.isGun?a.mag===0&&!a.reloading?(t.firePressed&&n.audio.empty(),a.startReload()&&(this.stats.reloads++,n.audio.reload(`start`))):a.fire(sf)&&this.shoot(a,n,t.aim):a.fire(sf)&&this.melee(n)),this.probeTimer-=e,this.probeTimer<=0&&(this.probeTimer=.05,this.probeAim(n));let s=r.stepSpeed(e)/4.6;this.spreadDeg=a.isGun?a.spread(t.aim,s,r.posture===`crouch`):0}handleSwitch(e){let t=e.select;if(!t&&e.cycle!==0){let n=this.loadout.indexOf(this.current);t=this.loadout[(n+e.cycle+this.loadout.length)%this.loadout.length]??null}t===`carbine`&&this.weapons.has(`shotgun`)&&(this.current===`carbine`||!this.weapons.has(`carbine`))&&(t=`shotgun`),t&&t!==this.current&&this.weapons.has(t)&&(this.weapon.cancelReload(),this.current=t,this.switchT=Gd,this.stats.switches++)}muzzleOf(e,t,n){let r=e.yaw,i=-Math.sin(r),a=-Math.cos(r),o=Math.cos(r),s=-Math.sin(r),c=e.posture===`crouch`?.98:1.42,l=t?.55:.4;return n.set(e.feet.x+i*l+o*.22,e.feet.y+c,e.feet.z+a*l+s*.22)}aimPoint(e,t,n){let r=e.camera;Yd.copy(r.position),Xd.copy(r.forward),this.muzzleOf(e.player,!0,$d);let i=Math.max(0,af.subVectors($d,Yd).dot(Xd));return Zd.copy(Yd).addScaledVector(Xd,i),e.physics.raycast(Zd,Xd,t,ud.PLAYER_SHOT,this.hit,e.player.collider)?n.copy(this.hit.point):n.copy(Zd).addScaledVector(Xd,t),n}probeAim(e){let t=this.weapon,n=t.isGun?t.def.range:4;this.aimPoint(e,n,Qd);let r=this.hit.hit?e.enemies.enemyFromCollider(this.hit.collider):null,i=this.hit.hit&&!r?e.civilians?.fromCollider(this.hit.collider):null;this.aimOver=r&&r.alive?`enemy`:i&&i.alive?`civilian`:`none`,this.muzzleOf(e.player,!0,$d),ef.subVectors(Qd,$d);let a=ef.length();this.blocked=!1,a>.5&&(ef.multiplyScalar(1/a),e.physics.raycast($d,ef,a-.2,ud.STATIC,this.hit,e.player.collider)&&(this.blocked=this.hit.distance<a*.85))}shoot(e,t,n){let r=e.def,i=t.player,a=t.physics;this.aimPoint(t,r.range,Qd),this.muzzleOf(i,n,$d);let o=of.subVectors(Qd,$d).normalize();tf.crossVectors(o,Math.abs(o.y)<.95?af.set(0,1,0):af.set(1,0,0)).normalize(),nf.crossVectors(tf,o).normalize();let s=e.spread(n,i.stepSpeed(1/60)/4.6,i.posture===`crouch`)*Wl,c=!1;for(let e=0;e<Math.max(1,r.pellets);e++){let e=t.rng.range(0,Math.PI*2),n=Math.sqrt(t.rng.next())*Math.tan(s);if(ef.copy(o).addScaledVector(tf,Math.cos(e)*n).addScaledVector(nf,Math.sin(e)*n).normalize(),a.raycast($d,ef,r.range,ud.PLAYER_SHOT,this.hit,i.collider)){rf.copy(this.hit.point);let e=t.enemies.enemyFromCollider(this.hit.collider),n=e?null:t.civilians?.fromCollider(this.hit.collider);if(e&&e.alive){c=!0;let n=Cd(rf.y,e.feet.y,e.height),a=r.damage*vd(this.hit.distance,r.falloffStart,r.falloffEnd),o=e.applyHit(a,n,i.feet,r.headMult);t.vfx.impact(rf,this.hit.normal,`blood`,5),this.onHit(e,n,o.killed,o.toHeavyArmor>o.toHealth,this.hit.distance,`gun`,t)}else n&&n.alive&&t.civilians?(t.vfx.impact(rf,this.hit.normal,`blood`,4),t.civilians.hit(n,r.damage*vd(this.hit.distance,r.falloffStart,r.falloffEnd))):(t.vfx.impact(rf,this.hit.normal,`spark`,6),t.vfx.decal(rf,this.hit.normal))}else rf.copy($d).addScaledVector(ef,r.range);t.vfx.tracer($d,rf,16769696)}this.stats.shotsFired++,c&&this.stats.shotsHit++,t.vfx.muzzle($d,o,!0),t.audio.shot(r.id===`carbine`?`carbine`:r.id===`shotgun`?`shotgun`:r.noise<12?`pistolSilenced`:`pistol`);let l=n?.75:1;t.camera.kick(sf[0]*Wl*l,-sf[1]*Wl*l),t.camera.addTrauma(r.id===`shotgun`?.22:.07),this.recoilVis=1,t.enemies.noise(i.feet,r.noise),t.civilians?.noise(i.feet,Math.max(r.noise,12))}onHit(e,t,n,r,i,a,o){n?(this.hitMarker.kind=`kill`,this.hitMarker.t=.32,o.audio.hit(`kill`)):(this.hitMarker.kind=t===`head`?`head`:r?`armor`:`body`,this.hitMarker.t=.16,o.audio.hit(this.hitMarker.kind===`head`?`head`:r?`armor`:`body`));let s=this.lastHitEnemy===e&&this.time-this.lastHitTime<.35;if(this.lastHitEnemy=e,this.lastHitTime=this.time,!n)return;let c=`kill`;a===`takedown`?c=`takedown`:a===`knife`?c=`knifeKill`:this.sinceDodge<1?c=`dodgeKill`:t===`head`?c=`headshot`:this.sinceCover<.6?c=`coverKill`:this.focusActive?c=`focusKill`:i>30&&(c=`longShot`),this.award(c),this.time-this.lastKillTime<1.5&&this.award(`multiKill`),this.sinceDamage>10&&this.award(`noDamageKill`),(s||a===`takedown`)&&this.award(`doubleTap`),this.lastKillTime=this.time,this.stats.kills++,t===`head`&&this.stats.headshots++,a===`knife`&&this.stats.knifeKills++;let l=this.weapons.get(`carbine`)??this.weapons.get(`shotgun`);!l||l.reserve<l.def.mag||o.rng.chance(.65)?o.pickups.add(`ammo`,e.feet,40):this.vitals.health<60&&o.rng.chance(.5)&&o.pickups.add(`medkit`,e.feet,40)}melee(e){let t=this.weapon,n=e.player;this.meleeT=.3,e.audio.knife();let r=t.def.meleeRange??1.7,i=Math.cos((t.def.meleeArcDeg??70)/2*Wl),a=-Math.sin(n.yaw),o=-Math.cos(n.yaw),s=null,c=r;for(let t of e.enemies.enemies){if(!t.alive)continue;let e=t.feet.x-n.feet.x,r=t.feet.z-n.feet.z,l=Math.hypot(e,r);l>c||Math.abs(t.feet.y-n.feet.y)>1.2||(e*a+r*o)/Math.max(1e-4,l)<i||(s=t,c=l)}if(!s)return;let l=-Math.sin(s.mover.yaw),u=-Math.cos(s.mover.yaw),d=s.feet.x-n.feet.x,f=s.feet.z-n.feet.z,p=(d*l+f*u)/Math.max(1e-4,Math.hypot(d,f))>.3,m=s.state===`patrol`||s.state===`suspicious`,h=s.applyHit(p||m?999:t.def.damage,`body`,n.feet,1,p||m);af.set(s.feet.x,s.feet.y+1.2,s.feet.z),e.vfx.impact(af,Xd.set(-d,0,-f).normalize(),`blood`,8),this.stats.shotsFired++,this.stats.shotsHit++,this.onHit(s,`body`,h.killed,!1,c,`knife`,e)}takedownCandidate(e){let t=e.player;if(t.state!==`ground`&&t.state!==`cover`)return null;let n=-Math.sin(e.camera.yaw),r=-Math.cos(e.camera.yaw),i=null,a=Ud;for(let o of e.enemies.enemies){if(!o.alive||o.def.takedownWhenStunned&&o.state!==`stunned`)continue;let e=o.feet.x-t.feet.x,s=o.feet.z-t.feet.z,c=Math.hypot(e,s);c>a||Math.abs(o.feet.y-t.feet.y)>.8||(e*n+s*r)/Math.max(1e-4,c)<Wd||(i=o,a=c)}return i}startTakedown(e,t){this.weapon.cancelReload(),this.takedown={enemy:e,t:0,shots:0},e.stun(),t.player.setLocked(!0),t.player.yaw=Math.atan2(-(e.feet.x-t.player.feet.x),-(e.feet.z-t.player.feet.z)),this.meleeT=.45,t.audio.takedown(),t.camera.addTrauma(.25)}tickTakedown(e,t){let n=this.takedown;n.t+=e;let r=n.enemy,i=()=>{this.muzzleOf(t.player,!0,$d),af.set(r.feet.x,r.feet.y+.35,r.feet.z),ef.subVectors(af,$d).normalize(),t.vfx.tracer($d,af,16769696),t.vfx.muzzle($d,ef,!0),t.vfx.impact(af,Xd.set(0,1,0),`blood`,6),t.audio.shot(`pistol`),t.camera.addTrauma(.12)};if(n.shots===0&&n.t>=Vd&&(n.shots=1,i(),r.alive)){let e=r.applyHit(999,`body`,t.player.feet,1,!0);this.stats.takedowns++,this.onHit(r,`body`,e.killed,!1,1,`takedown`,t)}n.shots===1&&n.t>=Hd&&(n.shots=2,i()),(n.t>=Bd||this.dead)&&(this.takedown=null,t.player.setLocked(!1))}takeHit(e,t,n){if(this.dead||!(t>0))return;let r=n.player;if(r.invulnerable)return;let i=t;if(this.takedown&&(i*=.25),r.state===`cover`&&r.cover){let t=e.feet.x-r.feet.x,n=e.feet.z-r.feet.z,a=Math.hypot(t,n)||1;t/a*-r.cover.normal.x+n/a*-r.cover.normal.z>.3&&(i*=.5)}let a=yd(this.vitals,i);this.stats.damageTaken+=a.dealt,this.stats.healthLost+=a.toHealth,this.sinceDamage=0,this.style.onDamage(a.dealt);let o=this.damageDirs[this.damageDirNext];this.damageDirNext=(this.damageDirNext+1)%this.damageDirs.length,o.from.copy(e.feet),o.t=1.1,this.lastDamage={label:e.def.label,type:e.def.type,from:e.feet.clone(),distance:e.feet.distanceTo(r.feet)},n.audio.hurt(i>20),n.camera.addTrauma(Math.min(.6,.15+i/50)),a.killed&&this.die(n)}die(e){this.dead=!0,this.stats.deaths++,this.lastPlayerPos.copy(e.player.feet),this.focusActive=!1,this.weapon.cancelReload(),this.takedown&&=(this.takedown.enemy.brain.unstun(),this.takedown.enemy.mover.setLocked(!1),null),e.player.setLocked(!1),e.player.kill()}deathCause(e){let t=this.lastDamage;return t?`Te disparó un ${t.label} a ${Math.round(t.distance)} m. ${lf(e,t.from,this.lastPlayerPos)}`:`Caíste en combate.`}lastPlayerPos=new H;collectPickups(e){let t=this.weapons.get(`carbine`)??this.weapons.get(`shotgun`),n=e.pickups.collect(e.player.feet,e=>e===`ammo`?!!t&&t.reserve<t.def.reserve:e===`medkit`?this.vitals.health<this.vitals.maxHealth:this.vitals.armor<this.vitals.maxArmor);n&&(e.audio.ui(`confirm`),n===`ammo`&&t?(t.addReserve(t.def.mag*1.5),this.pushFeed(`+ Munición (${t.def.name})`)):n===`medkit`?(xd(this.vitals,50),this.pushFeed(`+ Botiquín`)):(this.vitals.armor=this.vitals.maxArmor,this.pushFeed(`+ Integridad del traje`)))}};function lf(e,t,n){let r=Math.atan2(-(t.x-n.x),-(t.z-n.z))-e;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;let i=Math.abs(r);return i<Math.PI/4?`Venía de delante.`:i>Math.PI*3/4?`Venía de tu espalda.`:r>0?`Venía de tu izquierda.`:`Venía de tu derecha.`}var uf={boot:[`title`,`loading`],title:[`loading`],loading:[`hub`,`playing`,`briefing`,`title`],hub:[`hubMenu`,`paused`,`loading`,`playing`,`briefing`,`dead`],hubMenu:[`hub`,`briefing`,`loading`],briefing:[`loading`,`hub`,`playing`],playing:[`paused`,`dead`,`results`,`loading`,`hub`],paused:[`hub`,`playing`,`loading`,`title`],dead:[`playing`,`hub`,`results`,`loading`],results:[`loading`,`title`]},df=new Set([`hub`,`playing`,`dead`]),ff=new Set([`hub`,`playing`]),pf=class{current=`boot`;previous=`boot`;listeners=new Set;resumeTo=`playing`;get state(){return this.current}get prev(){return this.previous}can(e){return uf[this.current].includes(e)}go(e){if(e!==this.current){if(!this.can(e))throw Error(`Transición inválida: ${this.current} → ${e}`);e===`paused`&&(this.current===`hub`||this.current===`playing`)&&(this.resumeTo=this.current),this.previous=this.current,this.current=e;for(let t of this.listeners)t(e,this.previous)}}on(e){return this.listeners.add(e),()=>this.listeners.delete(e)}get simulating(){return df.has(this.current)}get controlling(){return ff.has(this.current)}},mf=[`moveForward`,`moveBack`,`moveLeft`,`moveRight`,`jump`,`dodge`,`sprint`,`crouch`,`fire`,`aim`,`reload`,`takedown`,`interact`,`focus`,`weapon1`,`weapon2`,`weapon3`,`weaponNext`,`weaponPrev`,`shoulder`,`intel`,`pause`,`help`,`debug`],hf={moveForward:[`KeyW`,`ArrowUp`],moveBack:[`KeyS`,`ArrowDown`],moveLeft:[`KeyA`,`ArrowLeft`],moveRight:[`KeyD`,`ArrowRight`],jump:[`Space`,`Pad0`],dodge:[`AltLeft`,`AltRight`,`Pad5`],sprint:[`ShiftLeft`,`ShiftRight`,`Pad10`],crouch:[`KeyC`,`Pad3`],fire:[`Mouse0`,`Pad7`],aim:[`Mouse2`,`Pad6`],reload:[`KeyR`,`Pad2`],takedown:[`KeyF`,`Pad1`],interact:[`KeyE`,`Pad0`],focus:[`KeyQ`,`Pad4`],weapon1:[`Digit1`,`Pad12`],weapon2:[`Digit2`],weapon3:[`Digit3`,`Pad13`],weaponNext:[`WheelDown`,`Pad15`],weaponPrev:[`WheelUp`,`Pad14`],shoulder:[`KeyV`,`Pad11`],intel:[`Tab`,`Pad8`],pause:[`Escape`,`Pad9`],help:[`KeyH`],debug:[`F3`]},gf=mf.filter(e=>e!==`debug`&&e!==`pause`),_f={moveForward:`Avanzar`,moveBack:`Retroceder`,moveLeft:`Izquierda`,moveRight:`Derecha`,jump:`Saltar / Vault`,dodge:`Esquiva (también doble Espacio)`,sprint:`Sprint`,crouch:`Agacharse / Deslizar / Cubrirse`,fire:`Disparar`,aim:`Apuntar`,reload:`Recargar`,takedown:`Takedown / Melee`,interact:`Interactuar`,focus:`Foco (cámara lenta)`,weapon1:`Arma principal`,weapon2:`Pistola`,weapon3:`Cuchillo`,weaponNext:`Siguiente arma`,weaponPrev:`Arma anterior`,shoulder:`Cambiar de hombro`,intel:`Contratos / Intel`,pause:`Pausa`,help:`Controles`,debug:`Debug`},vf={0:`A`,1:`B`,2:`X`,3:`Y`,4:`LB`,5:`RB`,6:`LT`,7:`RT`,8:`Select`,9:`Start`,10:`L3`,11:`R3`,12:`D-pad ↑`,13:`D-pad ↓`,14:`D-pad ←`,15:`D-pad →`,16:`Home`};function yf(e){if(e.startsWith(`Pad`))return vf[Number(e.slice(3))]??e;if(e.startsWith(`Key`))return e.slice(3);if(e.startsWith(`Digit`))return e.slice(5);switch(e){case`Mouse0`:return`Clic izq.`;case`Mouse1`:return`Clic central`;case`Mouse2`:return`Clic der.`;case`WheelUp`:return`Rueda ↑`;case`WheelDown`:return`Rueda ↓`;case`Space`:return`Espacio`;case`ShiftLeft`:case`ShiftRight`:return`Shift`;case`AltLeft`:case`AltRight`:return`Alt`;case`ControlLeft`:case`ControlRight`:return`Ctrl`;case`Escape`:return`Esc`;case`Tab`:return`Tab`;case`Enter`:return`Enter`;case`ArrowUp`:return`↑`;case`ArrowDown`:return`↓`;case`ArrowLeft`:return`←`;case`ArrowRight`:return`→`;default:return e}}function bf(e){let t={};for(let n of mf)t[n]=[...e[n]??hf[n]];return t}var xf=.16,Sf=.35,Cf=new Set([`Tab`,`Space`,`AltLeft`,`AltRight`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`F3`,`Backquote`]),wf=class{capturing=!1;freeLook=!1;lastDevice=`kbm`;bindings=bf(hf);codeToActions=new Map;down=new Set;padDown=new Set;virtualDown=new Set;pressedLatch=new Set;releasedLatch=new Set;consumed=new Set;mouseDX=0;mouseDY=0;padMove={x:0,y:0};padLook={x:0,y:0};virtualMove={x:0,y:0};listeners=new Set;target;attached=!1;padIndex=-1;captureNext=null;constructor(e){this.target=e,this.rebuildMap()}attach(){this.attached||(this.attached=!0,window.addEventListener(`keydown`,this.onKeyDown,{capture:!0}),window.addEventListener(`keyup`,this.onKeyUp,{capture:!0}),window.addEventListener(`mousedown`,this.onMouseDown),window.addEventListener(`mouseup`,this.onMouseUp),window.addEventListener(`mousemove`,this.onMouseMove),this.target.addEventListener(`wheel`,this.onWheel,{passive:!1}),this.target.addEventListener(`contextmenu`,this.onContextMenu),window.addEventListener(`blur`,this.onBlur),document.addEventListener(`visibilitychange`,this.onVisibility),document.addEventListener(`pointerlockchange`,this.onPointerLockChange),window.addEventListener(`gamepadconnected`,this.onPadConnected),window.addEventListener(`gamepaddisconnected`,this.onPadDisconnected))}detach(){this.attached&&(this.attached=!1,window.removeEventListener(`keydown`,this.onKeyDown,{capture:!0}),window.removeEventListener(`keyup`,this.onKeyUp,{capture:!0}),window.removeEventListener(`mousedown`,this.onMouseDown),window.removeEventListener(`mouseup`,this.onMouseUp),window.removeEventListener(`mousemove`,this.onMouseMove),this.target.removeEventListener(`wheel`,this.onWheel),this.target.removeEventListener(`contextmenu`,this.onContextMenu),window.removeEventListener(`blur`,this.onBlur),document.removeEventListener(`visibilitychange`,this.onVisibility),document.removeEventListener(`pointerlockchange`,this.onPointerLockChange),window.removeEventListener(`gamepadconnected`,this.onPadConnected),window.removeEventListener(`gamepaddisconnected`,this.onPadDisconnected))}on(e){return this.listeners.add(e),()=>this.listeners.delete(e)}emit(e){for(let t of this.listeners)t(e)}getBindings(){return bf(this.bindings)}setBindings(e){this.bindings=bf(e),this.rebuildMap()}rebuildMap(){this.codeToActions.clear();for(let e of mf)for(let t of this.bindings[e]){let n=this.codeToActions.get(t);n?n.push(e):this.codeToActions.set(t,[e])}}label(e,t=this.lastDevice){let n=this.bindings[e];return yf((t===`pad`?n.find(e=>e.startsWith(`Pad`)):n.find(e=>!e.startsWith(`Pad`)))??n[0]??`?`)}captureNextCode(e){this.captureNext=e}codeActive(e){return this.down.has(e)||this.padDown.has(e)||this.virtualDown.has(e)}isDown(e){for(let t of this.bindings[e])if(this.codeActive(t))return!0;return!1}pressed(e){for(let t of this.bindings[e])if(this.pressedLatch.has(t)&&!this.consumed.has(t))return!0;return!1}released(e){for(let t of this.bindings[e])if(this.releasedLatch.has(t))return!0;return!1}consume(e){for(let t of this.bindings[e])this.pressedLatch.has(t)&&this.consumed.add(t)}moveAxis(e){let t=+!!this.isDown(`moveRight`)-!!this.isDown(`moveLeft`),n=+!!this.isDown(`moveForward`)-!!this.isDown(`moveBack`);t+=this.padMove.x+this.virtualMove.x,n+=this.padMove.y+this.virtualMove.y;let r=Math.hypot(t,n);return r>1&&(t/=r,n/=r),e.x=t,e.y=n,e}consumeMouse(e){return e.x=this.mouseDX,e.y=this.mouseDY,this.mouseDX=0,this.mouseDY=0,e}padLookAxis(e){return e.x=this.padLook.x,e.y=this.padLook.y,e}get pointerLocked(){return document.pointerLockElement===this.target}endStep(){this.pressedLatch.clear(),this.releasedLatch.clear(),this.consumed.clear()}reset(){this.down.clear(),this.padDown.clear(),this.virtualDown.clear(),this.pressedLatch.clear(),this.releasedLatch.clear(),this.consumed.clear(),this.mouseDX=0,this.mouseDY=0,this.padMove.x=this.padMove.y=0,this.padLook.x=this.padLook.y=0,this.virtualMove.x=this.virtualMove.y=0}get heldCount(){return this.down.size+this.padDown.size+this.virtualDown.size+ +(this.virtualMove.x!==0||this.virtualMove.y!==0)}virtualHold(e,t){let n=this.bindings[e][0];n&&(t?(this.virtualDown.has(n)||this.pressedLatch.add(n),this.virtualDown.add(n)):this.virtualDown.delete(n)&&this.releasedLatch.add(n))}virtualPress(e){let t=this.bindings[e][0];t&&this.pressedLatch.add(t)}setVirtualMove(e,t){this.virtualMove.x=e,this.virtualMove.y=t}pollGamepad(){let e=typeof navigator.getGamepads==`function`?navigator.getGamepads():[],t=null;if(this.padIndex>=0&&(t=e[this.padIndex]??null),!t){for(let n of e)if(n&&n.connected){t=n,this.padIndex=n.index;break}}if(!t||!t.connected){if(this.padDown.size>0){for(let e of this.padDown)this.releasedLatch.add(e);this.padDown.clear()}this.padMove.x=this.padMove.y=0,this.padLook.x=this.padLook.y=0;return}let n=!1;for(let e=0;e<t.buttons.length&&e<17;e++){let r=t.buttons[e];if(!r)continue;let i=e===6||e===7?r.value>Sf:r.pressed,a=Tf[e]??`Pad${e}`;i?(n=!0,this.padDown.has(a)||(this.padDown.add(a),this.pressedLatch.add(a))):this.padDown.delete(a)&&this.releasedLatch.add(a)}Ef(t.axes[0]??0,-(t.axes[1]??0),this.padMove,1),Ef(t.axes[2]??0,t.axes[3]??0,this.padLook,1.6),(n||Math.abs(this.padMove.x)+Math.abs(this.padMove.y)+Math.abs(this.padLook.x)+Math.abs(this.padLook.y)>0)&&(this.lastDevice=`pad`)}onKeyDown=e=>{if(this.captureNext){e.preventDefault();let t=this.captureNext;this.captureNext=null,t(e.code)}else this.capturing&&(Cf.has(e.code)||this.codeToActions.has(e.code))&&e.preventDefault(),this.lastDevice=`kbm`,e.repeat||(this.down.has(e.code)||this.pressedLatch.add(e.code),this.down.add(e.code))};onKeyUp=e=>{this.capturing&&(Cf.has(e.code)||this.codeToActions.has(e.code))&&e.preventDefault(),this.down.delete(e.code)&&this.releasedLatch.add(e.code)};onMouseDown=e=>{if(this.captureNext&&e.button!==0){e.preventDefault();let t=this.captureNext;this.captureNext=null,t(`Mouse${e.button}`);return}let t=`Mouse${e.button}`;this.lastDevice=`kbm`,this.gameTarget(e)&&(this.down.has(t)||this.pressedLatch.add(t),this.down.add(t))};onMouseUp=e=>{let t=`Mouse${e.button}`;this.down.delete(t)&&this.releasedLatch.add(t)};gameTarget(e){return this.pointerLocked||e.target===this.target}onMouseMove=e=>{(this.pointerLocked||this.freeLook)&&(Math.abs(e.movementX)>600||Math.abs(e.movementY)>600||(this.mouseDX+=e.movementX,this.mouseDY+=e.movementY,this.lastDevice=`kbm`))};onWheel=e=>{this.capturing&&e.preventDefault();let t=e.deltaY<0?`WheelUp`:`WheelDown`;this.pressedLatch.add(t)};onContextMenu=e=>{e.preventDefault()};onBlur=()=>{this.reset(),this.emit(`blur`)};onVisibility=()=>{document.visibilityState===`hidden`&&(this.reset(),this.emit(`hidden`))};onPointerLockChange=()=>{this.pointerLocked?(this.mouseDX=0,this.mouseDY=0,this.emit(`pointerlock-gained`)):(this.reset(),this.emit(`pointerlock-lost`))};onPadConnected=e=>{this.padIndex=e.gamepad.index,this.emit(`pad-connected`)};onPadDisconnected=e=>{e.gamepad.index===this.padIndex&&(this.padIndex=-1,this.reset()),this.emit(`pad-disconnected`)}},Tf=Array.from({length:17},(e,t)=>`Pad${t}`);function Ef(e,t,n,r){let i=Math.hypot(e,t);if(i<xf){n.x=0,n.y=0;return}let a=Math.min(1,(i-xf)/.84)**+r;n.x=e/i*a,n.y=t/i*a}var Df=class{s;constructor(e=2654435769){this.s=e>>>0}setSeed(e){this.s=e>>>0}next(){let e=this.s=this.s+1831565813>>>0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}range(e,t){return e+(t-e)*this.next()}int(e,t){return Math.floor(this.range(e,t+1))}chance(e){return this.next()<e}pick(e){if(e.length===0)throw Error(`Rng.pick: lista vacía`);return e[Math.floor(this.next()*e.length)]}sign(){return this.next()<.5?-1:1}},Of=[`low`,`medium`,`high`],kf={mouseSens:[.25,3],padSens:[.25,3],fov:[55,95],brightness:[.7,1.5],master:[0,1],music:[0,1],sfx:[0,1],ui:[0,1],shake:[0,1],uiScale:[.85,1.4]},Af=new Set([`Escape`,`F3`]);function jf(){return{version:1,mouseSens:1,padSens:1,invertY:!1,aimToggle:!1,fov:68,brightness:1,preset:`medium`,dynamicResolution:!0,master:.8,music:.55,sfx:.9,ui:.7,shake:1,uiScale:1,hints:!0,bindings:Mf(hf)}}function Mf(e){let t={};for(let n of mf)t[n]=[...e[n]];return t}var Nf=/^(Key[A-Z]|Digit\d|Numpad\w+|Arrow(Up|Down|Left|Right)|F\d{1,2}|Mouse[0-4]|Wheel(Up|Down)|Pad\d{1,2}|[A-Z][A-Za-z]+)$/;function Pf(e,t,n){let[r,i]=kf[t];return typeof e==`number`&&Number.isFinite(e)?Math.min(i,Math.max(r,e)):n}function Ff(e,t){return typeof e==`boolean`?e:t}function If(e){let t=jf();if(!e||typeof e!=`object`)return t;let n=e,r={version:1,mouseSens:Pf(n.mouseSens,`mouseSens`,t.mouseSens),padSens:Pf(n.padSens,`padSens`,t.padSens),invertY:Ff(n.invertY,t.invertY),aimToggle:Ff(n.aimToggle,t.aimToggle),fov:Pf(n.fov,`fov`,t.fov),brightness:Pf(n.brightness,`brightness`,t.brightness),preset:Of.includes(n.preset)?n.preset:t.preset,dynamicResolution:Ff(n.dynamicResolution,t.dynamicResolution),master:Pf(n.master,`master`,t.master),music:Pf(n.music,`music`,t.music),sfx:Pf(n.sfx,`sfx`,t.sfx),ui:Pf(n.ui,`ui`,t.ui),shake:Pf(n.shake,`shake`,t.shake),uiScale:Pf(n.uiScale,`uiScale`,t.uiScale),hints:Ff(n.hints,t.hints),bindings:t.bindings},i=n.bindings;if(i&&typeof i==`object`){let e=i;for(let t of gf){let n=e[t];if(!Array.isArray(n))continue;let i=n.filter(e=>typeof e==`string`&&Nf.test(e)&&!Af.has(e));i.some(e=>!e.startsWith(`Pad`))&&(r.bindings[t]=[...new Set(i)])}}return r}function Lf(e){let t=e.get(ou);if(t===null)return jf();let n;try{n=JSON.parse(t)}catch(e){return console.warn(`[settings] ajustes ilegibles, se usan los de fábrica:`,e instanceof Error?e.message:e),jf()}return If(n)}function Rf(e,t){e.set(ou,JSON.stringify(t))}var zf=e=>!e.startsWith(`Pad`);function Bf(e,t,n){if(!gf.includes(t))return{ok:!1,reason:`not-rebindable`};if(Af.has(n))return{ok:!1,reason:`reserved`};if(!zf(n))return{ok:!1,reason:`pad`};let r=Mf(e),i=r[t],a=i.findIndex(zf),o=a>=0?i[a]:null;if(o===n)return{ok:!0,bindings:r,displaced:null};let s=null;for(let e of gf){if(e===t)continue;let i=r[e],a=i.indexOf(n);if(!(a<0)&&(s=e,o&&!i.includes(o)?i[a]=o:i.splice(a,1),!i.some(zf))){let t=hf[e].find(e=>zf(e)&&e!==n);t&&i.unshift(t)}}let c=i.filter((e,t)=>t!==a&&e!==n);return r[t]=a>=0?[...c.slice(0,a),n,...c.slice(a)]:[n,...c],{ok:!0,bindings:r,displaced:s}}function Vf(e){let t=e.toLowerCase();return/swiftshader|llvmpipe|software|basic render/.test(t)||/intel/.test(t)&&!/\barc\b/.test(t)||/mali|adreno|powervr|videocore/.test(t)?`low`:`medium`}function Hf(){let e=document.createElement(`canvas`),t=e.getContext(`webgl2`)??e.getContext(`webgl`);if(!t)return``;let n=t.getExtension(`WEBGL_debug_renderer_info`),r=String(n?t.getParameter(n.UNMASKED_RENDERER_WEBGL):t.getParameter(t.RENDERER));return t.getExtension(`WEBGL_lose_context`)?.loseContext(),r}var Uf=class{visible=!1;el;text;cmds;commands=[];acc=1;constructor(e){this.el=document.createElement(`div`),this.el.id=`debug-overlay`,this.el.setAttribute(`role`,`region`),this.el.setAttribute(`aria-label`,`Overlay de depuración`),this.el.hidden=!0,this.text=document.createElement(`pre`),this.text.id=`debug-text`,this.cmds=document.createElement(`div`),this.cmds.className=`debug-cmds`;let t=document.createElement(`div`);t.className=`debug-title`,t.textContent=`DEBUG · F3`,this.el.append(t,this.text,this.cmds),e.appendChild(this.el)}setVisible(e){this.visible=e,this.el.hidden=!e,this.acc=1}toggle(){this.setVisible(!this.visible)}addCommand(e,t,n,r={}){let i=document.createElement(`button`);i.type=`button`,i.className=`debug-btn`,i.dataset.cmd=e,i.textContent=r.hotkey?`${t} [${r.hotkey.replace(`Key`,``).replace(`Digit`,``)}]`:t;let a={id:e,label:t,run:n,button:i,hotkey:r.hotkey,isOn:r.isOn};i.addEventListener(`click`,e=>{e.preventDefault(),a.run(),this.refreshButtons()}),this.commands.push(a),this.cmds.appendChild(i)}run(e){let t=this.commands.find(t=>t.id===e);return t?(t.run(),this.refreshButtons(),!0):!1}handleHotkey(e){if(!this.visible)return!1;let t=this.commands.find(t=>t.hotkey===e);return t?(t.run(),this.refreshButtons(),!0):!1}refreshButtons(){for(let e of this.commands)e.isOn&&e.button.classList.toggle(`on`,e.isOn())}update(e,t){this.visible&&(this.acc+=e,this.acc<.25||(this.acc=0,this.text.textContent=t(),this.refreshButtons()))}get textContent(){return this.text.textContent??``}},Wf=class{scene;lines;geo=new pr;enabled=!1;constructor(e){this.scene=e;let t=new Ii({vertexColors:!0,depthTest:!1,transparent:!0,opacity:.85});this.lines=new Ji(this.geo,t),this.lines.renderOrder=999,this.lines.frustumCulled=!1,this.lines.visible=!1}setEnabled(e){this.enabled=e,this.lines.visible=e,e&&!this.lines.parent&&this.scene.add(this.lines),!e&&this.lines.parent&&this.scene.remove(this.lines)}refresh(e){if(!this.enabled)return;let{vertices:t,colors:n}=e.debugLines();this.geo.setAttribute(`position`,new Qn(t,3)),this.geo.setAttribute(`color`,new Qn(n,4)),this.geo.computeBoundingSphere()}},Gf=class{capacity;frames;cpu;idx=0;count=0;totalFrames=0;windowStart=0;windowFrames=0;windowMs=0;windowCpu=0;windowWorst=0;constructor(e=240){this.capacity=e,this.frames=new Float64Array(e),this.cpu=new Float64Array(e)}push(e,t){this.frames[this.idx]=e,this.cpu[this.idx]=t,this.idx=(this.idx+1)%this.capacity,this.count<this.capacity&&this.count++,this.totalFrames++,this.windowFrames++,this.windowMs+=e,this.windowCpu+=t,e>this.windowWorst&&(this.windowWorst=e)}avgFrameMs(e=60){let t=Math.min(e,this.count);if(t===0)return 0;let n=0;for(let e=0;e<t;e++)n+=this.frames[(this.idx-1-e+this.capacity)%this.capacity]??0;return n/t}avgCpuMs(e=60){let t=Math.min(e,this.count);if(t===0)return 0;let n=0;for(let e=0;e<t;e++)n+=this.cpu[(this.idx-1-e+this.capacity)%this.capacity]??0;return n/t}fps(e=60){let t=this.avgFrameMs(e);return t>0?1e3/t:0}worstFrameMs(e=120){let t=Math.min(e,this.count),n=0;for(let e=0;e<t;e++)n=Math.max(n,this.frames[(this.idx-1-e+this.capacity)%this.capacity]??0);return n}beginWindow(e){this.windowStart=e,this.windowFrames=0,this.windowMs=0,this.windowCpu=0,this.windowWorst=0}windowResult(e){let t=(e-this.windowStart)/1e3;return{frames:this.windowFrames,seconds:t,fps:t>0?this.windowFrames/t:0,avgMs:this.windowFrames>0?this.windowMs/this.windowFrames:0,cpuMs:this.windowFrames>0?this.windowCpu/this.windowFrames:0,worstMs:this.windowWorst}}};function Kf(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new pr;c.morphTargetsRelative=s;let l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0,p=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let t in d.morphAttributes){if(!i.has(t))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;if(d.morphAttributes[t].length!==e[0].morphAttributes[t].length)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have the same number of morph targets for the "`+t+`" morph attribute.`),null;o[t]===void 0&&(o[t]=[]),o[t].push(d.morphAttributes[t]),p++}if(p!==i.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of morph attributes.`),null;if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=qf(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=qf(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function qf(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new Qn(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var Jf=new Map,Yf=4;function Xf(e){Yf=Math.max(1,Math.min(8,e))}function Zf(e){let t=document.createElement(`canvas`);t.width=e,t.height=e;let n=t.getContext(`2d`);if(!n)throw Error(`Canvas 2D no disponible`);return[t,n]}function Qf(e,n=!0){let r=new ra(e);return r.wrapS=t,r.wrapT=t,r.anisotropy=Yf,n&&(r.colorSpace=Be),r.needsUpdate=!0,r}function $f(e){return`#${e.toString(16).padStart(6,`0`)}`}function ep(e,t,n,r,i,a){for(let o=0;o<r;o++){let r=a?255:0;e.fillStyle=`rgba(${r},${r},${r},${n.range(i*.3,i)})`;let o=n.range(1,3);e.fillRect(n.range(0,t),n.range(0,t),o,o)}}function tp(e,t,n){let[r,i]=Zf(512);i.fillStyle=$f(e),i.fillRect(0,0,512,512),i.fillStyle=`rgba(0,0,0,0.05)`,i.fillRect(0,0,256,256),i.fillRect(256,256,256,256),i.strokeStyle=$f(n),i.lineWidth=1.5;for(let e=0;e<=8;e++){let t=e*512/8;i.beginPath(),i.moveTo(t,0),i.lineTo(t,512),i.moveTo(0,t),i.lineTo(512,t),i.stroke()}i.strokeStyle=$f(t),i.lineWidth=4;for(let e=0;e<=2;e++){let t=e*512/2;i.beginPath(),i.moveTo(t,0),i.lineTo(t,512),i.moveTo(0,t),i.lineTo(512,t),i.stroke()}return Qf(r)}function np(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#9a9a98`,n.fillRect(0,0,256,256);for(let e=0;e<40;e++){let e=n.createRadialGradient(r.range(0,256),r.range(0,256),2,r.range(0,256),r.range(0,256),r.range(20,70)),t=r.range(0,1)>.5?255:0;e.addColorStop(0,`rgba(${t},${t},${t},0.06)`),e.addColorStop(1,`rgba(${t},${t},${t},0)`),n.fillStyle=e,n.fillRect(0,0,256,256)}return ep(n,256,r,1400,.18,!1),ep(n,256,r,600,.12,!0),Qf(t)}function rp(e){let[t,n]=Zf(256),r=new Df(e);return n.fillStyle=`#c8c2b6`,n.fillRect(0,0,256,256),ep(n,256,r,900,.07,!1),ep(n,256,r,500,.06,!0),n.fillStyle=`rgba(0,0,0,0.10)`,n.fillRect(0,238,256,4),Qf(t)}function ip(e,t,n,r){let[i,a]=Zf(512),o=new Df(e);a.fillStyle=t,a.fillRect(0,0,512,512),ep(a,512,o,1500,.05,!0);let s=(e,t,n,r)=>{a.strokeStyle=e,a.globalAlpha=n,a.lineWidth=t,a.lineCap=`round`;for(let e=0;e<r;e++){let e=o.range(0,512),t=-10;for(a.beginPath(),a.moveTo(e,t);t<522;)e+=o.range(-22,22),t+=o.range(12,30),a.lineTo(e,t);a.stroke()}a.globalAlpha=1};return s(n,2.2,.35,7),s(n,1,.5,9),s(r,1.4,.45,4),a.strokeStyle=`rgba(0,0,0,0.25)`,a.lineWidth=2,a.strokeRect(1,1,254,254),a.strokeRect(257,1,254,254),a.strokeRect(1,257,254,254),a.strokeRect(257,257,254,254),Qf(i)}function ap(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#7a5538`,n.fillRect(0,0,256,256);for(let e=0;e<256;e+=2){let t=Math.sin(e*.09+r.range(0,.6))*14;n.fillStyle=`rgba(${40+t},${22+t*.5},10,0.18)`,n.fillRect(0,e,256,2)}return n.strokeStyle=`rgba(30,15,5,0.45)`,n.lineWidth=4,n.strokeRect(6,6,244,244),n.strokeStyle=`rgba(255,220,170,0.12)`,n.lineWidth=2,n.strokeRect(12,12,232,232),Qf(t)}function op(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#9a9a9a`,n.fillRect(0,0,256,256),ep(n,256,r,2500,.1,!1),n.strokeStyle=`rgba(255,230,150,0.35)`,n.lineWidth=3;for(let e=0;e<4;e++)for(let t=0;t<4;t++){let r=e*64+32,i=t*64+32;n.beginPath(),n.moveTo(r,i-22.4),n.lineTo(r+22.4,i),n.lineTo(r,i+22.4),n.lineTo(r-22.4,i),n.closePath(),n.stroke()}return Qf(t)}function sp(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#b4b8bd`,n.fillRect(0,0,256,256);for(let e=0;e<256;e++){let t=r.range(0,1)>.5?255:0;n.fillStyle=`rgba(${t},${t},${t},${r.range(.02,.08)})`,n.fillRect(0,e,256,1)}n.fillStyle=`rgba(0,0,0,0.35)`;for(let[e,t]of[[12,12],[244,12],[12,244],[244,244]])n.beginPath(),n.arc(e,t,4,0,Math.PI*2),n.fill();return Qf(t)}function cp(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#a07a4c`,n.fillRect(0,0,256,256);for(let e=0;e<5;e++)n.fillStyle=`rgba(60,35,15,${r.range(.08,.2)})`,n.fillRect(0,256/5*e,256,256/5-4),n.fillStyle=`rgba(40,22,8,0.5)`,n.fillRect(0,256/5*e+256/5-4,256,4);return n.strokeStyle=`#5a3c1e`,n.lineWidth=18,n.strokeRect(9,9,238,238),n.lineWidth=14,n.beginPath(),n.moveTo(14,14),n.lineTo(242,242),n.stroke(),Qf(t)}function lp(){let[e,t]=Zf(256);t.fillStyle=`#b0b0b0`,t.fillRect(0,0,256,256);for(let e=0;e<256;e+=16){let n=t.createLinearGradient(e,0,e+16,0);n.addColorStop(0,`rgba(0,0,0,0.28)`),n.addColorStop(.5,`rgba(255,255,255,0.18)`),n.addColorStop(1,`rgba(0,0,0,0.28)`),t.fillStyle=n,t.fillRect(e,0,16,256)}return t.fillStyle=`rgba(0,0,0,0.3)`,t.fillRect(0,0,256,6),t.fillRect(0,250,256,6),Qf(e)}function up(e){let[t,n]=Zf(256),r=new Df(e);return n.fillStyle=`#5a5d62`,n.fillRect(0,0,256,256),ep(n,256,r,3e3,.22,!1),ep(n,256,r,1400,.16,!0),Qf(t)}function dp(){let[e,t]=Zf(256);t.fillStyle=`#6a6c72`,t.fillRect(0,0,256,256);for(let e=0;e<4;e++)for(let n=0;n<4;n++)t.fillStyle=(e+n)%2==0?`#2e3036`:`#34363d`,t.fillRect(e*64+3,n*64+3,58,58);return Qf(e)}function fp(){let[e,t]=Zf(256),n=[`#ff2e88`,`#19e3ff`,`#7a3cff`,`#ffd23f`,`#ff2e88`,`#19e3ff`],r=new Df(77);t.fillStyle=`#101014`,t.fillRect(0,0,256,256);for(let e=0;e<4;e++)for(let i=0;i<4;i++)t.fillStyle=n[r.int(0,n.length-1)]??`#ff2e88`,t.globalAlpha=r.range(.55,1),t.fillRect(e*64+4,i*64+4,56,56);return t.globalAlpha=1,Qf(e)}function pp(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#8f8a84`,n.fillRect(0,0,256,256);for(let e=0;e<8;e++){let t=e%2==0?0:32;for(let i=-64;i<256;i+=64){let a=r.range(-14,14);n.fillStyle=`rgb(${142+a},${70+a*.5},${52+a*.4})`,n.fillRect(i+t+2,e*32+2,60,28)}}return Qf(t)}function mp(e){let[t,n]=Zf(256),r=new Df(e);n.fillStyle=`#86837d`,n.fillRect(0,0,256,256);for(let e=0;e<1600;e++){let e=r.range(60,200);n.fillStyle=`rgba(${e},${e*.98},${e*.94},0.55)`,n.beginPath(),n.arc(r.range(0,256),r.range(0,256),r.range(.8,2.6),0,Math.PI*2),n.fill()}return Qf(t)}function hp(){let[e,t]=Zf(128);t.fillStyle=`#e8b81e`,t.fillRect(0,0,128,128),t.fillStyle=`#1a1a1a`;for(let e=-128;e<256;e+=32)t.beginPath(),t.moveTo(e,0),t.lineTo(e+16,0),t.lineTo(e+16-128,128),t.lineTo(e-128,128),t.closePath(),t.fill();return Qf(e)}function gp(){let[e,t]=Zf(256);t.fillStyle=`#efe9dc`,t.fillRect(0,0,256,256);let n=[`#c8102e`,`#efe9dc`,`#c8102e`,`#efe9dc`,`#c8102e`];for(let e=0;e<n.length;e++)t.fillStyle=n[e]??`#c8102e`,t.beginPath(),t.arc(128,128,115.2*(1-e/n.length),0,Math.PI*2),t.fill();return Qf(e)}function _p(e){let[t,n]=Zf(128),r=new Df(e);return n.fillStyle=`#808080`,n.fillRect(0,0,128,128),ep(n,128,r,1200,.2,!1),ep(n,128,r,1200,.2,!0),Qf(t)}function vp(e){let t=Jf.get(e);if(t)return t;let n;switch(e){case`grid`:n=tp(13225428,7304832,10133931);break;case`gridDark`:n=tp(9146779,5001819,7568004);break;case`gridOrange`:n=tp(15043132,10243863,13200679);break;case`concrete`:n=np(11);break;case`plaster`:n=rp(12);break;case`marble`:n=ip(13,`#d8d2c6`,`#8f8a80`,`#c9a227`);break;case`marbleDark`:n=ip(14,`#4c4c52`,`#a9a6a0`,`#d4af37`);break;case`wood`:n=ap(15);break;case`carpet`:n=op(16);break;case`brushed`:n=sp(17);break;case`crate`:n=cp(18);break;case`corrugated`:n=lp();break;case`asphalt`:n=up(19);break;case`tiles`:n=dp();break;case`danceFloor`:n=fp();break;case`brick`:n=pp(20);break;case`gravel`:n=mp(21);break;case`hazard`:n=hp();break;case`target`:n=gp();break;case`noise`:n=_p(22)}return Jf.set(e,n),n}function yp(e,t,n){let r=n.ppm??128,i=Math.min(2048,Math.max(64,Math.round(e*r))),a=Math.min(1024,Math.max(32,Math.round(t*r))),o=document.createElement(`canvas`);o.width=i,o.height=a;let s=o.getContext(`2d`);if(!s)throw Error(`Canvas 2D no disponible`);n.bg===void 0?s.clearRect(0,0,i,a):(s.fillStyle=$f(n.bg),s.fillRect(0,0,i,a));let c=n.font===`serif`?`Georgia, "Times New Roman", serif`:`system-ui, "Segoe UI", Arial, sans-serif`,l=n.sub?a*.5:a*.66;s.textAlign=`center`,s.textBaseline=`middle`,s.fillStyle=$f(n.color),s.shadowColor=$f(n.color),s.shadowBlur=a*.06;let u=l;for(s.font=`700 ${u}px ${c}`;s.measureText(n.text).width>i*.92&&u>8;)u*=.92,s.font=`700 ${u}px ${c}`;if(s.fillText(n.text,i/2,n.sub?a*.4:a/2),n.sub){let e=a*.22;for(s.font=`500 ${e}px ${c}`;s.measureText(n.sub).width>i*.92&&e>6;)e*=.92,s.font=`500 ${e}px ${c}`;s.shadowBlur=0,s.globalAlpha=.85,s.fillText(n.sub,i/2,a*.78),s.globalAlpha=1}let d=new ra(o);return d.colorSpace=Be,d.anisotropy=Yf,d.needsUpdate=!0,d}var bp={qaGrid:{color:16777215,tex:`grid`,texScale:2,roughness:.85,metalness:0},qaGridDark:{color:16777215,tex:`gridDark`,texScale:2,roughness:.85,metalness:0},qaOrange:{color:16777215,tex:`gridOrange`,texScale:2,roughness:.7,metalness:0},concrete:{color:14211286,tex:`concrete`,texScale:3,roughness:.92,metalness:0},concreteDark:{color:9079432,tex:`concrete`,texScale:3,roughness:.92,metalness:0},plaster:{color:16777215,tex:`plaster`,texScale:2.5,roughness:.9,metalness:0},plasterDark:{color:9209210,tex:`plaster`,texScale:2.5,roughness:.9,metalness:0},marble:{color:16777215,tex:`marble`,texScale:3,roughness:.32,metalness:0},marbleDark:{color:16777215,tex:`marbleDark`,texScale:3,roughness:.28,metalness:0},woodPanel:{color:16777215,tex:`wood`,texScale:1.6,roughness:.6,metalness:0},woodDark:{color:10192246,tex:`wood`,texScale:1.6,roughness:.6,metalness:0},carpetRed:{color:12075343,tex:`carpet`,texScale:2,roughness:.95,metalness:0},carpetGreen:{color:4161635,tex:`carpet`,texScale:2,roughness:.95,metalness:0},gold:{color:13938487,texScale:1,roughness:.35,metalness:.65,emissive:3811845,emissiveIntensity:.5},brass:{color:12094526,texScale:1,roughness:.4,metalness:.5},metal:{color:12896462,tex:`brushed`,texScale:1.5,roughness:.5,metalness:.3},metalDark:{color:7567488,tex:`brushed`,texScale:1.5,roughness:.55,metalness:.3},steelBlue:{color:8690102,tex:`brushed`,texScale:1.5,roughness:.5,metalness:.3},crate:{color:16777215,tex:`crate`,texScale:1.2,roughness:.82,metalness:0},containerRed:{color:12601910,tex:`corrugated`,texScale:2.6,roughness:.7,metalness:.15},containerBlue:{color:3828912,tex:`corrugated`,texScale:2.6,roughness:.7,metalness:.15},containerGreen:{color:4687706,tex:`corrugated`,texScale:2.6,roughness:.7,metalness:.15},containerYellow:{color:13935407,tex:`corrugated`,texScale:2.6,roughness:.7,metalness:.15},asphalt:{color:16777215,tex:`asphalt`,texScale:4,roughness:.95,metalness:0},tilesBlack:{color:16777215,tex:`tiles`,texScale:2,roughness:.35,metalness:0},danceFloor:{color:16777215,tex:`danceFloor`,texScale:4,roughness:.3,metalness:0,emissive:16777215,emissiveIntensity:.85,emissiveFromMap:!0},glass:{color:11066623,texScale:1,roughness:.08,metalness:0,transparent:!0,opacity:.22},leather:{color:5912364,texScale:1,roughness:.55,metalness:0},velvet:{color:9051714,tex:`noise`,texScale:1,roughness:.92,metalness:0},brick:{color:16777215,tex:`brick`,texScale:2,roughness:.9,metalness:0},water:{color:2315642,texScale:1,roughness:.12,metalness:.1},roofGravel:{color:16777215,tex:`gravel`,texScale:2,roughness:.96,metalness:0},hazard:{color:16777215,tex:`hazard`,texScale:1,roughness:.7,metalness:0},targetBoard:{color:16777215,tex:`target`,texScale:1,roughness:.8,metalness:0}},xp=new Map;function Sp(e){return bp[e].texScale}function Cp(e){let t=xp.get(e);if(t)return t;let n=bp[e],r=new Sa({color:n.color,roughness:n.roughness,metalness:n.metalness});return n.tex&&(r.map=vp(n.tex)),n.emissive!==void 0&&(r.emissive=new K(n.emissive),r.emissiveIntensity=n.emissiveIntensity??1,n.emissiveFromMap&&r.map&&(r.emissiveMap=r.map)),n.transparent&&(r.transparent=!0,r.opacity=n.opacity??.5,r.depthWrite=!1,r.side=2),r.name=`level:${e}`,xp.set(e,r),r}var wp=new Map;function Tp(e,t=1.6){let n=`${e}:${t}`,r=wp.get(n);if(r)return r;let i=new Gr({color:new K(e).multiplyScalar(t)});return i.name=`neon:${n}`,wp.set(n,i),i}function Ep(e,t,n,r=2.4){let i={rimColor:{value:new K(t)},rimStrength:{value:n},rimPower:{value:r}};return e.onBeforeCompile=e=>{e.uniforms.rimColor=i.rimColor,e.uniforms.rimStrength=i.rimStrength,e.uniforms.rimPower=i.rimPower,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 rimColor;
uniform float rimStrength;
uniform float rimPower;`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
{
  float rimF = 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) );
  totalEmissiveRadiance += rimColor * ( rimStrength * pow( rimF, rimPower ) );
}`)},e.customProgramCacheKey=()=>`rim-v1`,e.userData.rim=i,i}function Dp(){return{speed:0,moveAngle:0,state:`ground`,posture:`stand`,grounded:!0,aim:0,aimPitch:0,stateTime:0,reload:-1,recoil:0,melee:0}}var Op=new K,kp=new G,Ap=new G,jp=new H(0,.9,0),Mp=1.6;function Z(e,t,n,r,i=0,a=0,o=0){let s=new sa(e,t,n);s.translate(i,a,o),Op.set(r);let c=s.getAttribute(`position`).count,l=new Float32Array(c*3);for(let e=0;e<c;e++)l[e*3]=Op.r,l[e*3+1]=Op.g,l[e*3+2]=Op.b;return s.setAttribute(`color`,new tr(l,3)),s}function Np(e){let t=Kf(e,!1);if(!t)throw Error(`CharacterRig: no se pudo fusionar la geometría`);for(let t of e)t.dispose();return t.computeBoundingSphere(),t}var Pp=new Map;function Fp(e,t,n,r){let i=r?void 0:Pp.get(e);if(i)return i;let a=new Sa({vertexColors:!0,roughness:.72,metalness:.05});a.name=`rig:${e}`;let o={mat:a,rim:Ep(a,t,n,2.2)};return r||Pp.set(e,o),o}var Ip=class{root=new un;material;rim;spin=new gi;hips=new gi;torso=new gi;armL=new gi;armR=new gi;thighL=new gi;thighR=new gi;shinL=new gi;shinR=new gi;pieces=[];skeleton=null;weaponMount=new un;weaponMesh=null;meshes=[];phase=0;crouchK=0;aimK=0;bulk;opacity=1;constructor(e,t){let{mat:n,rim:r}=Fp(e,t.rimColor,t.rimStrength,!!t.uniqueMaterial);this.material=n,this.rim=r;let i=t.colors,a=this.bulk=t.bulk??1,o=[Z(.36*a,.2,.22*a,i.pants,0,.02,0),Z(.44*a,.52,.26*a,i.jacket,0,.36,0),Z(.13,.36,.02,i.shirt,0,.42,-.135*a),Z(.045,.3,.025,i.tie,0,.42,-.142*a),Z(.1,.08,.1,i.skin,0,.66,0),Z(.2,.24,.22,i.skin,0,.82,-.01),Z(.06,.025,.02,i.accent,0,.84,-.12)];switch(t.vest&&o.push(Z(.48*a,.4,.3*a,i.accent,0,.36,0)),t.hair){case`long`:o.push(Z(.23,.07,.25,i.hair,0,.955,0),Z(.235,.34,.09,i.hair,0,.78,.09),Z(.03,.26,.2,i.hair,.115,.82,0),Z(.03,.26,.2,i.hair,-.115,.82,0));break;case`short`:o.push(Z(.215,.06,.235,i.hair,0,.95,0),Z(.215,.12,.05,i.hair,0,.88,.1));break;case`helmet`:o.push(Z(.25,.14,.27,i.accent,0,.93,0),Z(.22,.05,.03,1053720,0,.84,-.125));break;case`cap`:o.push(Z(.22,.07,.24,i.accent,0,.955,0),Z(.2,.02,.1,i.accent,0,.925,-.15))}this.addMesh(this.torso,Np(o));let s=()=>Np([Z(.12*a,.32,.13*a,i.jacket,0,-.16,0),Z(.11*a,.28,.12*a,i.jacket,0,-.45,-.02),Z(.08,.09,.09,i.skin,0,-.63,-.03)]);this.armL.position.set(-.285*a,.56,0),this.armR.position.set(.285*a,.56,0),this.addMesh(this.armL,s()),this.addMesh(this.armR,s()),this.torso.add(this.armL,this.armR),this.weaponMount.position.set(0,-.63,-.04),this.armR.add(this.weaponMount);let c=()=>Z(.16*a,.46,.17*a,i.pants,0,-.23,0),l=()=>Np([Z(.14*a,.42,.15*a,i.pants,0,-.21,0),Z(.15*a,.07,.27,i.shoes,0,-.44,-.05)]);this.thighL.position.set(-.1*a,0,0),this.thighR.position.set(.1*a,0,0),this.shinL.position.set(0,-.46,0),this.shinR.position.set(0,-.46,0),this.addMesh(this.thighL,c()),this.addMesh(this.thighR,c()),this.addMesh(this.shinL,l()),this.addMesh(this.shinR,l()),this.thighL.add(this.shinL),this.thighR.add(this.shinR),this.hips.position.set(0,.05,0),this.hips.add(this.torso,this.thighL,this.thighR),this.spin.position.set(0,.9,0),this.spin.add(this.hips),this.root.add(this.spin),this.buildSkin(),this.setWeapon(t.weapon,i.accent)}addMesh(e,t){this.pieces.push({bone:e,geo:t})}buildSkin(){let e=[this.spin,this.hips,this.torso,this.armL,this.armR,this.thighL,this.thighR,this.shinL,this.shinR];this.root.updateMatrixWorld(!0),kp.copy(this.root.matrixWorld).invert();let t=[];for(let{bone:n,geo:r}of this.pieces){r.applyMatrix4(Ap.multiplyMatrices(kp,n.matrixWorld));let i=r.getAttribute(`position`).count,a=e.indexOf(n),o=new Uint16Array(i*4),s=new Float32Array(i*4);for(let e=0;e<i;e++)o[e*4]=a,s[e*4]=1;r.setAttribute(`skinIndex`,new $n(o,4)),r.setAttribute(`skinWeight`,new tr(s,4)),t.push(r)}this.pieces.length=0;let n=new hi(Np(t),this.material);n.castShadow=!0,n.receiveShadow=!0,n.boundingSphere=new ar(jp.clone(),Mp),this.root.add(n),this.root.updateMatrixWorld(!0),this.skeleton=new bi(e),n.bind(this.skeleton),this.meshes.push(n)}setWeapon(e,t=8947848){this.weaponMesh&&=(this.weaponMount.remove(this.weaponMesh),this.weaponMesh.geometry.dispose(),null);let n=1908515,r=null;switch(e){case`pistol`:r=Np([Z(.04,.06,.2,n,0,0,-.08),Z(.035,.1,.05,n,0,-.06,-.01)]);break;case`rifle`:r=Np([Z(.05,.08,.72,n,0,0,-.22),Z(.04,.14,.05,n,0,-.09,-.12),Z(.05,.04,.2,t,0,.06,-.2)]);break;case`smg`:r=Np([Z(.05,.08,.42,n,0,0,-.13),Z(.04,.16,.05,n,0,-.1,-.08)]);break;case`shotgun`:r=Np([Z(.06,.08,.8,3811868,0,0,-.25),Z(.05,.05,.6,n,0,.05,-.32)]);break;case`knife`:r=Np([Z(.02,.03,.18,13159634,0,0,-.1),Z(.03,.04,.08,n,0,0,.01)])}r&&(this.weaponMesh=new ri(r,this.material),this.weaponMesh.castShadow=!0,this.weaponMount.add(this.weaponMesh))}setShadows(e){for(let t of this.meshes)t.castShadow=e;this.weaponMesh&&(this.weaponMesh.castShadow=e)}setOpacity(e){let t=Gl(e,0,1);Math.abs(t-this.opacity)<.01||(this.opacity=t,this.root.visible=t>=.5)}update(e,t){let n=+(e.posture===`crouch`||e.state===`slide`||e.state===`roll`);this.crouchK=ql(this.crouchK,n,14,t),this.aimK=ql(this.aimK,e.aim,18,t);let r=this.crouchK,i=this.aimK,a=e.grounded&&e.speed>.25&&(e.state===`ground`||e.state===`cover`||e.state===`locked`),o=Kl(1.25,1.6,Gl(e.speed/7,0,1));a&&(this.phase+=e.speed/o*Math.PI*t);let s=a?Gl(e.speed/6.5,.25,1)*(1-r*.5):0,c=Math.cos(e.moveAngle)<-.3?-1:1,l=Math.sin(this.phase)*.75*s*c,u=Math.max(0,Math.sin(this.phase+Math.PI/2))*1*s,d=Math.max(0,Math.sin(this.phase-Math.PI/2))*1*s,f=-l,p=l,m=u,h=d,g=.05-Math.abs(Math.sin(this.phase))*.035*s,_=-.08*Gl(e.speed/7,0,1),v=0,y=.9;switch(f=Kl(f,-1.25+l*.4,r),p=Kl(p,-1.05-l*.4,r),m=Kl(m,1.95,r),h=Kl(h,1.75,r),g=Kl(g,-.36,r),_=Kl(_,-.28,r),e.state){case`air`:f=Kl(f,-.6,.8),p=Kl(p,-.2,.8),m=Kl(m,.9,.8),h=Kl(h,.5,.8);break;case`roll`:{let t=Gl(e.stateTime/.5,0,1);v=-Math.PI*2*t,y=Kl(.9,.5,Math.sin(t*Math.PI)),f=p=-1.6,m=h=2.2,_=-.7;break}case`slide`:_=.55,p=-1.3,h=.15,f=-.4,m=1.6,g=-.42;break;case`vault`:_=-.45,f=-1.4,p=-.9,m=1.8,h=1.2;break;case`dead`:{let t=Gl(e.stateTime/.55,0,1);v=Math.PI/2*t*t,y=Kl(.9,.2,t),f=-.2,p=.1,m=h=.2;break}}let b=l*.8,x=-l*.8,S=.06,C=-.06,w=0,T=0,E=-Math.PI/2-e.aimPitch;if((e.state===`ground`||e.state===`cover`||e.state===`air`||e.state===`locked`)&&(x=Kl(Kl(x,-.55,.6),E,i),b=Kl(b,E+.15,i),w=Kl(0,.55,i),T=Kl(0,.05,i),S=Kl(S,.35,i)),e.reload>=0){let t=Math.sin(Gl(e.reload,0,1)*Math.PI);b=Kl(b,-1.1,t),S=Kl(S,.6,t)}e.melee>0&&(x=Kl(x,-2.2,e.melee),C=Kl(C,-.5,e.melee)),x-=e.recoil*.18;let D=(e,n)=>ql(e,n,16,t);this.thighL.rotation.x=D(this.thighL.rotation.x,f),this.thighR.rotation.x=D(this.thighR.rotation.x,p),this.shinL.rotation.x=D(this.shinL.rotation.x,m),this.shinR.rotation.x=D(this.shinR.rotation.x,h),this.hips.position.y=D(this.hips.position.y,g),this.torso.rotation.x=D(this.torso.rotation.x,_+(i>.5?-e.aimPitch*.25:0)),this.armL.rotation.x=D(this.armL.rotation.x,b),this.armR.rotation.x=D(this.armR.rotation.x,x),this.armL.rotation.y=D(this.armL.rotation.y,w),this.armR.rotation.y=D(this.armR.rotation.y,T),this.armL.rotation.z=D(this.armL.rotation.z,S),this.armR.rotation.z=D(this.armR.rotation.z,C),e.state===`roll`||e.state===`dead`?(this.spin.rotation.x=v,this.spin.position.y=y):(this.spin.rotation.x=D(this.spin.rotation.x,0),this.spin.position.y=D(this.spin.position.y,y)),!a&&e.state===`ground`&&(this.torso.scale.y=1+Math.sin(performance.now()*.0025)*.006*this.bulk)}dispose(){for(let e of this.meshes)e.geometry.dispose();this.skeleton?.dispose(),this.weaponMesh?.geometry.dispose(),this.root.removeFromParent()}},Lp={jacket:2764342,shirt:1052949,tie:460810,pants:2369326,shoes:723725,skin:13212542,hair:2826007,accent:1711136},Rp=.32,zp=.58,Bp=.25,Q={run:4.6,sprint:7,aimWalk:2.6,crouch:2.2,cover:1.9,accelGround:38,decelGround:30,accelAir:9,gravity:22,jumpSpeed:6.5,maxFall:30,coyote:.12,jumpBuffer:.12,doubleTapWindow:.3,rollTime:.5,rollSpeed:7.6,rollEndSpeed:3,rollFastPhase:.34,rollIFrameStart:.05,rollIFrameEnd:.36,rollCooldown:.35,diveUp:2.4,slideTime:.7,slideStartSpeed:8.6,slideEndSpeed:3,slideMinSpeed:5,slideCooldown:.5,slideSteer:1.6,maxHorizontal:9.5,turnRate:14,aimTurnRate:28,vaultMinH:.42,vaultMaxH:1.28,vaultReach:1,vaultMaxDepth:1.6,vaultRiseBase:.12,vaultRisePerM:.12,vaultOverSpeed:4.5,vaultExitSpeed:3.5,vaultAbortDev:.35,coverGap:.06,coverProbe:.95};function Vp(){return{moveX:0,moveY:0,camYaw:0,sprint:!1,aim:!1,crouchPressed:!1,jumpPressed:!1,dodgePressed:!1}}function Hp(){return{start:new H,p1:new H,p2:new H,dir:new H,dur1:0,dur2:0,mantle:!1}}function Up(e,t){t.start.copy(e.start),t.p1.copy(e.p1),t.p2.copy(e.p2),t.dir.copy(e.dir),t.dur1=e.dur1,t.dur2=e.dur2,t.mantle=e.mantle}function Wp(e,t){return t.set(-Math.sin(e),0,-Math.cos(e))}function Gp(e,t){return Math.atan2(-e,-t)}var Kp=new H,qp=new H,Jp=new H,Yp=new H,Xp=new H,Zp=new H(0,-1,0),Qp=class{physics;char;feet=new H;prevFeet=new H;velocity=new H;yaw=0;prevYaw=0;state=`ground`;posture=`stand`;grounded=!0;stateTime=0;sprinting=!1;aiming=!1;invulnerable=!1;cover=null;speedMultiplier=1;killY=-50;stats={jumps:0,vaults:0,mantles:0,rolls:0,dives:0,slides:0,coverEnters:0,sprintTime:0,distance:0};nanResets=0;killPlaneResets=0;maxHorizontalSpeed=0;lastSafe=new H;lastSafeYaw=0;time=0;coyote=0;jumpBuffer=0;lastJumpTime=-10;airDiveUsed=!1;rollCooldown=0;slideCooldown=0;slideSpeed0=0;rollDir=new H;slideDir=new H;vault=null;snapOn=!0;safeTimer=0;kccOut={x:0,y:0,z:0};colOut;desired={x:0,y:0,z:0};hit=dd();center=new H;groups;constructor(e,t,n,r=ld.PLAYER){this.physics=e,this.groups=r,this.center.set(t.x,t.y+zp+Rp,t.z),this.char=e.createCharacter(this.center,Rp,zp,r),this.colOut=new e.R.CharacterCollision,this.feet.copy(t),this.prevFeet.copy(t),this.yaw=this.prevYaw=n,this.lastSafe.copy(t),this.lastSafeYaw=n}get collider(){return this.char.collider}get halfHeight(){return this.posture===`stand`?zp:Bp}get height(){return 2*(this.halfHeight+Rp)}centerOf(e){return e.set(this.feet.x,this.feet.y+this.halfHeight+Rp,this.feet.z)}get horizontalSpeed(){return Math.hypot(this.velocity.x,this.velocity.z)}stepSpeed(e){return e>0?Math.hypot(this.feet.x-this.prevFeet.x,this.feet.z-this.prevFeet.z)/e:0}teleport(e,t){this.posture===`crouch`&&this.setPosture(`stand`),this.feet.copy(e),this.prevFeet.copy(e),this.velocity.set(0,0,0),this.yaw=this.prevYaw=t,this.state=`ground`,this.stateTime=0,this.vault=null,this.cover=null,this.invulnerable=!1,this.syncCollider()}haltOnPause(){(this.state===`ground`||this.state===`cover`)&&(this.velocity.x=0,this.velocity.z=0)}setLocked(e){e?(this.exitCover(),this.state=`locked`,this.velocity.set(0,this.velocity.y,0)):this.state===`locked`&&(this.state=this.grounded?`ground`:`air`),this.stateTime=0}kill(){this.exitCover(),this.vault=null,this.state=`dead`,this.stateTime=0,this.invulnerable=!1}revive(e,t){this.state=`ground`,this.teleport(e,t)}syncCollider(){this.centerOf(this.center),this.char.collider.setTranslation(this.center)}setPosture(e){return e===this.posture?!0:e===`stand`&&!this.hasStandRoom()?!1:(this.posture=e,this.char.collider.setHalfHeight(this.halfHeight),this.syncCollider(),!0)}hasStandRoom(e=this.feet){return qp.set(e.x,e.y+zp+Rp+.03,e.z),this.physics.overlapsCapsule(qp,.3,zp,ud.STATIC_AND_ENEMIES,this.char.collider)===null}setSnap(e){e!==this.snapOn&&(this.snapOn=e,e?this.char.controller.enableSnapToGround(fd.snapToGround):this.char.controller.disableSnapToGround())}setState(e){e!==this.state&&(this.state=e,this.stateTime=0)}fixedUpdate(e,t){this.time+=e,this.prevFeet.copy(this.feet),this.prevYaw=this.yaw,this.stateTime+=e,this.rollCooldown=Math.max(0,this.rollCooldown-e),this.slideCooldown=Math.max(0,this.slideCooldown-e),this.coyote=Math.max(0,this.coyote-e),this.jumpBuffer=Math.max(0,this.jumpBuffer-e),t.jumpPressed&&(this.jumpBuffer=Q.jumpBuffer),this.aiming=t.aim&&this.state!==`dead`&&this.state!==`locked`;let n=-Math.sin(t.camYaw),r=-Math.cos(t.camYaw),i=Math.cos(t.camYaw),a=-Math.sin(t.camYaw);Kp.set(n*t.moveY+i*t.moveX,0,r*t.moveY+a*t.moveX);let o=Math.min(1,Kp.length());switch(o>1e-4&&Kp.multiplyScalar(1/Kp.length()),this.state){case`ground`:this.stepGround(e,t,o);break;case`air`:this.stepAir(e,t,o);break;case`roll`:this.stepRoll(e);break;case`slide`:this.stepSlide(e,t,o);break;case`vault`:this.stepVault(e);break;case`cover`:this.stepCover(e,t,o);break;case`locked`:this.velocity.x=0,this.velocity.z=0,this.applyGravity(e),this.move(e,!0);break;case`dead`:this.velocity.x*=.85,this.velocity.z*=.85,this.applyGravity(e),this.move(e,!0)}this.updateFacing(e,t),this.afterStep(e)}stepGround(e,t,n){let r=this.horizontalSpeed;Wp(t.camYaw,Yp);let i=n>0?Kp.dot(Yp):0;if(this.sprinting=t.sprint&&!this.aiming&&n>.5&&i>.45&&this.posture===`stand`,t.crouchPressed){if(r>Q.slideMinSpeed&&this.slideCooldown<=0){this.startSlide(n),this.stepSlide(e,t,n);return}if(this.tryEnterCover(t,n))return;this.setPosture(this.posture===`stand`?`crouch`:`stand`)}if(t.dodgePressed&&this.rollCooldown<=0){this.startRoll(n,!1),this.stepRoll(e);return}if(this.jumpBuffer>0){this.jumpBuffer=0;let r=n>.3?Jp.copy(Kp):Wp(this.yaw,Jp);if(this.time-this.lastJumpTime<Q.doubleTapWindow&&this.rollCooldown<=0){this.startRoll(n,!1),this.stepRoll(e);return}if(this.tryVault(r)){this.stepVault(e);return}if(this.posture===`stand`||this.setPosture(`stand`)){this.doJump(),this.stepAir(e,t,n);return}}let a=this.posture===`crouch`?Q.crouch:this.aiming?Q.aimWalk:this.sprinting?Q.sprint:Q.run;this.accelerate(e,a*n*this.speedMultiplier,Q.accelGround,Q.decelGround),this.velocity.y=-1,this.move(e,!0),this.sprinting&&(this.stats.sprintTime+=e),this.grounded||(this.coyote=Q.coyote,this.velocity.y=0,this.setState(`air`))}doJump(){this.velocity.y=Q.jumpSpeed,this.lastJumpTime=this.time,this.airDiveUsed=!1,this.coyote=0,this.grounded=!1,this.stats.jumps++,this.setState(`air`)}stepAir(e,t,n){if(this.sprinting=!1,this.jumpBuffer>0){if(this.coyote>0)this.jumpBuffer=0,this.doJump();else if(this.time-this.lastJumpTime<Q.doubleTapWindow&&!this.airDiveUsed&&this.rollCooldown<=0){this.jumpBuffer=0,this.startRoll(n,!0),this.stepRoll(e);return}}if(t.dodgePressed&&!this.airDiveUsed&&this.rollCooldown<=0){this.startRoll(n,!0),this.stepRoll(e);return}let r=Math.max(Q.run,this.horizontalSpeed)*n*this.speedMultiplier;this.accelerate(e,r,Q.accelAir,Q.accelAir*.3),this.applyGravity(e),this.move(e,!1),this.grounded&&this.velocity.y<=0&&(this.velocity.y=0,this.setState(`ground`))}applyGravity(e){this.velocity.y=Math.max(-Q.maxFall,this.velocity.y-Q.gravity*e)}accelerate(e,t,n,r){let i=Kp.x*t,a=Kp.z*t,o=i-this.velocity.x,s=a-this.velocity.z,c=Math.hypot(o,s);if(c<1e-6)return;let l=(t*t>this.velocity.x*this.velocity.x+this.velocity.z*this.velocity.z?n:r)*e,u=c>l?l/c:1;this.velocity.x+=o*u,this.velocity.z+=s*u}startRoll(e,t){this.exitCover(),e>.2?this.rollDir.copy(Kp):Wp(this.yaw,this.rollDir),this.setPosture(`crouch`),t?(this.airDiveUsed=!0,this.velocity.y=Math.max(this.velocity.y,Q.diveUp),this.stats.dives++):this.stats.rolls++,this.vault=null,this.setState(`roll`)}stepRoll(e){let t=this.stateTime;this.invulnerable=t>=Q.rollIFrameStart&&t<=Q.rollIFrameEnd;let n=t<Q.rollFastPhase?Q.rollSpeed:Kl(Q.rollSpeed,Q.rollEndSpeed,Gl((t-Q.rollFastPhase)/(Q.rollTime-Q.rollFastPhase),0,1));this.velocity.x=this.rollDir.x*n*this.speedMultiplier,this.velocity.z=this.rollDir.z*n*this.speedMultiplier,this.grounded&&this.velocity.y<=0?this.velocity.y=-1:this.applyGravity(e),this.move(e,this.grounded&&this.velocity.y<=0),t>=Q.rollTime&&(this.invulnerable=!1,this.rollCooldown=Q.rollCooldown,this.clampHorizontal(Q.run),this.setPosture(`stand`),this.setState(this.grounded?`ground`:`air`))}startSlide(e){let t=this.horizontalSpeed;t>.5?this.slideDir.set(this.velocity.x/t,0,this.velocity.z/t):e>.2?this.slideDir.copy(Kp):Wp(this.yaw,this.slideDir),this.slideSpeed0=Math.max(t,Q.slideStartSpeed),this.setPosture(`crouch`),this.stats.slides++,this.setState(`slide`)}stepSlide(e,t,n){let r=Gl(this.stateTime/Q.slideTime,0,1),i=1-(1-r)*(1-r),a=Kl(this.slideSpeed0,Q.slideEndSpeed,i);if(n>.2&&Wp(Zl(Gp(this.slideDir.x,this.slideDir.z),Gp(Kp.x,Kp.z),Q.slideSteer*e),this.slideDir),t.dodgePressed&&this.rollCooldown<=0){this.startRoll(n,!1);return}if(this.jumpBuffer>0&&this.setPosture(`stand`)){this.jumpBuffer=0,this.clampHorizontal(Q.sprint),this.slideCooldown=Q.slideCooldown,this.doJump();return}this.velocity.x=this.slideDir.x*a*this.speedMultiplier,this.velocity.z=this.slideDir.z*a*this.speedMultiplier,this.velocity.y=-1,this.move(e,!0);let o=this.stateTime>.12&&this.stepSpeed(e)<1.5;this.grounded?(r>=1||o)&&(this.slideCooldown=Q.slideCooldown,(t.sprint||t.moveY>.3)&&this.setPosture(`stand`),this.setState(`ground`)):(this.slideCooldown=Q.slideCooldown,this.velocity.y=0,this.setState(`air`))}clampHorizontal(e){let t=this.horizontalSpeed;t>e&&(this.velocity.x*=e/t,this.velocity.z*=e/t)}tryVault(e){let t=this.planVault(e);return t?(this.exitCover(),this.setPosture(`crouch`),Up(t,this.activePlan),this.vault=this.activePlan,t.mantle?this.stats.mantles++:this.stats.vaults++,this.velocity.set(0,0,0),this.setState(`vault`),!0):!1}planVault(e){if(!this.grounded)return null;let t=this.physics,n=this.hit;if(Xp.set(this.feet.x,this.feet.y+.3,this.feet.z),!t.raycast(Xp,e,Q.vaultReach,ud.STATIC,n,this.char.collider)||Math.abs(n.normal.y)>.3||n.normal.x*e.x+n.normal.z*e.z>-.5)return null;let r=n.distance,i=n.point.x,a=n.point.z;if(Xp.set(i+e.x*.25,this.feet.y+Q.vaultMaxH+.45,a+e.z*.25),!t.raycast(Xp,Zp,Q.vaultMaxH+.45,ud.STATIC,n,this.char.collider)||n.normal.y<.8)return null;let o=n.point.y,s=o-this.feet.y;if(s<Q.vaultMinH||s>Q.vaultMaxH)return null;let c=o+.1;if(qp.set(i+e.x*.3,c+Bp+Rp,a+e.z*.3),t.overlapsCapsule(qp,.3,.25,ud.STATIC,this.char.collider))return null;let l=-1;for(let r=.35;r<=Q.vaultMaxDepth+.01;r+=.35)if(Xp.set(i+e.x*r,o+.3,a+e.z*r),!t.raycast(Xp,Zp,.45,ud.STATIC,n,this.char.collider)){l=r;break}let u=this.scratchPlan;u.start.copy(this.feet);let d=Math.max(0,r-Rp-.08);if(u.p1.set(this.feet.x+e.x*d,c,this.feet.z+e.z*d),u.mantle=!1,l>0){let r=i+e.x*(l+Rp+.12),d=a+e.z*(l+Rp+.12);Xp.set(r,o+.3,d);let f=t.raycast(Xp,Zp,s+2.5,ud.STATIC,n,this.char.collider),p=f?n.point.y:-1/0;qp.set(r,c+Bp+Rp,d);let m=t.overlapsCapsule(qp,.3,Bp,ud.STATIC,this.char.collider)===null;f&&m&&p>this.feet.y-3?u.p2.set(r,c,d):l=-1}if(l<0){u.mantle=!0;let n=i+e.x*.55,r=a+e.z*.55;if(u.p2.set(n,o+.02,r),qp.set(n,o+.04+Bp+Rp,r),t.overlapsCapsule(qp,.3,.25,ud.STATIC,this.char.collider))return null}return u.dir.copy(e),u.dur1=Q.vaultRiseBase+Q.vaultRisePerM*s,u.dur2=Math.max(.12,Math.hypot(u.p2.x-u.p1.x,u.p2.z-u.p1.z)/Q.vaultOverSpeed),u}scratchPlan=Hp();activePlan=Hp();peekContext(e,t,n){let r=this.peekOut;if(r.vault=null,r.cover=null,this.state!==`ground`||!this.grounded)return r;let i=-Math.sin(e),a=-Math.cos(e),o=Math.cos(e),s=-Math.sin(e);Jp.set(i*n+o*t,0,a*n+s*t),Jp.lengthSq()<.09?Wp(e,Jp):Jp.normalize();let c=this.planVault(Jp);return c&&(r.vault=c.mantle?`mantle`:`vault`),this.probeCover(Jp,Q.coverProbe)&&(r.cover=this.coverProbe.height),r}peekOut={vault:null,cover:null};stepVault(e){let t=this.vault;if(!t){this.setState(`air`);return}let n=this.stateTime,r=qp;if(n<=t.dur1?r.lerpVectors(t.start,t.p1,n/t.dur1):r.lerpVectors(t.p1,t.p2,Math.min(1,(n-t.dur1)/t.dur2)),this.velocity.set((r.x-this.feet.x)/e,(r.y-this.feet.y)/e,(r.z-this.feet.z)/e),this.move(e,!1,!1),this.feet.distanceTo(r)>Q.vaultAbortDev)this.vault=null,this.velocity.set(0,0,0),this.setPosture(`stand`),this.setState(`air`);else if(n>=t.dur1+t.dur2){let e=t.mantle,n=t.dir;this.vault=null,this.setPosture(`stand`),e?(this.velocity.set(0,-1,0),this.setState(`ground`)):(this.velocity.set(n.x*Q.vaultExitSpeed,0,n.z*Q.vaultExitSpeed),this.setState(`air`))}}probeCover(e,t){let n=this.physics,r=this.hit,i=this.coverProbe;if(Xp.set(this.feet.x,this.feet.y+.45,this.feet.z),!n.raycast(Xp,e,t,ud.STATIC,r,this.char.collider)||Math.abs(r.normal.y)>.35||r.normal.x*e.x+r.normal.z*e.z>-.5)return!1;let a=Math.hypot(r.normal.x,r.normal.z)||1;return i.dist=r.distance,i.nx=r.normal.x/a,i.nz=r.normal.z/a,Xp.set(this.feet.x,this.feet.y+.8,this.feet.z),n.raycast(Xp,e,i.dist+.35,ud.STATIC,r,this.char.collider)?(Xp.set(this.feet.x,this.feet.y+1.5,this.feet.z),i.height=n.raycast(Xp,e,i.dist+.4,ud.STATIC,r,this.char.collider)?`high`:`low`,!0):!1}coverProbe={dist:0,nx:0,nz:1,height:`low`};tryEnterCover(e,t){if(!this.grounded)return!1;let n=t>.3?Jp.copy(Kp):Wp(e.camYaw,Jp);if(!this.probeCover(n,Q.coverProbe))return!1;let r=this.coverProbe;return this.cover={normal:new H(r.nx,0,r.nz),height:r.height,edge:0},r.height===`low`&&this.setPosture(`crouch`),this.velocity.set(0,0,0),this.stats.coverEnters++,this.setState(`cover`),!0}exitCover(){this.cover&&(this.cover=null,this.state===`cover`&&(this.setPosture(`stand`),this.setState(`ground`)))}stepCover(e,t,n){let r=this.cover;if(!r){this.setState(`ground`);return}let i=r.normal,a=i.z,o=-i.x,s=(Kp.x*a+Kp.z*o)*n,c=(Kp.x*i.x+Kp.z*i.z)*n;if(t.crouchPressed||t.sprint&&n>.5||c>.65){this.exitCover(),this.stepGround(e,{...t,crouchPressed:!1},n);return}if(t.dodgePressed&&this.rollCooldown<=0){this.exitCover(),this.startRoll(n,!1);return}if(this.jumpBuffer>0){if(this.jumpBuffer=0,Jp.set(-i.x,0,-i.z),r.height===`low`&&this.tryVault(Jp))return;if(this.exitCover(),this.posture===`stand`){this.doJump();return}}if(Jp.set(-i.x,0,-i.z),!this.probeCover(Jp,Q.coverProbe+.2)){this.exitCover();return}let l=this.coverProbe;i.set(i.x*.7+l.nx*.3,0,i.z*.7+l.nz*.3).normalize(),r.height=l.height;let u=s*Q.cover*this.speedMultiplier;if(r.edge=0,Math.abs(s)>.1){let t=Math.sign(s),n=Rp*.9+Math.abs(u)*e,i=this.physics;Xp.set(this.feet.x+a*t*n,this.feet.y+.45,this.feet.z+o*t*n),i.raycast(Xp,Jp,l.dist+.35,ud.STATIC,this.hit,this.char.collider)||(u=0,r.edge=t)}let d=Gl((l.dist-Rp-Q.coverGap)*12,-2,3);this.velocity.x=a*u-i.x*d,this.velocity.z=o*u-i.z*d,this.velocity.y=-1,r.height===`low`?this.setPosture(this.aiming?`stand`:`crouch`):this.setPosture(`stand`),this.move(e,!0),this.grounded||(this.exitCover(),this.setState(`air`))}updateFacing(e,t){let n=this.yaw,r=Q.turnRate;this.state!==`dead`&&this.state!==`locked`&&(this.state===`vault`&&this.vault?n=Gp(this.vault.dir.x,this.vault.dir.z):this.aiming?(n=t.camYaw,r=Q.aimTurnRate):this.state===`cover`&&this.cover?n=Gp(-this.cover.normal.x,-this.cover.normal.z):this.state===`roll`?(n=Gp(this.rollDir.x,this.rollDir.z),r=Q.aimTurnRate):this.state===`slide`?n=Gp(this.slideDir.x,this.slideDir.z):this.horizontalSpeed>.6&&(n=Gp(this.velocity.x,this.velocity.z)),this.yaw=Zl(this.yaw,this.yaw+Yl(this.yaw,n),r*e))}move(e,t,n=!0){this.setSnap(t);let r=this.desired;r.x=this.velocity.x*e,r.y=this.velocity.y*e,r.z=this.velocity.z*e;let i=this.char.controller;i.computeColliderMovement(this.char.collider,r,void 0,this.groups);let a=i.computedMovement(this.kccOut);this.grounded=i.computedGrounded(),n&&this.clipVelocityAgainstContacts(),this.feet.x+=a.x,this.feet.y+=a.y,this.feet.z+=a.z,this.syncCollider()}clipVelocityAgainstContacts(){if(this.velocity.y<=0)return;let e=this.char.controller,t=e.numComputedCollisions();for(let n=0;n<t;n++){let t=e.computedCollision(n,this.colOut);if(t&&t.normal1.y<-.5){this.velocity.y=0;return}}}afterStep(e){let t=this.feet;if(!Number.isFinite(t.x)||!Number.isFinite(t.y)||!Number.isFinite(t.z))this.nanResets++,console.error(`[PlayerController] posición no finita: restaurando último suelo seguro`),this.teleport(this.lastSafe,this.lastSafeYaw);else if(t.y<this.killY)this.killPlaneResets++,this.teleport(this.lastSafe,this.lastSafeYaw);else{if(e>0){let n=Math.hypot(t.x-this.prevFeet.x,t.z-this.prevFeet.z)/e;this.stats.distance+=n*e,this.speedMultiplier===1&&n>this.maxHorizontalSpeed&&(this.maxHorizontalSpeed=n)}this.state===`ground`&&this.grounded&&this.stateTime>.3&&(this.safeTimer+=e,this.safeTimer>.5&&(this.safeTimer=0,this.lastSafe.copy(t),this.lastSafeYaw=this.yaw))}}renderFeet(e,t){return t.lerpVectors(this.prevFeet,this.feet,e)}renderYaw(e){return this.prevYaw+Yl(this.prevYaw,this.yaw)*e}penetration(){return this.centerOf(qp),this.physics.overlapsCapsule(qp,.29000000000000004,this.halfHeight-.01,ud.STATIC,this.char.collider)}dispose(){this.physics.removeCharacter(this.char)}},$p={charonFirst:{speaker:`Charon`,lines:[`Le damos la bienvenida al Continental. Es un placer tenerle de vuelta.`,`Le recuerdo la primera regla de la casa: aquí no se hace negocio. Las armas se quedan enfundadas.`,`Cuando quiera un contrato, hable conmigo. El Sommelier le atenderá en la armería y Winston le espera en gerencia.`,`El campo de práctica está en el sótano: baje por el ascensor del fondo.`]},charonBoard:{speaker:`Charon`,lines:[`Aquí tiene el tablero de contratos. Elija con cuidado.`]},sommelierFirst:{speaker:`Sommelier`,lines:[`Buenas noches. ¿Algo para la cena? Tenemos de todo... para una celebración.`,`Las Monedas Continental abren cualquier vitrina de esta casa.`]},sommelierRepeat:{speaker:`Sommelier`,lines:[`¿Qué le apetece esta noche?`]},winstonFirst:{speaker:`Winston`,lines:[`Se retiró, y el mundo de afuera no lo ha entendido. Mientras esté bajo este techo, nadie le tocará.`,`Pero recuerde: si dispara aquí dentro, la Alta Mesa le declarará Excomunicado. Perderá privilegios... y monedas.`,`Complete contratos, gane monedas y no haga tonterías en mi hotel.`]},winstonRepeat:{speaker:`Winston`,lines:[`Los contratos los gestiona Charon. Yo gestiono las consecuencias.`,`Disfrute de su estancia. Y recuerde las reglas.`]},winstonReadmit:{speaker:`Winston`,lines:[`Le dije que no hiciera tonterías.`,`La Alta Mesa ha aceptado la multa. Sus privilegios quedan restituidos... por ahora.`]},winstonReadmitDead:{speaker:`Winston`,lines:[`Despierte. Ha tenido suerte de que esto siga siendo mi hotel.`,`La multa ya está pagada. No vuelva a disparar aquí dentro.`]}};function em(e){return{speaker:`Reglas de la casa`,lines:[`REGLA I — No se hace negocio en el Continental. Aquí nadie dispara.`,`REGLA II — Todo marcador de sangre se honra sin excepción.`,`CONSECUENCIA — Quien rompe la Regla I es declarado Excomunicado: suena la alarma, la Alta Mesa cobra el 30 % de sus monedas y el hotel se vuelve hostil hasta que Winston le readmita.`,`RECORDATORIO — WASD mover · ${e.sprint} sprint · ${e.crouch} agacharse o cubrirse · ${e.jump} saltar · ${e.fire} disparar · ${e.reload} recargar · ${e.takedown} takedown · ${e.focus} foco · ${e.interact} interactuar.`]}}var tm={intelNeutral:`Zona neutral: aquí nadie dispara. Desenfundar es un aviso; disparar, Excomunicado (multa del 30 % y oleadas).`,intelHostile:`EXCOMUNICADO: sobrevive a las oleadas hasta que Winston te readmita.`,intelContracts:`Contratos con Charon (recepción) · armería con el Sommelier · simulacro en el sótano.`,warnDraw:`Regla I: aquí no se hace negocio. Disparar dentro del Continental = EXCOMUNICADO.`,holstered:`Arma enfundada.`,excommunicado:e=>`EXCOMUNICADO. La Alta Mesa cobra ${e} monedas. El hotel es hostil.`,wave:(e,t)=>`Oleada ${e} de ${t}`,readmitted:`Readmisión concedida. El Continental vuelve a ser zona neutral.`,drillDone:e=>`Simulacro completado: +${e} monedas. Vuelve al Continental por el ascensor.`,drillRepeat:`Simulacro completado. Vuelve al Continental por el ascensor.`,zoneNeutral:`ZONA NEUTRAL · PROHIBIDO DISPARAR`,zoneHostile:(e,t)=>`EXCOMUNICADO · OLEADA ${e}/${t}`,objectiveFirst:`Habla con Charon en recepción`,objectiveHub:`Visita la armería o baja al campo de práctica`,objectiveSurvive:(e,t)=>`Sobrevive a la oleada ${e} de ${t}`,objectiveDrill:`Elimina a los 6 maniquíes armados del patio`,objectiveDrillDone:`Vuelve al Continental por el ascensor`},nm=[{id:`practice.clean`,name:`Calentamiento`,desc:`Completa el simulacro sin gastar marcadores.`,coins:1,mission:`practice`,check:e=>e.stats.markersUsed===0},{id:`nightclub.noCivs`,name:`Nadie más`,desc:`Ningún civil herido.`,coins:2,mission:`nightclub`,check:e=>e.stats.civiliansHurt===0&&e.stats.civiliansKilled===0},{id:`nightclub.ghost`,name:`Fantasma`,desc:`Sin disparar la alarma.`,coins:2,mission:`nightclub`,check:e=>!e.alarmSounded},{id:`nightclub.gunfu`,name:`Gun-fu`,desc:`3 takedowns en el club.`,coins:2,mission:`nightclub`,check:e=>e.stats.takedowns>=3},{id:`docks.fast`,name:`Demolición`,desc:`Menos de 4 minutos.`,coins:2,mission:`docks`,check:e=>e.stats.timeSec<240},{id:`docks.knife`,name:`Filo`,desc:`5 bajas con cuchillo.`,coins:2,mission:`docks`,check:e=>e.stats.knifeKills>=5},{id:`docks.untouched`,name:`Intocable`,desc:`La salud nunca bajó de 100.`,coins:3,mission:`docks`,check:e=>e.minHealth>=100},{id:`rooftop.marksmen`,name:`Cazatiradores`,desc:`Todos los tiradores con headshot.`,coins:2,mission:`rooftop`,check:e=>e.marksmenTotal>0&&e.marksmenHeadshots>=e.marksmenTotal},{id:`rooftop.punctual`,name:`Puntual`,desc:`Escapa con más de 20 s.`,coins:2,mission:`rooftop`,check:e=>e.escapeSecondsLeft>20},{id:`rooftop.economy`,name:`Economía de movimiento`,desc:`Máximo 2 recargas.`,coins:3,mission:`rooftop`,check:e=>e.reloads<=2},{id:`gauntlet.w5`,name:`Oleada 5`,desc:`Supera la oleada 5.`,coins:2,mission:`gauntlet`,check:e=>e.gauntletWaves>=5},{id:`gauntlet.w10`,name:`Oleada 10`,desc:`Supera la oleada 10.`,coins:4,mission:`gauntlet`,check:e=>e.gauntletWaves>=10},{id:`gauntlet.x8`,name:`×8`,desc:`Alcanza el multiplicador ×8 en el Gauntlet.`,coins:2,mission:`gauntlet`,check:e=>e.styleBest>=8},{id:`global.first`,name:`Primer contrato`,desc:`Completa tu primer contrato.`,coins:1,mission:null,check:e=>e.mission!==`gauntlet`},{id:`global.rankS`,name:`Rango S`,desc:`Consigue un rango S.`,coins:3,mission:null,check:e=>e.rank===`S`},{id:`global.collector`,name:`Coleccionista`,desc:`Compra 5 mejoras.`,coins:2,mission:null,check:(e,t)=>t.upgrades.length>=5}];function rm(e,t){let n=[];for(let r of nm)r.mission!==null&&r.mission!==e.mission||t.achievements.includes(r.id)||r.check(e,t)&&(t.achievements.push(r.id),n.push({id:r.id,name:r.name,coins:r.coins}));return n}var im={id:`global.excommunicado`,name:`Excomunicado`,coins:0},am=2.5,om=class{state=`neutral`;wave=0;triggered=0;armedTimer=0;readmitTimer=0;gapTimer=-1;pendingWave=0;get armed(){return this.state===`armed`||this.state===`excommunicado`}get hostile(){return this.state===`excommunicado`}drawWeapon(){return this.state===`neutral`?(this.state=`armed`,this.armedTimer=0,`warn`):`none`}holster(){return this.state===`armed`?(this.state=`neutral`,`holstered`):`none`}shotFired(){return this.state!==`neutral`&&this.state!==`armed`?`none`:(this.state=`excommunicado`,this.triggered++,this.wave=0,this.pendingWave=1,this.gapTimer=-1,`excommunicado`)}takePendingWave(){let e=this.pendingWave;return e>0&&(this.pendingWave=0,this.wave=e),e}waveCleared(){return this.state!==`excommunicado`||this.gapTimer>=0||this.pendingWave>0?`none`:this.wave>=3?(this.readmit(),`readmitted`):(this.gapTimer=am,`none`)}playerDied(){return this.state===`excommunicado`?(this.readmit(),`readmitted`):`none`}readmit(){this.state=`readmitted`,this.readmitTimer=4,this.pendingWave=0,this.gapTimer=-1}update(e){switch(this.state){case`armed`:return this.armedTimer+=e,this.armedTimer>=8?(this.state=`neutral`,`holstered`):`none`;case`excommunicado`:return this.gapTimer>=0&&(this.gapTimer-=e,this.gapTimer<0)?(this.pendingWave=this.wave+1,`waveStart`):`none`;case`readmitted`:return this.readmitTimer-=e,this.readmitTimer<=0?(this.state=`neutral`,this.wave=0,`neutral`):`none`;default:return`none`}}reset(){this.state=`neutral`,this.wave=0,this.pendingWave=0,this.gapTimer=-1,this.armedTimer=0,this.readmitTimer=0}},sm=new K(16756896),cm=new K(16751242),lm=class{d;rules=new om;lostCoins=0;lastShots;alarmT=0;alarmOn=!1;baseHemi;baseAmbient;baseHemiIntensity;diedDuringExcom=!1;constructor(e){this.d=e;let t=e.session;this.lastShots=t.combat.stats.shotsFired,this.baseHemi=t.level.hemi.color.clone(),this.baseAmbient=t.level.ambient.color.clone(),this.baseHemiIntensity=t.level.hemi.intensity,t.combat.holstered=!0,t.combat.onFireWhileHolstered=()=>this.onDrawAttempt(),e.hud.setCombatVisible(!1),e.hud.setZone(tm.zoneNeutral),e.hud.setObjective(e.profile.flags.charonMet?tm.objectiveHub:tm.objectiveFirst)}get hostile(){return this.rules.hostile}get state(){return this.rules.state}onDrawAttempt(){this.rules.drawWeapon()===`warn`&&(this.d.session.combat.holstered=!1,this.d.hud.setCombatVisible(!0),this.d.hud.showToast(tm.warnDraw,4),this.d.audio.ui(`error`))}holster(){let e=this.d.session.combat;e.holstered=!0,e.weapon.cancelReload(),this.d.hud.setCombatVisible(!1)}fixedUpdate(e){let t=this.d.session,n=t.combat;if(n.stats.shotsFired>this.lastShots&&(this.lastShots=n.stats.shotsFired,this.rules.shotFired()===`excommunicado`&&this.trigger()),this.handle(this.rules.update(e)),this.rules.hostile){let e=this.rules.takePendingWave();e>0?this.spawnWave(e):t.enemies.aliveCount===0&&this.handle(this.rules.waveCleared())}}handle(e){switch(e){case`holstered`:this.holster(),this.d.hud.showToast(tm.holstered,1.5);break;case`waveStart`:break;case`readmitted`:this.readmit();break;case`neutral`:this.setAlarm(!1),this.holster(),this.d.hud.setZone(tm.zoneNeutral),this.d.hud.setObjective(this.d.profile.flags.charonMet?tm.objectiveHub:tm.objectiveFirst),this.d.hud.showToast(tm.readmitted,3)}}trigger(){let e=this.d.profile;this.lostCoins=ju(e),e.flags.excomSeen=!0,e.achievements.includes(im.id)||e.achievements.push(im.id),this.d.save(),this.setAlarm(!0),this.d.hud.showToast(tm.excommunicado(this.lostCoins),5),this.d.hud.setCombatVisible(!0),this.diedDuringExcom=!1}spawnWave(e){let t=this.d.session;t.enemies.spawnEvent(`excom-${e}`,!0)===0?this.handle(this.rules.waveCleared()):(t.enemies.alertAll(t.player.feet),this.d.hud.setZone(tm.zoneHostile(e,3)),this.d.hud.setObjective(tm.objectiveSurvive(e,3)),this.d.hud.showToast(tm.wave(e,3),2),this.d.audio.alert(t.player.feet))}onPlayerDied(){this.rules.playerDied()===`readmitted`&&(this.diedDuringExcom=!0,this.readmit())}readmit(){this.d.session.enemies.despawnAll(),this.d.audio.siren(!1),this.d.hud.setObjective(``),this.d.save(),this.d.dialog(this.diedDuringExcom?$p.winstonReadmitDead:$p.winstonReadmit)}setAlarm(e){if(e===this.alarmOn)return;this.alarmOn=e;let t=this.d.session.level;if(this.d.audio.siren(e),e)t.hemi.color.copy(sm),t.ambient.color.copy(cm);else{t.hemi.color.copy(this.baseHemi),t.ambient.color.copy(this.baseAmbient),t.hemi.intensity=this.baseHemiIntensity;for(let e of t.alarmLights)e.intensity=0}}frameUpdate(e){if(!this.alarmOn)return;this.alarmT+=e;let t=.55+.45*Math.sin(this.alarmT*5);for(let e of this.d.session.level.alarmLights)e.intensity=e.userData.baseIntensity*t}dispose(){this.setAlarm(!1);let e=this.d.session.combat;e.onFireWhileHolstered=null,e.holstered=!1}};async function um(e){switch(e){case`arena`:return(await ad(async()=>{let{arena:e}=await import(`./arena-_jxDRWRo.js`);return{arena:e}},__vite__mapDeps([0,1]),import.meta.url)).arena;case`practice`:return(await ad(async()=>{let{practice:e}=await import(`./practice-DJ3ha5D_.js`);return{practice:e}},__vite__mapDeps([2,1]),import.meta.url)).practice;case`hub`:return(await ad(async()=>{let{hub:e}=await import(`./hub-pJscrpLP.js`);return{hub:e}},__vite__mapDeps([3,1]),import.meta.url)).hub;case`nightclub`:return(await ad(async()=>{let{nightclub:e}=await import(`./nightclub-DG0tSEBx.js`);return{nightclub:e}},__vite__mapDeps([4,1]),import.meta.url)).nightclub;case`docks`:return(await ad(async()=>{let{docks:e}=await import(`./docks-CAcpTRDL.js`);return{docks:e}},__vite__mapDeps([5,1]),import.meta.url)).docks;case`rooftop`:return(await ad(async()=>{let{rooftop:e}=await import(`./rooftop-C7fLbxMG.js`);return{rooftop:e}},__vite__mapDeps([6,1]),import.meta.url)).rooftop;default:throw Error(`Nivel no disponible todavía: ${e}`)}}var dm=1.5,fm=.7,pm=.15,mm=1.2,hm=.5;function gm(e){let t=Math.max(1,Math.floor(e)),n=Math.min(10,3+Math.floor((t-1)*dm)),r=t>=3?Math.min(3,Math.floor(t/3)):0,i=t>=5?Math.min(2,Math.floor((t-5)/2)+1):0,a=n-r-i,o=t>=2?Math.min(fm,pm*t):0,s=Math.round(a*o);return{thug:a-s,escort:s,heavy:r,marksman:i,total:n}}function _m(e){let t=[];for(let n=0;n<e.thug;n++)t.push(`thug`);for(let n=0;n<e.escort;n++)t.push(`escort`);for(let n=0;n<e.marksman;n++)t.push(`marksman`);for(let n=0;n<e.heavy;n++)t.push(`heavy`);return t}function vm(e){let t=[];for(let n of e.enemies)n.spawnOn?.startsWith(`excom-`)&&(t.some(e=>Math.hypot(e[0]-n.pos[0],e[2]-n.pos[2])<.5)||t.push(n.pos));return t}var ym={id:`gauntlet`,lives:1,objectives:[{id:`waves`,kind:`waves`,text:`Sobrevive`}]};function bm(){return{distance:0,sprintTime:0,vaults:0,mantles:0,slides:0,rolls:0,dives:0,coverEnters:0,shotsFired:0,reloads:0,switches:0,focusUses:0,takedowns:0}}function xm(e,t){return t.distance=e.distance,t.sprintTime=e.sprintTime,t.vaults=e.vaults,t.mantles=e.mantles,t.slides=e.slides,t.rolls=e.rolls,t.dives=e.dives,t.coverEnters=e.coverEnters,t.shotsFired=e.shotsFired,t.reloads=e.reloads,t.switches=e.switches,t.focusUses=e.focusUses,t.takedowns=e.takedowns,t}var Sm={move:4,sprint:1.2,vault:1,slide:1,dodge:1,cover:1,shoot:3,reload:1,switch:1,focus:1,takedown:1};function Cm(e,t){switch(e){case`move`:return t.distance;case`sprint`:return t.sprintTime;case`vault`:return t.vaults+t.mantles;case`slide`:return t.slides;case`dodge`:return t.rolls+t.dives;case`cover`:return t.coverEnters;case`shoot`:return t.shotsFired;case`reload`:return t.reloads;case`switch`:return t.switches;case`focus`:return t.focusUses;case`takedown`:return t.takedowns}}function wm(e,t,n){let r=Cm(e,n)-Cm(e,t);return Math.max(0,Math.min(1,r/Sm[e]))}function Tm(e,t,n){let r=Sm[e];return r<=1||e===`move`||e===`sprint`?null:Math.min(r,Math.floor(Cm(e,n)-Cm(e,t)))}var Em=[`moveForward`,`moveLeft`,`moveBack`,`moveRight`],Dm=new Set(mf);function Om(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>{if(n===`move`){let e=Em.map(e=>t(e));return e.every(e=>/^[A-Z0-9]$/.test(e))?e.join(``):e.join(` / `)}return Dm.has(n)?t(n):e})}var km=[[`S`,88],[`A`,74],[`B`,58],[`C`,40]],Am=e=>Math.max(0,Math.min(100,e));function jm(e,t){return t<=0||e<=t?100:Am(100*(1-(e-t)/t))}function Mm(e,t,n,r){return e<=0?n+r>0?100:50:Am(100*t/e)}function Nm(e,t){return t<=0?100:Am(100*(1-e/(1.5*t)))}function Pm(e){return Am(100*e/6)}function Fm(e,t){return Am(100-40*e-100*t)}function Im(e){for(let[t,n]of km)if(e>=n)return t;return`D`}var Lm=[`D`,`C`,`B`,`A`,`S`];function Rm(e){let t={time:jm(e.timeSec,e.parTime),accuracy:Mm(e.shotsFired,e.shotsHit,e.takedowns,e.knifeKills),damage:Nm(e.damageTaken,e.healthPool),variety:Pm(e.varietyCount),civilians:e.hasCivilians?Fm(e.civiliansHurt,e.civiliansKilled):null},n=[t.time,t.accuracy,t.damage,t.variety,...t.civilians===null?[]:[t.civilians]],r=n.reduce((e,t)=>e+t,0)/n.length,i=Math.min(10,Math.max(0,(e.styleBest-1)*(10/7))),a=15*Math.max(0,e.markersUsed),o=Math.round(Am(r+i-a)*10)/10,s=Im(o),c=!1;return e.hasCivilians&&e.civiliansKilled>0&&Lm.indexOf(s)>Lm.indexOf(`C`)&&(s=`C`,c=!0),{subs:t,styleBonus:Math.round(i*10)/10,markerPenalty:a,total:o,rank:s,capped:c}}var zm=[.5,.2],Bm=3.5,Vm=100,Hm=3,Um=new H,Wm=class{d;id;objectives;index=0;time=0;finished=!1;markersTotal;markersUsed=0;respawnPos;respawnYaw;alarmSounded=!1;alarmDisabled=!1;civiliansHurt=0;civiliansKilled=0;minHealth=100;marksmenHeadshots=0;marksmenTotal=0;escapeLeft=0;gauntletWaves=0;doneTargets=new Set;bossPhaseDone=new Set;bossKneel=0;bossKneeling=null;objectiveTime=0;lastKills=0;gauntletWave=0;gauntletBreak=0;waveQueue=[];waveEnemies=[];spawnT=0;spawnCursor=0;spawnPoints=[];learnBase=bm();learnNow=bm();scoreBase={shotsFired:0,shotsHit:0,takedowns:0,knifeKills:0,damageTaken:0};hudNum=NaN;constructor(e){this.d=e;let t=e.session,n=e.block??t.data.mission;if(!n)throw Error(`El nivel ${t.data.id} no tiene guion de misión`);this.id=n.id,this.objectives=n.objectives,this.markersTotal=n.lives??Ld(new Set(e.profile.upgrades));let r=t.data.spawn;this.respawnPos=new H(r.pos[0],r.pos[1],r.pos[2]),this.respawnYaw=r.yaw,this.marksmenTotal=t.data.enemies.filter(e=>e.type===`marksman`).length,this.startObjective(0)}get current(){return this.objectives[this.index]??null}text(e){return this.d.label?Om(e.text,this.d.label):e.text}get currentText(){let e=this.current;return e?this.text(e):``}refreshText(){this.hudNum=NaN;let e=this.current;e&&!this.finished&&this.d.hud.setObjective(this.text(e))}hudCount(e,t,n){t!==this.hudNum&&(this.hudNum=t,this.d.hud.setObjective(`${this.text(e)} · ${n(t)}`))}skipLearn(){if(this.current?.kind!==`learn`)return;for(let e of this.objectives)e.stunGroup&&this.d.session.enemies.despawnGroup(e.stunGroup);let e=this.objectives.findIndex(e=>e.kind!==`learn`);e>=0&&this.startObjective(e,!0)}fillCounters(e){let t=this.d.session.player.stats,n=this.d.session.combat.stats;return e.distance=t.distance,e.sprintTime=t.sprintTime,e.vaults=t.vaults,e.mantles=t.mantles,e.slides=t.slides,e.rolls=t.rolls,e.dives=t.dives,e.coverEnters=t.coverEnters,e.shotsFired=n.shotsFired,e.reloads=n.reloads,e.switches=n.switches,e.focusUses=n.focusUses,e.takedowns=n.takedowns,e}get gauntletPending(){return this.waveQueue.length}get markersLeft(){return this.markersTotal-this.markersUsed}beacon(e){let t=this.current;if(!t)return null;let n=this.d.session;if(t.kind===`waves`){let t=null,r=1/0;for(let e of this.waveEnemies){if(!e.alive)continue;let i=e.feet.distanceToSquared(n.player.feet);i<r&&(r=i,t=e)}return t?e.set(t.feet.x,t.feet.y+1.9,t.feet.z):null}if(t.kind===`learn`&&t.stunGroup){for(let r of n.enemies.enemies)if(r.alive&&r.spawnDef.group===t.stunGroup)return e.set(r.feet.x,r.feet.y+1.9,r.feet.z);return null}if(t.kind===`eliminate`||t.kind===`boss`){let r=null,i=1/0;for(let e of n.enemies.enemies){if(!e.alive||!this.matchesGroup(e,t))continue;let a=e.feet.distanceToSquared(n.player.feet);a<i&&(i=a,r=e)}return r?e.set(r.feet.x,r.feet.y+1.9,r.feet.z):t.at?e.set(t.at[0],t.at[1]+1.2,t.at[2]):null}if(t.kind===`interact`&&t.targets){let r=null,i=1/0;for(let a of t.targets){if(this.doneTargets.has(a))continue;let t=n.data.interactables.find(e=>e.id===a);if(!t)continue;let o=(t.pos[0]-n.player.feet.x)**2+(t.pos[2]-n.player.feet.z)**2;o<i&&(i=o,r=e.set(t.pos[0],t.pos[1]+1.2,t.pos[2]))}return r}return t.at?e.set(t.at[0],t.at[1]+1.2,t.at[2]):null}matchesGroup(e,t){if(t.kind===`boss`)return e.spawnDef.id===t.enemyId||e.id.startsWith(`${t.enemyId}#`);let n=t.group??`all`;return n===`all`||e.spawnDef.group===n}startObjective(e,t=!1){let n=this.objectives[e];if(!n)return;this.index=e,this.objectiveTime=0,this.hudNum=NaN;let r=this.objectives[e-1];if(n.kind!==`learn`&&r?.kind===`learn`&&this.startScoring(),n.kind===`learn`&&this.startLearn(n),n.onStart&&this.d.session.enemies.spawnEvent(n.onStart)>0&&this.d.session.enemies.alertAll(this.d.session.player.feet),n.kind===`escape`&&(this.escapeLeft=n.seconds??45),this.d.hud.setObjective(this.text(n)),n.kind===`waves`){if(this.spawnPoints=vm(this.d.session.data),this.spawnPoints.length===0)throw Error(`El nivel ${this.d.session.data.id} no tiene puntos de oleada`);this.gauntletBreak=5,this.d.hud.setZone(`GAUNTLET · EXCOMUNICADO`),this.d.hud.setObjective(this.breakText())}if(e>0){let e=n.kind===`learn`?`✓ Hecho`:r?.kind===`learn`&&!t?`Tutorial completado · ${this.text(n)}`:`Objetivo: ${this.text(n)}`;this.d.hud.showToast(e,n.kind===`learn`?1.2:3),this.d.audio.ui(`confirm`)}}startScoring(){let e=this.d.session.combat;this.time=0,this.minHealth=e.vitals.health,this.scoreBase.shotsFired=e.stats.shotsFired,this.scoreBase.shotsHit=e.stats.shotsHit,this.scoreBase.takedowns=e.stats.takedowns,this.scoreBase.knifeKills=e.stats.knifeKills,this.scoreBase.damageTaken=e.stats.damageTaken}startLearn(e){xm(this.fillCounters(this.learnNow),this.learnBase);let t=this.d.session.combat;if(e.skill===`focus`&&(t.focus=Math.max(t.focus,Vm)),e.skill===`reload`){let e=t.weapon;e.isGun&&e.mag>=e.def.mag&&(e.mag=Math.max(1,e.mag-Hm))}}completeObjective(){let e=this.current;e&&(e.onComplete&&this.d.session.enemies.spawnEvent(e.onComplete),e.checkpoint&&this.activateCheckpoint(e.checkpoint),this.index+1>=this.objectives.length?this.finish(!0,``):this.startObjective(this.index+1))}activateCheckpoint(e){let t=this.d.session.data.checkpoints.find(t=>t.id===e);t&&(this.respawnPos.set(t.pos[0],t.pos[1],t.pos[2]),this.respawnYaw=t.yaw,this.d.hud.showToast(`Punto de control: ${t.label}`,2.5))}onInteract(e){this.d.session.data.interactables.find(t=>t.id===e)?.kind===`alarmPanel`&&(this.alarmDisabled=!0,this.d.hud.showToast(`Alarma desactivada`,2.5),this.d.audio.ui(`confirm`)),this.doneTargets.add(e)}onEnemyAlert(e){if(!this.d.session.data.mission?.alarm||this.alarmSounded||this.alarmDisabled)return;this.alarmSounded=!0;let t=this.d.session.enemies.spawnEvent(`alarm`);this.d.hud.showToast(t>0?`¡Alarma! Llegan refuerzos`:`¡Alarma!`,3),this.d.audio.alert(e.feet),this.d.session.enemies.alertAll(this.d.session.player.feet)}onCivilianHurt(e){e?(this.civiliansKilled++,this.d.hud.showToast(`¡Civil abatido! El rango queda limitado a C`,3.5),this.d.audio.ui(`error`)):(this.civiliansHurt++,this.d.hud.showToast(`¡Civil herido! Baja la nota de civiles`,2.5),this.d.audio.ui(`error`))}onPlayerDied(){return this.markersUsed++,this.markersUsed>=this.markersTotal?(this.finish(!1,`Sin marcadores de sangre.`),!1):!0}fixedUpdate(e){if(this.finished)return;let t=this.d.session,n=this.current;if(n){if(n.kind!==`learn`&&(this.time+=e,this.minHealth=Math.min(this.minHealth,t.combat.vitals.health)),this.objectiveTime+=e,this.trackMarksmen(),this.tickBoss(e),n.stunGroup)for(let e of t.enemies.enemies)e.alive&&e.spawnDef.group===n.stunGroup&&e.state!==`stunned`&&e.stun();switch(n.kind){case`learn`:{let e=n.skill;if(!e){this.completeObjective();break}this.fillCounters(this.learnNow);let r=!1;if(n.stunGroup){let e=0,i=0;for(let r of t.enemies.enemies)r.spawnDef.group===n.stunGroup&&(e++,r.alive&&i++);r=e>0&&i===0}if(r||wm(e,this.learnBase,this.learnNow)>=1){this.d.audio.ui(`confirm`),this.completeObjective();break}let i=Tm(e,this.learnBase,this.learnNow);i!==null&&this.hudCount(n,i,t=>`${t}/${Sm[e]}`);break}case`reach`:case`escape`:if(n.kind===`escape`&&(this.escapeLeft=Math.max(0,(n.seconds??45)-this.objectiveTime),this.hudCount(n,Math.ceil(this.escapeLeft),e=>`${e} s`),this.escapeLeft<=0)){this.finish(!1,`Se acabó el tiempo de escape.`);return}n.at&&this.playerInZone(n.at,n.radius??2.5)&&this.completeObjective();break;case`eliminate`:{let e=0,r=0;for(let i of t.enemies.enemies)this.matchesGroup(i,n)&&(r++,i.alive&&e++);r>0&&e===0?this.completeObjective():e>0&&this.objectiveTime>.5&&this.hudCount(n,e,e=>`${e} restante${e===1?``:`s`}`);break}case`interact`:{let e=n.targets??[],t=e.filter(e=>!this.doneTargets.has(e)).length;t===0?this.completeObjective():e.length>1&&this.hudCount(n,e.length-t,t=>`${t}/${e.length}`);break}case`survive`:{let e=Math.max(0,(n.seconds??30)-this.objectiveTime);this.hudCount(n,Math.ceil(e),e=>`${e} s`),e<=0&&this.completeObjective();break}case`waves`:this.tickWaves(e);break;case`boss`:{let e=t.enemies.enemies.find(e=>this.matchesGroup(e,n));e&&!e.alive?this.completeObjective():e&&this.hudCount(n,Math.ceil(e.vitals.health/e.vitals.maxHealth*100),e=>`${e} %`);break}}}}tickWaves(e){let t=this.d.session;if(this.gauntletBreak>0){this.gauntletBreak-=e,this.d.hud.setObjective(this.breakText()),this.gauntletBreak<=0&&this.startWave();return}this.spawnT-=e,this.waveQueue.length>0&&this.spawnT<=0&&this.spawnNext();let n=0;for(let e of this.waveEnemies)e.alive&&n++;let r=n+this.waveQueue.length;r===0?(this.gauntletWaves=this.gauntletWave,this.gauntletBreak=5,this.waveEnemies.length=0,xd(t.combat.vitals,30),this.d.hud.showToast(`Oleada ${this.gauntletWave} superada · +30 salud`,2.5),this.d.audio.ui(`confirm`)):this.d.hud.setObjective(`Oleada ${this.gauntletWave} · ${r} restante${r===1?``:`s`}`)}breakText(){return`Oleada ${this.gauntletWave+1} en ${Math.max(1,Math.ceil(this.gauntletBreak))} s`}startWave(){this.gauntletWave++,this.waveQueue.length=0,this.waveQueue.push(..._m(gm(this.gauntletWave))),this.spawnT=0,this.d.hud.setZone(`GAUNTLET · OLEADA ${this.gauntletWave}`),this.d.hud.showToast(`Oleada ${this.gauntletWave}`,2),this.d.audio.alert(this.d.session.player.feet)}spawnNext(){let e=this.d.session,t=this.spawnPoints,n=mm*mm;for(let r=0;r<t.length;r++){let i=t[(this.spawnCursor+r)%t.length];if(Um.set(i[0],i[1],i[2]),Um.distanceToSquared(e.player.feet)<16)continue;let a=!1;for(let t of e.enemies.enemies)if(t.alive&&t.feet.distanceToSquared(Um)<n){a=!0;break}if(a)continue;let o=this.waveQueue.shift(),s=Math.atan2(-(e.player.feet.x-i[0]),-(e.player.feet.z-i[2])),c=e.enemies.spawn({id:`g${this.gauntletWave}-${o}-${this.waveEnemies.length+1}`,type:o,pos:[i[0],i[1],i[2]],yaw:s});c.brain.aggressive=!0,c.brain.alert(e.player.feet),this.waveEnemies.push(c),this.spawnCursor=(this.spawnCursor+r+1)%t.length,this.spawnT=hm;return}}playerInZone(e,t){let n=this.d.session.player.feet;return Math.hypot(e[0]-n.x,e[2]-n.z)<=t&&Math.abs(e[1]-n.y)<2.5}trackMarksmen(){let e=this.d.session.combat.stats.kills;if(e===this.lastKills)return;this.lastKills=e;let t=0;for(let e of this.d.session.enemies.enemies)e.def.type===`marksman`&&!e.alive&&e.lastHitWasHead&&t++;this.marksmenHeadshots=t}tickBoss(e){let t=this.d.session;if(this.bossKneeling){if(t.combat.takedown?.enemy===this.bossKneeling)return;this.bossKneel-=e,(this.bossKneel<=0||!this.bossKneeling.alive)&&(this.bossKneeling.alive&&(this.bossKneeling.brain.unstun(),this.bossKneeling.mover.setLocked(!1)),this.bossKneeling=null)}else for(let e of t.enemies.enemies){if(e.def.type!==`boss`||!e.alive)continue;let n=e.vitals.health/e.vitals.maxHealth;for(let r=0;r<zm.length;r++){if(this.bossPhaseDone.has(r)||n>zm[r])continue;this.bossPhaseDone.add(r),e.stun(),this.bossKneeling=e,this.bossKneel=Bm;let i=t.enemies.spawnEvent(`boss-phase-${r+1}`);this.d.hud.showToast(i>0?`¡El Juez se arrodilla! Remátalo con un takedown. Llegan escoltas.`:`¡El Juez se arrodilla! Remátalo con un takedown.`,3.5),this.d.audio.alert(e.feet);return}}}finish(e,t){if(this.finished)return;this.finished=!0;let n=this.d.session.combat,r=ru[this.id],i={timeSec:this.time,parTime:r.parTime,shotsFired:n.stats.shotsFired-this.scoreBase.shotsFired,shotsHit:n.stats.shotsHit-this.scoreBase.shotsHit,takedowns:n.stats.takedowns-this.scoreBase.takedowns,knifeKills:n.stats.knifeKills-this.scoreBase.knifeKills,damageTaken:n.stats.damageTaken-this.scoreBase.damageTaken,healthPool:n.vitals.maxHealth+n.vitals.maxArmor,varietyCount:n.style.varietyCount,hasCivilians:r.hasCivilians,civiliansHurt:this.civiliansHurt,civiliansKilled:this.civiliansKilled,markersUsed:this.markersUsed,styleBest:n.style.bestMultiplier},a=Rm(i);if(this.id===`gauntlet`){this.finishGauntlet(i,a);return}let o=this.d.profile,s=!o.completed.includes(this.id),c=0,l=[],u=!1;if(e){c=ku(this.id,a.rank,s),u=gu(o,this.id,{rank:a.rank,score:n.style.score,timeSec:Math.round(this.time)}),l=rm({mission:this.id,rank:a.rank,stats:i,alarmSounded:this.alarmSounded,minHealth:this.minHealth,reloads:n.stats.reloads,marksmenHeadshots:this.marksmenHeadshots,marksmenTotal:this.marksmenTotal,escapeSecondsLeft:this.escapeLeft,gauntletWaves:this.gauntletWaves,styleBest:n.style.bestMultiplier},o);for(let e of l)c+=e.coins;Mu(o,c)}this.d.save(),this.d.hud.setObjective(``),this.d.onFinished({mission:this.id,success:e,failReason:t,rank:a,stats:i,timeSec:this.time,coinsReward:c,firstTime:s,achievements:l,newBest:u,kills:n.stats.kills,markersUsed:this.markersUsed,markersTotal:this.markersTotal,gauntlet:null})}finishGauntlet(e,t){let n=this.d.profile,r=this.d.session.combat,i=this.gauntletWaves,a=i>0?hu(n,{waves:i,score:r.style.score,date:Date.now()}):0,o=rm({mission:this.id,rank:t.rank,stats:e,alarmSounded:!1,minHealth:this.minHealth,reloads:r.stats.reloads,marksmenHeadshots:this.marksmenHeadshots,marksmenTotal:this.marksmenTotal,escapeSecondsLeft:0,gauntletWaves:i,styleBest:r.style.bestMultiplier},n),s=Au(i);for(let e of o)s+=e.coins;Mu(n,s),this.d.save(),this.d.hud.setObjective(``),this.d.onFinished({mission:this.id,success:!0,failReason:``,rank:t,stats:e,timeSec:this.time,coinsReward:s,firstTime:!1,achievements:o,newBest:a===1,kills:r.stats.kills,markersUsed:this.markersUsed,markersTotal:this.markersTotal,gauntlet:{waves:i,position:a,top:n.gauntlet.map(e=>({...e}))}})}},Gm=.6,Km=.1,qm=class{scale=1;upWait=4;slowT=0;okT=0;lastChange=null;reset(){this.scale=1,this.upWait=4,this.slowT=0,this.okT=0,this.lastChange=null}update(e,t){return e>18.620689655172416?(this.okT=0,this.slowT+=t,this.slowT<2||this.scale<=.6?!1:(this.slowT=0,this.lastChange===`up`&&(this.upWait=Math.min(32,this.upWait*2)),this.lastChange=`down`,this.scale=Math.max(Gm,Jm(this.scale-Km)),!0)):(this.slowT=0,e>17.24137931034483||this.scale>=1?(this.okT=0,this.scale>=1&&(this.upWait=4),!1):(this.okT+=t,this.okT<this.upWait?!1:(this.okT=0,this.lastChange=`up`,this.scale=Math.min(1,Jm(this.scale+Km)),!0)))}};function Jm(e){return Math.round(e*10)/10}var Ym={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Xm=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Zm=new co(-1,1,1,-1,0,1),Qm=new class extends pr{constructor(){super(),this.setAttribute(`position`,new tr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new tr([0,2,0,0,2,0],2))}},$m=class{constructor(e){this._mesh=new ri(Qm,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Zm)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},eh=class extends Xm{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof ba?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=_a.clone(e.uniforms),this.material=new ba({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new $m(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},th=class extends Xm{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},nh=class extends Xm{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},rh=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new V);this._width=n.width,this._height=n.height,t=new Nt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:_}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new eh(Ym),this.copyPass.material.blending=0,this.timer=new _o}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}th!==void 0&&(r instanceof th?n=!0:r instanceof nh&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new V);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},ih={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},ah=class extends Xm{constructor(){super(),this.isOutputPass=!0,this.uniforms=_a.clone(ih.uniforms),this.material=new xa({name:ih.name,uniforms:this.uniforms,vertexShader:ih.vertexShader,fragmentShader:ih.fragmentShader}),this._fsQuad=new $m(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},W.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},oh=class extends Xm{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new K}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},sh={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new K(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},ch=class e extends Xm{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new V(256,256):new V(e.x,e.y),this.clearColor=new K(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Nt(i,a,{type:_,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Nt(i,a,{type:_,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Nt(i,a,{type:_,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=sh;this.highPassUniforms=_a.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ba({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new V(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new H(1,1,1),new H(1,1,1),new H(1,1,1),new H(1,1,1),new H(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=_a.clone(Ym.uniforms),this.blendMaterial=new ba({uniforms:this.copyUniforms,vertexShader:Ym.vertexShader,fragmentShader:Ym.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new K,this._oldClearAlpha=1,this._basic=new Gr,this._fsQuad=new $m(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new V(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new ba({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new V(.5,.5)},direction:{value:new V(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new ba({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};ch.BlurDirectionX=new V(1,0),ch.BlurDirectionY=new V(0,1);var lh=class extends yn{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new sa;e.deleteAttribute(`uv`);let t=new Sa({side:1}),n=new Sa,r=new so(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let i=new ri(e,t);i.position.set(-.757,13.219,.717),i.scale.set(31.713,28.305,28.591),this.add(i);let a=new ki(e,n,6),o=new ln;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let s=new ri(e,uh(50));s.position.set(-16.116,14.37,8.208),s.scale.set(.1,2.428,2.739),this.add(s);let c=new ri(e,uh(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let l=new ri(e,uh(17));l.position.set(14.904,12.198,-1.832),l.scale.set(.15,4.265,6.331),this.add(l);let u=new ri(e,uh(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new ri(e,uh(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new ri(e,uh(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function uh(e){return new Ca({color:0,emissive:16777215,emissiveIntensity:e})}var dh={low:{pixelRatioCap:1,baseScale:.75,shadows:!1,shadowMapSize:512,bloom:!1,antialias:!1,particles:.5,shadowInterval:1},medium:{pixelRatioCap:1.25,baseScale:1,shadows:!0,shadowMapSize:1024,bloom:!1,antialias:!0,particles:1,shadowInterval:2},high:{pixelRatioCap:1.75,baseScale:1,shadows:!0,shadowMapSize:2048,bloom:!0,antialias:!0,particles:1,shadowInterval:1}},fh=class{renderer;scene=new yn;camera=new ao(68,1,.05,400);canvas;preset;dynamicResolution=!0;dyn=new qm;composer=null;bloomPass=null;bloomEnabled=!1;container;brightness=1;frameNo=0;constructor(e,t){this.container=e,this.preset=t;let n=dh[t];this.renderer=new Hl({antialias:n.antialias,powerPreference:`high-performance`,stencil:!1,alpha:!1});let r=this.renderer;r.outputColorSpace=Be,r.toneMapping=7,r.toneMappingExposure=1,r.shadowMap.enabled=n.shadows,r.shadowMap.type=1,r.info.autoReset=!1,Xf(r.capabilities.getMaxAnisotropy()),this.canvas=r.domElement,this.canvas.id=`game-canvas`,this.canvas.setAttribute(`aria-label`,`Vista del juego`),e.appendChild(this.canvas);let i=new $o(r),a=new lh;this.scene.environment=i.fromScene(a,.04).texture,a.dispose(),i.dispose(),this.setBloom(n.bloom),this.resize(),window.addEventListener(`resize`,this.resize),this.watchDevicePixelRatio()}get quality(){return dh[this.preset]}applyPreset(e){this.preset=e;let t=dh[e];this.renderer.shadowMap.enabled=t.shadows,this.setBloom(t.bloom),this.dyn.reset(),this.resize()}setBloom(e){if(this.bloomEnabled=e,e&&!this.composer){let e=this.renderer.getSize(new V);this.composer=new rh(this.renderer),this.composer.addPass(new oh(this.scene,this.camera)),this.bloomPass=new ch(e,.45,.35,.85),this.composer.addPass(this.bloomPass),this.composer.addPass(new ah),this.resize()}}get bloomActive(){return this.bloomEnabled}setExposure(e){this.renderer.toneMappingExposure=Gl(e,.4,2.5)}setBrightness(e){this.brightness=Gl(e,.6,1.8),this.canvas.style.filter=this.brightness===1?``:`brightness(${this.brightness})`}get pixelRatio(){let e=this.quality;return Math.min(window.devicePixelRatio||1,e.pixelRatioCap)*e.baseScale*(this.dynamicResolution?this.dyn.scale:1)}appliedW=0;appliedH=0;appliedDpr=0;checkResize(){let e=this.container.clientWidth||window.innerWidth,t=this.container.clientHeight||window.innerHeight;(e!==this.appliedW||t!==this.appliedH||window.devicePixelRatio!==this.appliedDpr)&&this.resize()}resize=()=>{let e=Math.max(1,this.container.clientWidth||window.innerWidth),t=Math.max(1,this.container.clientHeight||window.innerHeight);this.appliedW=e,this.appliedH=t,this.appliedDpr=window.devicePixelRatio,this.renderer.setPixelRatio(this.pixelRatio),this.renderer.setSize(e,t,!1),this.canvas.style.width=`100%`,this.canvas.style.height=`100%`,this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(e,t))};watchDevicePixelRatio(){window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener(`change`,()=>{this.resize(),this.watchDevicePixelRatio()},{once:!0})}updateDynamicResolution(e,t){this.dynamicResolution&&this.dyn.update(e,t)&&this.resize()}get dynamicScale(){return this.dyn.scale}render(){this.renderer.info.reset();let e=this.renderer.shadowMap;e.enabled&&(this.frameNo++,e.autoUpdate=!1,this.frameNo%this.quality.shadowInterval===0&&(e.needsUpdate=!0)),this.bloomEnabled&&this.composer?this.composer.render():this.renderer.render(this.scene,this.camera)}prewarm(){this.renderer.compile(this.scene,this.camera),this.renderer.shadowMap.needsUpdate=!0}sampleLuminance(){this.render();let e=this.renderer.getContext(),t=e.drawingBufferWidth,n=e.drawingBufferHeight,r=new Uint8Array(t*n*4);e.readPixels(0,0,t,n,e.RGBA,e.UNSIGNED_BYTE,r);let i=0,a=0;for(let e=0;e<n;e+=4)for(let n=0;n<t;n+=4){let o=(e*t+n)*4;i+=(.2126*(r[o]??0)+.7152*(r[o+1]??0)+.0722*(r[o+2]??0))/255,a++}return a>0?i/a:0}gpuInfo(){let e=this.renderer.getContext(),t=e.getExtension(`WEBGL_debug_renderer_info`);return String(t?e.getParameter(t.UNMASKED_RENDERER_WEBGL):e.getParameter(e.RENDERER))}dispose(){window.removeEventListener(`resize`,this.resize),this.composer?.dispose(),this.renderer.dispose()}};function ph(e,t){let n=document.getElementById(`boot-progress`),r=document.getElementById(`boot-label`);n&&(n.style.width=`${Math.round(Math.max(0,Math.min(1,e))*100)}%`),r&&(r.textContent=t),document.getElementById(`boot`)?.setAttribute(`aria-valuenow`,String(Math.round(e*100)))}function mh(e=!1){let t=document.getElementById(`boot`);if(!t)return;t.style.pointerEvents=`none`;let n=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;e||n||typeof t.animate!=`function`?t.remove():t.animate([{opacity:1},{opacity:0}],{duration:450,easing:`ease`,fill:`forwards`}).finished.then(()=>t.remove(),()=>t.remove())}function hh(e){let t=e instanceof Error?`${e.message}\n\n${e.stack??``}`:String(e);console.error(e);let n=document.getElementById(`boot`)??document.body.appendChild(document.createElement(`div`));n.id=`boot`,n.classList.remove(`boot-done`),n.innerHTML=``;let r=document.createElement(`div`);r.className=`fatal`;let i=document.createElement(`h1`);i.textContent=`No se pudo iniciar el juego`;let a=document.createElement(`p`);a.textContent=`Tu navegador necesita WebGL2 y WebAssembly. Prueba con Chrome, Edge o Firefox actualizados.`;let o=document.createElement(`pre`);o.textContent=t,r.append(i,a,o),n.appendChild(r)}function $(e,t={},n=[]){let r=document.createElement(e);if(t.class&&(r.className=t.class),t.id&&(r.id=t.id),t.text!==void 0&&(r.textContent=t.text),t.role&&r.setAttribute(`role`,t.role),t.ariaLabel&&r.setAttribute(`aria-label`,t.ariaLabel),t.title&&(r.title=t.title),t.type&&r instanceof HTMLButtonElement&&(r.type=t.type),t.hidden&&(r.hidden=!0),t.tabIndex!==void 0&&(r.tabIndex=t.tabIndex),t.dataset)for(let[e,n]of Object.entries(t.dataset))r.dataset[e]=n;t.style&&Object.assign(r.style,t.style);let i=t.onClick;i&&r.addEventListener(`click`,e=>i(e));for(let e of n)e!=null&&e!==!1&&r.append(typeof e==`string`||typeof e==`number`?String(e):e);return r}function gh(e,t,n=`btn`){let r=$(`button`,{class:n,type:`button`,text:e});return r.addEventListener(`click`,e=>{e.preventDefault(),e.stopPropagation(),t()}),r}function _h(e){return $(`kbd`,{class:`keycap`,text:e})}function vh(e,t){e.textContent!==t&&(e.textContent=t)}function yh(e,t){e.hidden===t&&(e.hidden=!t)}var bh={shirt:1908774,tie:789776,pants:2764083,shoes:723725,skin:12554098,hair:2038294},xh={thug:{type:`thug`,label:`Matón`,color:16747562,glyph:`●`,description:`Pistola. Avanza y dispara en pares.`,health:80,heavyArmor:0,weapon:{damage:8,pellets:1,rpm:180,burst:2,burstPause:1.1,range:30,accuracy:.5,telegraph:0,model:`pistol`},reaction:.7,detectTime:1,sightRange:26,fovDeg:110,runScale:.92,walkScale:.42,prefersCover:.45,flanker:!1,engage:[7,15],colors:{jacket:3814192,accent:16747562,...bh},hair:`short`,vest:!1,bulk:1.05,score:100},escort:{type:`escort`,label:`Escolta`,color:16765503,glyph:`▲`,description:`SMG en ráfagas. Te flanquea.`,health:90,heavyArmor:0,weapon:{damage:5,pellets:1,rpm:620,burst:4,burstPause:1,range:24,accuracy:.42,telegraph:0,model:`smg`},reaction:.6,detectTime:.9,sightRange:24,fovDeg:115,runScale:1,walkScale:.45,prefersCover:.3,flanker:!0,engage:[6,12],colors:{jacket:2830392,accent:16765503,...bh},hair:`cap`,vest:!0,bulk:1,score:120},marksman:{type:`marksman`,label:`Tirador`,color:16726843,glyph:`◆`,description:`Rifle. Láser rojo 1,2 s antes de disparar: rompe la línea de visión.`,health:70,heavyArmor:0,weapon:{damage:35,pellets:1,rpm:26,burst:1,burstPause:.6,range:60,accuracy:.92,telegraph:1.2,model:`rifle`},reaction:.8,detectTime:1.2,sightRange:50,fovDeg:90,runScale:.85,walkScale:.4,prefersCover:.2,flanker:!1,engage:[15,45],colors:{jacket:3420206,accent:16726843,...bh},hair:`short`,vest:!1,bulk:1,score:150},heavy:{type:`heavy`,label:`Blindado`,color:8368895,glyph:`■`,description:`Escopeta y armadura: el cuerpo apenas recibe daño. Headshot o takedown.`,health:120,heavyArmor:150,weapon:{damage:6,pellets:4,rpm:55,burst:1,burstPause:1.2,range:14,accuracy:.7,telegraph:.6,model:`shotgun`},reaction:.8,detectTime:1.1,sightRange:22,fovDeg:100,runScale:.7,walkScale:.35,prefersCover:0,flanker:!1,engage:[2,7],colors:{jacket:3028290,accent:8368895,...bh},hair:`helmet`,vest:!0,bulk:1.28,score:220},boss:{type:`boss`,label:`Jefe`,color:16723592,glyph:`★`,description:`Patrón propio por fases. Observa su telégrafo.`,health:420,heavyArmor:120,weapon:{damage:9,pellets:1,rpm:420,burst:5,burstPause:1.4,range:40,accuracy:.5,telegraph:.5,model:`smg`},reaction:.5,detectTime:.6,sightRange:45,fovDeg:140,runScale:.85,takedownWhenStunned:!0,walkScale:.4,prefersCover:.5,flanker:!1,engage:[8,18],colors:{jacket:15196888,shirt:1316378,tie:16723592,pants:14275527,shoes:1710618,skin:13081210,hair:921102,accent:16723592},hair:`short`,vest:!1,bulk:1.12,score:600}},Sh=6219464,Ch=.95,wh=14,Th=[{colors:{jacket:11745882,shirt:15787744,tie:11745882,pants:2829104,shoes:273,skin:14266508,hair:3877406,accent:16723592},hair:`long`},{colors:{jacket:2976949,shirt:16119285,tie:2976949,pants:2042426,shoes:273,skin:9198140,hair:1709330,accent:1696767},hair:`short`},{colors:{jacket:15253578,shirt:1315860,tie:15253578,pants:3815994,shoes:273,skin:15780008,hair:13214826,accent:16765503},hair:`long`},{colors:{jacket:6962431,shirt:15329778,tie:6962431,pants:2105392,shoes:273,skin:12159594,hair:2760216,accent:8011007},hair:`cap`}],Eh=class{physics;nav;rng;id;mover;rig;vitals=hd({maxHealth:60});state=`calm`;home;goal=new H;intent=Vp();pose=Dp();dancePhase;hideTimer=0;deathTime=-1;stuckT=0;progressFrom=new H;constructor(e,t,n,r,i,a){this.physics=t,this.nav=n,this.rng=i,this.id=e.id,this.home=new H(e.pos[0],e.pos[1],e.pos[2]),this.mover=new Qp(t,new H(e.pos[0],e.pos[1]+.02,e.pos[2]),e.yaw,ld.CIVILIAN);let o=Th[a%Th.length];this.rig=new Ip(`civ`,{colors:o.colors,rimColor:Sh,rimStrength:.9,hair:o.hair,weapon:`none`}),r.add(this.rig.root),this.dancePhase=i.range(0,Math.PI*2),this.behavior=e.behavior}behavior;get alive(){return!this.vitals.dead}get collider(){return this.mover.collider}get feet(){return this.mover.feet}get height(){return this.mover.height}panic(e){this.alive&&this.state!==`hide`&&(this.feet.distanceTo(e)>wh&&this.state===`calm`||(this.pickFleeGoal(e),this.state=`flee`,this.hideTimer=this.rng.range(4,7)))}pickFleeGoal(e){let t=this.feet,n=-1,r=-1/0;for(let i=0;i<12;i++){let i=this.rng.range(0,Math.PI*2),a=this.rng.range(6,14),o=this.nav.nearestNode(t.x+Math.sin(i)*a,t.y,t.z+Math.cos(i)*a,2);if(o<0)continue;let s=this.nav.nodeX[o]-e.x,c=this.nav.nodeZ[o]-e.z,l=s*s+c*c;l>r&&(r=l,n=o)}n>=0?this.nav.pos(n,this.goal):this.goal.copy(t),this.progressFrom.copy(t),this.stuckT=0}applyHit(e){let t=yd(this.vitals,e);return t.dealt<=0?{killed:!1,dealt:0}:(t.killed?(this.state=`dead`,this.mover.kill(),this.mover.collider.setEnabled(!1),this.deathTime=performance.now()):this.panic(this.feet),{killed:t.killed,dealt:t.dealt})}fixedUpdate(e){let t=this.intent;if(t.moveX=0,t.moveY=0,t.sprint=!1,this.state===`flee`){let n=this.feet,r=this.goal.x-n.x,i=this.goal.z-n.z,a=Math.hypot(r,i);this.stuckT+=e,this.stuckT>1&&(n.distanceTo(this.progressFrom)<.3&&this.pickFleeGoal(n),this.progressFrom.copy(n),this.stuckT=0),a<.6?(this.state=`hide`,this.mover.setPosture(`crouch`)):(t.camYaw=Gp(r,i),t.moveY=Ch,t.sprint=!0)}else if(this.state===`hide`)this.hideTimer-=e,this.hideTimer<=0&&(this.state=`calm`,this.mover.setPosture(`stand`));else if(this.state===`calm`&&this.behavior!==`dance`){let e=this.feet,n=this.home.x-e.x,r=this.home.z-e.z;Math.hypot(n,r)>1&&(t.camYaw=Gp(n,r),t.moveY=.4)}this.mover.fixedUpdate(e,t)}renderUpdate(e,t){let n=this.mover;n.renderFeet(e,this.rig.root.position),this.rig.root.rotation.y=n.renderYaw(e);let r=this.pose;r.speed=n.stepSpeed(Ql),r.state=this.alive?n.state:`dead`,r.posture=n.posture,r.grounded=n.grounded,r.aim=0,r.stateTime=this.alive?n.stateTime:(performance.now()-this.deathTime)/1e3,this.rig.update(r,t),this.alive&&this.state===`calm`&&this.behavior===`dance`&&(this.dancePhase+=t*6.5,this.rig.root.position.y+=Math.abs(Math.sin(this.dancePhase))*.08,this.rig.root.rotation.y+=Math.sin(this.dancePhase*.5)*.35)}dispose(){this.rig.dispose(),this.physics.removeCharacter(this.mover.char)}},Dh=class{list=[];byHandle=new Map;onHurt=null;constructor(e,t,n,r,i){e.forEach((e,a)=>{let o=new Eh(e,t,n,r,i,a);this.list.push(o),this.byHandle.set(o.collider.handle,o)})}fromCollider(e){return e?this.byHandle.get(e.handle)??null:null}noise(e,t){let n=t*t;for(let t of this.list)t.alive&&t.feet.distanceToSquared(e)<=n&&t.panic(e)}hit(e,t){let n=e.applyHit(t);n.dealt>0&&this.onHurt?.(e,n.killed)}fixedUpdate(e){for(let t of this.list)t.fixedUpdate(e)}renderUpdate(e,t){for(let n of this.list)n.renderUpdate(e,t)}get aliveCount(){return this.list.filter(e=>e.alive).length}dispose(){for(let e of this.list)e.dispose();this.list.length=0,this.byHandle.clear()}},Oh=[`thug`,`escort`,`marksman`,`heavy`,`boss`],kh=e=>`#${e.toString(16).padStart(6,`0`)}`;function Ah(e,t,n,r){return $(`li`,{class:`intel-enemy`},[$(`span`,{class:`intel-glyph`,text:e,style:{color:kh(t),borderColor:kh(t)}}),$(`span`,{class:`intel-name`,text:n}),$(`span`,{class:`intel-desc`,text:r})])}function jh(e){let t=[];for(let n of Oh){if(!e.enemies.includes(n))continue;let r=xh[n];t.push(Ah(r.glyph,r.color,r.label,r.description))}e.civilians&&t.push(Ah(`✚`,Sh,`Civil`,`No dispares: herirlos baja la nota y matar a uno limita el rango a C.`));let n=[];return e.markers&&n.push(`Marcadores ${e.markers.total-e.markers.used}/${e.markers.total}`),e.alive!==null&&n.push(`Enemigos a la vista ${e.alive}`),$(`section`,{class:`intel`,role:`dialog`,ariaLabel:`Intel`},[$(`div`,{class:`intel-kicker`,text:`INTEL`}),$(`h2`,{class:`intel-title`,text:e.title.toUpperCase()}),$(`div`,{class:`intel-place`,text:e.place}),e.objective?$(`p`,{class:`intel-objective`},[$(`b`,{text:`Objetivo: `}),e.objective]):null,n.length?$(`div`,{class:`intel-facts`,text:n.join(` · `)}):null,e.notes.length?$(`ul`,{class:`intel-notes`},e.notes.map(e=>$(`li`,{text:e}))):null,t.length?$(`div`,{class:`intel-sub`,text:`Leyenda`}):null,t.length?$(`ul`,{class:`intel-legend`},t):null])}var Mh=class{root;crosshair;hitmark;prompt;promptKey;promptText;zone;objective;beacon;beaconDist;beaconArrow;beaconArrowDist;markers;hints;hintsEnabled=!0;intel;vitals;armorBar;healthBar;vitalsText;weaponPanel;weaponName;ammoMag;ammoRes;slots;reloadBar;reloadFill;reloadWindow;reloadLabel;dmgRing;dmgArcs=[];style;styleMult;styleRank;styleGauge;styleScore;feed;focusBox;focusFill;focusLabel;vignette;focusTint;focusTintOn=!1;death;deathCause;deathHint;toast;toastT=0;lastPrompt=``;cache=new Map;combatVisible=!0;constructor(e){this.root=$(`div`,{id:`hud`,ariaLabel:`HUD`}),this.crosshair=$(`div`,{class:`crosshair`,ariaLabel:`Mira`},[$(`i`,{class:`ch ch-t`}),$(`i`,{class:`ch ch-b`}),$(`i`,{class:`ch ch-l`}),$(`i`,{class:`ch ch-r`}),$(`i`,{class:`ch-dot`})]),this.hitmark=$(`div`,{class:`hitmark`},[$(`i`),$(`i`),$(`i`),$(`i`)]),this.promptKey=_h(`E`),this.promptText=$(`span`,{class:`prompt-text`}),this.prompt=$(`div`,{class:`prompt`,role:`status`},[this.promptKey,this.promptText]),this.prompt.hidden=!0,this.zone=$(`div`,{class:`zone-label`}),this.objective=$(`div`,{class:`objective`,role:`status`,ariaLabel:`Objetivo actual`}),this.objective.hidden=!0,this.beaconDist=$(`span`,{class:`beacon-dist`}),this.beacon=$(`div`,{class:`beacon`,ariaLabel:`Baliza del objetivo`},[$(`i`,{class:`beacon-diamond`}),this.beaconDist]),this.beacon.hidden=!0,this.beaconArrowDist=$(`span`,{class:`beacon-dist`}),this.beaconArrow=$(`div`,{class:`beacon-arrow`},[$(`i`,{class:`beacon-tri`}),this.beaconArrowDist]),this.beaconArrow.hidden=!0,this.markers=$(`div`,{class:`markers`,ariaLabel:`Marcadores de sangre`}),this.markers.hidden=!0,this.hints=$(`div`,{class:`hints`}),this.armorBar=$(`div`,{class:`bar-fill armor`}),this.healthBar=$(`div`,{class:`bar-fill health`}),this.vitalsText=$(`div`,{class:`vitals-text`}),this.vitals=$(`div`,{class:`vitals`,ariaLabel:`Integridad del traje y salud`},[$(`div`,{class:`vitals-label`,text:`INTEGRIDAD`}),$(`div`,{class:`bar`},[this.armorBar]),$(`div`,{class:`vitals-label`,text:`SALUD`}),$(`div`,{class:`bar`},[this.healthBar]),this.vitalsText]),this.weaponName=$(`div`,{class:`weapon-name`}),this.ammoMag=$(`span`,{class:`ammo-mag`}),this.ammoRes=$(`span`,{class:`ammo-res`}),this.slots=$(`div`,{class:`slots`}),this.weaponPanel=$(`div`,{class:`weapon-panel`,ariaLabel:`Arma y munición`},[this.weaponName,$(`div`,{class:`ammo`},[this.ammoMag,this.ammoRes]),this.slots]),this.reloadFill=$(`div`,{class:`reload-fill`}),this.reloadWindow=$(`div`,{class:`reload-window`}),this.reloadLabel=$(`div`,{class:`reload-label`,text:`R en la zona dorada = recarga perfecta`}),this.reloadBar=$(`div`,{class:`reload`},[$(`div`,{class:`reload-track`},[this.reloadWindow,this.reloadFill]),this.reloadLabel]),this.reloadBar.hidden=!0,this.dmgRing=$(`div`,{class:`dmg-ring`});for(let e=0;e<6;e++){let e=$(`div`,{class:`dmg-arc`});this.dmgArcs.push(e),this.dmgRing.appendChild(e)}this.styleMult=$(`div`,{class:`style-mult`}),this.styleRank=$(`div`,{class:`style-rank`}),this.styleGauge=$(`div`,{class:`style-gauge-fill`}),this.styleScore=$(`div`,{class:`style-score`}),this.feed=$(`div`,{class:`feed`}),this.style=$(`div`,{class:`style`,ariaLabel:`Medidor de estilo`},[this.styleMult,this.styleRank,$(`div`,{class:`style-gauge`},[this.styleGauge]),this.styleScore,this.feed]),this.focusFill=$(`div`,{class:`focus-fill`}),this.focusLabel=$(`div`,{class:`focus-label`}),this.focusBox=$(`div`,{class:`focus`,ariaLabel:`Foco`},[$(`div`,{class:`focus-track`},[this.focusFill]),this.focusLabel]),this.vignette=$(`div`,{class:`vignette`}),this.focusTint=$(`div`,{class:`focus-tint`}),this.deathCause=$(`p`,{class:`death-cause`}),this.deathHint=$(`p`,{class:`death-hint`}),this.death=$(`div`,{class:`death`,role:`alertdialog`,ariaLabel:`Has caído`},[$(`h2`,{text:`HAS CAÍDO`}),this.deathCause,this.deathHint]),this.death.hidden=!0,this.toast=$(`div`,{class:`toast`,role:`status`}),this.toast.hidden=!0,this.intel=$(`div`,{class:`intel-wrap`}),this.intel.hidden=!0,this.root.append(this.focusTint,this.vignette,this.beacon,this.beaconArrow,this.crosshair,this.hitmark,this.dmgRing,this.prompt,this.zone,this.objective,this.markers,this.hints,this.vitals,this.weaponPanel,this.reloadBar,this.style,this.focusBox,this.toast,this.death,this.intel),this.root.hidden=!0,e.appendChild(this.root)}setVisible(e){yh(this.root,e)}setCombatVisible(e){if(e!==this.combatVisible){this.combatVisible=e;for(let t of[this.vitals,this.weaponPanel,this.style,this.focusBox])t.hidden=!e}}setZone(e){vh(this.zone,e)}setCrosshairVisible(e){yh(this.crosshair,e)}setObjective(e){vh(this.objective,e),yh(this.objective,e.length>0),e||this.setBeacon(null)}setBeacon(e){if(!e){yh(this.beacon,!1),yh(this.beaconArrow,!1);return}let t=`${Math.round(e.distance)} m`;e.onScreen?(yh(this.beaconArrow,!1),yh(this.beacon,!0),this.beacon.style.transform=`translate(${Math.round(e.x)}px, ${Math.round(e.y)}px)`,vh(this.beaconDist,t)):(yh(this.beacon,!1),yh(this.beaconArrow,!0),this.beaconArrow.style.transform=`translate(${Math.round(e.x)}px, ${Math.round(e.y)}px) rotate(${e.angle.toFixed(1)}deg)`,vh(this.beaconArrowDist,t),this.beaconArrowDist.style.transform=`rotate(${(-e.angle).toFixed(1)}deg)`)}setMarkers(e,t){if(t<=0){yh(this.markers,!1);return}yh(this.markers,!0);let n=`${e}/${t}`;this.markersKey!==n&&(this.markersKey=n,this.markers.replaceChildren($(`span`,{class:`markers-label`,text:`MARCADORES`}),...Array.from({length:t},(n,r)=>$(`i`,{class:`marker${r<t-e?` on`:``}`}))))}markersKey=``;setIntel(e){e?this.intel.replaceChildren(jh(e)):this.intel.replaceChildren(),this.intel.hidden=!e}get intelOpen(){return!this.intel.hidden}setHintsEnabled(e){this.hintsEnabled=e,this.hints.hidden=!e||this.hints.childElementCount===0}setHints(e){this.hints.replaceChildren(...e.map(e=>$(`div`,{class:`hint`},[_h(e.key),$(`span`,{text:e.text})]))),this.hints.hidden=!this.hintsEnabled||e.length===0}setPrompt(e){let t=e?`${e.key}|${e.text}`:``;t!==this.lastPrompt&&(this.lastPrompt=t,e?(vh(this.promptKey,e.key),vh(this.promptText,e.text),this.prompt.hidden=!1):this.prompt.hidden=!0)}clearTransient(){this.toastT=0,this.toast.hidden=!0,this.setBeacon(null),this.setIntel(null)}showToast(e,t=2.5){vh(this.toast,e),this.toast.hidden=!1,this.toastT=t}showDeath(e,t){vh(this.deathCause,e),vh(this.deathHint,t),this.death.hidden=!1}hideDeath(){this.death.hidden=!0}set(e,t,n){let r=this.styleCache.get(e);r||(r=new Map,this.styleCache.set(e,r)),r.get(t)!==n&&(r.set(t,n),e.style.setProperty(t,n))}styleCache=new WeakMap;update(e,t){this.set(this.armorBar,`width`,`${e.maxArmor>0?Math.round(e.armor/e.maxArmor*100):0}%`),this.set(this.healthBar,`width`,`${Math.round(e.health/e.maxHealth*100)}%`),vh(this.vitalsText,`${Math.ceil(e.armor)} · ${Math.ceil(e.health)}`),this.vignette.style.opacity=e.health<35?String(.25+(1-e.health/35)*.45):`0`,vh(this.weaponName,e.weaponName),vh(this.ammoMag,e.isGun?String(e.mag):`—`),vh(this.ammoRes,e.isGun?` / ${Number.isFinite(e.reserve)?e.reserve:`∞`}`:``),this.ammoMag.classList.toggle(`low`,e.isGun&&e.mag<=Math.max(2,Math.floor(e.magMax*.25)));let n=e.slots.map(e=>`${e.key}${e.name}${+!!e.active}`).join(`|`);this.cache.get(`slots`)!==n&&(this.cache.set(`slots`,n),this.slots.replaceChildren(...e.slots.map(e=>$(`span`,{class:`slot${e.active?` active`:``}`},[_h(e.key),$(`span`,{text:e.name})]))));let r=e.reload>=0;yh(this.reloadBar,r),r&&(this.set(this.reloadFill,`width`,`${Math.round(e.reload*100)}%`),e.perfect?(this.reloadWindow.hidden=!1,this.set(this.reloadWindow,`left`,`${(e.perfect[0]*100).toFixed(1)}%`),this.set(this.reloadWindow,`width`,`${((e.perfect[1]-e.perfect[0])*100).toFixed(1)}%`)):this.reloadWindow.hidden=!0,yh(this.reloadLabel,!!e.perfect)),this.set(this.crosshair,`--gap`,`${Math.round(e.spreadPx)}px`),this.crosshair.classList.toggle(`blocked`,e.blocked),this.crosshair.classList.toggle(`enemy`,e.aimOverEnemy&&!e.blocked),this.crosshair.classList.toggle(`civilian`,e.aimOverCivilian&&!e.blocked),this.hitmark.className=`hitmark ${e.hitT>0?`on ${e.hitKind}`:``}`;for(let t=0;t<this.dmgArcs.length;t++){let n=this.dmgArcs[t],r=e.damage[t];!r||r.k<=0?n.style.opacity!==`0`&&(n.style.opacity=`0`):(n.style.opacity=r.k.toFixed(2),n.style.transform=`rotate(${-r.angle*180/Math.PI}deg)`)}vh(this.styleMult,`×${e.multiplier}`),vh(this.styleRank,e.rankName.toUpperCase()),this.set(this.styleGauge,`width`,`${Math.round(Math.min(1,Math.max(0,e.gauge))*100)}%`),vh(this.styleScore,e.score.toLocaleString(`es`)),this.style.dataset.mult=String(e.multiplier);let i=e.feed.map(e=>`${e.text}${e.points}`).join(`|`);this.cache.get(`feed`)!==i&&(this.cache.set(`feed`,i),this.feed.replaceChildren(...e.feed.map(e=>$(`div`,{class:`feed-item`},[$(`span`,{text:e.text}),e.points>0?$(`b`,{text:`+${e.points}`}):null])))),this.set(this.focusFill,`height`,`${Math.round(e.focus)}%`),this.focusBox.classList.toggle(`ready`,e.focusReady&&!e.focusActive),this.focusBox.classList.toggle(`active`,e.focusActive),e.focusActive!==this.focusTintOn&&(this.focusTintOn=e.focusActive,this.focusTint.classList.toggle(`on`,e.focusActive)),vh(this.focusLabel,e.focusActive?`FOCO`:e.focusReady?`${e.focusKey} FOCO`:`FOCO`),this.toastT>0&&(this.toastT-=t,this.toastT<=0&&(this.toast.hidden=!0))}},Nh=[[`controls`,`Controles`],[`video`,`Vídeo y audio`],[`access`,`Accesibilidad`],[`keys`,`Teclas`]],Ph=[[`low`,`Bajo`],[`medium`,`Medio`],[`high`,`Alto`]],Fh=e=>`${Math.round(e*100)} %`,Ih=e=>`×${e.toFixed(2)}`,Lh=[{label:`Mover`,actions:[`moveForward`,`moveLeft`,`moveBack`,`moveRight`]},{label:`Mirar`,actions:[]},{label:`Disparar / Apuntar`,actions:[`fire`,`aim`]},{label:`Recargar`,actions:[`reload`]},{label:`Takedown / Melee`,actions:[`takedown`]},{label:`Interactuar`,actions:[`interact`]},{label:`Sprint`,actions:[`sprint`]},{label:`Agacharse · Deslizar (corriendo) · Cubrirse (junto a pared)`,actions:[`crouch`]},{label:`Saltar / Vault`,actions:[`jump`]},{label:`Esquiva (o doble Espacio)`,actions:[`dodge`]},{label:`Foco (cámara lenta)`,actions:[`focus`]},{label:`Armas`,actions:[`weapon1`,`weapon2`,`weapon3`]},{label:`Cambiar de hombro`,actions:[`shoulder`]},{label:`Contratos / Intel`,actions:[`intel`]},{label:`Pausa · Controles`,actions:[`pause`,`help`]},{label:`Debug`,actions:[`debug`]}],Rh=new Set([`dialog`,`shop`,`contracts`]),zh=class{input;cb;devButtons;root;current=null;back=null;dialog=null;dialogIndex=0;onDialogEnd=null;settingsTab=`controls`;rebinding=null;settingsNote=``;constructor(e,t,n,r){this.input=t,this.cb=n,this.devButtons=r,this.root=$(`div`,{id:`screens`}),this.root.hidden=!0,e.appendChild(this.root),window.addEventListener(`keydown`,e=>{e.repeat||(this.current===`dialog`&&(e.code===`KeyE`||e.code===`Enter`||e.code===`Space`)?(e.preventDefault(),this.advanceDialog()):this.current===`briefing`&&e.code===`Enter`&&this.briefing&&(e.preventDefault(),this.briefing.onStart()))})}get isMenu(){return this.current!==null&&Rh.has(this.current)}show(e){(e===`controls`||e===`settings`)&&this.current!==e&&(this.back=this.current),e!==`settings`&&this.cancelRebind(),this.current=e,this.root.hidden=!1,this.root.replaceChildren(this.build(e)),this.root.dataset.screen=e,(this.root.querySelector(`button.btn-primary`)??this.root.querySelector(`button`))?.focus({preventScroll:!0})}hide(){this.cancelRebind(),this.current=null,this.dialog=null,this.root.hidden=!0,this.root.replaceChildren(),delete this.root.dataset.screen}closeSub(){let e=this.back;this.back=null,e&&e!==`controls`&&e!==`settings`?this.show(e):this.hide()}cancelRebind(){this.rebinding&&(this.rebinding=null,this.input.captureNextCode(null))}showDialog(e,t=null){this.dialog=e,this.dialogIndex=0,this.onDialogEnd=t,this.show(`dialog`)}advanceDialog(){if(!this.dialog)return;if(this.dialogIndex<this.dialog.lines.length-1){this.dialogIndex++,this.show(`dialog`);return}let e=this.onDialogEnd;this.dialog=null,this.onDialogEnd=null,e?e():this.cb.onCloseMenu()}refresh(){this.current&&this.show(this.current)}showBriefing(e,t,n,r=null){this.briefing={m:e,onStart:t,onBack:n,onSkip:r},this.show(`briefing`)}showResults(e,t,n){this.results={r:e,onRetry:t,onHub:n},this.show(`results`)}briefing=null;results=null;build(e){switch(e){case`title`:return this.buildTitle();case`confirmNew`:return this.buildConfirmNew();case`pause`:return this.buildPause();case`controls`:return this.buildControls();case`settings`:return this.buildSettings();case`dialog`:return this.buildDialog();case`shop`:return this.buildShop();case`contracts`:return this.buildContracts();case`briefing`:return this.buildBriefing();case`results`:return this.buildResults()}}buildBriefing(){let e=this.briefing;if(!e)return $(`section`,{class:`screen`});let[t,n,r]=e.m.briefing;return $(`section`,{class:`screen screen-briefing`,role:`dialog`,ariaLabel:`Briefing: ${e.m.name}`},[$(`div`,{class:`brief-kicker`,text:`CONTRATO`}),$(`h2`,{class:`screen-heading`,text:e.m.name.toUpperCase()}),$(`div`,{class:`brief-place`,text:e.m.place}),$(`ol`,{class:`brief-lines`},[$(`li`,{},[$(`b`,{text:`Objetivo. `}),t]),$(`li`,{},[$(`b`,{text:`Regla. `}),n]),$(`li`,{},[$(`b`,{text:`Meta. `}),r])]),$(`div`,{class:`menu menu-row`},[gh(`Empezar`,e.onStart,`btn btn-primary`),...e.onSkip?[gh(`Saltar tutorial`,e.onSkip)]:[],gh(`Volver`,e.onBack)]),$(`p`,{class:`screen-hint`},[`Pulsa `,_h(`Enter`),` para empezar.`])])}buildResults(){let e=this.results;if(!e)return $(`section`,{class:`screen`});let t=e.r;if(t.gauntlet)return this.buildGauntletResults(t,t.gauntlet,e.onRetry,e.onHub);let n=Math.floor(t.timeSec/60),r=Math.floor(t.timeSec%60),i=t.subs.map(e=>$(`div`,{class:`sub`},[$(`span`,{class:`sub-label`,text:e.label}),$(`div`,{class:`sub-bar`},[$(`div`,{class:`sub-fill`,style:{width:`${e.value??0}%`}})]),$(`span`,{class:`sub-value`,text:e.value===null?`—`:String(Math.round(e.value))})])),a=[];if(t.success){if(a.push($(`div`,{class:`coins coins-big`},[$(`span`,{class:`coin-icon`,text:`◉`}),$(`b`,{class:`coin-count`,text:`+${t.coins}`}),` Monedas Continental`])),t.newBest&&a.push($(`div`,{class:`results-best`,text:`Nuevo mejor resultado`})),t.achievements.length){a.push($(`div`,{class:`achv-title`,text:`Logros`}));for(let e of t.achievements)a.push($(`div`,{class:`achv`,text:`${e.name}${e.coins?` · +${e.coins}`:``}`}))}}else a.push($(`p`,{class:`results-fail`,text:t.failReason}));return $(`section`,{class:`screen screen-results ${t.success?`ok`:`fail`}`,role:`dialog`,ariaLabel:`Resultados del contrato`},[$(`div`,{class:`brief-kicker`,text:t.success?`CONTRATO CUMPLIDO`:`CONTRATO FALLIDO`}),$(`h2`,{class:`screen-heading`,text:t.missionName.toUpperCase()}),$(`div`,{class:`results-grid`},[$(`div`,{class:`rank-box`,dataset:{rank:t.rank}},[$(`div`,{class:`rank-letter`,text:t.success?t.rank:`—`}),$(`div`,{class:`rank-total`,text:t.success?`${Math.round(t.total)} / 100${t.capped?` · limitado a C`:``}`:``})]),$(`div`,{class:`subs`},i)]),$(`div`,{class:`results-line`,text:`Tiempo ${n}:${String(r).padStart(2,`0`)} · Bajas ${t.kills} · Estilo ${t.styleScore.toLocaleString(`es`)} · Marcadores usados ${t.markersUsed}/${t.markersTotal}`}),...a,$(`div`,{class:`menu menu-row`},[gh(`Volver al Continental`,e.onHub,`btn btn-primary`),gh(t.success?`Repetir contrato`:`Reintentar`,e.onRetry)])])}buildGauntletResults(e,t,n,r){let i=[$(`div`,{class:`coins coins-big`},[$(`span`,{class:`coin-icon`,text:`◉`}),$(`b`,{class:`coin-count`,text:`+${e.coins}`}),` Monedas Continental`])];if(e.achievements.length){i.push($(`div`,{class:`achv-title`,text:`Logros`}));for(let t of e.achievements)i.push($(`div`,{class:`achv`,text:`${t.name}${t.coins?` · +${t.coins}`:``}`}))}let a=t.position>0?`Puesto ${t.position} del top 10${t.position===1?` · nuevo récord`:``}`:t.waves>0?`Fuera del top 10`:`Sin oleadas superadas`;return $(`section`,{class:`screen screen-results ok`,role:`dialog`,ariaLabel:`Resultados del Gauntlet`},[$(`div`,{class:`brief-kicker`,text:`GAUNTLET TERMINADO`}),$(`h2`,{class:`screen-heading`,text:e.missionName.toUpperCase()}),$(`div`,{class:`results-grid`},[$(`div`,{class:`rank-box gauntlet-box`},[$(`div`,{class:`rank-letter gauntlet-waves`,text:String(t.waves)}),$(`div`,{class:`rank-total`,text:t.waves===1?`oleada superada`:`oleadas superadas`})]),this.gauntletTable(t.top,t.position)]),$(`div`,{class:`results-line gauntlet-place`,text:`${a} · Bajas ${e.kills} · Estilo ${e.styleScore.toLocaleString(`es`)}`}),...i,$(`div`,{class:`menu menu-row`},[gh(`Volver al Continental`,r,`btn btn-primary`),gh(`Otra vez`,n)])])}gauntletTable(e,t){return e.length===0?$(`p`,{class:`gauntlet-empty`,text:`Aún no hay récords.`}):$(`ol`,{class:`gauntlet-top`,ariaLabel:`Top 10 del Gauntlet`},e.map((e,n)=>$(`li`,{class:n+1===t?`me`:``},[$(`span`,{class:`gt-waves`,text:`${e.waves} oleadas`}),$(`span`,{class:`gt-score`,text:e.score.toLocaleString(`es`)})])))}buildTitle(){let e=this.cb.hasSave(),t=[];return e&&t.push(gh(`Continuar`,()=>this.cb.onContinue(),`btn btn-primary`)),t.push(gh(`Nueva partida`,()=>e?this.show(`confirmNew`):this.cb.onNewGame(),e?`btn`:`btn btn-primary`)),t.push(gh(`Controles`,()=>this.show(`controls`))),t.push(gh(`Ajustes`,()=>this.show(`settings`))),this.devButtons&&(t.push(gh(`Simulacro directo (QA)`,()=>this.cb.onPlayPractice(),`btn btn-dev`)),t.push(gh(`Arena de pruebas (QA)`,()=>this.cb.onPlayArena(),`btn btn-dev`))),$(`section`,{class:`screen screen-title`,role:`dialog`,ariaLabel:`Pantalla de título`},[$(`div`,{class:`title-block`},[$(`div`,{class:`title-main`,text:`EXCOMMUNICADO`}),$(`div`,{class:`title-sub`,text:`CONTINENTAL PROTOCOL`})]),$(`div`,{class:`menu`},t),$(`p`,{class:`fan-note`,text:`Proyecto de fans sin fines de lucro. No afiliado ni respaldado por los titulares de la franquicia John Wick.`})])}buildConfirmNew(){return $(`section`,{class:`screen`,role:`alertdialog`,ariaLabel:`Confirmar nueva partida`},[$(`h2`,{class:`screen-heading`,text:`¿NUEVA PARTIDA?`}),$(`p`,{class:`screen-hint`,text:`Se borrará la partida guardada (monedas, mejoras y récords). Esta acción no se puede deshacer.`}),$(`div`,{class:`menu`},[gh(`Sí, borrar y empezar`,()=>this.cb.onNewGame(),`btn btn-danger`),gh(`No, volver`,()=>this.show(`title`),`btn btn-primary`)])])}buildPause(){let e=[gh(`Reanudar`,()=>this.cb.onResume(),`btn btn-primary`),gh(`Controles`,()=>this.show(`controls`)),gh(`Ajustes`,()=>this.show(`settings`))];return this.cb.inHub()||e.push(gh(`Volver al Continental`,()=>this.cb.onReturnToHub())),e.push(gh(`Salir al título`,()=>this.cb.onQuitToTitle())),$(`section`,{class:`screen screen-pause`,role:`dialog`,ariaLabel:`Pausa`},[$(`h2`,{class:`screen-heading`,text:`PAUSA`}),$(`div`,{class:`menu`},e),$(`p`,{class:`screen-hint`,text:`El juego se pausa solo al cambiar de ventana o pulsar Esc. Haz clic en Reanudar para volver.`})])}buildControls(){let e=this.input.lastDevice,t=Lh.map(t=>{let n=t.actions.length===0?[_h(e===`pad`?`Stick der.`:`Ratón`)]:t.actions.map(t=>_h(this.input.label(t,e)));return $(`tr`,{},[$(`th`,{text:t.label}),$(`td`,{},n)])});return $(`section`,{class:`screen screen-controls`,role:`dialog`,ariaLabel:`Controles`},[$(`h2`,{class:`screen-heading`,text:e===`pad`?`CONTROLES · GAMEPAD`:`CONTROLES · TECLADO Y RATÓN`}),$(`table`,{class:`controls-table`},[$(`tbody`,{},t)]),$(`p`,{class:`screen-hint`,text:`${_f.crouch}: C hace una cosa u otra según el contexto; el aviso en pantalla te dice cuál.`}),$(`div`,{class:`menu`},[gh(`Volver`,()=>this.closeSub(),`btn btn-primary`)])])}updateSettings(e){this.cb.onSettingsChange({...this.cb.settings(),...e})}reshowSettings(e){this.show(`settings`),this.root.querySelector(e)?.focus({preventScroll:!0})}buildSettings(){let e=$(`div`,{class:`tabs`,role:`tablist`,ariaLabel:`Secciones de ajustes`},Nh.map(([e,t])=>{let n=gh(t,()=>{this.settingsTab=e,this.settingsNote=``,this.cancelRebind(),this.reshowSettings(`[data-tab="${e}"]`)},`tab${e===this.settingsTab?` active`:``}`);return n.setAttribute(`role`,`tab`),n.setAttribute(`aria-selected`,String(e===this.settingsTab)),n.dataset.tab=e,n})),t;switch(this.settingsTab){case`controls`:t=[this.slider(`Sensibilidad del ratón`,`mouseSens`,.05,Ih),this.slider(`Sensibilidad del mando`,`padSens`,.05,Ih),this.toggle(`Invertir eje Y`,`invertY`),this.toggle(`Apuntar: pulsar para alternar (en vez de mantener)`,`aimToggle`),this.slider(`Campo de visión`,`fov`,1,e=>`${Math.round(e)}°`)];break;case`video`:t=[this.presetRow(),this.toggle(`Resolución dinámica`,`dynamicResolution`),this.slider(`Brillo`,`brightness`,.05,Fh),this.slider(`Volumen general`,`master`,.05,Fh),this.slider(`Música`,`music`,.05,Fh),this.slider(`Efectos`,`sfx`,.05,Fh),this.slider(`Interfaz`,`ui`,.05,Fh)];break;case`access`:t=[this.slider(`Sacudida de cámara`,`shake`,.05,Fh),this.slider(`Tamaño de la interfaz`,`uiScale`,.05,Fh),this.toggle(`Mostrar pistas de teclas`,`hints`)];break;case`keys`:t=[this.keysTable(),$(`p`,{class:`screen-hint`,text:`Esc y F3 están reservadas. El clic izquierdo no se puede capturar: "Restablecer" lo devuelve a Disparar.`})]}return $(`section`,{class:`screen screen-settings`,role:`dialog`,ariaLabel:`Ajustes`},[$(`h2`,{class:`screen-heading`,text:`AJUSTES`}),e,$(`div`,{class:`settings-body`,role:`tabpanel`},t),$(`p`,{class:`settings-note`,text:this.settingsNote,role:`status`}),$(`div`,{class:`menu menu-row`},[gh(`Volver`,()=>this.closeSub(),`btn btn-primary`),gh(`Restablecer`,()=>{this.cb.onSettingsChange(jf()),this.settingsNote=`Ajustes de fábrica restaurados.`,this.reshowSettings(`[data-tab]`)})])])}slider(e,t,n,r){let i=this.cb.settings()[t],[a,o]=kf[t],s=$(`input`,{class:`slider`,ariaLabel:e,dataset:{setting:t}});s.type=`range`,s.min=String(a),s.max=String(o),s.step=String(n),s.value=String(i);let c=$(`span`,{class:`setting-value`,text:r(i)});return s.addEventListener(`input`,()=>{let e=Number(s.value);c.textContent=r(e),this.updateSettings({[t]:e})}),$(`label`,{class:`setting-row`},[$(`span`,{class:`setting-label`,text:e}),s,c])}toggle(e,t){let n=this.cb.settings()[t],r=gh(n?`Sí`:`No`,()=>{this.updateSettings({[t]:!this.cb.settings()[t]}),this.reshowSettings(`[data-setting="${t}"]`)},`btn btn-small toggle${n?` on`:``}`);return r.setAttribute(`aria-pressed`,String(n)),r.setAttribute(`aria-label`,e),r.dataset.setting=t,$(`div`,{class:`setting-row`},[$(`span`,{class:`setting-label`,text:e}),r])}presetRow(){let e=this.cb.settings().preset,t=$(`div`,{class:`segmented`,role:`radiogroup`,ariaLabel:`Calidad gráfica`},Ph.map(([t,n])=>{let r=gh(n,()=>{this.updateSettings({preset:t}),this.reshowSettings(`[data-preset="${t}"]`)},`btn btn-small${t===e?` on`:``}`);return r.setAttribute(`role`,`radio`),r.setAttribute(`aria-checked`,String(t===e)),r.dataset.preset=t,r}));return $(`div`,{class:`setting-row`},[$(`span`,{class:`setting-label`,text:`Calidad gráfica`}),t])}keysTable(){let e=this.cb.settings();return $(`table`,{class:`controls-table keys-table`},[$(`tbody`,{},gf.map(t=>{let n=e.bindings[t].filter(e=>!e.startsWith(`Pad`)),r=this.rebinding===t,i=gh(r?`Pulsa una tecla…`:`Cambiar`,()=>this.startRebind(t),`btn btn-small${r?` capturing`:``}`);return i.dataset.rebind=t,$(`tr`,{dataset:{action:t}},[$(`th`,{text:_f[t]}),$(`td`,{class:`keys`},[...new Set(n.map(yf))].map(e=>_h(e))),$(`td`,{},[i])])}))])}startRebind(e){this.rebinding=e,this.settingsNote=`Pulsa la tecla nueva para «${_f[e]}». Esc cancela.`,this.reshowSettings(`[data-rebind="${e}"]`),this.input.captureNextCode(t=>{if(this.rebinding=null,t===`Escape`)this.settingsNote=`Cambio cancelado.`;else{let n=Bf(this.cb.settings().bindings,e,t);if(!n.ok)this.settingsNote=n.reason===`reserved`?`${yf(t)} está reservada.`:`Esa acción no se puede reasignar.`;else{this.updateSettings({bindings:n.bindings});let r=n.displaced?n.bindings[n.displaced].find(e=>!e.startsWith(`Pad`)):void 0;this.settingsNote=n.displaced&&r?`${yf(t)} → ${_f[e]}. «${_f[n.displaced]}» pasa a ${yf(r)}.`:`${yf(t)} → ${_f[e]}.`}}this.reshowSettings(`[data-rebind="${e}"]`)})}buildDialog(){let e=this.dialog;if(!e)return $(`section`,{class:`screen`});let t=this.dialogIndex>=e.lines.length-1,n=this.input.label(`interact`);return $(`section`,{class:`screen screen-dialog`,role:`dialog`,ariaLabel:`Diálogo con ${e.speaker}`},[$(`div`,{class:`dialog-speaker`,text:e.speaker}),$(`p`,{class:`dialog-line`,text:e.lines[this.dialogIndex]??``}),$(`div`,{class:`dialog-footer`},[$(`span`,{class:`dialog-count`,text:`${this.dialogIndex+1} / ${e.lines.length}`}),gh(t?`Cerrar`:`Siguiente`,()=>this.advanceDialog(),`btn btn-primary`),$(`span`,{class:`dialog-hint`},[_h(n),` o `,_h(`Enter`)])])])}buildShop(){let e=this.cb.profile(),t=Cu.map(t=>{let n=Tu(e,t.id),r=n===`owned`?$(`span`,{class:`shop-status owned`,text:`Comprado`}):n===`locked`?$(`span`,{class:`shop-status locked`,text:`Requiere ${Cu.find(e=>e.id===t.requires)?.name??`…`}`}):n===`poor`?$(`span`,{class:`shop-status poor`,text:`Faltan ${t.price-e.coins} monedas`}):gh(`Comprar · ${t.price}`,()=>this.cb.onBuy(t.id),`btn btn-small btn-primary`);return $(`div`,{class:`shop-item ${n}`,dataset:{item:t.id}},[$(`div`,{class:`shop-text`},[$(`div`,{class:`shop-name`,text:t.name}),$(`div`,{class:`shop-desc`,text:t.desc})]),$(`div`,{class:`shop-price`,text:n===`owned`?`✓`:`${t.price} ◉`}),r])});return $(`section`,{class:`screen screen-shop`,role:`dialog`,ariaLabel:`Armería del Sommelier`},[$(`h2`,{class:`screen-heading`,text:`ARMERÍA DEL SOMMELIER`}),$(`div`,{class:`coins`,ariaLabel:`Monedas`},[$(`span`,{class:`coin-icon`,text:`◉`}),$(`b`,{class:`coin-count`,text:String(e.coins)}),` Monedas Continental`]),$(`div`,{class:`shop-list`},t),$(`div`,{class:`menu`},[gh(`Cerrar`,()=>this.cb.onCloseMenu(),`btn`)])])}buildContracts(){let e=this.cb.profile(),t=iu.map(t=>{let n=ru[t],r=e.best[t],i=!n.requires||e.completed.includes(n.requires),a;return a=n.available?i?gh(t===`gauntlet`?`Entrar`:r?`Repetir`:`Aceptar`,()=>this.cb.onStartMission(t),`btn btn-small btn-primary`):$(`span`,{class:`shop-status locked`,text:`Completa "${ru[n.requires].name}"`}):$(`span`,{class:`shop-status locked`,text:`Próximamente`}),$(`div`,{class:`contract ${n.available&&i?`open`:`locked`}`,dataset:{mission:t}},[$(`div`,{class:`shop-text`},[$(`div`,{class:`shop-name`,text:n.name}),$(`div`,{class:`shop-desc`,text:n.place}),$(`div`,{class:`contract-brief`,text:n.briefing[0]})]),$(`div`,{class:`contract-best`,text:t===`gauntlet`?e.gauntlet[0]?`Récord: ${e.gauntlet[0].waves}`:`—`:r?`Mejor: ${r.rank}`:`—`}),a])});return $(`section`,{class:`screen screen-contracts`,role:`dialog`,ariaLabel:`Tablero de contratos`},[$(`h2`,{class:`screen-heading`,text:`CONTRATOS · RECEPCIÓN`}),$(`div`,{class:`coins`},[$(`span`,{class:`coin-icon`,text:`◉`}),$(`b`,{class:`coin-count`,text:String(e.coins)}),` Monedas Continental`]),$(`div`,{class:`shop-list`},t),...e.gauntlet.length?[$(`div`,{class:`achv-title`,text:`Récords del Gauntlet`}),this.gauntletTable(e.gauntlet,0)]:[],$(`div`,{class:`menu`},[gh(`Cerrar`,()=>this.cb.onCloseMenu(),`btn`)])])}},Bh={mouseSens:.0022,padSens:3.2,invertY:!1,fov:68,shake:1},Vh=-1.25,Hh=1.05,Uh=.7,Wh=.2,Gh=3.1,Kh=2.2,qh=.7,Jh=.2,Yh=.06,Xh=.25,Zh=1.55,Qh=1,$h=new H,eg=new H,tg=new H,ng=new H,rg=new H,ig=new H,ag=class{camera;rng;yaw=0;pitch=-.12;settings={...Bh};shoulderSide=1;position=new H;pivot=new H;forward=new H(0,0,-1);distanceToHead=Gh;shoulderCur=1;dist=Gh;pivotH=Zh;fovCur=68;aimK=0;trauma=0;recoilPitch=0;recoilYaw=0;time=0;constructor(e,t){this.camera=e,this.rng=t}look(e,t,n,r,i){let a=this.settings,o=a.invertY?-1:1,s=1-this.aimK*.35;this.yaw-=e*a.mouseSens*s+n*a.padSens*i*s,this.pitch-=(t*a.mouseSens*s+r*a.padSens*i*s*.8)*o,this.pitch=Gl(this.pitch,Vh,Hh),(this.yaw>Math.PI*4||this.yaw<-Math.PI*4)&&(this.yaw=Math.atan2(Math.sin(this.yaw),Math.cos(this.yaw)))}setYawPitch(e,t){this.yaw=e,this.pitch=Gl(t,Vh,Hh)}toggleShoulder(){this.shoulderSide*=-1}addTrauma(e){this.trauma=Gl(this.trauma+e,0,1)}kick(e,t){this.pitch=Gl(this.pitch+e,Vh,Hh),this.yaw+=t,this.recoilPitch+=e,this.recoilYaw+=t}recover(e){let t=1-Math.exp(-7*e),n=this.recoilPitch*t*.6,r=this.recoilYaw*t*.6;this.pitch=Gl(this.pitch-n,Vh,Hh),this.yaw-=r,this.recoilPitch-=this.recoilPitch*t,this.recoilYaw-=this.recoilYaw*t}update(e,t){let n=e.dt;this.time+=n,this.recover(n),this.aimK=ql(this.aimK,+!!e.aiming,14,n),this.shoulderCur=ql(this.shoulderCur,this.shoulderSide,10,n),this.pivotH=ql(this.pivotH,e.posture===`crouch`?Qh:Zh,12,n),$h.set(e.feet.x,e.feet.y+this.pivotH,e.feet.z),this.pivot.copy($h);let r=Math.cos(this.yaw),i=Math.sin(this.yaw),a=Math.cos(this.pitch),o=Math.sin(this.pitch);eg.set(r,0,-i),tg.set(-i*a,o,-r*a),this.forward.copy(tg);let s=(Uh+0*this.aimK)*this.shoulderCur;rg.copy(eg).multiplyScalar(Math.sign(s)||1);let c=Math.abs(s);if(t&&c>.001){let e=t.sphereCast($h,rg,c,Jh*.8,ud.STATIC);c=Math.max(0,e-Yh)}ng.copy($h).addScaledVector(rg,c),ng.y+=Wh;let l=+!!e.sprinting,u=Gh+.2999999999999998*l;u+=(Kh-u)*this.aimK;let d=u;if(rg.copy(tg).multiplyScalar(-1),t){let e=t.sphereCast(ng,rg,u,Jh,ud.STATIC);d=Math.max(Xh,e-Yh)}if(this.dist=d<this.dist?d:ql(this.dist,d,6,n),ig.copy(ng).addScaledVector(rg,this.dist),t){rg.subVectors(ig,$h);let e=rg.length();if(e>1e-4){rg.multiplyScalar(1/e);let n=t.sphereCast($h,rg,e,Jh,ud.STATIC);n<e&&ig.copy($h).addScaledVector(rg,Math.max(Xh*.5,n-Yh))}}this.position.copy(ig),this.distanceToHead=this.position.distanceTo($h),this.trauma=Math.max(0,this.trauma-n*1.6);let f=this.trauma*this.trauma*this.settings.shake,p=0,m=0;f>1e-4&&(p=(this.rng.next()*2-1)*.035*f,m=(this.rng.next()*2-1)*.035*f);let h=this.camera;h.position.copy(this.position),h.rotation.set(this.pitch+p,this.yaw+m,0,`YXZ`);let g=this.settings.fov,_=g+6*l;_+=(g*qh-_)*this.aimK,this.fovCur=ql(this.fovCur,_,8,n),Math.abs(h.fov-this.fovCur)>.01&&(h.fov=this.fovCur,h.updateProjectionMatrix())}snap(){this.dist=Xh}},og=64,sg=128,cg=10,lg=new G,ug=new mt,dg=new H,fg=new H,pg=new H,mg=new H(0,0,1),hg=new K,gg=new G().makeScale(0,0,0),_g=class{scene;tracers;tracerLife=new Float32Array(og);tracerColor=[];tracerNext=0;points;pPos;pCol;pVel;pLife;maxParticles;pNext=0;decals;decalNext=0;flashes=[];flashLife=new Float32Array(cg);flashNext=0;playerLight;playerLightLife=0;constructor(e,t){this.scene=e;let n=new sa(1,1,1),r=new Gr({color:16777215,blending:2,transparent:!0,depthWrite:!1,toneMapped:!1});this.tracers=new ki(n,r,og),this.tracers.instanceMatrix.setUsage(Ge),this.tracers.frustumCulled=!1;for(let e=0;e<og;e++)this.tracers.setMatrixAt(e,gg),this.tracers.setColorAt(e,hg.setRGB(0,0,0)),this.tracerColor.push(new K);this.tracers.renderOrder=10,e.add(this.tracers),this.maxParticles=Math.max(64,Math.round(420*t));let i=this.maxParticles;this.pPos=new Float32Array(i*3).fill(-9999),this.pCol=new Float32Array(i*3),this.pVel=new Float32Array(i*3),this.pLife=new Float32Array(i);let a=new pr;a.setAttribute(`position`,new Qn(this.pPos,3).setUsage(Ge)),a.setAttribute(`color`,new Qn(this.pCol,3).setUsage(Ge));let o=new Yi({size:.07,vertexColors:!0,transparent:!0,depthWrite:!1,sizeAttenuation:!0,toneMapped:!1});this.points=new ea(a,o),this.points.frustumCulled=!1,e.add(this.points);let s=new la(.09,.09),c=new Gr({color:723724,transparent:!0,opacity:.85,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2});this.decals=new ki(s,c,sg),this.decals.instanceMatrix.setUsage(Ge),this.decals.frustumCulled=!1;for(let e=0;e<sg;e++)this.decals.setMatrixAt(e,gg);e.add(this.decals);let l=new Gr({color:new K(16765066).multiplyScalar(3),blending:2,transparent:!0,depthWrite:!1,toneMapped:!1}),u=new la(.32,.32);for(let t=0;t<cg;t++){let t=new ri(u,l),n=new ri(u,l);n.rotation.y=Math.PI/2,t.add(n),t.visible=!1,this.flashes.push(t),e.add(t)}this.playerLight=new so(16761975,0,9,2),e.add(this.playerLight)}tracer(e,t,n,r=.022){let i=this.tracerNext;this.tracerNext=(this.tracerNext+1)%og,pg.set(t.x-e.x,t.y-e.y,t.z-e.z);let a=pg.length();a<.05||(pg.multiplyScalar(1/a),ug.setFromUnitVectors(mg,pg),fg.set((e.x+t.x)/2,(e.y+t.y)/2,(e.z+t.z)/2),dg.set(r,r,a),lg.compose(fg,ug,dg),this.tracers.setMatrixAt(i,lg),this.tracerColor[i].set(n),this.tracers.setColorAt(i,this.tracerColor[i]),this.tracerLife[i]=.07,this.tracers.instanceMatrix.needsUpdate=!0,this.tracers.instanceColor&&(this.tracers.instanceColor.needsUpdate=!0))}impact(e,t,n,r=7){let i=n===`blood`?10165282:n===`spark`?16764779:10130828;hg.set(i);let a=n===`spark`?4.5:n===`blood`?2.2:1.6;for(let i=0;i<r;i++){let r=this.pNext;this.pNext=(this.pNext+1)%this.maxParticles;let o=r*3;this.pPos[o]=e.x+t.x*.02,this.pPos[o+1]=e.y+t.y*.02,this.pPos[o+2]=e.z+t.z*.02;let s=(i*2.399+this.pNext*.37)%(Math.PI*2),c=.6+i*7%5*.1;this.pVel[o]=(t.x+Math.cos(s)*c)*a,this.pVel[o+1]=(t.y+.5+Math.sin(s)*c*.5)*a,this.pVel[o+2]=(t.z+Math.sin(s)*c)*a,this.pCol[o]=hg.r,this.pCol[o+1]=hg.g,this.pCol[o+2]=hg.b,this.pLife[r]=n===`spark`?.25:.45}}decal(e,t){let n=this.decalNext;this.decalNext=(this.decalNext+1)%sg,pg.set(t.x,t.y,t.z).normalize(),ug.setFromUnitVectors(mg,pg),fg.set(e.x+pg.x*.006,e.y+pg.y*.006,e.z+pg.z*.006),dg.set(1,1,1),lg.compose(fg,ug,dg),this.decals.setMatrixAt(n,lg),this.decals.instanceMatrix.needsUpdate=!0}muzzle(e,t,n){let r=this.flashes[this.flashNext];this.flashLife[this.flashNext]=.045,this.flashNext=(this.flashNext+1)%cg,r.position.set(e.x,e.y,e.z),pg.set(t.x,t.y,t.z),r.quaternion.setFromUnitVectors(mg,pg.normalize()),r.rotation.z=Math.random()*Math.PI,r.visible=!0,n&&(this.playerLight.position.set(e.x,e.y,e.z),this.playerLight.intensity=6,this.playerLightLife=.05)}update(e){let t=!1;for(let n=0;n<og;n++)if(!(this.tracerLife[n]<=0)){if(this.tracerLife[n]-=e,t=!0,this.tracerLife[n]<=0)this.tracers.setMatrixAt(n,gg);else{let e=this.tracerLife[n]/.07;hg.copy(this.tracerColor[n]).multiplyScalar(e*1.6),this.tracers.setColorAt(n,hg)}}t&&(this.tracers.instanceMatrix.needsUpdate=!0,this.tracers.instanceColor&&(this.tracers.instanceColor.needsUpdate=!0));let n=!1;for(let t=0;t<this.maxParticles;t++){if(this.pLife[t]<=0)continue;n=!0;let r=t*3;this.pLife[t]-=e,this.pLife[t]<=0?this.pPos[r+1]=-9999:(this.pVel[r+1]-=9.8*e,this.pPos[r]+=this.pVel[r]*e,this.pPos[r+1]+=this.pVel[r+1]*e,this.pPos[r+2]+=this.pVel[r+2]*e)}if(n){let e=this.points.geometry;e.getAttribute(`position`).needsUpdate=!0,e.getAttribute(`color`).needsUpdate=!0}for(let t=0;t<cg;t++)this.flashLife[t]<=0||(this.flashLife[t]-=e,this.flashLife[t]<=0&&(this.flashes[t].visible=!1));this.playerLightLife>0&&(this.playerLightLife-=e,this.playerLightLife<=0&&(this.playerLight.intensity=0))}dispose(){this.scene.remove(this.tracers,this.points,this.decals,this.playerLight,...this.flashes),this.tracers.geometry.dispose(),this.points.geometry.dispose(),this.decals.geometry.dispose()}},vg=new Map;function yg(e){let t=vg.get(e);if(t)return t;let n=document.createElement(`canvas`);n.width=64,n.height=64;let r=n.getContext(`2d`);if(!r)throw Error(`Canvas 2D no disponible`);let i=e===`alert`?`#ff3344`:`#ffd23f`;r.fillStyle=`rgba(10,10,12,0.75)`,r.beginPath(),r.arc(32,32,28,0,Math.PI*2),r.fill(),r.strokeStyle=i,r.lineWidth=4,r.stroke(),r.fillStyle=i,r.font=`bold 40px system-ui, Arial, sans-serif`,r.textAlign=`center`,r.textBaseline=`middle`,r.fillText(e===`alert`?`!`:`?`,32,35);let a=new ra(n);a.colorSpace=Be;let o=new wr({map:a,depthTest:!1,depthWrite:!1,transparent:!0,toneMapped:!1});return vg.set(e,o),o}function bg(){return{canSee:!1,seeFactor:0,playerPos:new H,distance:999,canShoot:!1,heard:!1,heardPos:new H,allyAlert:!1,allyAlertPos:new H,damaged:!1,damageFrom:new H,path:`idle`,selfPos:new H}}function xg(){return{hasMove:!1,moveTo:new H,run:!1,crouch:!1,hasLook:!1,lookAt:new H,fire:!1,telegraph:0,detection:0,icon:`none`,shout:!1}}var Sg=1.6,Cg=5,wg=7,Tg=1.5,Eg=class e{def;patrol;home;stationary;rng;state=`patrol`;stateTime=0;detection=0;lastKnown=new H;hasLastKnown=!1;unseen=99;reactionLeft=0;burstLeft=0;shotCooldown=0;telegraphT=0;patrolIndex=0;patrolWait=0;repositionIn=3;peekTimer=0;peekUp=!1;flankSide=1;goal=new H;hasGoal=!1;stuckCount=0;vigilant=0;aggressive=!1;static ASSAULT_RANGE=8;constructor(e,t,n,r,i){this.def=e,this.patrol=t,this.home=n,this.stationary=r,this.rng=i,this.burstLeft=e.weapon.burst,this.flankSide=i.sign(),this.repositionIn=i.range(2.5,4.5)}go(e){this.state!==e&&this.state!==`dead`&&(this.state=e,this.stateTime=0,this.hasGoal=!1,this.stuckCount=0,this.telegraphT=0,this.searchLook=0,this.retreatIn=0,e===`combat`&&(this.repositionIn=this.rng.range(2,4)),e===`cover`&&(this.coverFor=this.rng.range(8,12)),e===`search`&&(this.detection=Math.min(this.detection,.7)))}searchLook=0;coverFor=10;retreatIn=0;stun(){this.state!==`dead`&&(this.state=`stunned`,this.stateTime=0)}unstun(){this.state===`stunned`&&(this.state=`combat`,this.stateTime=0,this.reactionLeft=this.def.reaction)}kill(){this.state=`dead`,this.stateTime=0}alert(e){this.state!==`dead`&&this.state!==`stunned`&&(this.lastKnown.copy(e),this.hasLastKnown=!0,this.detection=1,this.unseen=0,this.state!==`combat`&&this.state!==`cover`&&this.state!==`flank`&&(this.reactionLeft=this.def.reaction,this.go(`combat`)))}update(e,t,n,r){if(this.stateTime+=e,r.fire=!1,r.shout=!1,r.hasMove=!1,r.hasLook=!1,r.crouch=!1,r.run=!1,this.state===`dead`||this.state===`stunned`)r.telegraph=0,r.icon=`none`,r.detection=0;else{if(this.vigilant=Math.max(0,this.vigilant-e),this.shotCooldown=Math.max(0,this.shotCooldown-e),t.canSee){this.unseen=0,this.lastKnown.copy(t.playerPos),this.hasLastKnown=!0;let n=t.distance<5?3:1,r=t.seeFactor*n*(this.vigilant>0?2:1)/this.def.detectTime;this.detection=Math.min(1,this.detection+r*e)}else this.unseen+=e,(this.state===`patrol`||this.state===`suspicious`)&&(this.detection=Math.max(0,this.detection-.2*e));switch(t.damaged?(this.alert(t.damageFrom),r.shout=!0):t.allyAlert&&this.state!==`combat`&&this.state!==`cover`&&this.state!==`flank`?this.alert(t.allyAlertPos):t.heard&&(this.state===`patrol`||this.state===`suspicious`||this.state===`search`)&&(this.lastKnown.copy(t.heardPos),this.hasLastKnown=!0,t.heardPos.distanceTo(t.selfPos)<8?this.alert(t.heardPos):(this.detection=Math.max(this.detection,.55),this.go(`suspicious`))),this.detection>=1&&t.canSee&&(this.state===`patrol`||this.state===`suspicious`||this.state===`search`)?(this.reactionLeft=this.def.reaction,this.go(`combat`),r.shout=!0):this.detection>.3&&this.state===`patrol`&&this.hasLastKnown&&this.go(`suspicious`),this.state){case`patrol`:this.tickPatrol(e,t,n,r);break;case`suspicious`:r.hasLook=!0,r.lookAt.copy(this.lastKnown),this.stationary||this.moveTo(this.lastKnown,!1,r,t,n),this.stateTime>wg&&this.detection<.3&&this.go(`patrol`);break;case`combat`:this.tickCombat(e,t,n,r);break;case`cover`:this.tickCover(e,t,n,r);break;case`flank`:this.tickFlank(e,t,n,r);break;case`search`:this.tickSearch(e,t,n,r)}r.detection=this.detection,r.icon=this.state===`patrol`?this.detection>.05?`suspicious`:`none`:this.state===`suspicious`||this.state===`search`?`suspicious`:`alert`}}moveTo(e,t,n,r,i){r.path===`stuck`||r.path===`failed`?(this.stuckCount++,this.hasGoal=!!i.randomNear(r.selfPos,3+this.stuckCount,this.goal)):(!this.hasGoal||this.goal.distanceToSquared(e)>1)&&(this.goal.copy(e),this.hasGoal=!0),this.hasGoal&&(n.hasMove=!0,n.moveTo.copy(this.goal),n.run=t)}tickPatrol(e,t,n,r){if(this.stationary||this.patrol.length===0){!this.stationary&&t.selfPos.distanceTo(this.home)>1&&this.moveTo(this.home,!1,r,t,n);return}let i=this.patrol[this.patrolIndex%this.patrol.length];t.selfPos.distanceTo(i)<.9||t.path===`arrived`?(this.patrolWait+=e,this.patrolWait>Tg&&(this.patrolWait=0,this.patrolIndex=(this.patrolIndex+1)%this.patrol.length,this.hasGoal=!1)):t.path===`stuck`||t.path===`failed`?(this.patrolIndex=(this.patrolIndex+1)%this.patrol.length,this.hasGoal=!1):this.moveTo(i,!1,r,t,n)}tickFire(e,t,n){let r=this.def.weapon;if(!t.canSee||!t.canShoot||t.distance>r.range*1.15)this.telegraphT=Math.max(0,this.telegraphT-e*3),n.telegraph=r.telegraph>0?this.telegraphT/r.telegraph:0,this.unseen>.8&&(this.reactionLeft=Math.max(this.reactionLeft,this.def.reaction*.6));else if(this.reactionLeft>0)this.reactionLeft-=e,n.telegraph=0;else if(r.telegraph>0){if(this.shotCooldown>0){n.telegraph=0;return}this.telegraphT+=e,n.telegraph=Math.min(1,this.telegraphT/r.telegraph),this.telegraphT>=r.telegraph&&(this.telegraphT=0,n.fire=!0,this.burstLeft--,this.burstLeft<=0?(this.burstLeft=r.burst,this.shotCooldown=r.burstPause+60/r.rpm+this.rng.range(0,.4)):this.shotCooldown=60/r.rpm)}else n.telegraph=0,this.shotCooldown>0||(n.fire=!0,this.burstLeft--,this.burstLeft<=0?(this.burstLeft=r.burst,this.shotCooldown=r.burstPause+this.rng.range(0,.5)):this.shotCooldown=60/r.rpm)}tickCombat(t,n,r,i){if(i.hasLook=!0,i.lookAt.copy(n.canSee?n.playerPos:this.lastKnown),this.tickFire(t,n,i),this.stationary)return;if(this.unseen>Sg){this.go(`search`);return}if(this.repositionIn-=t,this.repositionIn<=0){if(this.repositionIn=this.rng.range(3,5.5),this.def.flanker&&this.rng.chance(.65)&&(this.flankSide=-this.flankSide,r.findFlank(n.selfPos,this.lastKnown,this.flankSide,this.goal))){this.go(`flank`),this.hasGoal=!0;return}if(this.rng.chance(this.def.prefersCover)&&r.findCover(n.selfPos,this.lastKnown,this.goal)){this.go(`cover`),this.hasGoal=!0;return}}let[a,o]=this.def.engage,s=this.aggressive?Math.min(o,e.ASSAULT_RANGE):o;this.retreatIn-=t,n.distance>s||!n.canSee?this.moveTo(this.lastKnown,!0,i,n,r):n.distance<a?((!this.hasGoal||this.retreatIn<=0)&&r.randomNear(n.selfPos,3,this.goal)&&(this.hasGoal=!0,this.retreatIn=1),this.hasGoal&&(i.hasMove=!0,i.moveTo.copy(this.goal),i.run=!0)):this.hasGoal=!1}tickCover(e,t,n,r){if(r.hasLook=!0,r.lookAt.copy(t.canSee?t.playerPos:this.lastKnown),!(t.path===`arrived`||t.selfPos.distanceTo(this.goal)<.7)){if(t.path===`stuck`||t.path===`failed`){this.go(`combat`);return}r.hasMove=!0,r.moveTo.copy(this.goal),r.run=!0,this.tickFire(e,t,r)}else this.peekTimer-=e,this.peekTimer<=0&&(this.peekUp=!this.peekUp,this.peekTimer=this.peekUp?this.rng.range(1.2,2):this.rng.range(1,1.8)),r.crouch=!this.peekUp,this.peekUp&&this.tickFire(e,t,r),(t.canSee&&t.distance<4.5||this.stateTime>this.coverFor)&&this.go(`combat`)}tickFlank(e,t,n,r){r.hasLook=!0,r.lookAt.copy(t.canSee?t.playerPos:this.lastKnown),this.tickFire(e,t,r),t.path===`arrived`||t.selfPos.distanceTo(this.goal)<.8||this.stateTime>6||t.path===`stuck`||t.path===`failed`?this.go(`combat`):(r.hasMove=!0,r.moveTo.copy(this.goal),r.run=!0)}tickSearch(e,t,n,r){if(t.canSee&&this.detection>.5){this.reactionLeft=this.def.reaction*.5,this.go(`combat`);return}let i=t.selfPos.distanceTo(this.lastKnown)<1.2||t.path===`arrived`;if(!i&&this.stateTime<12){this.moveTo(this.lastKnown,this.stateTime<4,r,t,n),t.path===`stuck`&&this.stuckCount>3&&this.go(`patrol`);return}r.hasLook=!0;let a=this.stateTime*1.3;r.lookAt.set(t.selfPos.x+Math.sin(a)*5,t.selfPos.y+1.4,t.selfPos.z+Math.cos(a)*5),i&&(this.searchLook+=e),(this.stateTime>12||this.searchLook>Cg)&&(this.vigilant=20,this.detection=.25,this.go(`patrol`))}},Dg={pistol:`enemyPistol`,smg:`enemySmg`,rifle:`enemyRifle`,shotgun:`enemyShotgun`},Og=1,kg=.3,Ag=2,jg=new H,Mg=new H,Ng=new H,Pg=new H,Fg=new H,Ig=new H,Lg=new sa(1,1,1),Rg=new K(16720435),zg=class{id;def;spawnDef;brain;mover;rig;vitals;perception=bg();cmd=xg();home=new H;w;intent=Vp();pose=Dp();icon;laser;laserMat;path=[];pathIdx=0;pathGoal=new H;hasPath=!1;replanCooldown=0;stuckTimer=0;stuckReplans=0;progressFrom=new H;pathEvent=null;perceiveTimer;aimIn=0;lastSee=!1;lastShoot=!1;hitFlash=0;laserBeepT=0;recoilVis=0;faceTargetT=0;baseRim;noProgressTime=0;maxNoProgress=0;stuckEvents=0;lastHitWasHead=!1;deathTime=-1;constructor(e,t,n){this.id=e.id,this.spawnDef=e,this.def=xh[e.type],this.w=t,this.home.set(e.pos[0],e.pos[1],e.pos[2]);let r=(e.patrol??[]).map(e=>new H(e[0],e[1],e[2]));this.brain=new Eg(this.def,r,this.home,!!e.stationary,t.rng),this.mover=new Qp(t.physics,new H(e.pos[0],e.pos[1]+.02,e.pos[2]),e.yaw,ld.ENEMY),this.vitals=hd({maxHealth:this.def.health,maxHeavyArmor:this.def.heavyArmor}),this.rig=new Ip(`enemy:${e.id}`,{colors:this.def.colors,rimColor:this.def.color,rimStrength:1.1,hair:this.def.hair,bulk:this.def.bulk,vest:this.def.vest,weapon:this.def.weapon.model,uniqueMaterial:!0}),this.baseRim=new K(this.def.color),t.scene.add(this.rig.root),this.icon=new Rr(yg(`suspicious`)),this.icon.scale.set(.45,.45,.45),this.icon.visible=!1,this.icon.renderOrder=20,t.scene.add(this.icon),this.def.weapon.telegraph>0&&this.def.type===`marksman`?(this.laserMat=new Gr({color:Rg,blending:2,transparent:!0,depthWrite:!1,toneMapped:!1}),this.laser=new ri(Lg,this.laserMat),this.laser.visible=!1,this.laser.frustumCulled=!1,t.scene.add(this.laser)):(this.laser=null,this.laserMat=null),this.perceiveTimer=n%6*Ql}get alive(){return!this.vitals.dead}get state(){return this.brain.state}get collider(){return this.mover.collider}get feet(){return this.mover.feet}get height(){return this.mover.height}fixedUpdate(e,t){if(this.hitFlash=Math.max(0,this.hitFlash-e),this.recoilVis=Math.max(0,this.recoilVis-e*6),!this.alive){this.mover.fixedUpdate(e,this.intent);return}this.perceive(e,t);let n=this.perception;n.path=this.pathEvent??(this.hasPath?`moving`:`idle`),this.pathEvent=null,n.selfPos.copy(this.mover.feet),this.brain.update(e,n,this.w.tactics,this.cmd),n.heard=!1,n.damaged=!1,n.allyAlert=!1,this.drive(e),this.mover.fixedUpdate(e,this.intent),this.trackProgress(e),this.cmd.fire&&t.alive&&this.shoot(t),this.updateTelegraph(e,t)}perceive(e,t){let n=this.perception;n.playerPos.copy(t.feet);let r=this.mover.feet;if(n.distance=Math.hypot(t.feet.x-r.x,t.feet.z-r.z),this.perceiveTimer-=e,this.perceiveTimer<=0&&(this.perceiveTimer=.1,this.lastSee=!1,this.lastShoot=!1,t.alive)){let e=this.def.sightRange*(t.crouched&&n.distance>5?.6:1);if(this.brain.state!==`patrol`&&(e*=1.3),n.distance<=e){let e=Gp(t.feet.x-r.x,t.feet.z-r.z),i=Math.abs(Jl(e-this.mover.yaw));if(n.distance<4||i<=this.def.fovDeg/2*Math.PI/180||this.brain.state!==`patrol`){Ng.set(r.x,r.y+(this.mover.posture===`crouch`?1:1.6),r.z);let e=this.w.physics;this.lastSee=e.lineOfSight(Ng,t.head,ud.STATIC)||e.lineOfSight(Ng,t.chest,ud.STATIC),this.lastSee&&(this.muzzlePos(Pg),this.lastShoot=e.lineOfSight(Pg,t.chest,ud.STATIC)||e.lineOfSight(Pg,t.head,ud.STATIC))}}}n.canSee=this.lastSee,n.canShoot=this.lastShoot,n.seeFactor=Gl(1.25-n.distance/(this.def.sightRange*1.1),.3,1)*(t.crouched?.65:1),this.aimIn=n.canSee?Math.min(2,this.aimIn+e):Math.max(0,this.aimIn-e*2)}hear(e){this.alive&&(this.perception.heard=!0,this.perception.heardPos.copy(e))}allyAlert(e){this.alive&&(this.perception.allyAlert=!0,this.perception.allyAlertPos.copy(e))}muzzlePos(e){let t=this.mover.feet,n=this.mover.yaw,r=-Math.sin(n),i=-Math.cos(n),a=this.mover.posture===`crouch`;return e.set(t.x+r*.45+Math.cos(n)*.2,t.y+(a?.95:1.4),t.z+i*.45-Math.sin(n)*.2)}drive(e){let t=this.cmd,n=this.intent,r=this.mover.feet;this.replanCooldown-=e;let i=this.mover.yaw;t.hasLook&&(i=Gp(t.lookAt.x-r.x,t.lookAt.z-r.z)),n.moveX=0,n.moveY=0,this.faceTargetT=Math.max(0,this.faceTargetT-e),(t.fire||t.telegraph>0)&&(this.faceTargetT=.6);let a=this.brain.state===`combat`||this.brain.state===`cover`||this.brain.state===`flank`||this.brain.state===`suspicious`||this.brain.state===`search`;if(n.aim=t.hasLook&&a&&(!t.hasMove||!t.run||this.faceTargetT>0),n.camYaw=i,this.mover.setPosture(t.crouch?`crouch`:`stand`),!t.hasMove){this.hasPath=!1;return}if((!this.hasPath||this.pathGoal.distanceToSquared(t.moveTo)>.64)&&(this.replanCooldown<=0&&this.plan(t.moveTo),!this.hasPath))return;let o=this.w.nav,s=this.path[this.pathIdx];for(;s!==void 0&&(o.pos(s,jg),!(Math.hypot(jg.x-r.x,jg.z-r.z)>.45));)this.pathIdx++,s=this.path[this.pathIdx];if(s===void 0&&(jg.copy(this.pathGoal),Math.hypot(jg.x-r.x,jg.z-r.z)<.4)){this.hasPath=!1,this.pathEvent=`arrived`;return}let c=jg.x-r.x,l=jg.z-r.z,u=Math.hypot(c,l)||1,d=t.run?this.def.runScale:this.def.walkScale;n.aim||(n.camYaw=Gp(c,l));let f=n.camYaw,p=-Math.sin(f),m=-Math.cos(f),h=Math.cos(f),g=-Math.sin(f);n.moveY=(c/u*p+l/u*m)*d,n.moveX=(c/u*h+l/u*g)*d}plan(e){let t=this.w.nav,n=this.mover.feet;this.replanCooldown=.35;let r=t.nearestNode(n.x,n.y,n.z,2),i=r>=0?t.nearestNode(e.x,e.y,e.z,3,t.comp[r]):-1,a=r>=0&&i>=0?t.findPath(r,i):null;this.pathGoal.copy(e),a?(this.path=t.smooth(a),this.pathIdx=0,this.hasPath=!0,t.pos(a[a.length-1],this.pathGoal),this.progressFrom.copy(n),this.stuckTimer=0):(this.hasPath=!1,this.pathEvent=`failed`)}trackProgress(e){!this.hasPath||!this.cmd.hasMove?(this.stuckTimer=0,this.noProgressTime=0,this.progressFrom.copy(this.mover.feet)):(this.stuckTimer+=e,this.mover.feet.distanceTo(this.progressFrom)>kg?(this.progressFrom.copy(this.mover.feet),this.stuckTimer=0,this.noProgressTime=0,this.stuckReplans=0):(this.noProgressTime+=e,this.maxNoProgress=Math.max(this.maxNoProgress,this.noProgressTime),this.stuckTimer>Og&&(this.stuckTimer=0,this.stuckEvents++,this.stuckReplans++,this.stuckReplans>Ag?(this.stuckReplans=0,this.hasPath=!1,this.pathEvent=`stuck`):(this.replanCooldown=0,this.plan(this.pathGoal)))))}shoot(e){let t=this.def.weapon;this.muzzlePos(Pg);let n=Pg.distanceTo(e.chest),r=Gl(.4+this.aimIn/2*.6,.4,1),i=Gl(12/Math.max(1,n),.35,1.3),a=e.speed>5?.6:e.speed>2?.82:1,o=e.crouched?.85:1,s=t.accuracy*this.w.accuracyMult*r*i*a*o,c=this.w.rng,l=!1,u=0;for(let n=0;n<Math.max(1,t.pellets);n++)!e.invulnerable&&c.next()<s&&(l=!0,u+=t.damage*this.w.damageMult);l?Ig.copy(e.chest):Ig.set(e.chest.x+c.range(-.9,.9),e.chest.y+c.range(-.4,.9),e.chest.z+c.range(-.9,.9)),Fg.subVectors(Ig,Pg).normalize(),this.w.vfx.tracer(Pg,Ig,this.def.type===`marksman`?16732224:16756848,this.def.type===`marksman`?.035:.022),this.w.vfx.muzzle(Pg,Fg,!1),this.w.audio.shot(Dg[t.model]??`enemyPistol`,Pg),this.recoilVis=1,this.w.onShotAtPlayer(this,l,u)}updateTelegraph(e,t){let n=this.cmd.telegraph;if(this.laser&&this.laserMat){if(n>.01&&this.alive){this.muzzlePos(Pg),Mg.copy(t.chest),Fg.subVectors(Mg,Pg);let r=Fg.length();this.laser.position.addVectors(Pg,Mg).multiplyScalar(.5),this.laser.lookAt(Mg),this.laser.scale.set(.02+n*.02,.02+n*.02,r),this.laserMat.color.copy(Rg).multiplyScalar(.6+n*2.2),this.laser.visible=!0,this.laserBeepT-=e,this.laserBeepT<=0&&(this.laserBeepT=.32-n*.24,this.w.audio.laserBeep(n,Pg))}else this.laser.visible=!1,this.laserBeepT=0}}applyHit(e,t,n,r,i=!1){let a=yd(this.vitals,e,{zone:t,headMult:r,pierce:i});return a.dealt<=0||(this.hitFlash=.12,this.lastHitWasHead=t===`head`,this.perception.damaged=!0,this.perception.damageFrom.copy(n),a.killed&&this.die()),a}die(){this.brain.kill(),this.mover.kill(),this.deathTime=performance.now(),this.mover.collider.setEnabled(!1),this.icon.visible=!1,this.laser&&(this.laser.visible=!1)}stun(){this.brain.stun(),this.mover.setLocked(!0)}reset(){this.alive&&(Sd(this.vitals),this.brain.state=`patrol`,this.brain.detection=0,this.brain.hasLastKnown=!1,this.mover.setLocked(!1),this.mover.revive(this.home,this.spawnDef.yaw),this.hasPath=!1,this.aimIn=0)}renderUpdate(e,t){let n=this.mover;n.renderFeet(e,this.rig.root.position),this.rig.root.rotation.y=n.renderYaw(e);let r=this.pose;r.speed=n.stepSpeed(Ql);let i=n.feet.x-n.prevFeet.x,a=n.feet.z-n.prevFeet.z;r.moveAngle=Math.hypot(i,a)>1e-4?Math.atan2(-i,-a)-n.yaw:0,r.state=this.alive?this.brain.state===`stunned`?`locked`:n.state:`dead`,r.posture=n.posture,r.grounded=n.grounded,r.aim=+!!this.intent.aim,r.aimPitch=0,r.stateTime=this.alive?n.stateTime:(performance.now()-this.deathTime)/1e3,r.recoil=this.recoilVis,r.melee=0,this.rig.update(r,t);let o=this.rig.rim;if(this.hitFlash>0?(o.rimColor.value.setRGB(1,1,1),o.rimStrength.value=2.4):this.cmd.telegraph>0&&!this.laser&&this.alive?(o.rimColor.value.copy(this.baseRim).lerp(Rg,this.cmd.telegraph),o.rimStrength.value=1.1+this.cmd.telegraph*1.6):(o.rimColor.value.copy(this.baseRim),o.rimStrength.value=this.alive?1.1:.25),this.alive&&this.cmd.icon!==`none`){this.icon.visible=!0,this.icon.material=yg(this.cmd.icon===`alert`?`alert`:`suspicious`),this.icon.position.set(this.rig.root.position.x,this.rig.root.position.y+(n.posture===`crouch`?1.55:2.2),this.rig.root.position.z);let e=this.cmd.icon===`alert`?.5:.32+this.cmd.detection*.16;this.icon.scale.set(e,e,e)}else this.icon.visible=!1}dispose(){this.rig.dispose(),this.w.scene.remove(this.icon),this.laser&&this.w.scene.remove(this.laser),this.laserMat?.dispose(),this.rig.material.dispose(),this.w.physics.removeCharacter(this.mover.char)}},Bg=new H(0,1,0);function Vg(e){let t=new mt;return e.rotY&&t.setFromAxisAngle(Bg,e.rotY),{center:new H(e.c[0],e.c[1],e.c[2]),half:new H(e.s[0]/2,e.s[1]/2,e.s[2]/2),quat:t}}function Hg(e){let t=e.thickness??.3,n=new H(e.from[0],e.from[1],e.from[2]),r=new H(e.to[0],e.to[1],e.to[2]),i=new H().subVectors(r,n),a=i.length(),o=i.clone().normalize(),s=new H().crossVectors(Bg,o).normalize(),c=new H().crossVectors(o,s).normalize(),l=new mt().setFromRotationMatrix(new G().makeBasis(s,c,o));return{center:new H().addVectors(n,r).multiplyScalar(.5).addScaledVector(c,-t/2),half:new H(e.w/2,t/2,a/2),quat:l}}function Ug(e,t){let n=[];for(let r of e.boxes){if(r.collide===!1)continue;let e=Vg(r);t.addStaticBox(e.center,e.half,e.quat),n.push(e)}for(let r of e.ramps){let e=Hg(r);t.addStaticBox(e.center,e.half,e.quat),n.push(e)}return n}var Wg=new H,Gg=new H,Kg=new H,qg=class{enemies=[];byHandle=new Map;cover=[];world;deps;mainComp=-1;currentId=``;spawnCounter=0;constructor(e){this.deps=e,this.world={physics:e.physics,nav:e.nav,vfx:e.vfx,audio:e.audio,rng:e.rng,scene:e.scene,tactics:this,accuracyMult:e.accuracyMult,damageMult:e.damageMult,onShotAtPlayer:e.onShotAtPlayer};let t=e.level.spawn.pos,n=e.nav.nearestNode(t[0],t[1],t[2],3);this.mainComp=n>=0?e.nav.comp[n]:-1,this.buildCoverPoints()}spawnInitial(){for(let e of this.deps.level.enemies)e.spawnOn||this.spawn(e)}spawnEvent(e,t=!1){let n=0;for(let r of this.deps.level.enemies)if(r.spawnOn===e){let e=this.spawn({...r,id:`${r.id}#${++this.spawnCounter}`});e.brain.aggressive=t,n++}return n}spawn(e){let t=new zg(e,this.world,this.enemies.length);return this.enemies.push(t),this.byHandle.set(t.collider.handle,t),t}spawnAt(e,t,n,r){let i=this.spawn({id:`dbg-${e}-${++this.spawnCounter}`,type:e,pos:[t.x,t.y,t.z],yaw:n});return r&&i.brain.alert(r),i}enemyFromCollider(e){return e?this.byHandle.get(e.handle)??null:null}get aliveCount(){let e=0;for(let t of this.enemies)t.alive&&e++;return e}noise(e,t){let n=t*t;for(let t of this.enemies)t.alive&&t.feet.distanceToSquared(e)<=n&&t.hear(e)}alertAll(e){for(let t of this.enemies)t.alive&&t.brain.alert(e)}fixedUpdate(e,t){for(let n of this.enemies){this.currentId=n.id;let r=n.state===`combat`||n.state===`cover`||n.state===`flank`;n.fixedUpdate(e,t),n.cmd.shout&&this.shout(n,t.feet);let i=n.state===`combat`||n.state===`cover`||n.state===`flank`;!r&&i&&n.alive&&(this.deps.audio.alert(n.feet),this.deps.onEnemyAlert?.(n)),n.state!==`cover`&&this.releaseCover(n.id)}this.currentId=``}shout(e,t){for(let n of this.enemies)n!==e&&n.alive&&n.feet.distanceToSquared(e.feet)<=324&&n.allyAlert(t)}renderUpdate(e,t){for(let n of this.enemies)n.renderUpdate(e,t)}despawnAll(){for(let e of this.enemies)e.dispose();this.enemies.length=0,this.byHandle.clear();for(let e of this.cover)e.claimedBy=null}despawnGroup(e){let t=0;for(let n=this.enemies.length-1;n>=0;n--){let r=this.enemies[n];if(r.spawnDef.group===e){for(let e of this.cover)e.claimedBy===r.id&&(e.claimedBy=null);this.byHandle.delete(r.collider.handle),r.dispose(),this.enemies.splice(n,1),t++}}return t}resetAlive(){for(let e of this.enemies)e.reset();for(let e of this.cover)e.claimedBy=null}qaStats(){let e=0,t=0,n={};for(let r of this.enemies)e=Math.max(e,r.maxNoProgress),t+=r.stuckEvents,n[r.state]=(n[r.state]??0)+1;return{alive:this.aliveCount,total:this.enemies.length,maxNoProgress:e,stuckEvents:t,states:n}}dispose(){for(let e of this.enemies)e.dispose();this.enemies.length=0,this.byHandle.clear()}buildCoverPoints(){let e=this.deps.nav;for(let t of this.deps.level.boxes){if(!t.cover||t.collide===!1)continue;let n=Vg(t),r=[[1,0,n.half.x],[-1,0,n.half.x],[0,1,n.half.z],[0,-1,n.half.z]];for(let[t,i,a]of r){Gg.set(t,0,i).applyQuaternion(n.quat);let r=t===0?n.half.x:n.half.z;Kg.set(-Gg.z,0,Gg.x);let o=Math.max(1,Math.floor(r*2/1));for(let t=0;t<o;t++){let i=o===1?0:-r+.4+(r*2-.8)*t/(o-1),s=new H(n.center.x+Gg.x*(a+.75)+Kg.x*i,n.center.y-n.half.y,n.center.z+Gg.z*(a+.75)+Kg.z*i),c=e.nearestNode(s.x,s.y,s.z,.6);c<0||e.comp[c]!==this.mainComp||(e.pos(c,s),this.cover.push({pos:s,normal:Gg.clone(),claimedBy:null}))}}}}get coverPointCount(){return this.cover.length}releaseCover(e){for(let t of this.cover)t.claimedBy===e&&(t.claimedBy=null)}findCover(e,t,n){let r=this.deps.physics,i=0,a=null,o=1/0;for(let n of this.cover){if(n.claimedBy&&n.claimedBy!==this.currentId)continue;let s=n.pos.distanceTo(e);if(!(s>16||n.pos.distanceTo(t)<4)&&(Wg.subVectors(t,n.pos).setY(0).normalize(),!(Wg.dot(n.normal)>-.35)&&s<o)){if(i++>6)break;if(Gg.set(n.pos.x,n.pos.y+.85,n.pos.z),Kg.set(t.x,t.y+1.4,t.z),r.lineOfSight(Gg,Kg,ud.STATIC))continue;a=n,o=s}}return a?(a.claimedBy=this.currentId,n.copy(a.pos),!0):!1}findFlank(e,t,n,r){let i=this.deps.nav,a=Math.atan2(e.x-t.x,e.z-t.z);for(let o of[75,60,90,45]){let s=a+n*(o*Math.PI/180),c=t.x+Math.sin(s)*9,l=t.z+Math.cos(s)*9,u=i.nearestNode(c,e.y,l,2.5);if(u>=0&&i.comp[u]===this.mainComp)return i.pos(u,r),!0}return!1}randomNear(e,t,n){let r=this.deps.nav,i=this.deps.rng;for(let a=0;a<10;a++){let a=i.range(0,Math.PI*2),o=i.range(1,Math.max(1.2,t)),s=r.nearestNode(e.x+Math.sin(a)*o,e.y,e.z+Math.cos(a)*o,1.5);if(s>=0&&r.comp[s]===this.mainComp)return r.pos(s,n),!0}return!1}},Jg={ammo:13938487,medkit:15921906,armor:5941759},Yg=1.15,Xg=null,Zg=new Map;function Qg(e){let t=Zg.get(e);if(t)return t;let n=new Sa({color:Jg[e],roughness:.4,metalness:.2,emissive:new K(Jg[e]).multiplyScalar(.25)});return Ep(n,Jg[e],1.4,2),Zg.set(e,n),n}var $g=class{scene;list=[];t=0;constructor(e){this.scene=e}add(e,t,n=1/0){Xg??=new sa(.34,.24,.24);let r=new un,i=new ri(Xg,Qg(e));if(r.add(i),e===`medkit`){let e=new ri(Xg,new Sa({color:13708075,emissive:4194304}));e.scale.set(.3,1.05,1.05),r.add(e)}r.position.copy(t),r.position.y+=.35,this.scene.add(r),this.list.push({kind:e,pos:t.clone(),mesh:r,taken:!1,ttl:n})}collect(e,t){for(let n of this.list)if(!n.taken&&!(Math.abs(n.pos.y-e.y)>1.4)&&!(Math.hypot(n.pos.x-e.x,n.pos.z-e.z)>Yg)&&t(n.kind))return n.taken=!0,n.mesh.visible=!1,n.kind;return null}update(e){this.t+=e;for(let t of this.list)t.taken||(t.ttl-=e,t.ttl<=0?(t.taken=!0,t.mesh.visible=!1):(t.mesh.rotation.y+=e*1.6,t.mesh.position.y=t.pos.y+.35+Math.sin(this.t*3+t.pos.x)*.06))}get activeCount(){return this.list.filter(e=>!e.taken).length}active(){return this.list.filter(e=>!e.taken).map(e=>({kind:e.kind,x:e.pos.x,y:e.pos.y,z:e.pos.z}))}dispose(){for(let e of this.list)this.scene.remove(e.mesh);this.list.length=0}};function e_(e,t=`#d4af37`,n=`rgba(12,14,18,0.78)`){let r=`700 40px system-ui, "Segoe UI", Arial, sans-serif`,i=document.createElement(`canvas`).getContext(`2d`);if(!i)throw Error(`Canvas 2D no disponible`);i.font=r;let a=i.measureText(e).width,o=Math.min(1024,Math.ceil(a+96*.3*2)),s=document.createElement(`canvas`);s.width=o,s.height=67;let c=s.getContext(`2d`);if(!c)throw Error(`Canvas 2D no disponible`);c.fillStyle=n;let l=67/2;c.beginPath(),c.moveTo(l,0),c.lineTo(o-l,0),c.arc(o-l,l,l,-Math.PI/2,Math.PI/2),c.lineTo(l,67),c.arc(l,l,l,Math.PI/2,Math.PI*3/2),c.closePath(),c.fill(),c.strokeStyle=t,c.lineWidth=3,c.stroke(),c.font=r,c.fillStyle=t,c.textAlign=`center`,c.textBaseline=`middle`,c.fillText(e,o/2,35.5);let u=new ra(s);u.colorSpace=Be;let d=new Rr(new wr({map:u,depthTest:!1,depthWrite:!1,transparent:!0,toneMapped:!1})),f=.26;return d.scale.set(o/67*f,f,1),d.renderOrder=15,d}function t_(e){let t=e.material;t.map?.dispose(),t.dispose(),e.removeFromParent()}var n_=1.1,r_=class{def;scene;rig;label;pos;baseYaw;yaw;pose=Dp();constructor(e,t){this.def=e,this.scene=t,this.pos=e.pos.clone(),this.baseYaw=this.yaw=e.yaw,this.rig=new Ip(`npc:${e.id}`,{colors:e.colors,rimColor:13938487,rimStrength:.55,hair:e.hair,vest:e.vest,bulk:e.bulk,weapon:`none`}),this.rig.root.position.copy(this.pos),this.rig.root.rotation.y=this.yaw,t.add(this.rig.root),this.label=e_(e.name),this.label.position.set(this.pos.x,this.pos.y+2.25,this.pos.z),t.add(this.label)}update(e,t){let n=t.x-this.pos.x,r=t.z-this.pos.z,i=this.baseYaw;if(n*n+r*r<49){let e=Gp(n,r),t=Math.max(-1.1,Math.min(n_,Jl(e-this.baseYaw)));i=this.baseYaw+t}this.yaw=Xl(this.yaw,i,4,e),this.rig.root.rotation.y=this.yaw,this.pose.speed=0,this.pose.state=`ground`,this.pose.grounded=!0,this.rig.update(this.pose,e)}dispose(){this.rig.dispose(),this.rig.material.dispose(),t_(this.label),this.scene}},i_={charon:{name:`Charon · Conserje`,colors:{jacket:1776930,shirt:15854816,tie:7999520,pants:1776930,shoes:723725,skin:5913386,hair:1709330,accent:13938487},hair:`bald`},sommelier:{name:`Sommelier · Armería`,colors:{jacket:5906218,shirt:15854816,tie:1776930,pants:2761256,shoes:723725,skin:14266508,hair:7031339,accent:13938487},hair:`short`,vest:!0},winston:{name:`Winston · Gerente`,colors:{jacket:3882826,shirt:15328472,tie:10124078,pants:3422015,shoes:723725,skin:14201752,hair:10132122,accent:13938487},hair:`short`}},a_=[{n:[1,0,0],u:[0,1,0],v:[0,0,1]},{n:[-1,0,0],u:[0,0,1],v:[0,1,0]},{n:[0,1,0],u:[0,0,1],v:[1,0,0]},{n:[0,-1,0],u:[1,0,0],v:[0,0,1]},{n:[0,0,1],u:[1,0,0],v:[0,1,0]},{n:[0,0,-1],u:[0,1,0],v:[1,0,0]}],o_=[[-1,-1],[1,-1],[1,1],[-1,1]],s_=class{pos=[];nor=[];uv=[];idx=[];verts=0;tmpL=new H;tmpN=new H;appendBox(e,t){let n=e.half;for(let r of a_){let i=Math.abs(r.n[0])*n.x+Math.abs(r.n[1])*n.y+Math.abs(r.n[2])*n.z,a=Math.abs(r.u[0])*n.x+Math.abs(r.u[1])*n.y+Math.abs(r.u[2])*n.z,o=Math.abs(r.v[0])*n.x+Math.abs(r.v[1])*n.y+Math.abs(r.v[2])*n.z;this.tmpN.set(r.n[0],r.n[1],r.n[2]).applyQuaternion(e.quat);let s=this.tmpN,c=0,l=0,u=Math.abs(s.y)>.7;if(!u){let e=Math.hypot(s.z,s.x)||1;c=s.z/e,l=-s.x/e}for(let[n,d]of o_){this.tmpL.set(r.n[0]*i+r.u[0]*n*a+r.v[0]*d*o,r.n[1]*i+r.u[1]*n*a+r.v[1]*d*o,r.n[2]*i+r.u[2]*n*a+r.v[2]*d*o).applyQuaternion(e.quat).add(e.center);let f=this.tmpL;this.pos.push(f.x,f.y,f.z),this.nor.push(s.x,s.y,s.z),u?this.uv.push(f.x/t,f.z/t):this.uv.push((f.x*c+f.z*l)/t,f.y/t)}let d=this.verts;this.idx.push(d,d+1,d+2,d,d+2,d+3),this.verts+=4}}get empty(){return this.verts===0}build(){let e=new pr;return e.setAttribute(`position`,new tr(this.pos,3)),e.setAttribute(`normal`,new tr(this.nor,3)),e.setAttribute(`uv`,new tr(this.uv,2)),e.setIndex(new er(this.idx,1)),e.computeBoundingBox(),e.computeBoundingSphere(),e}},c_=40;function l_(e,t,n,r){let i=new un;i.name=`level:${e.id}`;let a=[],o=Ug(e,n),s=new Map,c=(e,t,n,r)=>{let i=`${e}|${+!!t}|${Math.floor(n/c_)},${Math.floor(r/c_)}`,a=s.get(i);return a||(a={mat:e,cast:t,acc:new s_},s.set(i,a)),a.acc};for(let t of e.boxes){if(t.invisible)continue;let e=Vg(t);c(t.mat,t.shadow??!0,e.center.x,e.center.z).appendBox(e,Sp(t.mat))}for(let t of e.ramps){let e=Hg(t);c(t.mat,!0,e.center.x,e.center.z).appendBox(e,Sp(t.mat))}for(let e of s.values()){if(e.acc.empty)continue;let t=e.acc.build();a.push(t);let n=new ri(t,Cp(e.mat));n.castShadow=r.shadows&&e.cast,n.receiveShadow=r.shadows,n.matrixAutoUpdate=!1,n.updateMatrix(),n.name=`static:${e.mat}`,i.add(n)}let l=e.ambient,u=new qa(l.sky,l.ground,l.hemi),d=new fo(l.ambientColor,l.ambient);i.add(u,d);let f=e.key,p=new uo(f.color,f.intensity),m=new H(f.dir[0],f.dir[1],f.dir[2]).normalize(),h=(e.bounds.min[0]+e.bounds.max[0])/2,g=(e.bounds.min[2]+e.bounds.max[2])/2;if(p.target.position.set(h,0,g),p.position.set(h+m.x*60,m.y*60,g+m.z*60),p.castShadow=r.shadows&&f.shadow,p.castShadow){p.shadow.mapSize.set(r.shadowMapSize,r.shadowMapSize);let e=p.shadow.camera;e.left=-f.shadowArea,e.right=f.shadowArea,e.top=f.shadowArea,e.bottom=-f.shadowArea,e.near=1,e.far=160,p.shadow.bias=-6e-4,p.shadow.normalBias=.03}i.add(p,p.target);let _=[],v=[];for(let t of e.lights){let e=new so(t.color,t.alarm?0:t.intensity,t.distance,2);e.position.set(t.pos[0],t.pos[1],t.pos[2]),e.castShadow=!1,e.userData.baseIntensity=t.intensity,(t.alarm?v:_).push(e),i.add(e)}let y=new Map,b=[],x={leaves:null,disposables:a};for(let t of e.decor)u_(t,i,y,b,x);d_(b,i,r.shadows,a);for(let[e,t]of y){let[n,r]=e.split(`:`).map(Number),o=t.build();a.push(o);let s=new ri(o,Tp(n,r));s.name=`neon`,s.matrixAutoUpdate=!1,s.updateMatrix(),i.add(s)}return t.background=new K(l.background),t.fog=l.fog?new vn(l.fog.color,l.fog.near,l.fog.far):null,t.environmentIntensity=l.ibl,t.add(i),i.updateMatrixWorld(!0),i.traverse(e=>{e.matrixAutoUpdate=!1}),i.matrixWorldAutoUpdate=!1,{data:e,root:i,hemi:u,ambient:d,key:p,points:_,alarmLights:v,solids:o,dispose(){t.remove(i);for(let e of a)e.dispose();i.clear()}}}function u_(e,t,n,r,i){let a=i.disposables;switch(e.kind){case`neon`:{let t=`${e.color}:${e.intensity??1.6}`,r=n.get(t);r||(r=new s_,n.set(t,r)),r.appendBox(Vg({c:e.c,s:e.s,rotY:e.rotY??0,mat:`metal`}),1);return}case`sign`:{let n=yp(e.w,e.h,{text:e.text,sub:e.sub,color:e.color,bg:e.bg,font:e.font??`sans`}),r=new Gr({map:n,transparent:e.bg===void 0,toneMapped:!1});e.glow&&r.color.setScalar(e.glow);let i=new la(e.w,e.h),o=new ri(i,r);o.position.set(e.c[0],e.c[1],e.c[2]),o.rotation.y=e.rotY,o.name=`sign:${e.text}`,a.push(i,r,n),t.add(o);return}case`prop`:r.push(f_(e,i));return}}function d_(e,t,n,r){let i=new Map;for(let t of e){t.updateMatrixWorld(!0);for(let e of t.children){let t=e,n=t.material,r=t.geometry.clone().applyMatrix4(t.matrixWorld),a=i.get(n);a?a.push(r):i.set(n,[r]),t.geometry.dispose()}}for(let[e,a]of i){let i=Kf(a,!1);for(let e of a)e.dispose();if(!i)throw Error(`LevelBuilder: no se pudieron fusionar los props`);i.computeBoundingSphere(),r.push(i);let o=new ri(i,e);o.name=`props`,o.castShadow=!1,o.receiveShadow=n,t.add(o)}}function f_(e,t){let n=t.disposables,r=new un;r.position.set(e.c[0],e.c[1],e.c[2]),r.rotation.y=e.rotY??0,r.scale.setScalar(e.scale??1);let i=(e,t,i,a,o)=>{n.push(e);let s=new ri(e,t);return s.position.set(i,a,o),r.add(s),s};switch(e.prop){case`plant`:{i(new ca(.28,.22,.55,10),Cp(`brass`),0,.275,0),t.leaves||(t.leaves=new Sa({color:3107644,roughness:.8}),n.push(t.leaves));let e=t.leaves;i(new ua(.45,8,6),e,0,.95,0),i(new ua(.32,8,6),e,.18,1.3,.05);break}case`lampDesk`:i(new ca(.08,.1,.04,12),Cp(`brass`),0,.02,0),i(new ca(.015,.015,.35,6),Cp(`brass`),0,.2,0),i(new ca(.06,.13,.12,12,1,!0),Tp(8257456,1.2),0,.4,0);break;case`chandelier`:i(new da(1.1,.05,8,32),Cp(`gold`),0,0,0).rotation.x=Math.PI/2;for(let e=0;e<10;e++){let t=e/10*Math.PI*2;i(new ua(.07,8,6),Tp(16769704,2),Math.cos(t)*1.1,-.12,Math.sin(t)*1.1)}i(new ca(.02,.02,1.4,6),Cp(`gold`),0,.7,0);break;case`barStools`:for(let e=0;e<4;e++)i(new ca(.2,.2,.08,12),Cp(`leather`),e*.9,.75,0),i(new ca(.03,.05,.72,6),Cp(`metal`),e*.9,.36,0);break;case`speaker`:i(new sa(.8,1.6,.6),Cp(`metalDark`),0,.8,0),i(new ca(.25,.25,.05,16),Tp(1696767,1.2),0,.5,.31).rotation.x=Math.PI/2,i(new ca(.15,.15,.05,16),Tp(16723592,1.2),0,1.15,.31).rotation.x=Math.PI/2;break;case`rotor`:i(new sa(9,.06,.35),Cp(`metalDark`),0,0,0),i(new sa(.35,.06,9),Cp(`metalDark`),0,0,0);break;case`waterTower`:i(new ca(1.6,1.6,2.6,14),Cp(`woodDark`),0,3.6,0),i(new ca(.1,.1,2.4,6),Cp(`metalDark`),1,1.2,1),i(new ca(.1,.1,2.4,6),Cp(`metalDark`),-1,1.2,1),i(new ca(.1,.1,2.4,6),Cp(`metalDark`),1,1.2,-1),i(new ca(.1,.1,2.4,6),Cp(`metalDark`),-1,1.2,-1);break;case`antenna`:i(new ca(.06,.12,8,6),Cp(`metal`),0,4,0),i(new ua(.15,8,6),Tp(16724804,2.5),0,8.1,0);break;case`crane`:i(new sa(1.2,18,1.2),Cp(`containerYellow`),0,9,0),i(new sa(22,1,1),Cp(`containerYellow`),6,18,0),i(new sa(.1,10,.1),Cp(`metalDark`),14,13,0)}for(let e of r.children)e.castShadow=!1;return r}var p_={cell:.5,agentRadius:.36,agentHeight:1.75,step:.34,maxSlopeDeg:45},m_=.7,h_=.28,g_=0,__=1,v_=2,y_=new H,b_=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],x_=class e{opts;minX;minZ;nx;nz;nodeCount=0;nodeX=new Float32Array;nodeY=new Float32Array;nodeZ=new Float32Array;nodeRamp=new Uint8Array;nodeCol=new Int32Array;colStart;colNodes=new Int32Array;adj=new Int32Array;comp=new Int32Array;gScore=new Float32Array;fScore=new Float32Array;parent=new Int32Array;visited=new Uint32Array;closed=new Uint32Array;heap=new Int32Array;heapSize=0;gen=1;constructor(e,t,n,r,i){this.opts=e,this.minX=t,this.minZ=n,this.nx=r,this.nz=i,this.colStart=new Int32Array(r*i+1)}static build(t,n=p_){let r=t.bounds,i=n.cell,a=Math.max(1,Math.ceil((r.max[0]-r.min[0])/i)),o=Math.max(1,Math.ceil((r.max[2]-r.min[2])/i)),s=new e(n,r.min[0],r.min[2],a,o),c=[],l=[];for(let e of t.boxes){if(e.collide===!1)continue;let t=Vg(e),n=S_(t);c.push(n),e.noWalk||l.push({s:n,top:t.center.y+t.half.y,stair:!!e.stair})}let u=[];for(let e of t.ramps){c.push(S_(Hg(e)));let t=e.to[0]-e.from[0],r=e.to[2]-e.from[2],i=Math.hypot(t,r);Math.atan2(Math.abs(e.to[1]-e.from[1]),i)*180/Math.PI>n.maxSlopeDeg+.5||u.push({r:e,fx:e.from[0],fz:e.from[2],fy:e.from[1],dy:e.to[1]-e.from[1],dirX:t/i,dirZ:r/i,len:i,half:e.w/2})}let d=Math.ceil((r.max[0]-r.min[0])/4)+1,f=Math.ceil((r.max[2]-r.min[2])/4)+1,p=Array.from({length:d*f},()=>[]),m=n.agentRadius;for(let e of c){let t=Math.max(0,Math.floor((e.minX-m-r.min[0])/4)),n=Math.min(d-1,Math.floor((e.maxX+m-r.min[0])/4)),i=Math.max(0,Math.floor((e.minZ-m-r.min[2])/4)),a=Math.min(f-1,Math.floor((e.maxZ+m-r.min[2])/4));for(let r=t;r<=n;r++)for(let t=i;t<=a;t++)p[r+t*d].push(e)}let h=(e,t,i)=>{let a=Math.floor((e-r.min[0])/4),o=Math.floor((i-r.min[2])/4),s=p[a+o*d];if(!s)return!0;let c=t+n.agentHeight-.05;for(let r of s)if(!(e<r.minX-m||e>r.maxX+m||i<r.minZ-m||i>r.maxZ+m)&&!(r.top<=t+n.step+.02)){for(let n=t+.3;n<=c;n+=h_)if(w_(r,e,n,i,m))return!0;if(w_(r,e,c,i,m))return!0}return!1},g=[],_=[],v=[],y=[],b=[],x=Array.from({length:a*o},()=>[]),S=[];for(let e=0;e<o;e++)for(let t=0;t<a;t++){let n=r.min[0]+(t+.5)*i,o=r.min[2]+(e+.5)*i;S.length=0;for(let e of l){let t=e.s;n<t.minX||n>t.maxX||o<t.minZ||o>t.maxZ||C_(t,n,o)&&S.push({y:e.top,kind:e.stair?v_:g_})}for(let e of u){let t=n-e.fx,r=o-e.fz,i=(t*e.dirX+r*e.dirZ)/e.len,a=-t*e.dirZ+r*e.dirX;i<0||i>1||Math.abs(a)>e.half-.05||S.push({y:e.fy+e.dy*i,kind:__})}if(S.length===0)continue;S.sort((e,t)=>t.y-e.y);let s=t+e*a,c=1/0;for(let e of S){if(c-e.y<.15||(c=e.y,e.y>r.max[1])||h(n,e.y,o))continue;let t=g.length;g.push(n),_.push(e.y),v.push(o),y.push(e.kind),b.push(s),x[s].push(t)}}s.nodeCount=g.length,s.nodeX=Float32Array.from(g),s.nodeY=Float32Array.from(_),s.nodeZ=Float32Array.from(v),s.nodeRamp=Uint8Array.from(y),s.nodeCol=Int32Array.from(b);let C=[];for(let e=0;e<a*o;e++){s.colStart[e]=C.length;for(let t of x[e])C.push(t)}s.colStart[a*o]=C.length,s.colNodes=Int32Array.from(C),s.buildAdjacency(),s.buildComponents();let w=s.nodeCount;return s.gScore=new Float32Array(w),s.fScore=new Float32Array(w),s.parent=new Int32Array(w),s.visited=new Uint32Array(w),s.closed=new Uint32Array(w),s.heap=new Int32Array(w+8),s}stepOk(e,t,n){let r=Math.abs(this.nodeY[e]-this.nodeY[t]),i=this.nodeRamp[e],a=this.nodeRamp[t];return i===__||a===__?r<=this.opts.cell*(n?Math.SQRT2:1)*Math.tan(this.opts.maxSlopeDeg*Math.PI/180)+.12:i===v_||a===v_?r<=m_:r<=this.opts.step}linkInColumn(e,t,n){let r=-1,i=1/0;for(let a=this.colStart[t];a<this.colStart[t+1];a++){let t=this.colNodes[a];if(!this.stepOk(e,t,n))continue;let o=Math.abs(this.nodeY[e]-this.nodeY[t]);o<i&&(i=o,r=t)}return r}buildAdjacency(){let e=this.nodeCount;this.adj=new Int32Array(e*8).fill(-1);for(let t=0;t<e;t++){let e=this.nodeCol[t],n=e%this.nx,r=e/this.nx|0;for(let e=0;e<8;e++){let[i,a]=b_[e],o=n+i,s=r+a;if(o<0||s<0||o>=this.nx||s>=this.nz)continue;let c=i!==0&&a!==0,l=this.linkInColumn(t,o+s*this.nx,c);l<0||c&&(this.linkInColumn(t,o+r*this.nx,!1)<0||this.linkInColumn(t,n+s*this.nx,!1)<0)||(this.adj[t*8+e]=l)}}}buildComponents(){let e=this.nodeCount;this.comp=new Int32Array(e).fill(-1);let t=0,n=[];for(let r=0;r<e;r++)if(this.comp[r]===-1){for(this.comp[r]=t,n.push(r);n.length;){let e=n.pop();for(let r=0;r<8;r++){let i=this.adj[e*8+r];i>=0&&this.comp[i]===-1&&(this.comp[i]=t,n.push(i))}}t++}}columnOf(e,t){let n=Math.floor((e-this.minX)/this.opts.cell),r=Math.floor((t-this.minZ)/this.opts.cell);return n<0||r<0||n>=this.nx||r>=this.nz?-1:n+r*this.nx}nearestNode(e,t,n,r=2.5,i=-1){let a=this.opts.cell,o=Math.floor((e-this.minX)/a),s=Math.floor((n-this.minZ)/a),c=Math.ceil(r/a),l=-1,u=1/0;for(let r=0;r<=c;r++){for(let a=-r;a<=r;a++)for(let c=-r;c<=r;c++){if(Math.max(Math.abs(c),Math.abs(a))!==r)continue;let d=o+c,f=s+a;if(d<0||f<0||d>=this.nx||f>=this.nz)continue;let p=d+f*this.nx;for(let r=this.colStart[p];r<this.colStart[p+1];r++){let a=this.colNodes[r];if(i>=0&&this.comp[a]!==i)continue;let o=this.nodeX[a]-e,s=this.nodeZ[a]-n,c=(this.nodeY[a]-t)*2.5,d=o*o+s*s+c*c;d<u&&(u=d,l=a)}}if(l>=0&&r>=1)break}return l}lineWalkable(e,t){let n=this.nodeX[e],r=this.nodeZ[e],i=this.nodeY[e],a=this.nodeX[t],o=this.nodeZ[t],s=this.nodeY[t],c=Math.hypot(a-n,o-r),l=Math.ceil(c/(this.opts.cell*.5)),u=e;for(let e=1;e<=l;e++){let t=e/l,c=n+(a-n)*t,d=r+(o-r)*t,f=this.columnOf(c,d);if(f<0)return!1;let p=i+(s-i)*t,m=-1;for(let e=this.colStart[f];e<this.colStart[f+1];e++){let t=this.colNodes[e];if(Math.abs(this.nodeY[t]-p)<=.45&&(t===u||this.isNeighbor(u,t)||this.nodeCol[t]===this.nodeCol[u])){m=t;break}}if(m<0)return!1;u=m}return!0}isNeighbor(e,t){for(let n=0;n<8;n++)if(this.adj[e*8+n]===t)return!0;return!1}findPath(e,t,n=3e4){if(e<0||t<0||this.comp[e]!==this.comp[t])return null;if(e===t)return[e];this.gen++,this.gen>4294967280&&(this.visited.fill(0),this.closed.fill(0),this.gen=1);let r=this.gen,i=this.nodeX[t],a=this.nodeZ[t],o=this.nodeY[t],s=e=>{let t=Math.abs(this.nodeX[e]-i),n=Math.abs(this.nodeZ[e]-a);return Math.max(t,n)+(Math.SQRT2-1)*Math.min(t,n)+Math.abs(this.nodeY[e]-o)};this.heapSize=0,this.visited[e]=r,this.gScore[e]=0,this.fScore[e]=s(e),this.parent[e]=-1,this.push(e);let c=0;for(;this.heapSize>0;){let e=this.pop();if(e===t)return this.reconstruct(t);if(this.closed[e]===r)continue;if(this.closed[e]=r,++c>n)return null;let i=this.gScore[e];for(let t=0;t<8;t++){let n=this.adj[e*8+t];if(n<0||this.closed[n]===r)continue;let a=this.nodeX[n]-this.nodeX[e],o=this.nodeZ[n]-this.nodeZ[e],c=this.nodeY[n]-this.nodeY[e],l=i+Math.sqrt(a*a+o*o+c*c);(this.visited[n]!==r||l<this.gScore[n])&&(this.visited[n]=r,this.gScore[n]=l,this.fScore[n]=l+s(n),this.parent[n]=e,this.push(n))}}return null}reconstruct(e){let t=[];for(let n=e;n>=0;n=this.parent[n])t.push(n);return t.reverse(),t}smooth(e){if(e.length<=2)return e.slice();let t=[e[0]],n=0;for(;n<e.length-1;){let r=n+1;for(let t=e.length-1;t>n+1;t--)if(this.lineWalkable(e[n],e[t])){r=t;break}t.push(e[r]),n=r}return t}push(e){let t=this.heapSize++;this.heap[t]=e;let n=this.fScore[e];for(;t>0;){let e=t-1>>1,r=this.heap[e];if(this.fScore[r]<=n)break;this.heap[t]=r,t=e}this.heap[t]=e}pop(){let e=this.heap[0],t=this.heap[--this.heapSize];if(this.heapSize>0){let e=0,n=this.fScore[t];for(;;){let t=e*2+1,r=t+1;if(t>=this.heapSize)break;let i=t;if(r<this.heapSize&&this.fScore[this.heap[r]]<this.fScore[this.heap[t]]&&(i=r),this.fScore[this.heap[i]]>=n)break;this.heap[e]=this.heap[i],e=i}this.heap[e]=t}return e}pos(e,t){return t.set(this.nodeX[e],this.nodeY[e],this.nodeZ[e])}componentSizes(){let e=new Map;for(let t=0;t<this.nodeCount;t++)e.set(this.comp[t],(e.get(this.comp[t])??0)+1);return e}};function S_(e){let t=1/0,n=-1/0,r=1/0,i=-1/0;for(let a of[-1,1])for(let o of[-1,1])for(let s of[-1,1])y_.set(e.half.x*a,e.half.y*o,e.half.z*s).applyQuaternion(e.quat).add(e.center),t=Math.min(t,y_.x),n=Math.max(n,y_.x),r=Math.min(r,y_.z),i=Math.max(i,y_.z);return{ob:e,inv:e.quat.clone().invert(),minX:t,maxX:n,minZ:r,maxZ:i,top:e.center.y+e.half.y}}function C_(e,t,n){return y_.set(t-e.ob.center.x,0,n-e.ob.center.z).applyQuaternion(e.inv),Math.abs(y_.x)<=e.ob.half.x&&Math.abs(y_.z)<=e.ob.half.z}function w_(e,t,n,r,i){return y_.set(t-e.ob.center.x,n-e.ob.center.y,r-e.ob.center.z).applyQuaternion(e.inv),Math.abs(y_.x)<=e.ob.half.x+i&&Math.abs(y_.y)<=e.ob.half.y&&Math.abs(y_.z)<=e.ob.half.z+i}var T_=class{data;deps;physics;level;nav;player;playerRig;vfx;pickups;enemies;combat;ctx;target;npcs=[];civilians;god=!1;infiniteAmmo=!1;constructor(e,t){this.data=e,this.deps=t;let n=t.scene;this.physics=new md(t.R),this.level=l_(e,n,this.physics,{shadows:t.quality.shadows,shadowMapSize:t.quality.shadowMapSize}),this.physics.step(),this.nav=x_.build(e);let r=e.spawn.pos;this.player=new Qp(this.physics,new H(r[0],r[1]+.02,r[2]),e.spawn.yaw),this.player.killY=e.killY,this.playerRig=new Ip(`player`,{colors:Lp,rimColor:15262416,rimStrength:.35,hair:`long`,weapon:`pistol`}),this.playerRig.setShadows(t.quality.shadows),n.add(this.playerRig.root),this.vfx=new _g(n,t.quality.particles),this.pickups=new $g(n);for(let t of e.pickups)this.pickups.add(t.kind,new H(t.pos[0],t.pos[1],t.pos[2]));this.combat=new cf(t.upgrades,Rd(t.upgrades)),this.enemies=new qg({level:e,physics:this.physics,nav:this.nav,vfx:this.vfx,audio:t.audio,rng:t.rng,scene:n,accuracyMult:t.accuracyMult,damageMult:t.damageMult,onShotAtPlayer:(e,t,n)=>{t&&!this.god&&this.combat.takeHit(e,n,this.ctx)},onEnemyAlert:e=>t.onEnemyAlert?.(e)}),this.civilians=e.civilians.length>0?new Dh(e.civilians,this.physics,this.nav,n,t.rng):null,this.civilians&&(this.civilians.onHurt=(e,n)=>t.onCivilianHurt?.(n)),this.ctx={physics:this.physics,camera:t.camera,player:this.player,enemies:this.enemies,civilians:this.civilians,vfx:this.vfx,audio:t.audio,rng:t.rng,pickups:this.pickups},this.target={feet:this.player.feet,head:new H,chest:new H,crouched:!1,speed:0,invulnerable:!1,alive:!0,collider:this.player.collider};for(let t of e.interactables){if(t.kind!==`npc`)continue;let r=i_[t.id];if(!r)continue;let i=e.boxes.find(e=>e.tag===`npc:${t.id}`)?.rotY??E_(t);this.npcs.push(new r_({id:t.id,pos:new H(t.pos[0],t.pos[1],t.pos[2]),yaw:i,...r},n))}this.enemies.spawnInitial(),this.physics.step()}updateTarget(e){let t=this.player,n=this.target,r=t.posture===`crouch`;return n.head.set(t.feet.x,t.feet.y+(r?1:1.6),t.feet.z),n.chest.set(t.feet.x,t.feet.y+(r?.7:1.15),t.feet.z),n.crouched=r,n.speed=t.stepSpeed(e),n.invulnerable=t.invulnerable||this.god,n.alive=!this.combat.dead,n}nearestInteractable(e,t){let n=this.player.feet,r=-Math.sin(e),i=-Math.cos(e),a=null,o=1/0;for(let e of this.data.interactables){if(t?.has(e.id))continue;let s=e.pos[0]-n.x,c=e.pos[2]-n.z,l=Math.hypot(s,c);l>e.radius||Math.abs(e.pos[1]-n.y)>1.5||l>.8&&(s*r+c*i)/l<.2||l<o&&(o=l,a=e)}return a}renderNpcs(e){for(let t of this.npcs)t.update(e,this.player.feet)}respawnAt(e,t){this.player.revive(e,t),this.physics.step()}dispose(){for(let e of this.npcs)e.dispose();this.civilians?.dispose(),this.enemies.dispose(),this.pickups.dispose(),this.vfx.dispose(),this.playerRig.dispose(),this.player.dispose(),this.level.dispose(),this.physics.dispose(),this.deps}};function E_(e){return Math.atan2(-(0-e.pos[0]),-(0-e.pos[2]))}var D_={carbine:`rifle`,shotgun:`shotgun`,pistol:`pistol`,knife:`knife`},O_={practice:`practice`,nightclub:`nightclub`,docks:`docks`,rooftop:`rooftop`,gauntlet:`hub`},k_={time:`Tiempo`,accuracy:`Precisión`,damage:`Daño recibido`,variety:`Variedad`,civilians:`Civiles ilesos`},A_=.88,j_={carbine:`weapon1`,shotgun:`weapon1`,pistol:`weapon2`,knife:`weapon3`},M_=1.2,N_=30,P_=new H,F_=new H,I_=new H,L_=new H(0,1,0),R_=new H,z_=new H,B_=.06,V_=30,H_=16,U_=class{renderer;stats=new Gf;debug;collisionView;sim=new eu;loop;opts;input;fsm=new pf;screens;hud;camera;audio=new Qu;rng=new Df(7);store;profile;settings;R=null;session=null;director=null;ready=!1;steps=0;manual=!1;invariants={steps:0,penetrations:0,cameraInside:0,cameraOccluded:0,outOfBounds:0,lastViolation:``};pendingLagMs=0;combatInconsistencies=0;currentLevel;mission=null;lastMission=null;outcome=null;usedInteractables=new Set;intent=Vp();idleIntent=Vp();cIntent=zd();idleCIntent=zd();move={x:0,y:0};mouse={x:0,y:0};pad={x:0,y:0};pose=Dp();captureOverlay;hudData;peekTimer=0;orbit=0;lastCpuMs=0;cpIndex=0;deathTimer=0;deathSlowmo=0;deathReturn=`playing`;lastWeaponModel=`pistol`;loading=!1;autosaveT=0;nearInteractable=null;holdT=0;aimLatched=!1;hintsFor=null;intelShown=!1;profiling=!1;prof={frames:0,steps:0,sim:0,player:0,enemies:0,civilians:0,physics:0,view:0,render:0};musicIn={fighting:0,searching:0,boss:!1,escape:!1,hostile:!1,onMission:!1};constructor(e,t,n){this.opts=n,this.currentLevel=n.startLevel,this.store=n.store??new Su;let r=_u(this.store);this.profile=r.profile,r.status===`reset-corrupt`&&console.warn(`[save] la partida guardada estaba corrupta; se empezó una nueva (copia en localStorage).`),this.settings=Lf(this.store);let i=this.store.get(ou)===null;i&&window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches&&(this.settings.shake=0),i&&!n.preset&&(this.settings.preset=Vf(Hf())),this.renderer=new fh(e,n.preset??this.settings.preset),this.input=new wf(this.renderer.canvas),this.input.attach(),this.input.on(e=>this.onInputEvent(e)),this.camera=new ag(this.renderer.camera,this.rng),this.hud=new Mh(t),this.screens=new zh(t,this.input,{onContinue:()=>void this.goToHub(),onNewGame:()=>this.newGame(),onPlayArena:()=>void this.playLevel(`arena`),onPlayPractice:()=>void this.playLevel(`practice`,{drill:!0}),onResume:()=>this.resume(),onReturnToHub:()=>void this.goToHub(),onQuitToTitle:()=>this.quitToTitle(),onCloseMenu:()=>this.closeMenu(),onBuy:e=>this.buyUpgrade(e),onStartMission:e=>this.startMission(e),settings:()=>this.settings,onSettingsChange:e=>this.applySettings(e),hasSave:()=>this.store.get(au)!==null,inHub:()=>this.currentLevel===`hub`,profile:()=>this.profile},n.qa),this.captureOverlay=$(`div`,{class:`capture-overlay`,role:`button`,tabIndex:0,ariaLabel:`Haz clic para capturar el ratón`},[$(`div`,{class:`capture-box`},[$(`strong`,{text:`Haz clic para jugar`}),$(`span`,{text:`El ratón controla la cámara. Esc para pausar.`})])]),this.captureOverlay.hidden=!0,this.captureOverlay.addEventListener(`click`,()=>this.requestLock()),t.appendChild(this.captureOverlay),this.debug=new Uf(t),this.collisionView=new Wf(this.renderer.scene),this.loop=new tu({frame:(e,t)=>this.frame(e,t)}),this.fsm.on((e,t)=>this.onStateChange(e,t)),this.hudData={health:100,maxHealth:100,armor:60,maxArmor:60,weaponName:``,mag:0,magMax:0,reserve:0,isGun:!0,slots:[],reload:-1,perfect:null,spreadPx:9,blocked:!1,aimOverEnemy:!1,hitKind:`none`,hitT:0,aimOverCivilian:!1,damage:Array.from({length:6},()=>({angle:0,k:0})),multiplier:1,rankName:Ed[0],gauge:0,score:0,feed:[],focus:0,focusActive:!1,focusReady:!1,focusKey:`Q`},this.registerDebugCommands(),this.applySettings(this.settings,!1);let a=()=>this.audio.init();window.addEventListener(`pointerdown`,a),window.addEventListener(`keydown`,a),window.addEventListener(`pagehide`,()=>this.saveNow()),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&this.saveNow()}),window.addEventListener(`keydown`,e=>{e.code===`F3`?(e.preventDefault(),this.debug.toggle()):e.repeat||this.debug.handleHotkey(e.code)})}async boot(){ph(.15,`Cargando motor de física…`),this.R=await sd(),ph(.6,`Preparando el Continental…`),await this.loadSession(this.opts.startLevel),ph(1,`Listo`),mh(this.opts.qa),this.loop.start(),this.fsm.go(`title`),this.ready=!0}async loadSession(e){if(!this.R)throw Error(`loadSession antes de boot()`);let t=await um(e);this.director?.dispose(),this.director=null,this.mission=null,this.usedInteractables.clear(),this.holdT=0,this.session?.dispose(),this.session=new T_(t,{R:this.R,scene:this.renderer.scene,quality:this.renderer.quality,audio:this.audio,rng:this.rng,camera:this.camera,upgrades:new Set(this.profile.upgrades),accuracyMult:1,damageMult:1,onEnemyAlert:e=>this.mission?.onEnemyAlert(e),onCivilianHurt:e=>this.mission?.onCivilianHurt(e)}),this.currentLevel=e,this.renderer.setExposure(t.ambient.exposure),this.camera.setYawPitch(t.spawn.yaw,-.12),this.camera.snap(),this.renderer.prewarm(),this.collisionView.refresh(this.session.physics),this.hud.clearTransient(),this.intelShown=!1,this.hud.setZone(t.name.toUpperCase()),this.hud.setObjective(``),this.hud.setMarkers(0,0),this.hud.setCombatVisible(!0),this.audio.ambience(t.ambience),this.cpIndex=0,this.lastWeaponModel=`none`}saveNow(){this.profile.playtimeSec+=Math.floor(this.autosaveT),this.autosaveT=0,yu(this.store,this.profile)}applySettings(e,t=!0){let n=this.settings;this.settings=e;let r=this.camera.settings;r.mouseSens=Bh.mouseSens*e.mouseSens,r.padSens=Bh.padSens*e.padSens,r.invertY=e.invertY,r.fov=e.fov,r.shake=e.shake,t&&e.preset!==n.preset&&e.preset!==this.renderer.preset&&this.renderer.applyPreset(e.preset),this.renderer.dynamicResolution=e.dynamicResolution,e.dynamicResolution||this.renderer.dyn.reset(),this.renderer.setBrightness(e.brightness),this.audio.setVolumes({master:e.master,music:e.music,sfx:e.sfx,ui:e.ui}),this.input.setBindings(e.bindings),document.documentElement.style.setProperty(`--ui-scale`,String(e.uiScale)),this.hud.setHintsEnabled(e.hints),e.aimToggle||(this.aimLatched=!1),this.hintsFor&&this.setHintsFor(this.hintsFor),this.mission?.refreshText(),t&&Rf(this.store,e)}newGame(){bu(this.store),this.profile=lu(),yu(this.store,this.profile),this.goToHub()}onStateChange(e,t){let n=e===`hub`||e===`playing`;this.input.capturing=n,n||(this.aimLatched=!1),this.input.endStep(),this.sim.reset(),this.hud.setVisible(n||e===`paused`||e===`dead`),e===`title`?this.screens.show(`title`):e===`paused`?this.screens.show(`pause`):e!==`hubMenu`&&this.screens.hide(),e!==`dead`&&this.hud.hideDeath(),!n&&document.pointerLockElement&&e!==`dead`&&document.exitPointerLock(),this.updateCaptureOverlay()}async goToHub(){if(this.loading||!this.fsm.can(`loading`))return;this.loading=!0,this.audio.init(),this.requestLock(),this.fsm.go(`loading`),(this.currentLevel!==`hub`||!this.session||this.mission)&&await this.loadSession(`hub`);let e=this.session;if(!e){this.loading=!1;return}let t=e.data.spawn;e.respawnAt(new H(t.pos[0],t.pos[1]+.02,t.pos[2]),t.yaw),e.combat.respawnReset(),this.camera.setYawPitch(t.yaw,-.12),this.camera.snap(),this.director?.dispose(),this.director=new lm({session:e,hud:this.hud,audio:this.audio,profile:this.profile,save:()=>this.saveNow(),dialog:e=>this.openMenu(()=>this.screens.showDialog(e))}),this.setHintsFor(`hub`),this.fsm.go(`hub`),this.loading=!1}async playLevel(e,t={}){if(this.loading||!this.fsm.can(`loading`))return;this.loading=!0,this.audio.init(),this.requestLock(),this.fsm.go(`loading`),(e!==this.currentLevel||!this.session||this.director||this.mission)&&await this.loadSession(e);let n=this.session;if(!n){this.loading=!1;return}let r=n.data.spawn;n.respawnAt(new H(r.pos[0],r.pos[1]+.02,r.pos[2]),r.yaw),n.combat.respawnReset(),t.drill&&n.enemies.spawnEvent(`drill`),this.camera.setYawPitch(r.yaw,-.12),this.camera.snap(),this.setHintsFor(e),this.fsm.go(`playing`),this.loading=!1}playArena(){this.playLevel(`arena`)}startMission(e){ru[e].available&&this.startContract(e)}async startContract(e){if(this.loading||!this.fsm.can(`loading`))return;this.loading=!0,this.audio.init(),this.fsm.go(`loading`),await this.loadSession(O_[e]);let t=this.session;if(!t){this.loading=!1;return}this.lastMission=e,this.outcome=null,this.mission=new Wm({session:t,block:e===`gauntlet`?ym:void 0,label:e=>this.input.label(e),hud:this.hud,audio:this.audio,profile:this.profile,save:()=>this.saveNow(),onFinished:e=>this.onMissionFinished(e)}),this.hud.setMarkers(0,this.mission.markersTotal),this.setHintsFor(e===`gauntlet`?`practice`:t.data.id),this.fsm.go(`briefing`);let n=this.mission.current?.kind===`learn`;this.screens.showBriefing(ru[e],()=>this.beginContract(),()=>void this.goToHub(),n?()=>{this.beginContract(),this.mission?.skipLearn()}:null),this.loading=!1}beginContract(){this.fsm.state===`briefing`&&(this.screens.hide(),this.requestLock(),this.fsm.go(`playing`))}onMissionFinished(e){this.outcome=e,(this.fsm.state===`playing`||this.fsm.state===`dead`)&&this.fsm.go(`results`);let t=[{label:k_.time,value:e.rank.subs.time},{label:k_.accuracy,value:e.rank.subs.accuracy},{label:k_.damage,value:e.rank.subs.damage},{label:k_.variety,value:e.rank.subs.variety}];e.rank.subs.civilians!==null&&t.push({label:k_.civilians,value:e.rank.subs.civilians});let n={missionName:ru[e.mission].name,success:e.success,failReason:e.failReason,rank:e.rank.rank,total:e.rank.total,capped:e.rank.capped,subs:t,timeSec:e.timeSec,kills:e.kills,markersUsed:e.markersUsed,markersTotal:e.markersTotal,coins:e.coinsReward,achievements:e.achievements.map(e=>({name:e.name,coins:e.coins})),newBest:e.newBest,styleScore:this.session?.combat.style.score??0,gauntlet:e.gauntlet?{waves:e.gauntlet.waves,position:e.gauntlet.position,top:e.gauntlet.top.map(e=>({waves:e.waves,score:e.score}))}:null};this.audio.ui(e.success?`coin`:`error`),this.screens.showResults(n,()=>void this.startContract(e.mission),()=>void this.goToHub())}setHintsFor(e){this.hintsFor=e;let t=e=>this.input.label(e),n=Om(`{move}`,t),r=`${t(`weapon1`)} / ${t(`weapon2`)} / ${t(`weapon3`)}`;e===`hub`?this.hud.setHints([{key:n,text:`Mover`},{key:t(`interact`),text:`Hablar · leer · usar el ascensor`},{key:t(`intel`),text:`Intel (mantener)`},{key:t(`sprint`),text:`Sprint`},{key:t(`help`),text:`Controles`}]):e===`arena`?this.hud.setHints([{key:n,text:`Mover`},{key:t(`sprint`),text:`Sprint`},{key:t(`crouch`),text:`Agacharse · deslizar (corriendo) · cubrirse (junto a pared)`},{key:t(`jump`),text:`Saltar · vault sobre obstáculos bajos`},{key:`2× ${t(`jump`)} / ${t(`dodge`)}`,text:`Esquiva (voltereta)`},{key:t(`aim`),text:`Apuntar`},{key:t(`shoulder`),text:`Cambiar de hombro`},{key:t(`intel`),text:`Intel (mantener)`},{key:t(`help`),text:`Controles`}]):this.hud.setHints([{key:t(`fire`),text:`Disparar`},{key:t(`aim`),text:`Apuntar`},{key:t(`reload`),text:`Recargar (otra vez en la zona dorada = perfecta)`},{key:r,text:`Carabina · pistola · cuchillo`},{key:t(`takedown`),text:`Takedown (cerca del enemigo)`},{key:t(`focus`),text:`Foco: cámara lenta`},{key:t(`intel`),text:`Intel (mantener)`},{key:t(`help`),text:`Controles`}])}pause(){(this.fsm.state===`playing`||this.fsm.state===`hub`)&&(this.session?.player.haltOnPause(),this.fsm.go(`paused`))}resume(){this.fsm.state===`paused`&&(this.requestLock(),this.fsm.go(this.fsm.resumeTo))}quitToTitle(){this.fsm.state===`paused`&&(this.saveNow(),this.fsm.go(`title`))}openMenu(e){if(this.fsm.state===`hub`)this.fsm.go(`hubMenu`);else if(this.fsm.state!==`hubMenu`)return;this.session?.player.haltOnPause(),e()}closeMenu(){this.fsm.state===`hubMenu`&&(this.screens.hide(),this.requestLock(),this.fsm.go(`hub`))}buyUpgrade(e){Eu(this.profile,e)?(this.audio.ui(`coin`),this.saveNow(),this.session?.combat.applyOwned(new Set(this.profile.upgrades)),this.screens.refresh()):this.audio.ui(`error`)}interact(e){let t=this.profile;switch(this.audio.ui(`click`),e.action){case`talk:charon`:t.flags.charonMet?this.openMenu(()=>this.screens.showDialog($p.charonBoard,()=>this.screens.show(`contracts`))):this.openMenu(()=>this.screens.showDialog($p.charonFirst,()=>{t.flags.charonMet=!0,this.saveNow(),this.hud.setObjective(tm.objectiveHub),this.screens.show(`contracts`)}));break;case`talk:sommelier`:{let e=!t.flags.sommelierMet;this.openMenu(()=>this.screens.showDialog(e?$p.sommelierFirst:$p.sommelierRepeat,()=>{t.flags.sommelierMet=!0,this.screens.show(`shop`)}));break}case`talk:winston`:{let e=!t.flags.winstonMet;this.openMenu(()=>this.screens.showDialog(e?$p.winstonFirst:$p.winstonRepeat,()=>{t.flags.winstonMet=!0,this.saveNow(),this.closeMenu()}));break}case`read:rules`:{let e=e=>this.input.label(e);this.openMenu(()=>this.screens.showDialog(em({interact:e(`interact`),fire:e(`fire`),crouch:e(`crouch`),jump:e(`jump`),takedown:e(`takedown`),reload:e(`reload`),focus:e(`focus`),sprint:e(`sprint`)})));break}case`goto:practice`:this.startContract(`practice`);break;case`goto:hub`:this.goToHub();break;default:this.mission?(this.mission.onInteract(e.id),this.usedInteractables.add(e.id),this.nearInteractable=null,this.audio.ui(`confirm`)):console.warn(`[hub] acción desconocida`,e.action)}}requestLock(){if(!this.opts.pointerLock)return;let e=this.renderer.canvas;if(document.pointerLockElement===e)return;let t=e=>{console.warn(`[pointer lock] rechazado:`,e instanceof Error?e.message:e),this.updateCaptureOverlay()};e.requestPointerLock({unadjustedMovement:!0}).catch(n=>{n instanceof DOMException&&n.name===`NotSupportedError`?e.requestPointerLock().catch(t):t(n)})}updateCaptureOverlay(){let e=this.opts.pointerLock&&this.fsm.controlling&&!this.input.pointerLocked;this.captureOverlay.hidden=!e}onInputEvent(e){switch(e){case`blur`:case`hidden`:this.pause();break;case`pointerlock-lost`:this.opts.pointerLock&&this.pause(),this.updateCaptureOverlay();break;case`pointerlock-gained`:this.updateCaptureOverlay();break;case`pad-connected`:this.hud.showToast(`Gamepad conectado`);break;case`pad-disconnected`:this.hud.showToast(`Gamepad desconectado`)}}frame(e,t){if(this.pendingLagMs>0){let e=performance.now()+this.pendingLagMs;for(this.pendingLagMs=0;performance.now()<e;);}let n=performance.now();this.renderer.checkResize(),this.input.pollGamepad(),this.handleFrameActions(e),this.updateIntel(),this.updateMusic();let r=this.session,i=this.fsm.controlling;this.input.consumeMouse(this.mouse),i&&(this.input.padLookAxis(this.pad),this.camera.look(this.mouse.x,this.mouse.y,this.pad.x,this.pad.y,e),this.autosaveT+=e,this.autosaveT>=N_&&this.saveNow()),r&&(r.combat.frameUpdate(e,this.audio),this.deathSlowmo=Math.max(0,this.deathSlowmo-e),this.sim.timeScale=this.deathSlowmo>0?.4:r.combat.timeScale,this.audio.setMuffle(r.combat.focusActive?.55:0));let a=this.profiling?performance.now():0;if(this.fsm.simulating&&r&&!this.manual){let t=this.sim.advance(e);for(let e=0;e<t;e++)this.fixedUpdate(Ql)}let o=this.profiling?performance.now():0,s=this.manual?1:this.sim.alpha,c=e*this.sim.timeScale,l=i||this.fsm.state===`paused`||this.fsm.state===`dead`||this.fsm.state===`hubMenu`;r&&l?(this.updatePlayerView(s,e,c),r.enemies.renderUpdate(s,c),r.civilians?.renderUpdate(s,c),r.vfx.update(c),r.renderNpcs(c),this.director?.frameUpdate(c),i&&this.updateBeacon()):this.updateAttractCamera(e),r&&(i||this.fsm.state===`dead`)&&this.updateHud(e),this.audio.setListener(this.renderer.camera.position,this.camera.forward),this.debug.update(e,()=>this.debugText()),this.collisionView.enabled&&r&&this.collisionView.refresh(r.physics),this.fsm.simulating||this.input.endStep();let u=this.profiling?performance.now():0;if(this.renderer.render(),this.lastCpuMs=performance.now()-n,this.profiling){let e=this.prof;e.frames++,e.sim+=o-a,e.view+=u-o,e.render+=performance.now()-u}this.stats.push(e*1e3,this.lastCpuMs),this.renderer.updateDynamicResolution(this.stats.avgFrameMs(60),e)}updateMusic(){let e=this.session,t=this.fsm.state,n=null;t===`title`?n=`hub`:e&&t!==`boot`&&t!==`loading`&&(n=this.mission?.id===`gauntlet`?`gauntlet`:this.director?.hostile?`tension`:e.data.music),this.audio.setMusic(n);let r=this.musicIn;if(r.fighting=0,r.searching=0,e&&t!==`title`)for(let t of e.enemies.enemies){if(!t.alive)continue;let e=t.state;e===`combat`||e===`cover`||e===`flank`?r.fighting++:(e===`search`||e===`suspicious`)&&r.searching++}let i=this.mission?.current;r.boss=i?.kind===`boss`,r.escape=i?.kind===`escape`,r.hostile=!!this.director?.hostile||this.mission?.id===`gauntlet`&&this.mission.gauntletBreak<=0,r.onMission=!!this.mission||this.currentLevel===`practice`||this.currentLevel===`arena`;let a=t===`paused`||t===`results`||t===`briefing`||t===`hubMenu`||t===`title`;this.audio.setMusicIntensity(a?Math.min(.2,Uu(r)):Uu(r)),this.audio.duckMusic(a),this.audio.updateMusic()}updateIntel(){let e=this.fsm.controlling&&this.input.isDown(`intel`);e!==this.intelShown&&(this.intelShown=e,this.hud.setIntel(e?this.intelView():null))}intelView(){let e=this.session,t=this.mission,n=e?.data,r=new Set;if(t?.id===`gauntlet`)for(let e of[`thug`,`escort`,`marksman`,`heavy`])r.add(e);else if(t)for(let e of n?.enemies??[])r.add(e.type);else if(this.director?.hostile)for(let e of n?.enemies??[])e.spawnOn?.startsWith(`excom-`)&&r.add(e.type);let i=[];if(t){let e=ru[t.id];i.push(e.briefing[1]??``),i.push(e.briefing[2]??``),n?.mission?.alarm&&!t.alarmDisabled&&i.push(t.alarmSounded?`La alarma ya ha sonado.`:`Si alguien da la voz de alarma llegan refuerzos. Busca el panel para desactivarla.`)}else this.currentLevel===`hub`&&(i.push(this.director?.hostile?tm.intelHostile:tm.intelNeutral),i.push(tm.intelContracts));return{title:t?ru[t.id].name:n?.name??``,place:t?ru[t.id].place:n?.subtitle??``,objective:t?t.currentText:``,markers:t?{used:t.markersUsed,total:t.markersTotal}:null,notes:i.filter(e=>e.length>0),enemies:[...r],civilians:(n?.civilians.length??0)>0,alive:e&&(t||this.director?.hostile)?e.enemies.aliveCount:null}}handleFrameActions(e){let t=this.input;this.screens.current===`controls`||this.screens.current===`settings`?(t.pressed(`pause`)||this.screens.current===`controls`&&t.pressed(`help`))&&(t.consume(`pause`),t.consume(`help`),this.screens.closeSub()):this.fsm.state===`hubMenu`?t.pressed(`pause`)&&this.screens.current!==`dialog`&&(t.consume(`pause`),this.closeMenu()):this.fsm.state!==`briefing`&&this.fsm.state!==`results`&&(this.fsm.state===`dead`?(this.deathTimer+=e,this.deathTimer>=M_&&(t.pressed(`jump`)||t.pressed(`fire`)||t.pressed(`interact`))&&(t.consume(`jump`),t.consume(`fire`),t.consume(`interact`),this.respawn())):(t.pressed(`pause`)&&(t.consume(`pause`),this.fsm.state===`paused`?this.resume():t.pointerLocked||this.pause()),t.pressed(`help`)&&(t.consume(`help`),this.fsm.controlling&&this.pause(),(this.fsm.state===`paused`||this.fsm.state===`title`)&&this.screens.show(`controls`)),this.fsm.controlling&&t.pressed(`shoulder`)&&(t.consume(`shoulder`),this.camera.toggleShoulder())))}aimHeld(){return this.settings.aimToggle?this.aimLatched:this.input.isDown(`aim`)}buildIntent(){let e=this.intent,t=this.input;return t.moveAxis(this.move),e.moveX=this.move.x,e.moveY=this.move.y,e.camYaw=this.camera.yaw,e.sprint=t.isDown(`sprint`),this.settings.aimToggle&&t.pressed(`aim`)&&(this.aimLatched=!this.aimLatched),e.aim=this.aimHeld(),e.crouchPressed=t.pressed(`crouch`),e.jumpPressed=t.pressed(`jump`),e.dodgePressed=t.pressed(`dodge`),e}buildCombatIntent(){let e=this.cIntent,t=this.input;return e.fireHeld=t.isDown(`fire`),e.firePressed=t.pressed(`fire`),e.aim=this.aimHeld(),e.reloadPressed=t.pressed(`reload`),e.takedownPressed=t.pressed(`takedown`),e.focusPressed=t.pressed(`focus`),e.select=t.pressed(`weapon1`)?`carbine`:t.pressed(`weapon2`)?`pistol`:t.pressed(`weapon3`)?`knife`:null,e.cycle=t.pressed(`weaponNext`)?1:t.pressed(`weaponPrev`)?-1:0,e}fixedUpdate(e){let t=this.session;if(!t)return;let n=this.profiling?performance.now():0,r=this.fsm.controlling,i=this.nearInteractable;if(r&&i&&this.interactionsAllowed){let t=i.hold??0;if(t>0)this.input.isDown(`interact`)?(this.input.consume(`jump`),this.holdT+=e,this.holdT>=t&&(this.holdT=0,this.interact(i))):this.holdT=0;else if(this.input.pressed(`interact`)&&(this.input.consume(`interact`),this.input.consume(`jump`),this.interact(i),!this.fsm.controlling)){this.input.endStep();return}}else this.holdT=0;let a=r?this.buildIntent():this.idleIntent;t.player.fixedUpdate(e,a);let o=r?this.buildCombatIntent():this.idleCIntent;t.infiniteAmmo&&(t.combat.weapon.mag=Math.max(t.combat.weapon.mag,1)),t.combat.fixedUpdate(e,o,t.ctx);let s=this.profiling?performance.now():0;t.enemies.fixedUpdate(e,t.updateTarget(e));let c=this.profiling?performance.now():0;t.civilians?.fixedUpdate(e);let l=this.profiling?performance.now():0;t.pickups.update(e),this.director?.fixedUpdate(e),this.fsm.state===`playing`&&this.mission?.fixedUpdate(e);let u=this.profiling?performance.now():0;if(t.physics.step(),this.profiling){let e=this.prof,t=performance.now();e.steps++,e.enemies+=c-s,e.civilians+=l-c,e.physics+=t-u,e.player+=s-n+(u-l)}this.steps++,this.opts.qa&&(this.checkPlayerInvariants(),this.checkCombatInvariants()),t.combat.dead&&this.fsm.controlling&&this.onPlayerDeath(),this.input.endStep()}get interactionsAllowed(){return!this.director?.hostile&&this.mission?.id!==`gauntlet`}onPlayerDeath(){let e=this.session;if(!e)return;this.deathReturn=this.fsm.state===`hub`?`hub`:`playing`,this.fsm.go(`dead`),this.deathTimer=0,this.deathSlowmo=.9,this.director?.onPlayerDied();let t=this.input.label(`jump`);if(this.mission){let n=this.mission.onPlayerDied();if(this.hud.setMarkers(this.mission.markersUsed,this.mission.markersTotal),!n)return;let r=this.mission.markersLeft;this.hud.showDeath(e.combat.deathCause(this.camera.yaw),`Gastas un marcador de sangre (${r} restante${r===1?``:`s`}). Pulsa ${t} o clic para volver al último punto de control.`)}else this.hud.showDeath(e.combat.deathCause(this.camera.yaw),`Pulsa ${t} o clic para reaparecer`)}respawn(){let e=this.session;if(!e||this.fsm.state!==`dead`)return;let t=this.mission,n=t?t.respawnPos:new H(e.data.spawn.pos[0],e.data.spawn.pos[1],e.data.spawn.pos[2]),r=t?t.respawnYaw:e.data.spawn.yaw;e.respawnAt(new H(n.x,n.y+.02,n.z),r),e.combat.respawnReset(),e.enemies.resetAlive(),this.aimLatched=!1,this.camera.setYawPitch(r,-.12),this.camera.snap(),this.hud.hideDeath(),this.fsm.go(this.deathReturn)}updateBeacon(){let e=this.session,t=this.mission;if(!e||!t||!t.beacon(I_)){this.hud.setBeacon(null);return}let n=I_.distanceTo(e.player.feet),r=this.renderer.camera,i=this.renderer.canvas.clientWidth||window.innerWidth,a=this.renderer.canvas.clientHeight||window.innerHeight;I_.project(r);let o=I_.z>1,s=o?-I_.x:I_.x,c=o?-I_.y:I_.y;if(!o&&Math.abs(s)<=A_&&Math.abs(c)<=A_){this.hud.setBeacon({x:(s+1)/2*i,y:(1-c)/2*a,onScreen:!0,angle:0,distance:n});return}let l=Math.max(Math.abs(s),Math.abs(c))/A_;l>1e-6&&(s/=l,c/=l);let u=Math.atan2(s,c)*180/Math.PI;this.hud.setBeacon({x:(s+1)/2*i,y:(1-c)/2*a,onScreen:!1,angle:u,distance:n})}updatePlayerView(e,t,n){let r=this.session;if(!r)return;let i=r.player;i.renderFeet(e,F_),this.camera.update({feet:F_,posture:i.posture,aiming:i.aiming,sprinting:i.sprinting,dt:t},r.physics),this.opts.qa&&this.checkCameraInvariants();let a=r.playerRig;a.root.position.copy(F_);let o=i.renderYaw(e);a.root.rotation.y=o;let s=r.combat,c=s.holstered?`none`:D_[s.current];c!==this.lastWeaponModel&&(this.lastWeaponModel=c,a.setWeapon(c));let l=this.pose;l.speed=i.stepSpeed(Ql);let u=i.feet.x-i.prevFeet.x,d=i.feet.z-i.prevFeet.z;l.moveAngle=Math.hypot(u,d)>1e-4?Math.atan2(-u,-d)-o:0,l.state=i.state,l.posture=i.posture,l.grounded=i.grounded,l.aim=!s.holstered&&(i.aiming||s.weapon.cooldown>0)?1:0,l.aimPitch=this.camera.pitch,l.stateTime=i.stateTime,l.reload=s.weapon.reloadProgress,l.recoil=s.recoilVis,l.melee=s.meleeT>0?Math.sin((1-s.meleeT/.45)*Math.PI):0,a.update(l,n),a.setOpacity(this.camera.distanceToHead<.55?0:1)}updateAttractCamera(e){this.orbit+=e;let t=this.renderer.camera,n=this.session?.data.attract;if(n){let e=.5-.5*Math.cos(2*Math.PI*this.orbit/n.period);R_.set(n.from[0],n.from[1],n.from[2]),z_.set(n.to[0],n.to[1],n.to[2]),t.position.lerpVectors(R_,z_,e),t.lookAt(n.look[0],n.look[1],n.look[2]);return}let r=this.orbit*B_;t.position.set(Math.sin(r)*V_,H_,Math.cos(r)*V_),t.lookAt(L_)}updateHud(e){let t=this.session;if(!t)return;let n=t.combat,r=n.weapon,i=this.hudData;i.health=n.vitals.health,i.maxHealth=n.vitals.maxHealth,i.armor=n.vitals.armor,i.maxArmor=n.vitals.maxArmor,i.weaponName=r.def.name,i.isGun=r.isGun,i.mag=r.mag,i.magMax=r.def.mag,i.reserve=r.reserve,i.slots.length!==n.loadout.length&&(i.slots=n.loadout.map(()=>({key:``,name:``,active:!1}))),n.loadout.forEach((e,t)=>{let r=i.slots[t];r.key=this.input.label(j_[e]),r.name=e===`carbine`?`Carabina`:e===`shotgun`?`Escopeta`:e===`pistol`?`Pistola`:`Cuchillo`,r.active=e===n.current}),i.reload=r.reloadProgress,i.perfect=r.perfectAvailable?r.perfectWindow:null;let a=this.renderer.camera.fov*Math.PI/180,o=window.innerHeight/2/Math.tan(a/2);i.spreadPx=Math.max(4,Math.min(60,Math.tan(n.spreadDeg*Math.PI/180)*o)),i.blocked=n.blocked,i.aimOverEnemy=n.aimOver===`enemy`,i.aimOverCivilian=n.aimOver===`civilian`,i.hitKind=n.hitMarker.kind,i.hitT=n.hitMarker.t;for(let e=0;e<i.damage.length;e++){let r=n.damageDirs[e],a=i.damage[e];a.k=r.t>0?Math.min(1,r.t/.6):0,a.k>0&&(a.angle=Jl(Math.atan2(-(r.from.x-t.player.feet.x),-(r.from.z-t.player.feet.z))-this.camera.yaw))}if(i.multiplier=n.style.multiplier,i.rankName=n.style.rankName,i.gauge=n.style.gauge,i.score=n.style.score,i.feed=n.feed,i.focus=n.focus,i.focusActive=n.focusActive,i.focusReady=n.focus>=30,i.focusKey=this.input.label(`focus`),this.hud.update(i,e),this.hud.setCrosshairVisible(!n.holstered),this.peekTimer-=e,this.peekTimer<=0){this.peekTimer=.1;let e=this.nearInteractable;this.nearInteractable=this.fsm.controlling&&this.interactionsAllowed?t.nearestInteractable(this.camera.yaw,this.usedInteractables):null,this.nearInteractable!==e&&(this.holdT=0),this.hud.setPrompt(this.contextPrompt())}}contextPrompt(){let e=this.session;if(!e||!this.fsm.controlling)return null;let t=e.player,n=e=>this.input.label(e),r=this.nearInteractable;if(r){let e=r.hold??0;return e>0?{key:`Mantén ${n(`interact`)}`,text:this.holdT>0?`${r.prompt} · ${Math.min(99,Math.round(this.holdT/e*100))} %`:r.prompt}:{key:n(`interact`),text:r.prompt}}if(e.combat.takedownCandidate(e.ctx))return{key:n(`takedown`),text:`Takedown`};if(t.state===`cover`&&t.cover)return t.cover.height===`low`?{key:`${n(`aim`)} / ${n(`jump`)}`,text:`Asomarse · saltar por encima  ·  C: salir`}:{key:n(`aim`),text:`Asomarse  ·  C: salir de cobertura`};let i=t.peekContext(this.camera.yaw,this.move.x,this.move.y);return i.vault?{key:n(`jump`),text:i.vault===`vault`?`Saltar por encima`:`Subir`}:i.cover?{key:n(`crouch`),text:i.cover===`low`?`Cubrirse (cobertura baja)`:`Cubrirse`}:null}checkPlayerInvariants(){let e=this.session;if(!e)return;let t=this.invariants;t.steps++;let n=e.player;n.penetration()&&(t.penetrations++,t.lastViolation=`penetración en ${n.feet.x.toFixed(2)},${n.feet.y.toFixed(2)},${n.feet.z.toFixed(2)} (${n.state})`);let r=e.data.bounds,i=n.feet;(i.x<r.min[0]-.5||i.x>r.max[0]+.5||i.z<r.min[2]-.5||i.z>r.max[2]+.5||i.y>r.max[1]+2)&&(t.outOfBounds++,t.lastViolation=`fuera de límites en ${i.x.toFixed(2)},${i.y.toFixed(2)},${i.z.toFixed(2)}`)}checkCombatInvariants(){let e=this.session;if(!e)return;let t=e.combat,n=e.player;for(let e of t.weapons.values())(e.mag<0||e.mag>e.def.mag||e.reserve<0||Number.isNaN(e.reserve)||e.reloading&&!e.isGun||e.reloading&&e.reloadT>e.reloadDur+.05)&&(this.combatInconsistencies++,this.invariants.lastViolation=`arma ${e.def.id} inconsistente: mag=${e.mag} reserva=${e.reserve} recargando=${e.reloading}`);t.takedown&&n.state!==`locked`&&!t.dead&&(this.combatInconsistencies++,this.invariants.lastViolation=`takedown activo sin jugador bloqueado`),!t.takedown&&n.state===`locked`&&(this.combatInconsistencies++,this.invariants.lastViolation=`jugador bloqueado sin takedown`),t.dead!==(n.state===`dead`)&&(this.combatInconsistencies++,this.invariants.lastViolation=`muerte desincronizada: combate=${t.dead} jugador=${n.state}`),(t.vitals.health<0||t.vitals.armor<0||t.vitals.health>t.vitals.maxHealth)&&(this.combatInconsistencies++,this.invariants.lastViolation=`vitales fuera de rango`)}checkCameraInvariants(){let e=this.session;if(!e)return;let t=this.invariants,n=this.camera.position;e.physics.overlapsBall(n,.1,ud.STATIC)&&(t.cameraInside++,t.lastViolation=`cámara dentro de geometría en ${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)}`),P_.copy(this.camera.pivot),e.physics.lineOfSight(n,P_,ud.STATIC)||(t.cameraOccluded++,t.lastViolation=`jugador tapado desde la cámara en ${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)}`)}stepManual(e){let t=this.session;if(t)for(let n=0;n<e;n++)this.camera.look(0,0,0,0,Ql),this.fixedUpdate(Ql),this.updatePlayerView(1,Ql,Ql),t.enemies.renderUpdate(1,Ql),t.vfx.update(Ql),t.combat.frameUpdate(Ql,this.audio),this.director?.frameUpdate(Ql),(this.fsm.controlling||this.fsm.state===`dead`)&&(this.updateHud(Ql),this.updateBeacon())}stepManualCameraOnly(){let e=this.session;e&&(e.player.renderFeet(1,F_),this.camera.update({feet:F_,posture:e.player.posture,aiming:e.player.aiming,sprinting:e.player.sprinting,dt:0},e.physics))}qaRefreshHud(){this.updateHud(0)}qaRespawn(){this.fsm.state===`dead`&&this.respawn()}qaInteract(){let e=this.session;if(!e||!this.fsm.controlling||!this.interactionsAllowed)return!1;let t=e.nearestInteractable(this.camera.yaw,this.usedInteractables);return t?(this.nearInteractable=t,this.interact(t),!0):!1}resetInvariants(){let e=this.invariants;if(e.steps=e.penetrations=e.cameraInside=e.cameraOccluded=e.outOfBounds=0,e.lastViolation=``,this.combatInconsistencies=0,this.session){let e=this.session.player;e.nanResets=0,e.killPlaneResets=0,e.maxHorizontalSpeed=0}}spawnEnemyAhead(e,t=10){let n=this.session;if(!n)return;let r=n.player.feet,i=this.camera.yaw,a=r.x-Math.sin(i)*t,o=r.z-Math.cos(i)*t,s=n.nav.nearestNode(a,r.y,o,4);if(s<0)return;let c=n.nav.pos(s,new H);n.enemies.spawnAt(e,c,i+Math.PI,r.clone())}registerDebugCommands(){let e=this.debug;e.addCommand(`collisions`,`Colisiones`,()=>{this.collisionView.setEnabled(!this.collisionView.enabled),this.session&&this.collisionView.refresh(this.session.physics)},{hotkey:`KeyU`,isOn:()=>this.collisionView.enabled}),e.addCommand(`god`,`God mode`,()=>{this.session&&(this.session.god=!this.session.god)},{hotkey:`KeyG`,isOn:()=>!!this.session?.god}),e.addCommand(`ammo`,`Munición infinita`,()=>{this.session&&(this.session.infiniteAmmo=!this.session.infiniteAmmo)},{hotkey:`KeyM`,isOn:()=>!!this.session?.infiniteAmmo}),e.addCommand(`spawn`,`Spawn enemigo`,()=>this.spawnEnemyAhead(this.rng.pick([`thug`,`escort`,`heavy`])),{hotkey:`KeyJ`}),e.addCommand(`killAll`,`Matar enemigos`,()=>{let e=this.session;if(e)for(let t of e.enemies.enemies)t.alive&&t.applyHit(9999,`body`,e.player.feet,1,!0)},{hotkey:`KeyK`}),e.addCommand(`coins`,`+10 monedas`,()=>{Mu(this.profile,10),this.saveNow(),this.screens.refresh()},{hotkey:`KeyI`}),e.addCommand(`nextCheckpoint`,`Siguiente checkpoint`,()=>{let e=this.session;if(!e||e.data.checkpoints.length===0)return;this.cpIndex=(this.cpIndex+1)%e.data.checkpoints.length;let t=e.data.checkpoints[this.cpIndex];t&&(e.respawnAt(new H(t.pos[0],t.pos[1]+.02,t.pos[2]),t.yaw),this.camera.setYawPitch(t.yaw,-.12),this.camera.snap())},{hotkey:`KeyN`}),e.addCommand(`speed`,`Velocidad ×3 (estrés)`,()=>{let e=this.session?.player;e&&(e.speedMultiplier=e.speedMultiplier===1?3:1)},{hotkey:`KeyP`,isOn:()=>(this.session?.player.speedMultiplier??1)!==1}),e.addCommand(`slowmo`,`Cámara lenta`,()=>{let e=this.session?.combat;e&&(e.focus=100,e.focusActive=!e.focusActive)},{hotkey:`KeyO`,isOn:()=>!!this.session?.combat.focusActive})}debugText(){let e=this.renderer.renderer.info,t=this.session,n=t?.player,r=[`FPS ${this.stats.fps(60).toFixed(0)}  (${this.stats.avgFrameMs(60).toFixed(2)} ms, peor ${this.stats.worstFrameMs(120).toFixed(1)} ms)`,`CPU ${this.stats.avgCpuMs(60).toFixed(2)} ms   pasos ${this.steps}   escala de tiempo ×${this.sim.timeScale.toFixed(2)}`,`Draw calls ${e.render.calls}   triángulos ${e.render.triangles}   programas ${e.programs?.length??0}`,`Geometrías ${e.memory.geometries}   texturas ${e.memory.textures}`,`Resolución ×${this.renderer.pixelRatio.toFixed(2)}  (dinámica ×${this.renderer.dynamicScale.toFixed(1)})  preset ${this.renderer.preset}`,`Estado ${this.fsm.state}   nivel ${t?.data.name??`—`}   colliders ${t?.physics.colliderCount??0}   nav ${t?.nav.nodeCount??0} nodos`,`Perfil: ${this.profile.coins} monedas   mejoras ${this.profile.upgrades.join(`,`)||`—`}   excomunicados ${this.profile.excommunicados}`];if(n&&t){let e=t.enemies.qaStats();r.push(`Jugador ${n.feet.x.toFixed(2)}, ${n.feet.y.toFixed(2)}, ${n.feet.z.toFixed(2)}  ${n.state}/${n.posture}  suelo=${n.grounded?`sí`:`no`}  v=${n.stepSpeed(Ql).toFixed(2)} m/s`,`Salud ${Math.ceil(t.combat.vitals.health)}  armadura ${Math.ceil(t.combat.vitals.armor)}  arma ${t.combat.current} ${t.combat.weapon.mag}/${t.combat.weapon.reserve}  ${t.combat.holstered?`enfundada`:``}`,`Enemigos vivos ${e.alive}/${e.total}  atascos ${e.stuckEvents}  máx. sin avanzar ${e.maxNoProgress.toFixed(1)} s  ${Object.entries(e.states).map(([e,t])=>`${e}:${t}`).join(` `)}`,`Hub ${this.director?`${this.director.state} oleada ${this.director.rules.wave}`:`—`}   cámara dist ${this.camera.distanceToHead.toFixed(2)}  yaw ${this.camera.yaw.toFixed(2)}`,`Input mantenidas ${this.input.heldCount}  pointer lock ${this.input.pointerLocked?`sí`:`no`}  dispositivo ${this.input.lastDevice}`)}if(this.opts.qa){let e=this.invariants;r.push(`QA penetraciones ${e.penetrations}  cámara dentro ${e.cameraInside}  tapada ${e.cameraOccluded}  fuera ${e.outOfBounds}  combate ${this.combatInconsistencies}`)}return r.push(`GPU ${this.renderer.gpuInfo()}`),r.join(`
`)}},W_=new URLSearchParams(window.location.search),G_=W_.has(`qa`)||!1,K_=W_.get(`preset`),q_=K_===`low`||K_===`medium`||K_===`high`?K_:void 0,J_=W_.get(`level`),Y_=J_===`arena`||J_===`practice`?J_:`hub`,X_=!G_||W_.get(`lock`)===`1`;function Z_(){let e=document.getElementById(`game-root`),t=document.getElementById(`ui-root`);if(!e||!t)throw Error(`Faltan #game-root o #ui-root en index.html`);let n=new U_(e,t,{qa:G_,preset:q_,startLevel:Y_,pointerLock:X_});G_&&Nu(n),n.boot().catch(hh)}try{Z_()}catch(e){hh(e)}