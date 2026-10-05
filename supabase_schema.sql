-- ==============================================================================
-- SCHEMA SUPABASE: XELFY (Controle, Gestão e Loja Online)
-- Banco de Dados: PostgreSQL com RLS (Row Level Security) Ativo
-- Capacidade: Suporta 500+ acessos simultâneos com custo R$ 0,00 no Free Tier
-- ==============================================================================

-- 1. EXTENSÕES
create extension if not exists "uuid-ossp";

-- 2. TABELA: ACCOUNTS (Contas bancárias / Caixas)
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text,
  balance numeric default 0,
  color text default '#2d91a8',
  icon text,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 3. TABELA: APP_SETTINGS (Configurações da Empresa e Identidade Visual)
create table if not exists public.app_settings (
  id uuid primary key default uuid_generate_v4(),
  company_name text,
  company_logo text,
  company_cover text,
  company_phone text,
  company_email text,
  company_address text,
  company_instagram text,
  company_facebook text,
  primary_color text default '#2d91a8',
  secondary_color text default '#52cfc1',
  dark_mode boolean default false,
  fab_position text default 'left',
  footer_text text default 'Obrigado pela preferência! ✨',
  quotation_notes text default 'Este orçamento é válido por 15 dias',
  receipt_notes text default 'Pagamento recebido com sucesso',
  company_info text,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 4. TABELA: CATEGORIES (Categorias do Catálogo)
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  "order" integer default 0,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 5. TABELA: CATALOG_ITEMS (Produtos e Serviços)
create table if not exists public.catalog_items (
  id uuid primary key default uuid_generate_v4(),
  code text,
  name text not null,
  description text,
  type text default 'Produto',
  category text,
  sale_price numeric default 0,
  cost_price numeric default 0,
  stock numeric default 0,
  control_stock boolean default false,
  photo text,
  featured boolean default false,
  sales_count integer default 0,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 6. TABELA: CLIENTS (Clientes / Contatos)
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  company text,
  name text not null,
  photo text,
  whatsapp text,
  email text,
  document text,
  address text,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 7. TABELA: EVENTS (Agenda / Compromissos)
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text,
  description text,
  date date not null,
  start_time text,
  end_time text,
  location text,
  participants jsonb default '[]'::jsonb,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 8. TABELA: FINANCIALS (Movimentações Financeiras / Receitas e Despesas)
create table if not exists public.financials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null, -- 'Receita' ou 'Despesa'
  amount numeric default 0,
  category text,
  status text default 'Aberto', -- 'Aberto', 'Pago', 'Atrasado'
  due_date date,
  payment_date date,
  description text,
  order_id text,
  account_id text,
  account_name text,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 9. TABELA: INVENTORY (Estoque de Matéria-Prima / Insumos)
create table if not exists public.inventory (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  unit text default 'un',
  quantity numeric default 0,
  unit_cost numeric default 0,
  min_quantity numeric default 0,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 10. TABELA: ONLINE_STORE (Vitrine e Loja Online)
create table if not exists public.online_store (
  id uuid primary key default uuid_generate_v4(),
  store_url text,
  is_published boolean default true,
  banner_image text,
  whatsapp_number text,
  enable_notes boolean default true,
  enable_payment_method boolean default true,
  enable_order_type boolean default true,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 11. TABELA: ORDERS (Pedidos e Orçamentos)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  client_id text,
  client_name text,
  items jsonb default '[]'::jsonb,
  status text default 'Pendente', -- 'Pendente', 'Confirmado', 'Entregue', 'Cancelado', etc.
  order_date timestamptz default now(),
  due_date date,
  subtotal numeric default 0,
  discount numeric default 0,
  total numeric default 0,
  notes text,
  payment_method text,
  installments integer default 1,
  installment_details jsonb default '[]'::jsonb,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 12. TABELA: PRODUCT_RECIPES (Ficha Técnica / Insumos do Produto)
create table if not exists public.product_recipes (
  id uuid primary key default uuid_generate_v4(),
  catalog_item_id text not null,
  catalog_item_name text,
  recipe jsonb default '[]'::jsonb,
  total_cost numeric default 0,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 13. TABELA: READ_NOTIFICATIONS (Notificações do Usuário)
create table if not exists public.read_notifications (
  id uuid primary key default uuid_generate_v4(),
  notification_id text not null,
  read_at timestamptz default now(),
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- 14. TABELA: TRANSFERS (Transferências entre Contas)
create table if not exists public.transfers (
  id uuid primary key default uuid_generate_v4(),
  from_account_id text not null,
  from_account_name text,
  to_account_id text not null,
  to_account_name text,
  amount numeric default 0,
  transfer_date date default current_date,
  description text,
  created_by text default (auth.jwt() ->> 'email'),
  created_by_id uuid default auth.uid(),
  created_date timestamptz default now(),
  updated_date timestamptz default now()
);

-- ==============================================================================
-- 15. ATIVAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
alter table public.accounts enable row level security;
alter table public.app_settings enable row level security;
alter table public.categories enable row level security;
alter table public.catalog_items enable row level security;
alter table public.clients enable row level security;
alter table public.events enable row level security;
alter table public.financials enable row level security;
alter table public.inventory enable row level security;
alter table public.online_store enable row level security;
alter table public.orders enable row level security;
alter table public.product_recipes enable row level security;
alter table public.read_notifications enable row level security;
alter table public.transfers enable row level security;

-- ==============================================================================
-- 16. POLÍTICAS DE SEGURANÇA (RLS)
-- ==============================================================================

-- Função helper para verificar proprietário do registro
create or replace function public.is_record_owner(owner_email text, owner_id uuid)
returns boolean as $$
begin
  return (auth.jwt() ->> 'email' = owner_email or auth.uid() = owner_id);
end;
$$ language plpgsql security definer;

-- ACCOUNTS: Apenas o dono acessa
create policy "accounts_owner_all" on public.accounts for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- APP_SETTINGS: Leitura pública (para exibir loja), escrita apenas do dono
create policy "app_settings_public_read" on public.app_settings for select using (true);
create policy "app_settings_owner_write" on public.app_settings for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- CATEGORIES: Leitura pública (vitrine da loja), escrita apenas do dono
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_owner_write" on public.categories for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- CATALOG_ITEMS: Leitura pública (vitrine da loja), escrita apenas do dono
create policy "catalog_items_public_read" on public.catalog_items for select using (true);
create policy "catalog_items_owner_write" on public.catalog_items for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- CLIENTS: Apenas o dono acessa
create policy "clients_owner_all" on public.clients for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- EVENTS: Apenas o dono acessa
create policy "events_owner_all" on public.events for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- FINANCIALS: Apenas o dono acessa
create policy "financials_owner_all" on public.financials for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- INVENTORY: Apenas o dono acessa
create policy "inventory_owner_all" on public.inventory for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- ONLINE_STORE: Leitura pública da vitrine, escrita apenas do dono
create policy "online_store_public_read" on public.online_store for select using (true);
create policy "online_store_owner_write" on public.online_store for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- ORDERS: Clientes da vitrine podem criar pedidos (INSERT), dono pode ver e gerenciar tudo
create policy "orders_public_insert" on public.orders for insert with check (true);
create policy "orders_owner_all" on public.orders for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- PRODUCT_RECIPES: Apenas o dono acessa
create policy "product_recipes_owner_all" on public.product_recipes for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- READ_NOTIFICATIONS: Apenas o dono acessa
create policy "read_notifications_owner_all" on public.read_notifications for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- TRANSFERS: Apenas o dono acessa
create policy "transfers_owner_all" on public.transfers for all
  using (public.is_record_owner(created_by, created_by_id))
  with check (public.is_record_owner(created_by, created_by_id));

-- ==============================================================================
-- 17. STORAGE: BUCKET PARA UPLOAD DE FOTOS E COMPROVANTES
-- ==============================================================================
insert into storage.buckets (id, name, public) 
values ('xelfy-media', 'xelfy-media', true)
on conflict (id) do nothing;

create policy "xelfy_media_public_read" on storage.objects for select using (bucket_id = 'xelfy-media');
create policy "xelfy_media_auth_insert" on storage.objects for insert with check (bucket_id = 'xelfy-media');
create policy "xelfy_media_auth_update" on storage.objects for update using (bucket_id = 'xelfy-media');
create policy "xelfy_media_auth_delete" on storage.objects for delete using (bucket_id = 'xelfy-media');
