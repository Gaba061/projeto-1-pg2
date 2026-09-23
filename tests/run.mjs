import ts from 'typescript';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync('work',{recursive:true});
for(const name of ['hub-service','provider','agents','instructions','certificate-service']){
 const src=readFileSync('lib/'+name+'.ts','utf8');
 const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/from '\.\/(agents|provider|instructions)'/g,"from './$1-test.mjs'");
 writeFileSync('work/'+name+'-test.mjs',js);
}
await import('./service.test.mjs');
await import('./certificate.test.mjs');

