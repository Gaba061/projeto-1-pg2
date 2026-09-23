import {agents,type AgentId} from './agents';
import {instructions,AGENT_VERSION} from './instructions';
import {respond,type InputMessage,type ProviderConfig,type N8nRequestContext} from './provider';
type Context={db:D1Database|undefined;user:string|null;config:ProviderConfig|null;dailyLimit:number;defer:(p:Promise<unknown>)=>void;provider?:typeof respond};
type Conv={id:string;user_id:string;agent_id:AgentId;title:string};
type Row={id:string;role:'user'|'assistant';content:string;seq:number};
type RunRow={id:string;conversation_id:string;message_id:string;request_key:string;status:string;error:string|null};
class Fault extends Error{constructor(public code:number,message:string){super(message);}}
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=(s:unknown):s is string=>typeof s==='string'&&/^[a-f0-9-]{36}$/i.test(s);
const now=()=>new Date().toISOString();
export async function handleHub(request:Request,ctx:Context):Promise<Response>{
 try{
 const parts=new URL(request.url).pathname.replace(/^\/api\/hub\/?/,'').split('/').filter(Boolean);
 const {db,user}=ctx;
 if(parts[0]==='status'&&request.method==='GET'){
  let storageReady=false;if(db&&user){try{await db.prepare('SELECT id FROM conversations LIMIT 1').first();storageReady=true;}catch{}}
  return reply({authenticated:!!user,storageReady,aiReady:!!ctx.config,provider:ctx.config?.kind||null,model:ctx.config?.model||null,dailyLimit:ctx.dailyLimit});
 }
 if(!user)throw new Fault(401,'Entre na sua conta para acessar as conversas.');
 if(!db)throw new Fault(503,'O histórico ainda não está conectado. Sua mensagem permanece no campo de texto.');
 const method=request.method;
 if(method!=='GET'){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)throw new Fault(403,'Origem da solicitação não autorizada.');
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Fault(415,'Formato de solicitação inválido.');
 }
 // Recover executions abandoned by a worker restart without reissuing provider calls.
 await db.prepare("UPDATE runs SET status='failed',error='A resposta foi interrompida. Você pode tentar novamente.',finished_at=? WHERE user_id=? AND status='running' AND created_at<?").bind(now(),user,new Date(Date.now()-60000).toISOString()).run();
 if(parts[0]==='export'&&method==='GET'){
  const conversations=await db.prepare('SELECT * FROM conversations WHERE user_id=? ORDER BY created_at').bind(user).all();
  const messages=await db.prepare('SELECT m.* FROM messages m JOIN conversations c ON c.id=m.conversation_id WHERE c.user_id=? ORDER BY m.seq').bind(user).all();
  return new Response(JSON.stringify({format:'gabriel-ai-hub',version:1,exportedAt:now(),conversations:conversations.results,messages:messages.results},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="gabriel-ai-hub-conversas.json"','Cache-Control':'no-store'}});
 }
 if(parts[0]!=='conversations')throw new Fault(404,'Página não encontrada.');
 let body:Record<string,unknown>={};
 if(method!=='GET'){
  if(Number(request.headers.get('content-length')||0)>60000)throw new Fault(413,'Mensagem muito longa.');
  const raw=await request.text();if(raw.length>50000)throw new Fault(413,'Mensagem muito longa.');
  try{body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();}catch{throw new Fault(400,'Solicitação inválida.');}
 }
 if(parts.length===1){
  if(method==='GET')return reply({conversations:(await db.prepare('SELECT id,agent_id,title,updated_at FROM conversations WHERE user_id=? ORDER BY updated_at DESC LIMIT 200').bind(user).all()).results});
  if(method==='POST'){
   if(!agents.some(a=>a.id===body.agentId)||!uuid(body.id))throw new Fault(400,'Escolha um agente válido.');
   const existing=await db.prepare('SELECT user_id,agent_id FROM conversations WHERE id=?').bind(body.id).first<{user_id:string;agent_id:string}>();
   if(existing){if(existing.user_id!==user||existing.agent_id!==body.agentId)throw new Fault(409,'Não foi possível criar esta conversa.');return reply({id:body.id});}
   await db.prepare('INSERT INTO conversations(id,user_id,agent_id,title,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(body.id,user,body.agentId,'Nova conversa',now(),now()).run();return reply({id:body.id},201);
  }
 }
 const id=parts[1];if(!uuid(id))throw new Fault(404,'Conversa não encontrada.');
 const conv=await db.prepare('SELECT * FROM conversations WHERE id=? AND user_id=?').bind(id,user).first<Conv>();
 if(!conv)throw new Fault(404,'Conversa não encontrada.');
 const snapshot=async()=>({messages:(await db.prepare('SELECT id,role,content,created_at FROM messages WHERE conversation_id=? ORDER BY seq').bind(id).all()).results,run:await db.prepare('SELECT id,status,error FROM runs WHERE conversation_id=? ORDER BY created_at DESC,rowid DESC LIMIT 1').bind(id).first()});
 if(parts.length===2&&method==='GET')return reply(await snapshot());
 const action=parts[2];
 if(action==='cancel'&&method==='POST'){
  await db.prepare("UPDATE runs SET status='cancelled',error='Resposta interrompida por você.',finished_at=? WHERE conversation_id=? AND user_id=? AND status='running'").bind(now(),id,user).run();return reply(await snapshot());
 }
 if(!['messages','retry'].includes(action)||method!=='POST')throw new Fault(404,'Ação não encontrada.');
 if(!uuid(body.key))throw new Fault(400,'Identificador da mensagem inválido.');
 const previous=await db.prepare('SELECT * FROM runs WHERE user_id=? AND request_key=?').bind(user,body.key).first<RunRow>();
 if(previous){
  if(previous.conversation_id!==id)throw new Fault(409,'Solicitação já utilizada em outra conversa.');
  const original=await db.prepare('SELECT content FROM messages WHERE id=?').bind(previous.message_id).first<{content:string}>();
  if(action==='messages'&&original?.content!==String(body.content||'').trim())throw new Fault(409,'A mensagem mudou. Inicie um novo envio.');
  return reply(await snapshot());
 }
 const running=await db.prepare("SELECT id FROM runs WHERE user_id=? AND status='running'").bind(user).first();
 if(running)throw new Fault(409,'Aguarde ou interrompa a resposta em andamento antes de enviar outra mensagem.');
 let messageId=crypto.randomUUID(),content='';
 if(action==='retry'){
  const last=await db.prepare('SELECT * FROM messages WHERE conversation_id=? ORDER BY seq DESC LIMIT 1').bind(id).first<Row>();
  const lastRun=await db.prepare('SELECT status FROM runs WHERE conversation_id=? ORDER BY created_at DESC,rowid DESC LIMIT 1').bind(id).first<{status:string}>();
  if(!last||last.role!=='user'||!lastRun||!['failed','cancelled'].includes(lastRun.status))throw new Fault(409,'Não há uma resposta pendente para tentar novamente.');
  if(!ctx.config)throw new Fault(503,'Conecte a IA para tentar novamente.');
  messageId=last.id;content=last.content;
 }else{
  content=typeof body.content==='string'?body.content.trim():'';
  if(!content||content.length>12000)throw new Fault(400,'Escreva uma mensagem de até 12.000 caracteres.');
 }
 const runId=crypto.randomUUID(),date=now();
 const batch:D1PreparedStatement[]=[];
 if(action==='messages')batch.push(db.prepare('INSERT INTO messages(id,conversation_id,role,content,created_at) VALUES(?,?,?,?,?)').bind(messageId,id,'user',content,date));
 // The quota check and running-user uniqueness are part of the same atomic batch.
 // A NULL status violates NOT NULL and rolls the entire operation back at the quota.
 batch.push(db.prepare(`INSERT INTO runs(id,conversation_id,user_id,message_id,request_key,agent_version,model,status,error,charged_attempt,created_at)
 VALUES(?,?,?,?,?,?,?,CASE WHEN ?=0 THEN 'failed' WHEN (SELECT COALESCE(SUM(charged_attempt),0) FROM runs WHERE user_id=? AND created_at>=?) < ? THEN 'running' ELSE NULL END,?,?,?)`).bind(runId,id,user,messageId,body.key,AGENT_VERSION,ctx.config?.model||null,ctx.config?1:0,user,date.slice(0,10)+'T00:00:00.000Z',ctx.dailyLimit,ctx.config?null:'Mensagem salva. Conecte a IA para receber uma resposta.',ctx.config?1:0,date));
 batch.push(db.prepare("UPDATE conversations SET updated_at=?, title=CASE WHEN title='Nova conversa' THEN ? ELSE title END WHERE id=? AND user_id=?").bind(date,content.slice(0,70),id,user));
 try{await db.batch(batch);}catch(e){const duplicate=await db.prepare('SELECT id FROM runs WHERE user_id=? AND request_key=?').bind(user,body.key).first();if(duplicate)return reply(await snapshot());throw new Fault(409,'O limite diário foi atingido ou existe outra resposta em andamento. Sua mensagem não foi enviada.');}
 if(ctx.config){const task=executeRun(ctx,conv,runId);ctx.defer(task);}
 return reply(await snapshot(),202);
 }catch(e){if(e instanceof Fault)return reply({error:e.message},e.code);console.error('Hub request failed',e instanceof Error?e.name:'Error');return reply({error:'Não foi possível acessar o histórico. Tente novamente; seu texto permanece no campo.'},503);}
}
async function executeRun(ctx:Context,conv:Conv,runId:string){
 const db=ctx.db!;const controller=new AbortController();let poll:ReturnType<typeof setInterval>|undefined;
 const timeout=setTimeout(()=>controller.abort(),24000);
 try{
  const state=await db.prepare('SELECT status,request_key FROM runs WHERE id=?').bind(runId).first<{status:string;request_key:string}>();if(state?.status!=='running')return;
  poll=setInterval(()=>{db.prepare('SELECT status FROM runs WHERE id=?').bind(runId).first<{status:string}>().then(r=>{if(r?.status!=='running')controller.abort();}).catch(()=>controller.abort());},1200);
  const history=await db.prepare('SELECT role,content FROM messages WHERE conversation_id=? ORDER BY seq DESC LIMIT 30').bind(conv.id).all<InputMessage>();
  const input:InputMessage[]=[];let chars=0;
  for(const row of history.results){if(chars+row.content.length>48000)break;input.unshift(row);chars+=row.content.length;}
  const systemInstructions=instructions(conv.agent_id)+'\nO contexto pode conter apenas as mensagens recentes desta conversa. Peça novamente detalhes antigos se não estiverem presentes.';
  const result=ctx.config?.kind==='n8n'
   ?await respond(ctx.config,systemInstructions,input,controller.signal,fetch,{
      userId:conv.user_id,agentId:conv.agent_id,conversationId:conv.id,requestId:state.request_key,
      message:input.filter(m=>m.role==='user').at(-1)?.content||'',userMemory:{},agentMemory:{},attachments:[],locale:'pt-BR',timezone:'America/Sao_Paulo'
    } as N8nRequestContext)
   :await (ctx.provider||respond)(ctx.config!,systemInstructions,input,controller.signal);
  await db.batch([
   db.prepare("UPDATE runs SET status='completed',finished_at=?,input_tokens=?,output_tokens=? WHERE id=? AND status='running'").bind(now(),result.usage?.input_tokens||0,result.usage?.output_tokens||0,runId),
   db.prepare("INSERT INTO messages(id,conversation_id,role,content,created_at) SELECT ?,?,'assistant',?,? WHERE EXISTS(SELECT 1 FROM runs WHERE id=? AND status='completed')").bind(crypto.randomUUID(),conv.id,result.text,now(),runId),
   db.prepare('UPDATE conversations SET updated_at=? WHERE id=?').bind(now(),conv.id)
  ]);
 }catch(e){
  const message=controller.signal.aborted?'A resposta excedeu o tempo disponível ou foi interrompida. Tente novamente.':e instanceof Error?e.message:'Não foi possível gerar a resposta.';
  try{await db.prepare("UPDATE runs SET status='failed',error=?,finished_at=? WHERE id=? AND status='running'").bind(message,now(),runId).run();}catch{console.error('Hub execution persistence failed');}
 }finally{clearTimeout(timeout);if(poll)clearInterval(poll);}
}

