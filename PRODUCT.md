# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O usuário principal é Gabriel. Nesta primeira versão, o produto é privado e usado somente por ele para organizar estudo, faculdade, carreira, trabalho na IPE Trading, certificados, projetos e evolução pessoal.

## Product Purpose

O Gabriel AI Hub é uma central pessoal de evolução. Ele reúne espaços especializados e agentes de IA em um único ambiente, preserva o histórico do usuário e oferece um ponto organizado para transformar estudo, trabalho, carreira e ideias em progresso concreto.

Sucesso significa conseguir abrir o espaço certo rapidamente, retomar o contexto de onde parou e manter seus materiais e conquistas organizados em um só lugar.

## Positioning

O produto combina uma central pessoal de trabalho com agentes especializados por objetivo. A experiência deve permitir escolher entre Faculdade, Concursos, IPE Trading e Carreira & Tecnologia sem perder a identidade, o histórico e o contexto geral do usuário.

## Operating Context

Gabriel utiliza o Hub como espaço pessoal para conversar com agentes, organizar certificados, acompanhar sua carreira e, futuramente, reunir projetos, arquivos, memória especializada e outras ferramentas. O acesso deve permanecer restrito à conta dele nesta primeira versão.

## Capabilities and Constraints

- Agentes iniciais: Faculdade/Engenharia da Computação, Concursos, IPE Trading e Carreira & Tecnologia.
- O Hub já possui uma central de agentes, histórico de conversas, área de carreira e biblioteca privada de certificados.
- Certificados podem ser registrados com instituição, data, credencial, habilidades e arquivo original.
- O produto deve poder evoluir para memória central, memórias especializadas, arquivos, bases de conhecimento, ferramentas específicas e encaminhamento automático para o agente adequado.
- O usuário quer flexibilidade para equilibrar desempenho, privacidade e baixo custo conforme a necessidade, mantendo aberta a escolha do provedor e do modelo de IA.
- A configuração de IA/API não deve ser tratada como requisito para organizar o restante do Hub.
- A execução dos agentes de IA acontece no n8n e chega ao Hub por uma camada server-side própria; a URL do webhook e o segredo opcional ficam somente na configuração de runtime.
- A integração inicial já cobre as quatro rotas, memória persistente, histórico idempotente e confirmação explícita de memórias. O próximo trabalho é validar a experiência no Hub e, depois, adicionar canais externos.
- O projeto de divulgação será separado no futuro e não deve orientar a experiência privada atual.

## Brand Commitments

- Nome: Organized Hub.
- Identidade pessoal associada ao nome Gabriel.
- Comunicação principal em português do Brasil.
- A experiência deve transmitir organização, evolução pessoal, autonomia e domínio do próprio espaço.
- O acesso privado é uma característica explícita desta primeira versão.

## Evidence on Hand

- Implementação web existente no projeto atual, com capa do Hub, central de agentes e área de carreira e certificados.
- Quatro agentes especializados já definidos e apresentados no produto.
- Histórico de conversas persistido de forma privada.
- Biblioteca de certificados com armazenamento de arquivos e isolamento por usuário.
- Não há, nesta etapa, uma API de IA configurada como requisito ativo nem uma base pública de divulgação.

## Product Principles

1. O Hub deve reduzir a distância entre uma intenção e o espaço certo para executá-la.
2. O contexto pessoal deve permanecer organizado, portátil e sob controle do usuário.
3. Cada agente deve ter uma especialidade clara sem fragmentar a experiência geral.
4. A arquitetura deve permitir trocar modelo, provedor e nível de custo sem reconstruir o produto.
5. Novos espaços devem ampliar a trajetória de Gabriel sem transformar o Hub privado em uma vitrine pública.
