/* CuriosityLab: dependency-free finite-domain Gaussian-process BO. */
(function(root){
'use strict';
const styles=['問題','反直覺','類比','直接定義'];
const space=styles.flatMap((_,style)=>[0,1,2].flatMap(gap=>[1,2,3].map(links=>({style,gap,links}))));
const key=x=>`${x.style}-${x.gap}-${x.links}`;
const clamp=x=>Math.max(0,Math.min(1,x));
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
function kernel(a,b){return .12*Math.exp(-.8*(a.style!==b.style)-.65*(a.gap-b.gap)**2-.45*(a.links-b.links)**2);}
function chol(A){let n=A.length,L=Array.from({length:n},()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let s=A[i][j];for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];L[i][j]=i===j?Math.sqrt(Math.max(s,1e-12)):s/L[j][j];}return L;}
function forward(L,b){let y=[];for(let i=0;i<b.length;i++){let s=b[i];for(let j=0;j<i;j++)s-=L[i][j]*y[j];y.push(s/L[i][i]);}return y;}
function backward(L,b){let x=Array(b.length).fill(0);for(let i=b.length-1;i>=0;i--){let s=b[i];for(let j=i+1;j<b.length;j++)s-=L[j][i]*x[j];x[i]=s/L[i][i];}return x;}
function fit(D,noise=.018){if(!D.length)return ()=>({mu:.5,sd:Math.sqrt(.12)});let L=chol(D.map((a,i)=>D.map((b,j)=>kernel(a.x,b.x)+(i===j?noise:0))));let alpha=backward(L,forward(L,D.map(d=>d.y-.5)));return x=>{let k=D.map(d=>kernel(x,d.x)),v=forward(L,k);return {mu:.5+k.reduce((s,z,i)=>s+z*alpha[i],0),sd:Math.sqrt(Math.max(0,kernel(x,x)-v.reduce((s,z)=>s+z*z,0)))};};}
function next(D,random,method='bo'){let used=new Set(D.map(d=>key(d.x))),pool=space.filter(x=>!used.has(key(x)));if(!pool.length)pool=space;if(D.length<4||method==='random')return {x:pool[Math.floor(random()*pool.length)],mode:'random'};let pred=fit(D),best=null;for(let x of pool){let {mu,sd}=pred(x),acq=mu+1.65*sd;if(!best||acq>best.acq)best={x,mu,sd,acq,mode:'UCB'};}return best;}
function score(c,e,l){return .2*c+.4*e+.4*l;}
// Synthetic user only: hidden preferences and feature interactions, not human evidence.
function profile(random){return {style:Math.floor(random()*4),gap:random()*2,links:1+random()*2,interaction:(random()-.5)*.16};}
function truth(x,p){let s=x.style===p.style?1:.35,g=Math.exp(-.9*(x.gap-p.gap)**2),l=Math.exp(-.7*(x.links-p.links)**2);let c=clamp(.12+.45*s+.28*g+.08*l),e=clamp(.08+.28*s+.32*g+.25*l+p.interaction*(x.gap-1)),q=clamp(.18+.20*s+.35*g+.19*l);return score(c,e,q);}
function simulate(seed,budget,method,p){let random=rng(seed),noise=rng(seed+98765),D=[],curve=[],best=-Infinity,opt=Math.max(...space.map(x=>truth(x,p)));for(let i=0;i<budget;i++){let {x}=next(D,random,method),actual=truth(x,p),y=clamp(actual+(noise()-.5)*.14);D.push({x,y});best=Math.max(best,actual);curve.push(opt-best);}return {D,curve,opt};}
function benchmark(seeds=40,budget=18){let bo=Array(budget).fill(0),random=bo.slice(),wins=0;for(let i=0;i<seeds;i++){let seed=100+i*127,p=profile(rng(seed+77)),a=simulate(seed,budget,'bo',p),b=simulate(seed,budget,'random',p);a.curve.forEach((v,j)=>bo[j]+=v/seeds);b.curve.forEach((v,j)=>random[j]+=v/seeds);if(a.curve.at(-1)<b.curve.at(-1)-1e-10)wins++;}return {bo,random,wins,seeds,budget};}
const api={styles,space,key,rng,fit,next,score,profile,truth,simulate,benchmark};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BO=api;
})(typeof globalThis!=='undefined'?globalThis:this);

