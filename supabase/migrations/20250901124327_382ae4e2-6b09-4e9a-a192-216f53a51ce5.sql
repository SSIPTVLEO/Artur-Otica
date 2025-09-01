-- Adicionar campo status na tabela ordem_servico
ALTER TABLE public.ordem_servico 
ADD COLUMN status VARCHAR DEFAULT 'ativa';

-- Atualizar ordens existentes para status ativa
UPDATE public.ordem_servico 
SET status = 'ativa' 
WHERE status IS NULL;