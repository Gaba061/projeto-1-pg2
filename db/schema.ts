import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex, check } from 'drizzle-orm/sqlite-core';
export const conversations=sqliteTable('conversations',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),agentId:text('agent_id').notNull(),title:text('title').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('idx_conversations_user_updated').on(t.userId,t.updatedAt),check('valid_agent',sql`${t.agentId} in ('faculdade','concursos','ipe','carreira')`)]);
export const messages=sqliteTable('messages',{
 seq:integer('seq').primaryKey({autoIncrement:true}),id:text('id').notNull().unique(),conversationId:text('conversation_id').notNull().references(()=>conversations.id,{onDelete:'cascade'}),role:text('role').notNull(),content:text('content').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('idx_messages_conversation_seq').on(t.conversationId,t.seq),check('valid_role',sql`${t.role} in ('user','assistant')`)]);
export const runs=sqliteTable('runs',{
 id:text('id').primaryKey(),conversationId:text('conversation_id').notNull().references(()=>conversations.id,{onDelete:'cascade'}),userId:text('user_id').notNull(),messageId:text('message_id').notNull().references(()=>messages.id),requestKey:text('request_key').notNull(),agentVersion:text('agent_version').notNull(),model:text('model'),status:text('status').notNull(),error:text('error'),inputTokens:integer('input_tokens'),outputTokens:integer('output_tokens'),chargedAttempt:integer('charged_attempt').notNull().default(0),createdAt:text('created_at').notNull(),finishedAt:text('finished_at'),
},t=>[uniqueIndex('idx_runs_user_request').on(t.userId,t.requestKey),uniqueIndex('idx_runs_one_active_user').on(t.userId).where(sql`${t.status} = 'running'`),index('idx_runs_conversation_created').on(t.conversationId,t.createdAt),index('idx_runs_user_date').on(t.userId,t.createdAt),check('valid_status',sql`${t.status} in ('running','completed','failed','cancelled')`)]);
export const certificates=sqliteTable('certificates',{
 id:text('id').primaryKey(),
 userId:text('user_id').notNull(),
 title:text('title').notNull(),
 issuer:text('issuer').notNull(),
 issuedAt:text('issued_at'),
 credentialId:text('credential_id'),
 skills:text('skills').notNull().default('[]'),
 filename:text('filename').notNull(),
 mimeType:text('mime_type').notNull(),
 sizeBytes:integer('size_bytes').notNull(),
 objectKey:text('object_key').notNull().unique(),
 createdAt:text('created_at').notNull(),
},t=>[index('idx_certificates_user_created').on(t.userId,t.createdAt),check('valid_certificate_size',sql`${t.sizeBytes} > 0 and ${t.sizeBytes} <= 8388608`)]);

