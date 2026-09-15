-- ==========================================================
-- Migration 003 : jetons de réinitialisation de mot de passe
-- Un jeton à usage unique, haché (SHA-256) en base, expirant
-- au bout d'une heure. Le jeton en clair n'est jamais stocké.
-- ==========================================================
create table if not exists reinitialisation_mot_de_passe (
    id uuid primary key default gen_random_uuid(),
    utilisateur_id uuid not null references utilisateur(id) on delete cascade,
    jeton_hash varchar(64) not null unique,
    expire_le timestamptz not null,
    utilise boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_reinit_utilisateur on reinitialisation_mot_de_passe(utilisateur_id);
