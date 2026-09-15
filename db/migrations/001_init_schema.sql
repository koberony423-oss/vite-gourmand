-- Vite & Gourmand - ECF TP Développeur Web et Web Mobile
-- Schéma relationnel initial (PostgreSQL / Supabase)
-- Basé sur le MCD fourni en annexe 1 de l'énoncé :
-- utilisateur, commande, menu, régime, thème, propose (liaison), plat, allergène, horaire, avis, adresse

create extension if not exists "pgcrypto";

-- ==========================================================
-- ADRESSE
-- ==========================================================
create table adresse (
    id uuid primary key default gen_random_uuid(),
    ligne1 varchar(255) not null,
    ligne2 varchar(255),
    code_postal varchar(10) not null,
    ville varchar(100) not null,
    pays varchar(100) not null default 'France',
    created_at timestamptz not null default now()
);

-- ==========================================================
-- UTILISATEUR (rôles : utilisateur / employe / administrateur)
-- ==========================================================
create type role_utilisateur as enum ('utilisateur', 'employe', 'administrateur');

create table utilisateur (
    id uuid primary key default gen_random_uuid(),
    nom varchar(100) not null,
    prenom varchar(100) not null,
    email varchar(255) not null unique,
    numero_gsm varchar(20),
    mot_de_passe_hash varchar(255) not null,
    role role_utilisateur not null default 'utilisateur',
    adresse_id uuid references adresse(id),
    actif boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_utilisateur_email on utilisateur(email);

-- ==========================================================
-- THEME (Noël / Pâques / classique / évènement...)
-- ==========================================================
create table theme (
    id uuid primary key default gen_random_uuid(),
    nom varchar(100) not null unique
);

-- ==========================================================
-- REGIME (végétarien / vegan / classique...) - extensible
-- ==========================================================
create table regime (
    id uuid primary key default gen_random_uuid(),
    nom varchar(100) not null unique
);

-- ==========================================================
-- ALLERGENE
-- ==========================================================
create table allergene (
    id uuid primary key default gen_random_uuid(),
    nom varchar(100) not null unique
);

-- ==========================================================
-- PLAT (entrée / plat / dessert) - réutilisable entre menus
-- ==========================================================
create type type_plat as enum ('entree', 'plat', 'dessert');

create table plat (
    id uuid primary key default gen_random_uuid(),
    nom varchar(150) not null,
    type type_plat not null,
    description text
);

create table plat_allergene (
    plat_id uuid references plat(id) on delete cascade,
    allergene_id uuid references allergene(id) on delete cascade,
    primary key (plat_id, allergene_id)
);

-- ==========================================================
-- MENU
-- ==========================================================
create table menu (
    id uuid primary key default gen_random_uuid(),
    titre varchar(200) not null,
    description text,
    theme_id uuid references theme(id),
    regime_id uuid references regime(id),
    nb_personnes_min integer not null check (nb_personnes_min > 0),
    prix_pour_min numeric(10,2) not null check (prix_pour_min >= 0),
    delai_commande_jours integer not null default 7,
    precautions_stockage text,
    stock_disponible integer not null default 0,
    galerie_images text[],
    actif boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_menu_theme on menu(theme_id);
create index idx_menu_regime on menu(regime_id);

-- ==========================================================
-- PROPOSE (liaison menu <-> plat, un plat peut appartenir à plusieurs menus)
-- ==========================================================
create table propose (
    menu_id uuid references menu(id) on delete cascade,
    plat_id uuid references plat(id) on delete cascade,
    primary key (menu_id, plat_id)
);

-- ==========================================================
-- HORAIRE (jours d'ouverture, visible en pied de page)
-- ==========================================================
create table horaire (
    id uuid primary key default gen_random_uuid(),
    jour_semaine smallint not null unique check (jour_semaine between 0 and 6), -- 0=lundi .. 6=dimanche
    heure_ouverture time,
    heure_fermeture time,
    ferme boolean not null default false
);

-- ==========================================================
-- COMMANDE
-- ==========================================================
create type statut_commande as enum (
    'en_attente',
    'accepte',
    'en_preparation',
    'en_cours_de_livraison',
    'livre',
    'en_attente_du_retour_de_materiel',
    'terminee',
    'annulee'
);

create table commande (
    id uuid primary key default gen_random_uuid(),
    utilisateur_id uuid not null references utilisateur(id),
    menu_id uuid not null references menu(id),
    nb_personnes integer not null,
    adresse_livraison_id uuid references adresse(id),
    distance_km numeric(6,2) default 0,
    date_prestation date not null,
    heure_souhaitee time not null,
    prix_menu numeric(10,2) not null,
    prix_livraison numeric(10,2) not null default 0,
    taux_remise numeric(4,2) not null default 0,
    prix_total numeric(10,2) not null,
    statut statut_commande not null default 'en_attente',
    materiel_pret boolean not null default false,
    date_limite_retour_materiel date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_commande_utilisateur on commande(utilisateur_id);
create index idx_commande_menu on commande(menu_id);
create index idx_commande_statut on commande(statut);

-- Historique des statuts (suivi de commande affiché à l'utilisateur)
create table commande_statut_historique (
    id uuid primary key default gen_random_uuid(),
    commande_id uuid not null references commande(id) on delete cascade,
    statut statut_commande not null,
    date_changement timestamptz not null default now(),
    commentaire text
);

-- Annulation par un employé : motif + moyen de contact obligatoires (RGPD / traçabilité)
create table annulation (
    id uuid primary key default gen_random_uuid(),
    commande_id uuid not null references commande(id) on delete cascade,
    employe_id uuid references utilisateur(id),
    motif text not null,
    moyen_contact varchar(50) not null,
    date_annulation timestamptz not null default now()
);

-- ==========================================================
-- AVIS
-- ==========================================================
create table avis (
    id uuid primary key default gen_random_uuid(),
    commande_id uuid not null references commande(id),
    utilisateur_id uuid not null references utilisateur(id),
    note smallint not null check (note between 1 and 5),
    commentaire text,
    valide boolean not null default false,
    created_at timestamptz not null default now()
);

create index idx_avis_valide on avis(valide);

-- ==========================================================
-- Données de référence (horaires, thèmes, régimes de base)
-- ==========================================================
insert into horaire (jour_semaine, heure_ouverture, heure_fermeture, ferme) values
 (0, '09:00', '18:00', false), -- lundi
 (1, '09:00', '18:00', false), -- mardi
 (2, '09:00', '18:00', false), -- mercredi
 (3, '09:00', '18:00', false), -- jeudi
 (4, '09:00', '18:00', false), -- vendredi
 (5, '10:00', '17:00', false), -- samedi
 (6, null, null, true);        -- dimanche fermé

insert into theme (nom) values ('Classique'), ('Noël'), ('Pâques'), ('Événement');
insert into regime (nom) values ('Classique'), ('Végétarien'), ('Vegan');
