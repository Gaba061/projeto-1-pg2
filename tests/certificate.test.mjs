import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync,mkdtempSync} from 'node:fs';
import {handleCertificates} from '../work/certificate-service-test.mjs';
const dir=mkdtempSync('work/certificate-');const sql=new DatabaseSync(dir+'/certificates.sqlite');sql.exec('PRAGMA foreign_keys=ON');
for(const file of readdirSync('drizzle').filter(file=>file.endsWith('.sql')).sort())sql.exec(readFileSync('drizzle/'+file,'utf8'));
function statement(query,params=[]){return{bind(...values){return statement(query,values);},async first(){return sql.prepare(query).get(...params)||null;},async all(){return{results:sql.prepare(query).all(...params)};},async run(){return sql.prepare(query).run(...params);}};}
const db={prepare:statement};const objects=new Map();
const bucket={async put(key,stream){objects.set(key,new Uint8Array(await new Response(stream).arrayBuffer()));},async get(key){const value=objects.get(key);return value?{body:new Blob([value]).stream()}:null;},async delete(key){objects.delete(key);}};
async function call(path,{method='GET',user='gabriel',form,bucketOverride=bucket}={}){const request=new Request('https://hub.test/api/hub/'+path,{method,headers:form?{Origin:'https://hub.test'}:undefined,body:form});return handleCertificates(request,{db,bucket:bucketOverride,user});}
assert.equal((await call('certificates',{user:null})).status,401);
const form=new FormData();form.set('title','Fundamentos de Redes');form.set('issuer','Cisco');form.set('issuedAt','2026-09-01');form.set('skills','Redes, Segurança, Redes');form.set('file',new File([new Uint8Array([0x25,0x50,0x44,0x46,0x2d,0x31])],'redes.pdf',{type:'application/pdf'}));
let response=await call('certificates',{method:'POST',form});assert.equal(response.status,201);const created=await response.json();assert.equal(created.certificate.skills.length,2);assert.equal(objects.size,1);
response=await call('certificates');let listed=await response.json();assert.equal(listed.certificates.length,1);assert.equal(listed.certificates[0].title,'Fundamentos de Redes');
response=await call('certificates',{user:'outro'});listed=await response.json();assert.equal(listed.certificates.length,0);assert.equal((await call(`certificates/${created.certificate.id}/file`,{user:'outro'})).status,404);
response=await call(`certificates/${created.certificate.id}/file`);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/pdf');
const fake=new FormData();fake.set('title','Arquivo falso');fake.set('issuer','Teste');fake.set('file',new File(['isto não é PDF'],'falso.pdf',{type:'application/pdf'}));assert.equal((await call('certificates',{method:'POST',form:fake})).status,415);
assert.equal((await call('certificates',{method:'POST',form,bucketOverride:null})).status,503);
console.log('PASS: certificados privados, arquivo validado, listagem e download isolados por proprietário');sql.close();

