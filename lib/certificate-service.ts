type CertificateContext={db:D1Database|undefined;bucket:R2Bucket|undefined;user:string|null};
type CertificateRow={id:string;title:string;issuer:string;issued_at:string|null;credential_id:string|null;skills:string;filename:string;mime_type:string;size_bytes:number;created_at:string;object_key?:string};
class CertificateFault extends Error{constructor(public code:number,message:string){super(message);}}
const MAX_FILE_SIZE=8*1024*1024;
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=(value:string)=>/^[a-f0-9-]{36}$/i.test(value);
const text=(form:FormData,name:string,max:number,required=false)=>{
 const value=form.get(name);const clean=typeof value==='string'?value.trim():'';
 if(required&&!clean)throw new CertificateFault(400,`Preencha ${name==='title'?'o nome do certificado':'a instituição'}.`);
 if(clean.length>max)throw new CertificateFault(400,'Um dos campos ultrapassou o tamanho permitido.');
 return clean;
};
function detectedMime(bytes:Uint8Array){
 if(bytes[0]===0x25&&bytes[1]===0x50&&bytes[2]===0x44&&bytes[3]===0x46)return'application/pdf';
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return'image/jpeg';
 if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47)return'image/png';
 if(bytes[0]===0x52&&bytes[1]===0x49&&bytes[2]===0x46&&bytes[3]===0x46&&bytes[8]===0x57&&bytes[9]===0x45&&bytes[10]===0x42&&bytes[11]===0x50)return'image/webp';
 return null;
}
function parseSkills(value:string){
 const skills=[...new Set(value.split(/[,;\n]/).map(item=>item.trim()).filter(Boolean))];
 if(skills.length>12||skills.some(item=>item.length>50))throw new CertificateFault(400,'Informe no máximo 12 habilidades curtas.');
 return skills;
}
export async function handleCertificates(request:Request,ctx:CertificateContext):Promise<Response>{
 try{
  const parts=new URL(request.url).pathname.replace(/^\/api\/hub\/?/,'').split('/').filter(Boolean);
  const {db,bucket,user}=ctx;
  if(!user)throw new CertificateFault(401,'Entre na sua conta para acessar seus certificados.');
  if(!db)throw new CertificateFault(503,'O cadastro de certificados ainda não está conectado.');
  if(parts[0]!=='certificates')throw new CertificateFault(404,'Página não encontrada.');
  if(request.method==='GET'&&parts.length===1){
   const rows=(await db.prepare('SELECT id,title,issuer,issued_at,credential_id,skills,filename,mime_type,size_bytes,created_at FROM certificates WHERE user_id=? ORDER BY COALESCE(issued_at,created_at) DESC,created_at DESC LIMIT 200').bind(user).all<CertificateRow>()).results;
   return reply({certificates:rows.map(row=>({...row,skills:JSON.parse(row.skills)})),attachmentsReady:!!bucket});
  }
  if(request.method==='GET'&&parts.length===3&&parts[2]==='file'){
   if(!bucket)throw new CertificateFault(503,'O armazenamento de arquivos ainda não está conectado.');
   if(!uuid(parts[1]))throw new CertificateFault(404,'Certificado não encontrado.');
   const row=await db.prepare('SELECT object_key,filename,mime_type FROM certificates WHERE id=? AND user_id=?').bind(parts[1],user).first<CertificateRow>();
   if(!row?.object_key)throw new CertificateFault(404,'Certificado não encontrado.');
   const object=await bucket.get(row.object_key);if(!object)throw new CertificateFault(404,'Arquivo não encontrado.');
   return new Response(object.body,{headers:{'Content-Type':row.mime_type,'Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(row.filename)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(request.method!=='POST'||parts.length!==1)throw new CertificateFault(404,'Ação não encontrada.');
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new CertificateFault(403,'Origem da solicitação não autorizada.');
  if(!bucket)throw new CertificateFault(503,'O armazenamento de anexos ainda não está conectado.');
  if(Number(request.headers.get('content-length')||0)>MAX_FILE_SIZE+100_000)throw new CertificateFault(413,'O arquivo deve ter no máximo 8 MB.');
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))throw new CertificateFault(415,'Envie o certificado pelo formulário de anexos.');
  const form=await request.formData();
  const title=text(form,'title',140,true),issuer=text(form,'issuer',140,true),issuedAt=text(form,'issuedAt',10),credentialId=text(form,'credentialId',120),skills=parseSkills(text(form,'skills',800));
  if(issuedAt&&!/^\d{4}-\d{2}-\d{2}$/.test(issuedAt))throw new CertificateFault(400,'Informe uma data válida.');
  const value=form.get('file');if(!(value instanceof File)||!value.size)throw new CertificateFault(400,'Selecione um certificado em PDF ou imagem.');
  if(value.size>MAX_FILE_SIZE)throw new CertificateFault(413,'O arquivo deve ter no máximo 8 MB.');
  const mime=detectedMime(new Uint8Array(await value.slice(0,12).arrayBuffer()));
  if(!mime)throw new CertificateFault(415,'Use um arquivo PDF, JPG, PNG ou WebP válido.');
  const id=crypto.randomUUID(),safeUser=user.replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,100),objectKey=`certificates/${safeUser}/${id}`,createdAt=new Date().toISOString();
  await bucket.put(objectKey,value.stream(),{httpMetadata:{contentType:mime},customMetadata:{owner:user,certificateId:id}});
  try{await db.prepare('INSERT INTO certificates(id,user_id,title,issuer,issued_at,credential_id,skills,filename,mime_type,size_bytes,object_key,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,user,title,issuer,issuedAt||null,credentialId||null,JSON.stringify(skills),value.name.slice(0,240)||'certificado',mime,value.size,objectKey,createdAt).run();}
  catch(error){await bucket.delete(objectKey);throw error;}
  return reply({certificate:{id,title,issuer,issued_at:issuedAt||null,credential_id:credentialId||null,skills,filename:value.name.slice(0,240)||'certificado',mime_type:mime,size_bytes:value.size,created_at:createdAt}},201);
 }catch(error){
  if(error instanceof CertificateFault)return reply({error:error.message},error.code);
  console.error('Certificate request failed',error instanceof Error?error.name:'Error');
  return reply({error:'Não foi possível salvar o certificado. Tente novamente.'},503);
 }
}

