-- Script para popular banco com dados de exemplo
-- Cole este script no Supabase SQL Editor e clique em RUN

-- 1. Criar um portfolio de exemplo
INSERT INTO portfolios (id, user_id, name, type, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  auth.uid(),
  'Carteira Principal',
  'Pessoal',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Adicionar transações de exemplo
INSERT INTO transactions (portfolio_id, ticker, type, date, qty, price, total, origin)
VALUES
  -- ITSA4
  ('00000000-0000-0000-0000-000000000001'::uuid, 'ITSA4', 'BUY', '2024-01-15', 100, 10.50, 1050.00, 'Manual'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'ITSA4', 'BUY', '2024-03-20', 50, 11.20, 560.00, 'Manual'),
  
  -- PETR4
  ('00000000-0000-0000-0000-000000000001'::uuid, 'PETR4', 'BUY', '2024-02-10', 200, 38.50, 7700.00, 'Manual'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'PETR4', 'BUY', '2024-05-15', 100, 39.80, 3980.00, 'Manual'),
  
  -- VALE3
  ('00000000-0000-0000-0000-000000000001'::uuid, 'VALE3', 'BUY', '2024-01-20', 150, 68.40, 10260.00, 'Manual'),
  
  -- AAPL
  ('00000000-0000-0000-0000-000000000001'::uuid, 'AAPL', 'BUY', '2024-04-01', 10, 175.50, 1755.00, 'Manual'),
  
  -- NVDA
  ('00000000-0000-0000-0000-000000000001'::uuid, 'NVDA', 'BUY', '2024-06-10', 5, 920.00, 4600.00, 'Manual')
ON CONFLICT DO NOTHING;

-- 3. Verificar se funcionou
SELECT 
  COUNT(*) as total_transactions,
  SUM(total) as total_invested
FROM transactions 
WHERE portfolio_id = '00000000-0000-0000-0000-000000000001'::uuid;
