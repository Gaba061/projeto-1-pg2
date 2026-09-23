import ts from 'typescript';
import {readFileSync,writeFileSync} from 'node:fs';
const code=ts.transpileModule(readFileSync('app/message-content.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
writeFileSync('work/message-content-test.mjs',code);
const {default:Content}=await import('../work/message-content-test.mjs');
const {createElement}=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');const {default:assert}=await import('node:assert/strict');
const html=renderToStaticMarkup(createElement(Content,{text:'# Resumo\n\n**Importante**\n\n$$E=mc^2$$\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```js\nconst n = 1;\n```\n\n<script>alert(1)</script>\n\n[link](javascript:alert(1))\n\n![imagem](https://example.com/tracker.png)'}));
assert.match(html,/<h1>Resumo/);assert.match(html,/<table>/);assert.match(html,/katex/);assert.match(html,/<pre>/);assert.doesNotMatch(html,/<script|javascript:|<img/);console.log('PASS: títulos, fórmulas, tabelas e código; HTML e imagens externas não executados');

