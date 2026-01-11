-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Create portfolios table
create table if not exists portfolios (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null default auth.uid(),
    name text not null,
    type text not null default 'Pessoal', -- 'Pessoal', 'Fundo', 'Holding', 'Offshore'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on portfolios
alter table portfolios enable row level security;

drop policy if exists "Users can view their own portfolios" on portfolios;
create policy "Users can view their own portfolios"
on portfolios for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own portfolios" on portfolios;
create policy "Users can insert their own portfolios"
on portfolios for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own portfolios" on portfolios;
create policy "Users can update their own portfolios"
on portfolios for update
using (auth.uid() = user_id);

drop policy if exists "Users can delete their own portfolios" on portfolios;
create policy "Users can delete their own portfolios"
on portfolios for delete
using (auth.uid() = user_id);


-- 2. Create transactions table (Updated)
create table if not exists transactions (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    portfolio_id uuid not null references portfolios(id) on delete cascade,
    ticker text not null,
    type text not null check (type in ('BUY', 'SELL', 'DIVIDEND')),
    date timestamp with time zone not null,
    qty numeric not null,
    price numeric not null,
    total numeric not null,
    origin text default 'Manual'
);

-- Enable Row Level Security
alter table transactions enable row level security;

-- Policies for transactions must now check portfolio ownership
-- We use a USING clause that checks if the portfolio_id in the transaction belongs to a portfolio owned by the user.

drop policy if exists "Users can view transactions of their portfolios" on transactions;
create policy "Users can view transactions of their portfolios"
on transactions for select
using (
    exists (
        select 1 from portfolios
        where portfolios.id = transactions.portfolio_id
        and portfolios.user_id = auth.uid()
    )
);

drop policy if exists "Users can insert transactions into their portfolios" on transactions;
create policy "Users can insert transactions into their portfolios"
on transactions for insert
with check (
    exists (
        select 1 from portfolios
        where portfolios.id = transactions.portfolio_id
        and portfolios.user_id = auth.uid()
    )
);

drop policy if exists "Users can update transactions of their portfolios" on transactions;
create policy "Users can update transactions of their portfolios"
on transactions for update
using (
    exists (
        select 1 from portfolios
        where portfolios.id = transactions.portfolio_id
        and portfolios.user_id = auth.uid()
    )
);

drop policy if exists "Users can delete transactions of their portfolios" on transactions;
create policy "Users can delete transactions of their portfolios"
on transactions for delete
using (
    exists (
        select 1 from portfolios
        where portfolios.id = transactions.portfolio_id
        and portfolios.user_id = auth.uid()
    )
);

-- 3. Create price_history table for historical price data
create table if not exists price_history (
    id uuid primary key default uuid_generate_v4(),
    ticker text not null,
    date date not null,
    open numeric,
    high numeric,
    low numeric,
    close numeric not null,
    volume bigint,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(ticker, date)
);

-- Create index for faster queries
create index if not exists idx_price_history_ticker_date on price_history(ticker, date desc);
create index if not exists idx_price_history_date on price_history(date desc);

-- Enable RLS on price_history (public read access)
alter table price_history enable row level security;

drop policy if exists "Anyone can view price history" on price_history;
create policy "Anyone can view price history"
on price_history for select
using (true);

-- 4. Create dividends table for future dividend tracking
create table if not exists dividends (
    id uuid primary key default uuid_generate_v4(),
    portfolio_id uuid not null references portfolios(id) on delete cascade,
    ticker text not null,
    ex_date date not null,
    payment_date date,
    amount numeric not null,
    quantity numeric not null,
    total numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on dividends
alter table dividends enable row level security;

drop policy if exists "Users can view their own dividends" on dividends;
create policy "Users can view their own dividends"
on dividends for select
using (
    exists (
        select 1 from portfolios
        where portfolios.id = dividends.portfolio_id
        and portfolios.user_id = auth.uid()
    )
);

drop policy if exists "Users can insert their own dividends" on dividends;
create policy "Users can insert their own dividends"
on dividends for insert
with check (
    exists (
        select 1 from portfolios
        where portfolios.id = dividends.portfolio_id
        and portfolios.user_id = auth.uid()
    )
);
