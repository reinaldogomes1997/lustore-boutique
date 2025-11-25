# Lustore Boutique - Loja Online

Loja boutique de moda feminina com carrinho de compras, painel admin e integração com WhatsApp para fechamento de pedidos.

## Características

- ✨ **Design Responsivo** - Otimizado para celular, tablet e desktop
- 🛒 **Carrinho de Compras** - Com localStorage para persistência
- 📱 **Integração WhatsApp** - Link direto para fechar pedidos (65998182029)
- 👨‍💼 **Painel Admin** - Gerenciar produtos, preços e estoques
- 🔐 **Autenticação** - Login seguro para admin
- 📸 **Upload de Imagens** - Redimensionamento e compressão automática
- 💾 **Persistência** - Dados salvos em localStorage

## Tecnologias

- React 19
- TypeScript
- Tailwind CSS 4
- Express.js
- tRPC
- Drizzle ORM
- MySQL/TiDB

## Instalação Local

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

O site estará disponível em `http://localhost:3000`

## Deploy no Netlify

### Opção 1: Drag & Drop (Recomendado para teste rápido)

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Faça upload do arquivo `dist/` gerado após `pnpm build`
3. O site estará online em segundos

### Opção 2: Git Integration

1. Faça push do repositório para GitHub/GitLab
2. Conecte o repositório no Netlify
3. Configure o comando de build: `pnpm build`
4. Configure o diretório de publicação: `dist`

## Estrutura do Projeto

```
lustore-boutique/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── App.tsx        # Roteamento principal
│   │   └── index.css      # Estilos globais
│   └── public/            # Ativos estáticos
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Procedimentos tRPC
│   └── db.ts              # Helpers do banco de dados
├── drizzle/               # Schema do banco de dados
└── netlify.toml           # Configuração Netlify
```

## Funcionalidades Principais

### Catálogo de Produtos

- Exibição de produtos com imagens, preços e estoques
- Seleção de quantidade
- Clique na imagem para visualizar em tamanho completo

### Carrinho de Compras

- Adicionar/remover produtos
- Alterar quantidade
- Total em tempo real
- Barra fixa no mobile com resumo do carrinho

### Checkout via WhatsApp

- Clique em "Fechar Pedido"
- Mensagem pré-formatada com itens e total
- Abre WhatsApp automaticamente
- Cliente completa dados (nome, endereço, telefone)

### Painel Admin

- Acesso via botão de menu (três pontos)
- Login com usuário/senha
- Adicionar, editar e remover produtos
- Configurar número do WhatsApp
- Alterar credenciais de acesso

## Configuração WhatsApp

O número padrão é `65998182029`. Para alterar:

1. Abra o painel admin (clique nos três pontos)
2. Faça login (padrão: admin/admin123)
3. Na seção "Configurações & Segurança", insira o novo número
4. Formato: DDI+DDD+número (ex: 5565998182029)

## Variáveis de Ambiente

O projeto usa variáveis de ambiente injetadas automaticamente pela plataforma Manus:

- `DATABASE_URL` - Conexão com banco de dados
- `VITE_APP_TITLE` - Título da aplicação
- `VITE_APP_LOGO` - URL do logo

## Performance

- Imagens comprimidas automaticamente (máx 1200px)
- Lazy loading de imagens
- Código otimizado para mobile
- Cache de localStorage

## Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.

## Licença

Todos os direitos reservados © 2025 Lustore Boutique
