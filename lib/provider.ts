export type ProviderKind='openai'|'ollama'|'n8n';
export type ProviderConfig={kind:ProviderKind;model:string;key?:string;baseUrl?:string;webhookUrl?:string;webhookSecret?:string};
export type InputMessage={role:'user'|'assistant';content:string};
type ProviderResult={text:string;usage?:{input_tokens:number;output_tokens:number}};

export type N8nRequestContext={
 userId:string;
 agentId:string;
 conversationId:string;
 requestId:string;
 message:string;
 userMemory?:unknown;
 agentMemory?:unknown;
 attachments?:unknown[];
 locale?:string;
 timezone?:string;
};

export async function respond(config:ProviderConfig,instructions:string,input:InputMessage[],signal:AbortSignal,fetcher:typeof fetch=fetch,n8nPayload?:N8nRequestContext):Promise<ProviderResult>{
 if(config.kind==='n8n'){
  if(!n8nPayload)throw Error('O endpoint n8n recebeu um contexto incompleto.');
  return respondWithN8n(config,n8nPayload,signal,fetcher);
 }
 return config.kind==='ollama'?respondWithOllama(config,instructions,input,signal,fetcher):respondWithOpenAI(config,instructions,input,signal,fetcher);
}

export async function respondWithN8n(config:ProviderConfig,payload:N8nRequestContext,signal:AbortSignal,fetcher:typeof fetch=fetch):Promise<ProviderResult>{
 if(!config.webhookUrl)throw Error('O endpoint n8n ainda não está configurado.');
 const headers:Record<string,string>={'Content-Type':'application/json'};
 if(config.webhookSecret)headers['X-Gabriel-Hub-Secret']=config.webhookSecret;
 const r=await fetcher(config.webhookUrl,{method:'POST',headers,body:JSON.stringify(payload),signal});
 const d=await r.json().catch(()=>null) as {reply?:unknown;agentId?:unknown;route?:unknown;clarifyingQuestion?:unknown;followUp?:unknown;error?:unknown;message?:unknown;usage?:{input_tokens?:number;output_tokens?:number}}|null;
 if(!r.ok)throw Error(typeof d?.error==='string'?d.error:'O roteador n8n não respondeu corretamente.');
 const route=String(d?.agentId??d?.route??'').trim().toLowerCase();
 const clarification=typeof d?.clarifyingQuestion==='string'?d.clarifyingQuestion.trim():typeof d?.followUp==='string'?d.followUp.trim():'';
 const text=route==='clarify'
  ?(clarification||'Posso ajudar com Faculdade, Concursos, IPE Trading ou Carreira & Tecnologia. Qual dessas áreas você quer usar?')
  :(typeof d?.reply==='string'?d.reply.trim():'');
 if(!text)throw Error('O roteador n8n não retornou uma resposta em texto.');
 return {text,usage:{input_tokens:d?.usage?.input_tokens||0,output_tokens:d?.usage?.output_tokens||0}};
}

async function respondWithOpenAI(config:ProviderConfig,instructions:string,input:InputMessage[],signal:AbortSignal,fetcher:typeof fetch):Promise<ProviderResult>{
 const r=await fetcher('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},body:JSON.stringify({model:config.model,instructions,input,max_output_tokens:3000,store:false}),signal});
 if(!r.ok){
  const detail=await r.json().catch(()=>null) as {error?:{code?:string;type?:string}}|null;
  const code=detail?.error?.code,type=detail?.error?.type;
  if(code==='credit_balance_exhausted')throw Error('O saldo da API acabou. Adicione créditos na conta OpenAI e tente novamente. Sua mensagem continua salva.');
  if(code==='insufficient_quota'||type==='insufficient_quota')throw Error('A conta da API está sem cota disponível. Verifique os créditos e o limite de gastos na OpenAI. Sua mensagem continua salva.');
  if(r.status===401)throw Error('A chave de IA precisa ser verificada.');
  if(r.status===403||code==='model_not_found')throw Error('A conta não tem acesso ao modelo configurado. Verifique o modelo e as permissões da API.');
  if(r.status===429)throw Error('Muitas solicitações em pouco tempo. Aguarde um momento e tente novamente. Sua mensagem continua salva.');
  throw Error('O serviço de IA não respondeu corretamente. Tente novamente.');
 }
 const d=await r.json() as {status:string;output?:{type:string;content?:{type:string;text?:string;refusal?:string}[]}[];usage?:{input_tokens:number;output_tokens:number}};
 if(d.status!=='completed')throw Error('A resposta ficou incompleta. Tente uma solicitação menor.');
 const text=(d.output||[]).filter(o=>o.type==='message').flatMap(o=>o.content||[]).map(c=>c.type==='output_text'?c.text:c.type==='refusal'?c.refusal:'').filter(Boolean).join('\n');
 if(!text.trim())throw Error('A IA não retornou uma resposta em texto.');
 return {text,usage:d.usage};
}

async function respondWithOllama(config:ProviderConfig,instructions:string,input:InputMessage[],signal:AbortSignal,fetcher:typeof fetch):Promise<ProviderResult>{
 const base=(config.baseUrl||'http://127.0.0.1:11434').replace(/\/$/,'');
 const r=await fetcher(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:config.model,messages:[{role:'system',content:instructions},...input],stream:false,options:{num_ctx:4096}}),signal});
 if(!r.ok)throw Error(r.status===404?'O modelo local não está instalado.':'O Ollama local não respondeu corretamente.');
 const d=await r.json() as {message?:{content?:string};prompt_eval_count?:number;eval_count?:number};
 const text=d.message?.content?.trim();
 if(!text)throw Error('O modelo local não retornou uma resposta em texto.');
 return {text,usage:{input_tokens:d.prompt_eval_count||0,output_tokens:d.eval_count||0}};
}

