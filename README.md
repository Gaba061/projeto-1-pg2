# Gabriel AI Hub

Plataforma pessoal de Gabriel para Faculdade, Concursos, IPE Trading e Carreira & Tecnologia.

## Estado da entrega

MVP A implementado e publicado: painel responsivo, quatro configurações de agente, autenticação pelo Sites, conversas e mensagens em D1, retomada, exportação JSON, tratamento de falhas, idempotência, limite diário, cancelamento e motores intercambiáveis OpenAI/Ollama.

Em 17/09/2026, a conexão local OpenAI foi configurada com chave aprovada, gpt-5.4-mini e 20 tentativas por dia. A chave autenticou, mas a geração real retornou credit_balance_exhausted: faltam créditos na API. O backend também aceita Ollama local, sem mudar os agentes ou o histórico. Em ambientes sem um motor configurado, a IA fica desativada e o aplicativo salva mensagens sem fabricar respostas. Memória permanente, anexos, pesquisa web, roteamento automático e personalização dos agentes pertencem às próximas etapas.

## Desenvolvimento

Node >= 22.13. Use o gerenciador e lockfile existentes. `npm run dev` inicia a prévia. `npm run build` gera o Worker. `node tests/run.mjs` verifica os fluxos essenciais; `npx tsc --noEmit` verifica tipos.

O starter simula login apenas na prévia local. A publicação privada é protegida pelo controle de acesso do Sites. As rotas validam a identidade encaminhada pela plataforma e o proprietário da conversa. Não expor o Worker diretamente sem a camada de autenticação da plataforma.

## Banco

Esquema em `db/schema.ts`. Migração inicial em `drizzle/`. Na prévia, aplicar as migrações pendentes via Wrangler usando `dist/server/wrangler.json` e `.wrangler/state`, depois do build. No Sites, migrações acompanham o pacote da versão.

Uma execução ativa por usuário; unicidade de chave de envio por usuário. Reserva do limite, criação da mensagem e execução ocorrem na mesma transação. Repetir uma solicitação com a mesma chave não chama o provedor novamente. Cada execução registra a versão das instruções e o uso informado pelo provedor.

## Ativação da IA

Configurar no ambiente do Sites:
- AI_PROVIDER: `openai` ou `ollama`.
- OPENAI_API_KEY: segredo, nunca no navegador ou repositório.
- OPENAI_MODEL: identificador de modelo acessível na conta.
- OLLAMA_BASE_URL: endereço local permitido (`localhost` ou `127.0.0.1`).
- OLLAMA_MODEL: modelo instalado, inicialmente sugerido `qwen3.5:4b`.
- AI_DAILY_REQUEST_LIMIT: inteiro de 1 a 500; valor inicial local: 20, ajustável.

O limite conta tentativas iniciadas, incluindo falhas após o início, por dia UTC. É um limite de quantidade, não de valor em dinheiro. O limite financeiro deve ser gerenciado separadamente na conta do provedor conforme necessário. Uma mudança de ambiente exige republicação.

A skill de publicação orienta usar o plugin OpenAI Developers para criar/reutilizar a chave com aprovação do usuário. O plugin foi habilitado e a chave local foi criada com aprovação, sem exposição no chat. Não solicitar chave por mensagem de chat.

O adaptador usa Responses API, store:false, até 3.000 tokens de saída, 30 mensagens recentes e até 48.000 caracteres de histórico. Nesta primeira entrega a resposta aparece quando concluída, com indicação de processamento; streaming de tokens ainda não foi implementado. Timeout de 24 segundos limita o trabalho posterior à resposta HTTP no Worker; pedidos longos podem exigir uma arquitetura de execução durável na próxima evolução. Cancelamento é persistido e tenta abortar a chamada em andamento; não garante devolução de consumo já ocorrido.

## Dados e recuperação

A exportação JSON autenticada preserva conversas, agentes associados, mensagens e datas. O original permanece no banco. Para restaurar, validar `format`, `version`, conteúdo e IDs; importar conversas e mensagens em transação sob o proprietário autenticado de destino, preservando a ordem das mensagens e remapeando conflitos de IDs. Não restaurar execuções antigas como ativas. A importação automatizada e backups agendados ainda não estão disponíveis; serão necessários antes de depender do Hub como única cópia de informações importantes.

## Verificações

Testes usam SQLite real em arquivo temporário e provedor substituto, sem chamadas pagas: autenticação, isolamento, persistência após reabrir banco, duplicação, nova tentativa, quota com rollback, concorrência, cancelamento, exportação, origem externa e contrato do provedor. Não equivalem a validação de resposta real do modelo.

Prévia local verificada com envio, recarga e retomada de uma mensagem de teste, telas desktop e celular e seleção por WebMCP. O conteúdo de teste local não é enviado ao banco de produção.

## Referências

- https://developers.openai.com/api/docs/quickstart
- https://github.com/remarkjs/react-markdown
- https://github.com/remarkjs/remark-math

## Validação de conexão — 17/09/2026

A consulta autenticada de modelos retornou 200. O teste Responses e a nova tentativa da mensagem pendente no próprio Hub retornaram falta de créditos. A mensagem original permaneceu salva, sem duplicação nem resposta simulada. Os avisos distinguem saldo esgotado, cota, excesso temporário de pedidos, chave inválida e acesso ao modelo. A primeira versão privada foi publicada; novos commits precisam ser criados no PowerShell externo porque o Codex protege a pasta `.git`.
# n8n production gateway

The Hub can use the published Gabriel AI Hub n8n workflow as its server-side AI provider. Configure these runtime variables in the local `.env` or the hosted Site runtime settings:

```text
AI_PROVIDER=n8n
N8N_WEBHOOK_URL=https://gaba061.app.n8n.cloud/webhook/gabriel-ai-hub
N8N_WEBHOOK_SECRET=<optional shared secret>
AI_DAILY_REQUEST_LIMIT=20
```

The Hub sends `userId`, `agentId`, `conversationId`, `requestId`, the latest message, locale, timezone and attachment/memory placeholders to the webhook. The n8n response must include a non-empty `reply`; the backend keeps the local conversation history and uses `requestId` as the retry/idempotency key. Keep the webhook URL and secret in runtime configuration, never in client code.

