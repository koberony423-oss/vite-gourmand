// Page des conditions générales de vente (commande, prix, livraison, annulation, matériel).
export default function CGV() {
  return (
    <section className="home-section page-texte" aria-labelledby="cgv-title">
      <p className="eyebrow">Informations</p>
      <h1 id="cgv-title" className="page-title">Conditions générales de vente</h1>

      <h2>Article 1 — Objet</h2>
      <p>
        Les présentes conditions régissent les ventes de prestations traiteur réalisées par la
        SARL Vite & Gourmand (Bordeaux) auprès de ses clients particuliers et professionnels, via
        le site vite-gourmand.fr.
      </p>

      <h2>Article 2 — Commande</h2>
      <p>
        La commande s’effectue en ligne depuis un compte client. Chaque menu précise un nombre
        minimum de convives et un délai de commande : la date de prestation doit respecter ce
        délai. La commande est enregistrée avec le statut « en attente » et devient ferme à sa
        validation par notre équipe (statut « acceptée »). Un menu en rupture de stock ne peut
        pas être commandé.
      </p>

      <h2>Article 3 — Prix</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises, par personne, sur la base du
        prix pour le nombre minimum de convives. Une remise de 5 % est appliquée sur le menu
        lorsque le nombre de convives atteint le double du minimum. Le prix affiché lors de la
        commande est définitif.
      </p>

      <h2>Article 4 — Livraison</h2>
      <p>
        La livraison est assurée par nos soins dans un rayon de 30 km autour de Bordeaux, puis
        au-delà sur devis. Les frais sont de 0 € jusqu’à 10 km, 15 € jusqu’à 30 km et 30 € au-delà.
        Le client s’engage à être présent à l’adresse et à l’heure convenues.
      </p>

      <h2>Article 5 — Conservation</h2>
      <p>
        Chaque menu indique ses précautions de conservation. Le client est responsable du respect
        de la chaîne du froid après la remise des produits.
      </p>

      <h2>Article 6 — Annulation</h2>
      <p>
        Le client peut demander l’annulation par e-mail ou téléphone jusqu’à 7 jours avant la
        prestation sans frais. Passé ce délai, 50 % du montant reste dû ; 100 % dans les 48 heures
        précédant la prestation. Vite & Gourmand peut annuler une commande en cas de force
        majeure ; le client est alors prévenu par le moyen de contact indiqué et intégralement
        remboursé.
      </p>

      <h2>Article 7 — Prêt de matériel</h2>
      <p>
        Le matériel prêté (plats, chauffe-plats, vaisselle) doit être restitué propre dans un
        délai de 10 jours ouvrés après la prestation. Tout matériel non restitué ou détérioré est
        facturé à sa valeur de remplacement.
      </p>

      <h2>Article 8 — Paiement</h2>
      <p>
        Le règlement s’effectue à la livraison par carte bancaire, chèque ou espèces, ou par
        virement pour les professionnels (30 jours fin de mois).
      </p>

      <h2>Article 9 — Réclamations et droit applicable</h2>
      <p>
        Toute réclamation doit être adressée dans les 48 heures suivant la prestation à
        contact@vite-gourmand.fr. Les présentes conditions sont soumises au droit français ; à
        défaut d’accord amiable, les tribunaux de Bordeaux sont compétents. Le client peut
        recourir gratuitement au médiateur de la consommation.
      </p>
    </section>
  )
}
