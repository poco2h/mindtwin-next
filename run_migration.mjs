import pg from 'pg';
const { Client } = pg;
const dbUrl = 'postgresql://postgres.zbhevbzgbhvalsboobfz:LiliSpeak2026!@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase Postgres!');

  const sql = `
    create table if not exists conv_terceros_rooms (
      id uuid primary key default gen_random_uuid(),
      follower_id text not null,
      follower_display_name text default 'Ana',
      lang_follower text not null default 'zh',
      lang_guest text not null default 'es',
      agora_channel text not null unique,
      agora_token_follower text,
      agora_token_guest text,
      guest_slug text not null unique,
      expires_at timestamptz not null default (now() + interval '24 hours'),
      status text not null default 'waiting',
      privacy boolean not null default true,
      started_at timestamptz,
      ended_at timestamptz,
      duration_seconds int default 0,
      minutos_consumidos int default 0,
      created_at timestamptz not null default now()
    );

    create table if not exists conv_terceros_turns (
      id uuid primary key default gen_random_uuid(),
      room_id uuid references conv_terceros_rooms(id) on delete cascade not null,
      speaker text not null,
      mode text default 'yo_hablo',
      original_text text not null,
      translated_text text not null,
      audio_url text,
      ling_feedback jsonb default '{}'::jsonb,
      created_at timestamptz not null default now()
    );

    create table if not exists conv_terceros_reports (
      id uuid primary key default gen_random_uuid(),
      room_id uuid references conv_terceros_rooms(id) on delete cascade not null unique,
      follower_id text not null,
      score_global int default 85,
      score_grammar int default 85,
      score_tones int default 85,
      score_fluency int default 85,
      ling_analysis jsonb default '[]'::jsonb,
      summary_text text,
      transcript_summary jsonb default '[]'::jsonb,
      is_private boolean not null default true,
      created_at timestamptz not null default now()
    );

    create index if not exists idx_conv_terceros_rooms_slug on conv_terceros_rooms(guest_slug);
    create index if not exists idx_conv_terceros_rooms_follower on conv_terceros_rooms(follower_id);
    create index if not exists idx_conv_terceros_turns_room on conv_terceros_turns(room_id);
    create index if not exists idx_conv_terceros_reports_room on conv_terceros_reports(room_id);
  `;

  await client.query(sql);
  console.log('✅ Tablas conv_terceros_rooms, conv_terceros_turns y conv_terceros_reports creadas con éxito en Supabase!');
  await client.end();
}

run().catch(console.error);
