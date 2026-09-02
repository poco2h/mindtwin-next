-- Migration 0013: Tablas para Conversación con Terceros (Traducción Simultánea Lili Speak)

-- 1. Tabla de Salas de Conversación con Terceros
create table if not exists conv_terceros_rooms (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users not null,
  
  -- Idiomas
  lang_follower text not null default 'zh', -- idioma que aprende el alumno (ej: 'zh', 'en')
  lang_guest text not null default 'es',    -- idioma nativo del interlocutor (ej: 'es')
  
  -- Agora RTC
  agora_channel text not null unique,
  agora_token_follower text,               -- token RTC para el alumno (UID=1)
  agora_token_guest text,                  -- token RTC para el interlocutor (UID=0)
  
  -- Link público
  guest_slug text not null unique,         -- parte pública del URL (10 caracteres URL-safe)
  expires_at timestamptz not null default (now() + interval '24 hours'),
  
  -- Estado
  status text not null default 'waiting',  -- 'waiting' | 'active' | 'ended'
  privacy boolean not null default true,   -- si ON, informe solo visible al alumno
  
  -- Post-llamada y métricas de consumo
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int default 0,
  minutos_consumidos int default 0,
  created_at timestamptz not null default now()
);

-- RLS: follower solo ve sus propias salas
alter table conv_terceros_rooms enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'conv_terceros_rooms' and policyname = 'follower_own_terceros_rooms'
  ) then
    create policy "follower_own_terceros_rooms" on conv_terceros_rooms
      for all using (follower_id = auth.uid());
  end if;
end $$;

-- 2. Tabla de Turnos de Habla
create table if not exists conv_terceros_turns (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references conv_terceros_rooms(id) on delete cascade not null,
  speaker text not null,                   -- 'follower' | 'guest'
  mode text default 'yo_hablo',            -- 'yo_hablo' | 'twin_habla' (solo follower)
  
  -- Contenido
  original_text text not null,             -- lo que se dijo en idioma del hablante
  translated_text text not null,           -- traducción para el receptor
  audio_url text,                          -- audio sintetizado o grabado si aplica
  
  -- Análisis lingüístico (solo turns del follower)
  ling_feedback jsonb default '{}'::jsonb, -- {tone_errors: [...], grammar: [...], fluency: 0.91}
  created_at timestamptz not null default now()
);

-- RLS: solo el follower de esa sala puede leer sus turns
alter table conv_terceros_turns enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'conv_terceros_turns' and policyname = 'follower_own_terceros_turns'
  ) then
    create policy "follower_own_terceros_turns" on conv_terceros_turns
      for select using (
        room_id in (select id from conv_terceros_rooms where follower_id = auth.uid())
      );
  end if;
end $$;

-- 3. Tabla de Informes Post-Llamada
create table if not exists conv_terceros_reports (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references conv_terceros_rooms(id) on delete cascade not null unique,
  follower_id uuid references auth.users not null,
  
  score_global int default 85,             -- 0-100
  score_grammar int default 85,
  score_tones int default 85,              -- relevante para chino/tailandés/vietnamita
  score_fluency int default 85,
  
  ling_analysis jsonb default '[]'::jsonb, -- array de hallazgos: tipo, ejemplo, corrección, ocurrencias
  summary_text text,                       -- resumen en lenguaje natural
  transcript_summary jsonb default '[]'::jsonb,
  is_private boolean not null default true, -- copia del privacy flag al generar
  created_at timestamptz not null default now()
);

-- RLS: solo el follower de la sala puede ver su informe si is_private = true
alter table conv_terceros_reports enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'conv_terceros_reports' and policyname = 'follower_own_terceros_reports'
  ) then
    create policy "follower_own_terceros_reports" on conv_terceros_reports
      for all using (follower_id = auth.uid());
  end if;
end $$;

-- Índices de consulta rápida
create index if not exists idx_conv_terceros_rooms_slug on conv_terceros_rooms(guest_slug);
create index if not exists idx_conv_terceros_rooms_follower on conv_terceros_rooms(follower_id);
create index if not exists idx_conv_terceros_turns_room on conv_terceros_turns(room_id);
create index if not exists idx_conv_terceros_reports_room on conv_terceros_reports(room_id);
