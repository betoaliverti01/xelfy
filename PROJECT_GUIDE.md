# 📁 Xelfy — Guia de Acesso e Retomada do Projeto

> Este documento contém todas as instruções, credenciais, links e comandos necessários para retomar o projeto **Xelfy** a qualquer momento.

---

## 📍 Onde o projeto está salvo

* **Diretório Local Permanente:** `C:\Users\rober\.gemini\antigravity-ide\scratch\xelfy`
* **Repositório Remoto (GitHub):** [https://github.com/betoaliverti01/xelfy.git](https://github.com/betoaliverti01/xelfy.git)
* **Branch Principal:** `main` (100% sincronizada com o GitHub)
* **Status do Código:** Build 100% testado (`npm run build` passando com 0 erros).

---

## ☁️ Serviços em Nuvem Conectados

1. **GitHub:**
   * URL: `https://github.com/betoaliverti01/xelfy`
   * Todos os commits, históricos e ajustes estão salvos na nuvem.

2. **Supabase (Banco de Dados PostgreSQL + Auth + Storage):**
   * **Project URL:** `https://cxqmqmlyizduqojihzwc.supabase.co`
   * **Schema SQL:** Arquivo local `supabase_schema.sql` (contém todas as tabelas, RLS e políticas).
   * **Credenciais locais:** Arquivo `.env.local`.

3. **Vercel (Hospedagem & Deploy Contínuo):**
   * O projeto possui configuração de SPA routing em `vercel.json`.
   * Sempre que você envia (`git push`) para a branch `main`, a Vercel atualiza a versão online automaticamente.

4. **Servidor MCP do Xelfy (Antigravity IDE):**
   * Arquivo de execução: `C:\Users\rober\.gemini\antigravity-ide\scratch\xelfy\mcp-server.cjs`
   * Configurado em: `c:\Users\rober\.gemini\config\mcp_config.json`
   * Permite que a IA consulte e altere tabelas do Xelfy diretamente pelo chat.

---

## 🚀 Como Executar ou Reabrir o Xelfy

Para rodar o projeto localmente quando voltar:

```bash
# 1. Acessar a pasta do projeto
cd C:\Users\rober\.gemini\antigravity-ide\scratch\xelfy

# 2. Iniciar o servidor de desenvolvimento
cmd /c "npm run dev"
```
O app abrirá no seu navegador em `http://localhost:5173`.

Para gerar a versão final de produção:
```bash
cmd /c "npm run build"
```

---

## 🗺️ Mapa de Rotas do Xelfy

* **`/`** ou **`/landing`** — Página de apresentação / Landing Page
* **`/login`** / **`/register`** — Autenticação (E-mail e Google OAuth)
* **`/dashboard`** — Visão geral e métricas de vendas
* **`/pedidos`** — Controle de orçamentos e pedidos
* **`/catalogo`** — Produtos e serviços com fotos e preços
* **`/financeiro`** — Contas a pagar, a receber e extrato
* **`/agenda`** — Agenda de serviços e compromissos
* **`/clientes`** — Base de clientes e contatos
* **`/estoque`** — Insumos e controle de estoque
* **`/storefront`** — **Vitrine Online Pública** (onde seus clientes escolhem produtos e fecham pedidos)
* **`/configuracoes`** — Personalização de cores, logotipo e perfil da empresa

---

*Última atualização registrada: Outubro de 2026.*
