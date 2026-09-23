export const agents = [
 {id:'faculdade',name:'Faculdade',area:'Engenharia da Computação',description:'Do primeiro conceito à solução. Aprenda, pratique e prepare seus trabalhos.',tags:['Disciplinas','Exercícios','Programação'],color:'#4359cc',wash:'#edf0ff',prompt:'Quero entender um conteúdo da faculdade. Ajude-me a organizar os conceitos e praticar.'},
 {id:'concursos',name:'Concursos',area:'Preparação com direção',description:'Transforme seu edital em um plano de estudo que cabe na sua rotina.',tags:['Editais','Planejamento','Revisões'],color:'#a16b12',wash:'#fff5de',prompt:'Quero montar um plano de estudos para concurso. O que você precisa saber para começar?'},
 {id:'ipe',name:'IPE Trading',area:'Pesquisa e comércio exterior',description:'Estruture pesquisas, analise mercados e desenvolva relatórios profissionais.',tags:['Mercados','Exportação','Relatórios'],color:'#107b76',wash:'#e3f5ef',prompt:'Preciso estruturar uma pesquisa para a IPE Trading. Vamos definir o briefing e as fontes necessárias.'},
 {id:'carreira',name:'Carreira & Tecnologia',area:'Seu próximo passo profissional',description:'Conecte suas experiências, estudos e projetos às oportunidades que busca.',tags:['Currículo','Certificações','Projetos'],color:'#9b4787',wash:'#faeaf4',prompt:'Quero planejar meu desenvolvimento profissional a partir das minhas experiências e objetivos.'},
] as const;
export type AgentId = typeof agents[number]['id'];
export type Conversation = {id:string;agent_id:AgentId;title:string;updated_at:string};
export type Message = {id:string;role:'user'|'assistant';content:string;created_at:string};
export type Run = {id:string;status:string;error:string|null};

