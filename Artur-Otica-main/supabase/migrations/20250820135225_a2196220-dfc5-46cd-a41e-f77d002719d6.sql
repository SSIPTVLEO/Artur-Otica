-- Tabela de Clientes
CREATE TABLE Cliente (
    ID SERIAL PRIMARY KEY,
    NOME VARCHAR(150) NOT NULL,
    CPF VARCHAR(14) UNIQUE,
    DATA_NASCIMENTO DATE,
    ENDERECO VARCHAR(200),
    BAIRRO VARCHAR(100),
    CIDADE VARCHAR(100),
    TELEFONE VARCHAR(20)
);

-- Tabela de Ordem de Serviço
CREATE TABLE Ordem_Servico (
    ID SERIAL PRIMARY KEY,
    numero_OS VARCHAR(20) UNIQUE NOT NULL,
    data_pedido DATE NOT NULL,
    ID_Cliente INT NOT NULL,
    FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID)
);

-- Tabela de Receita
CREATE TABLE Receita (
    ID SERIAL PRIMARY KEY,
    ID_OS INT NOT NULL,
    -- Olho Direito Longe
    ESFERICO_LONGE_OD DECIMAL(5,2),
    CILINDRICO_LONGE_OD DECIMAL(5,2),
    EIXO_LONGE_OD INT,
    DNP_LONGE_OD DECIMAL(5,2),
    ALTURA_OD DECIMAL(5,2),
    ADICAO_OD DECIMAL(5,2),
    -- Olho Esquerdo Longe
    ESFERICO_LONGE_OE DECIMAL(5,2),
    CILINDRICO_LONGE_OE DECIMAL(5,2),
    EIXO_LONGE_OE INT,
    DNP_LONGE_OE DECIMAL(5,2),
    ALTURA_OE DECIMAL(5,2),
    ADICAO_OE DECIMAL(5,2),
    -- Olho Direito Perto
    ESFERICO_PERTO_OD DECIMAL(5,2),
    CILINDRICO_PERTO_OD DECIMAL(5,2),
    EIXO_PERTO_OD INT,
    -- Olho Esquerdo Perto
    ESFERICO_PERTO_OE DECIMAL(5,2),
    CILINDRICO_PERTO_OE DECIMAL(5,2),
    EIXO_PERTO_OE INT,
    FOREIGN KEY (ID_OS) REFERENCES Ordem_Servico(ID)
);

-- Tabela de Armação e Lente
CREATE TABLE Armacao_Lente (
    ID SERIAL PRIMARY KEY,
    ID_OS INT NOT NULL,
    PONTE VARCHAR(20),
    HORIZONTAL VARCHAR(20),
    VERTICAL VARCHAR(20),
    DIAGONAL_MAIOR VARCHAR(20),
    MARCA_ARMACAO VARCHAR(100),
    REFERENCIA_ARMACAO VARCHAR(100),
    MATERIAL_ARMACAO VARCHAR(100),
    LENTE_COMPRADA VARCHAR(100),
    TRATAMENTO VARCHAR(100),
    COLORACAO VARCHAR(100),
    FOREIGN KEY (ID_OS) REFERENCES Ordem_Servico(ID)
);

-- Tabela de Pagamento
CREATE TABLE Pagamento (
    ID SERIAL PRIMARY KEY,
    ID_OS INT NOT NULL,
    VALOR_LENTE DECIMAL(10,2),
    VALOR_ARMACAO DECIMAL(10,2),
    VALOR_TOTAL DECIMAL(10,2) NOT NULL,
    FORMA_PAGAMENTO VARCHAR(50),
    ENTRADA DECIMAL(10,2),
    PARCELAS INT,
    VALOR_PARCELAS DECIMAL(10,2),
    STATUS VARCHAR(50),
    FOREIGN KEY (ID_OS) REFERENCES Ordem_Servico(ID)
);

-- Tabela de perfis (espelha o usuário do Supabase Auth)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('Admin','Avancado','Simples','Financeiro')),
  full_name text,
  created_at timestamptz not null default now()
);

-- Schema lógico para funções (opcional)
create schema if not exists app;

-- Função: retorna o papel do usuário autenticado
create or replace function app.current_role()
returns text
language sql
stable
as $$
  select role
  from public.profiles
  where user_id = auth.uid();
$$;

-- Funções booleanas de atalho
create or replace function app.is_admin()
returns boolean
language sql
stable
as $$ select coalesce(app.current_role() = 'Admin', false); $$;

create or replace function app.is_avancado()
returns boolean
language sql
stable
as $$ select coalesce(app.current_role() = 'Avancado', false); $$;

create or replace function app.is_simples()
returns boolean
language sql
stable
as $$ select coalesce(app.current_role() = 'Simples', false); $$;

create or replace function app.is_financeiro()
returns boolean
language sql
stable
as $$ select coalesce(app.current_role() = 'Financeiro', false); $$;

-- Ajustes nas tabelas: coluna created_by + índices
-- Cliente
alter table public."Cliente"
  add column if not exists created_by uuid not null default auth.uid();

create index if not exists idx_cliente_created_by on public."Cliente"(created_by);

-- Ordem_Servico
alter table public."Ordem_Servico"
  add column if not exists created_by uuid not null default auth.uid();

create index if not exists idx_os_created_by on public."Ordem_Servico"(created_by);

-- Receita
alter table public."Receita"
  add column if not exists created_by uuid not null default auth.uid();

create index if not exists idx_receita_created_by on public."Receita"(created_by);

-- Armacao_Lente
alter table public."Armacao_Lente"
  add column if not exists created_by uuid not null default auth.uid();

create index if not exists idx_armacao_lente_created_by on public."Armacao_Lente"(created_by);

-- Pagamento
alter table public."Pagamento"
  add column if not exists created_by uuid not null default auth.uid();

create index if not exists idx_pagamento_created_by on public."Pagamento"(created_by);

-- Habilitar RLS em todas as tabelas
alter table public."Cliente" enable row level security;
alter table public."Ordem_Servico" enable row level security;
alter table public."Receita" enable row level security;
alter table public."Armacao_Lente" enable row level security;
alter table public."Pagamento" enable row level security;
alter table public.profiles enable row level security;

-- Políticas: Cliente
-- Admin: tudo
create policy "cliente_admin_all"
on public."Cliente"
for all
using (app.is_admin())
with check (app.is_admin());

-- Avancado: SELECT em tudo
create policy "cliente_avancado_select_all"
on public."Cliente"
for select
using (app.is_avancado());

-- Simples e Avancado: manipular apenas o que criou
create policy "cliente_self_crud"
on public."Cliente"
for all
using (created_by = auth.uid() or app.is_admin())
with check (created_by = auth.uid() or app.is_admin());

-- Políticas: Ordem_Servico
-- Admin: tudo
create policy "os_admin_all"
on public."Ordem_Servico"
for all
using (app.is_admin())
with check (app.is_admin());

-- Avancado: SELECT em tudo
create policy "os_avancado_select_all"
on public."Ordem_Servico"
for select
using (app.is_avancado());

-- Self CRUD (Simples e Avancado nos próprios dados)
create policy "os_self_crud"
on public."Ordem_Servico"
for all
using (created_by = auth.uid() or app.is_admin())
with check (created_by = auth.uid() or app.is_admin());

-- Políticas: Receita
-- Admin: tudo
create policy "receita_admin_all"
on public."Receita"
for all
using (app.is_admin())
with check (app.is_admin());

-- Avancado: SELECT em tudo
create policy "receita_avancado_select_all"
on public."Receita"
for select
using (app.is_avancado());

-- Self CRUD: só se a OS pertencer ao usuário (ou Admin)
create policy "receita_self_crud_via_os"
on public."Receita"
for all
using (
  app.is_admin()
  or exists (
    select 1 from public."Ordem_Servico" os
    where os.id = "Receita".id_os
      and (os.created_by = auth.uid() or app.is_avancado() or app.is_admin())
  )
)
with check (
  app.is_admin()
  or exists (
    select 1 from public."Ordem_Servico" os
    where os.id = "Receita".id_os
      and (os.created_by = auth.uid() or app.is_admin())
  )
);

-- Políticas: Armacao_Lente
-- Admin: tudo
create policy "armacao_lente_admin_all"
on public."Armacao_Lente"
for all
using (app.is_admin())
with check (app.is_admin());

-- Avancado: SELECT em tudo
create policy "armacao_lente_avancado_select_all"
on public."Armacao_Lente"
for select
using (app.is_avancado());

-- Self CRUD: via OS
create policy "armacao_lente_self_crud_via_os"
on public."Armacao_Lente"
for all
using (
  app.is_admin()
  or exists (
    select 1 from public."Ordem_Servico" os
    where os.id = "Armacao_Lente".id_os
      and (os.created_by = auth.uid() or app.is_avancado() or app.is_admin())
  )
)
with check (
  app.is_admin()
  or exists (
    select 1 from public."Ordem_Servico" os
    where os.id = "Armacao_Lente".id_os
      and (os.created_by = auth.uid() or app.is_admin())
  )
);

-- Políticas: Pagamento
-- Admin: tudo
create policy "pagamento_admin_all"
on public."Pagamento"
for all
using (app.is_admin())
with check (app.is_admin());

-- Avancado: SELECT em tudo
create policy "pagamento_avancado_select_all"
on public."Pagamento"
for select
using (app.is_avancado());

-- Financeiro: acesso completo a todos os pagamentos
create policy "pagamento_financeiro_all"
on public."Pagamento"
for all
using (app.is_financeiro() or app.is_admin())
with check (app.is_financeiro() or app.is_admin());

-- Self CRUD: via OS
create policy "pagamento_self_crud_via_os"
on public."Pagamento"
for all
using (
  app.is_admin()
  or exists (
    select 1 from public."Ordem_Servico" os
    where os.id = "Pagamento".id_os
      and (os.created_by = auth.uid() or app.is_avancado() or app.is_admin())
  )
)
with check (
  app.is_admin()
  or exists (
    select 1 from public."Ordem_Servico" os
    where os.id = "Pagamento".id_os
      and (os.created_by = auth.uid() or app.is_admin())
  )
);

-- Profiles policies
create policy "profiles_select_own"
on public.profiles
for select
using (user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Regras extras de integridade
create or replace function app.enforce_child_created_by()
returns trigger
language plpgsql
as $$
declare
  os_owner uuid;
begin
  select created_by into os_owner from public."Ordem_Servico" where id = NEW.id_os;
  if os_owner is null then
    raise exception 'OS % não encontrada', NEW.id_os;
  end if;

  -- alinha created_by com a OS
  NEW.created_by := os_owner;
  return NEW;
end;
$$;

-- Receita
drop trigger if exists trg_receita_owner on public."Receita";
create trigger trg_receita_owner
before insert or update on public."Receita"
for each row
execute function app.enforce_child_created_by();

-- Armacao_Lente
drop trigger if exists trg_armacao_lente_owner on public."Armacao_Lente";
create trigger trg_armacao_lente_owner
before insert or update on public."Armacao_Lente"
for each row
execute function app.enforce_child_created_by();

-- Pagamento
drop trigger if exists trg_pagamento_owner on public."Pagamento";
create trigger trg_pagamento_owner
before insert or update on public."Pagamento"
for each row
execute function app.enforce_child_created_by();