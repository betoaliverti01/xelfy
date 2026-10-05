# xelfy

> Sistema completo de Controle, Gestão Financeira e Loja Online / Vitrine Digital.

---

## 🚀 Arquitetura & Custo Zero

Este projeto foi desacoplado de plataformas proprietárias para rodar com **custo zero permanente** e capacidade para mais de 500 acessos simultâneos diários:

* **Frontend:** React + Vite + TailwindCSS + Radix UI / Lucide Icons
* **Hospedagem:** Cloudflare Pages ou Vercel (100% Gratuito com SSL e CDN Global)
* **Backend & Banco de Dados:** Supabase (PostgreSQL com Row Level Security - RLS ativo)
* **Armazenamento de Mídia:** Supabase Storage (Bucket público para imagens de produtos e comprovantes)
* **Controle de Versão:** Git / GitHub

---

## 🛠️ Passo a Passo para Configuração

### 1. Banco de Dados (Supabase)
1. Crie uma conta gratuita em [supabase.com](https://supabase.com).
2. Crie um novo projeto (ex: `xelfy`).
3. Abra a aba **SQL Editor** no painel do Supabase.
4. Cole todo o conteúdo do arquivo [`supabase_schema.sql`](./supabase_schema.sql) e clique em **Run**.
5. Em **Project Settings -> API**, copie:
   * **Project URL**
   * **anon / public key**

### 2. Variáveis de Ambiente
Crie ou edite o arquivo `.env.local`:
```env
VITE_SUPABASE_URL=https://sua-url-supabase.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```

### 3. Executar Localmente
```bash
npm install
npm run dev
```

### 4. Deploy no Git & Nuvem
```bash
git remote set-url origin https://github.com/SEU_USUARIO/xelfy.git
git push -u origin main
```
Conecte o repositório na **Vercel** ou **Cloudflare Pages** com as seguintes variáveis de ambiente configuradas no painel da hospedagem:
* `VITE_SUPABASE_URL`
* `VITE_SUPABASE_ANON_KEY`
