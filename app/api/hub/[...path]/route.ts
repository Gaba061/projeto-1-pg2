import {env} from 'cloudflare:workers';
import {after} from 'next/server';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {handleHub} from '@/lib/hub-service';
import {handleCertificates} from '@/lib/certificate-service';
export const dynamic='force-dynamic';
async function handler(request:Request){
 const user=await getChatGPTUser();
 const path=new URL(request.url).pathname;
 if(path.startsWith('/api/hub/certificates'))return handleCertificates(request,{db:env.DB,bucket:env.BUCKET,user:user?.userId||null});
 const dailyLimit=Number(env.AI_DAILY_REQUEST_LIMIT);
 const allowanceReady=Number.isInteger(dailyLimit)&&dailyLimit>0&&dailyLimit<=500;
 const localUrl=/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(env.OLLAMA_BASE_URL||'');
 const config=env.AI_PROVIDER==='n8n'&&env.N8N_WEBHOOK_URL?{kind:'n8n' as const,model:'n8n-router',webhookUrl:env.N8N_WEBHOOK_URL,webhookSecret:env.N8N_WEBHOOK_SECRET}:env.AI_PROVIDER==='ollama'&&env.OLLAMA_MODEL&&localUrl?{kind:'ollama' as const,model:env.OLLAMA_MODEL,baseUrl:env.OLLAMA_BASE_URL}:env.OPENAI_API_KEY&&env.OPENAI_MODEL?{kind:'openai' as const,model:env.OPENAI_MODEL,key:env.OPENAI_API_KEY}:null;
 const enabled=allowanceReady&&!!config;
 return handleHub(request,{db:env.DB,user:user?.userId||null,config:enabled?config:null,dailyLimit:enabled?dailyLimit:0,defer:promise=>after(promise)});
}
export {handler as GET,handler as POST,handler as DELETE};

