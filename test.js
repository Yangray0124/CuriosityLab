'use strict';
const assert=require('node:assert/strict'),BO=require('./optimizer'),topics=require('./topics');
assert.equal(BO.space.length,36);
assert.equal(new Set(BO.space.map(BO.key)).size,36);
assert.equal(topics.length,36);
assert.equal(new Set(topics.map(t=>t.title)).size,36);
for(const t of topics){for(const k of ['tag','title','q','sur','analogy','direct','hint','body','quiz'])assert(typeof t[k]==='string'&&t[k].length>0);assert.equal(t.extra.length,3);assert(t.extra.every(e=>e.length===2&&e.every(Boolean)));assert.equal(t.opts.length,3);assert(Number.isInteger(t.ans)&&t.ans>=0&&t.ans<t.opts.length);}
assert.equal(BO.score(1,1,1),1);assert.equal(BO.score(0,0,0),0);
const x=BO.space[0],p=BO.fit([])(x),q=BO.fit([{x,y:.9}])(x);assert(q.mu>p.mu&&q.sd<p.sd);
const r=BO.benchmark(40,18);assert.deepEqual(r.bo.slice(0,4),r.random.slice(0,4));assert(r.bo.every(Number.isFinite)&&r.random.every(Number.isFinite));assert(r.bo.every((v,i)=>!i||v<=r.bo[i-1]+1e-12));
const a=BO.simulate(42,36,'bo',BO.profile(BO.rng(1)));assert.equal(new Set(a.D.map(d=>BO.key(d.x))).size,36);assert.equal(a.curve.at(-1),0);
console.log('All optimizer and 36-topic content tests passed.');
console.log(JSON.stringify({seeds:r.seeds,budget:r.budget,bo:r.bo.at(-1),random:r.random.at(-1),wins:r.wins}));
