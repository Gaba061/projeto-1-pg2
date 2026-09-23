'use client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
export default function MessageContent({text}:{text:string}){
 return <div className="message-prose"><Markdown skipHtml remarkPlugins={[remarkGfm,remarkMath]} rehypePlugins={[[rehypeKatex,{trust:false,strict:'ignore',maxExpand:1000}]]} components={{
  a:({href,children})=>href&&/^https?:\/\//i.test(href)?<a href={href} target="_blank" rel="noopener noreferrer">{children}</a>:<span>{children}</span>,
  img:({alt})=><span>[Imagem: {alt||'não carregada'}]</span>,
  table:({children})=><div className="table-scroll"><table>{children}</table></div>,
 }}>{text}</Markdown></div>;
}

