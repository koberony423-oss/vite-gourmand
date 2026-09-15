-- Vite & Gourmand - Données de test / démonstration
-- Comptes de test pour le manuel d'utilisation (mots de passe conformes à la politique : 10+ car., maj, min, chiffre, spécial)

insert into utilisateur (nom, prenom, email, numero_gsm, mot_de_passe_hash, role) values
 ('Kobeissi', 'Rony', 'admin@vite-gourmand.fr', '0600000001', crypt('Admin1234!', gen_salt('bf')), 'administrateur'),
 ('Dupont', 'Julie', 'employe@vite-gourmand.fr', '0600000002', crypt('Employe1234!', gen_salt('bf')), 'employe'),
 ('Martin', 'Client', 'client@vite-gourmand.fr', '0600000003', crypt('Client1234!', gen_salt('bf')), 'utilisateur');

-- Plats
insert into plat (nom, type, description) values
 ('Velouté de châtaignes', 'entree', 'Velouté onctueux, éclats de châtaignes torréfiées'),
 ('Foie gras mi-cuit et chutney de figues', 'entree', 'Foie gras maison, chutney maison'),
 ('Salade de lentilles corail et légumes rôtis', 'entree', 'Entrée végétarienne de saison'),
 ('Magret de canard aux cèpes', 'plat', 'Magret rôti, sauce aux cèpes, gratin dauphinois'),
 ('Risotto de saison aux légumes racines', 'plat', 'Risotto crémeux, légumes de saison, parmesan'),
 ('Chapon farci aux marrons', 'plat', 'Chapon fermier, farce aux marrons, jus corsé'),
 ('Tarte fine aux pommes caramélisées', 'dessert', 'Pâte feuilletée, pommes caramélisées, glace vanille'),
 ('Bûche pâtissière chocolat-praliné', 'dessert', 'Bûche maison, chocolat noir et praliné'),
 ('Fondant chocolat', 'dessert', 'Fondant coeur coulant, crème anglaise');

insert into allergene (nom) values
 ('Gluten'), ('Lait'), ('Oeuf'), ('Fruits à coque'), ('Céleri'), ('Moutarde'), ('Sulfites');

-- Allergènes sur quelques plats
insert into plat_allergene (plat_id, allergene_id)
select p.id, a.id from plat p, allergene a
where p.nom = 'Bûche pâtissière chocolat-praliné' and a.nom in ('Gluten','Lait','Oeuf','Fruits à coque');

insert into plat_allergene (plat_id, allergene_id)
select p.id, a.id from plat p, allergene a
where p.nom = 'Tarte fine aux pommes caramélisées' and a.nom in ('Gluten','Lait','Oeuf');

insert into plat_allergene (plat_id, allergene_id)
select p.id, a.id from plat p, allergene a
where p.nom = 'Risotto de saison aux légumes racines' and a.nom in ('Lait','Céleri');

-- Menus (reprennent les 3 menus déjà visibles sur le site)
insert into menu (titre, description, theme_id, regime_id, nb_personnes_min, prix_pour_min, delai_commande_jours, precautions_stockage, stock_disponible, galerie_images) values
 (
   'Menu Bordeaux classique',
   'Un menu traditionnel bordelais, entrée, plat et dessert pour régaler vos convives.',
   (select id from theme where nom = 'Classique'),
   (select id from regime where nom = 'Classique'),
   6, 168.00, 7,
   'À conserver au réfrigérateur entre 0 et 4°C, à consommer sous 48h après réception.',
   8,
   array['/images/menus/bordeaux-classique.jpg']
 ),
 (
   'Menu végétarien de saison',
   'Un menu 100% végétarien composé avec des produits de saison, idéal pour un évènement responsable.',
   (select id from theme where nom = 'Événement'),
   (select id from regime where nom = 'Végétarien'),
   8, 192.00, 10,
   'À conserver au réfrigérateur entre 0 et 4°C, à consommer sous 48h après réception.',
   5,
   array['/images/menus/vegetarien-saison.jpg']
 ),
 (
   'Menu de Noël gourmand',
   'Un menu de fêtes généreux et raffiné pour célébrer Noël en famille.',
   (select id from theme where nom = 'Noël'),
   (select id from regime where nom = 'Classique'),
   10, 320.00, 14,
   'À conserver au réfrigérateur entre 0 et 4°C, à consommer sous 48h après réception. Précommande recommandée.',
   3,
   array['/images/menus/noel-gourmand.jpg']
 );

-- Association menus <-> plats (propose)
insert into propose (menu_id, plat_id)
select m.id, p.id from menu m, plat p
where m.titre = 'Menu Bordeaux classique' and p.nom in ('Foie gras mi-cuit et chutney de figues','Magret de canard aux cèpes','Tarte fine aux pommes caramélisées');

insert into propose (menu_id, plat_id)
select m.id, p.id from menu m, plat p
where m.titre = 'Menu végétarien de saison' and p.nom in ('Salade de lentilles corail et légumes rôtis','Risotto de saison aux légumes racines','Fondant chocolat');

insert into propose (menu_id, plat_id)
select m.id, p.id from menu m, plat p
where m.titre = 'Menu de Noël gourmand' and p.nom in ('Velouté de châtaignes','Chapon farci aux marrons','Bûche pâtissière chocolat-praliné');
