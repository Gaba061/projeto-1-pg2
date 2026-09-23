---
name: Gabriel AI Hub
description: Painel de comando pessoal para organizar estudo, trabalho, carreira e evolução.
colors:
  deep-ink: "#08131c"
  midnight-surface: "#0c1b25"
  navy-sidebar: "#132838"
  slate-foreground: "#182c3c"
  cool-paper: "#f5f7fa"
  white-surface: "#ffffff"
  soft-border: "#dfe5eb"
  muted-text: "#617180"
  mint-accent: "#91e6cc"
  mint-action: "#82e0c0"
  teal-primary: "#153d3d"
  blue-accent: "#78bce8"
  amber-accent: "#e4bb7a"
  violet-accent: "#b4a3ee"
  rose-accent: "#e68ba6"
  slate-accent: "#7e9aa9"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(3.6rem, 8.1vw, 8.2rem)"
    fontWeight: 500
    lineHeight: 0.92
    letterSpacing: "-0.07em"
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(2rem, 4vw, 4rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
rounded:
  sm: "0.5rem"
  md: "0.8rem"
  lg: "1.125rem"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
components:
  button-primary:
    backgroundColor: "{colors.mint-action}"
    textColor: "#102c28"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.5rem"
    height: "3.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.slate-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1rem"
  card:
    backgroundColor: "{colors.midnight-surface}"
    textColor: "#eef5f4"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.slate-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"

# Design System: Gabriel AI Hub

## Overview

**Creative North Star: "O Painel de Comando Pessoal"**

O Gabriel AI Hub é uma central privada para transformar intenção em ação. A interface deve lembrar um painel de comando pessoal: clara o suficiente para orientar decisões rápidas, expressiva o bastante para refletir a trajetória de Gabriel e modular o bastante para crescer com novos espaços, agentes e projetos.

A atmosfera combina tecnologia e criatividade com uma base escura, azul-marinho e sóbria, pontuada por mint e acentos cromáticos específicos para dar orientação. O resultado é concentrado, autoral e humano; não é uma vitrine corporativa genérica nem um ambiente gamer. A personalidade vem do contraste entre tipografia sans de grande escala, itálico serifado em momentos de destaque, cartões tonais e microinterações discretas.

**Key Characteristics:**
- Painel pessoal, privado e orientado à ação.
- Tecnologia com calor visual e assinatura editorial.
- Hierarquia forte, leitura rápida e módulos expansíveis.
- Acentos de cor usados como orientação, não como decoração excessiva.

## Colors

A paleta alterna superfícies ink profundas com tons de papel e uma família de mint suave. As cores dos espaços funcionam como sinais de contexto, mantendo unidade sem tornar o Hub barulhento.

### Primary
- **Deep Ink** (#08131c): fundo principal da capa e base de concentração.
- **Mint Action** (#82e0c0): ação primária, estado ativo e progresso.
- **Teal Primary** (#153d3d): ações semânticas e superfícies de confirmação.

### Secondary
- **Blue Signal** (#78bce8): Faculdade e estados de informação.
- **Amber Signal** (#e4bb7a): Concursos e atenção estratégica.
- **Violet Signal** (#b4a3ee): IPE Trading e pesquisa especializada.
- **Rose Signal** (#e68ba6): Carreira & Tecnologia e próximos passos.
- **Slate Signal** (#7e9aa9): certificados e áreas ainda em construção.

### Neutral
- **Midnight Surface** (#0c1b25): cartões e camadas sobre o fundo escuro.
- **Navy Sidebar** (#132838): navegação persistente e contexto do Hub.
- **Cool Paper** (#f5f7fa): telas de trabalho claras quando a densidade pede contraste.
- **White Surface** (#ffffff): cartões, diálogos e campos de edição.
- **Soft Border** (#dfe5eb): separadores e limites discretos.
- **Muted Text** (#617180): descrições, metadados e instruções secundárias.

### Named Rules
**The Signal, Not Noise Rule.** Use mint e as cores dos espaços para orientar estado e escolha. Nenhum acento deve dominar a tela inteira.

## Typography

**Display Font:** Arial, Helvetica, sans-serif  
**Body Font:** Arial, Helvetica, sans-serif  
**Editorial Accent:** Georgia, Times New Roman, serif (itálico em frases de destaque)

**Character:** A sans-serif ampla e direta cria confiança e escaneabilidade. O serifado itálico aparece como uma assinatura editorial curta, trazendo personalidade sem transformar o produto em uma publicação.

### Hierarchy
- **Display** (500, `clamp(3.6rem, 8.1vw, 8.2rem)`, 0.92): hero da capa e mensagens de orientação.
- **Headline** (500, `clamp(2rem, 4vw, 4rem)`, 1.05): títulos de seção e chamadas de entrada.
- **Title** (700, 1.25rem, 1.2): nomes de agentes, módulos e cartões.
- **Body** (400, 1rem, 1.55): descrições, mensagens e contexto operacional.
- **Label** (700, 0.75rem, 0.14em, uppercase): status, índice, categoria e metadados.

### Named Rules
**The One Emphasis Rule.** Em uma composição, apenas uma frase ou palavra recebe o tratamento serifado itálico; o restante permanece em sans-serif para preservar clareza.

## Layout

O Hub usa uma composição de largura fluida com conteúdo limitado a aproximadamente 1440px e padding horizontal de 5.5vw na capa. A capa ocupa pelo menos `100svh`, com hero arejado e uma grade modular abaixo. A central de agentes usa grade de quatro colunas em telas largas, duas em telas médias e uma em telas estreitas; cartões de entrada podem ocupar duas colunas para estabelecer hierarquia.

O ritmo espacial alterna blocos compactos de navegação e metadados com grandes áreas de respiro no hero. Use `0.5rem`, `0.75rem`, `1rem`, `1.5rem` e `2.5rem` como degraus recorrentes. Em telas pequenas, preserve a ordem de leitura, reduza o hero e transforme grades em fluxo vertical sem apertar os controles.

## Elevation & Depth

A profundidade é principalmente tonal: Deep Ink, Midnight Surface e Navy Sidebar formam camadas reconhecíveis. Bordas finas definem os limites; sombras são ambientais e discretas, reservadas para hover, diálogos e superfícies que precisam se destacar.

### Shadow Vocabulary
- **Ambient Rest** (`0 3px 5px #152b3903`): repouso de cartões claros.
- **Ambient Hover** (`0 9px 25px #13283809`): elevação suave ao passar o cursor.
- **Mint Lift** (`0 10px 30px #71dabc26`): resposta da ação primária.

### Named Rules
**The Flat-by-Default Rule.** Superfícies ficam estáveis em repouso; movimento e sombra só aparecem quando o usuário interage ou precisa interpretar uma camada.

## Shapes

O vocabulário de formas é macio e funcional: cartões usam 15–18px, controles menores usam 8px e ações principais usam cápsulas (`999px`). Bordas são finas, claras e de baixo contraste. O arredondamento deve sugerir módulos encaixáveis, não bolhas decorativas; evite cantos excessivamente circulares em áreas de conteúdo.

## Components

### Buttons
- **Shape:** cápsula nas ações principais (`999px`); links e ações secundárias podem ser sem contorno.
- **Primary:** Mint Action, texto escuro, padding aproximado de `0.85rem 1.5rem`, altura de `3.25rem`.
- **Hover / Focus:** elevação Mint Lift e foco visível com ring Mint; preserve contraste e não dependa só de cor.
- **Secondary / Ghost:** fundo transparente ou tonal, texto de contexto e seta/ícone pequeno alinhado à direita.

### Chips
- **Style:** rótulos compactos em uppercase, letter-spacing amplo, fundo tonal e borda da cor do espaço.
- **State:** o estado ativo recebe mint ou a cor do espaço; estados informativos permanecem discretos.

### Cards / Containers
- **Corner Style:** 15–18px em cartões de destino; `0.8rem` em superfícies gerais.
- **Background:** Midnight Surface na capa; White Surface ou Cool Paper em fluxos de trabalho.
- **Shadow Strategy:** usar a elevação ambiental descrita acima, com borda sempre que o fundo não oferecer separação suficiente.
- **Border:** `1px solid` em tons Soft Border ou azul-marinho translúcido.
- **Internal Padding:** `1.25rem` como base; `1.5rem` ou mais para cartões hero.

### Inputs / Fields
- **Style:** White Surface, borda `#d2dfdc`, raio `8px`, texto Slate Foreground.
- **Focus:** borda Mint e outline/ring visível, sem glow espalhado.
- **Error / Disabled:** comunicar por texto e estado de contraste; reduzir opacidade apenas em controles realmente indisponíveis.

### Navigation
- **Style:** navegação superior leve sobre o fundo, labels em sans de 14px; sidebar Navy com item ativo destacado por faixa mint e fundo Slate/teal.
- **States:** hover tonal, ativo com indicador mint, foco sempre visível.
- **Mobile:** manter marca, acesso ao contexto atual e menu compacto; não sacrificar o caminho de volta.

### Signature Component: Destination Card
Cartões de espaços usam índice numérico, ícone acima do texto, status curto, título forte, descrição breve e uma forma cromática suave no canto inferior. A composição deve manter o ícone separado da escrita para que a identificação seja imediata.

### Signature Component: Brand Mark
O símbolo é um `G` maiúsculo dentro de uma moldura arredondada, acompanhado de “Gabriel” e do rótulo “AI HUB”. Ele funciona como assinatura pessoal e deve permanecer legível em fundos escuros.

## Do's and Don'ts

### Do:
- **Do** preserve o contraste entre o fundo Deep Ink e o Mint Action para orientar a próxima ação.
- **Do** use a cor de cada espaço como sinal semântico consistente.
- **Do** mantenha títulos grandes, curtos e com bastante respiro.
- **Do** combine tecnologia com detalhes editoriais controlados, como o serifado itálico do hero.
- **Do** trate privacidade, contexto e sensação de propriedade como parte da experiência visual.

### Don't:
- **Don't** transforme o Hub em um painel corporativo genérico.
- **Don't** use excesso de neon, gradientes brilhantes ou estética gamer.
- **Don't** reduzir tudo a minimalismo frio sem sinais de trajetória pessoal.
- **Don't** espalhe todas as cores dos agentes em cada tela; preserve a hierarquia.
- **Don't** use o ícone por cima da escrita em cartões; mantenha a ordem índice, ícone, status, título e descrição.

