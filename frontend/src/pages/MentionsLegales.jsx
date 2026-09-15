// Page des mentions légales (éditeur, hébergeur, données personnelles, cookies) — société fictive.
export default function MentionsLegales() {
  return (
    <section className="home-section page-texte" aria-labelledby="ml-title">
      <p className="eyebrow">Informations</p>
      <h1 id="ml-title" className="page-title">Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        Vite & Gourmand, SARL au capital de 20 000 €, immatriculée au RCS de Bordeaux sous le
        numéro 812 345 678, dont le siège social est situé 12 rue Sainte-Catherine, 33000
        Bordeaux. Numéro de TVA intracommunautaire : FR 12 812345678.
      </p>
      <p>
        Gérants et directeurs de la publication : Julie et José Martin. Contact :
        contact@vite-gourmand.fr — 05 56 00 00 00.
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — téléphone :
        1007.
      </p>

      <h2>Protection des données personnelles (RGPD)</h2>
      <p>
        Les données collectées (nom, prénom, adresse e-mail, téléphone, commandes) sont
        nécessaires à la gestion de votre compte, de vos commandes et de nos échanges. Elles sont
        conservées pendant la durée de la relation commerciale puis archivées selon les
        obligations légales (3 ans après le dernier contact, 10 ans pour les pièces comptables).
        Elles ne sont jamais cédées à des tiers.
      </p>
      <p>
        Conformément au Règlement général sur la protection des données et à la loi Informatique
        et Libertés, vous disposez d’un droit d’accès, de rectification, d’effacement, de
        limitation, d’opposition et de portabilité. Pour l’exercer, écrivez à notre délégué à la
        protection des données : dpo@vite-gourmand.fr, ou par courrier à l’adresse du siège. Vous
        pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).
      </p>

      <h2>Cookies</h2>
      <p>
        Le site n’utilise aucun cookie publicitaire ni de mesure d’audience. Seul un jeton de
        session, stocké dans votre navigateur, est utilisé pour maintenir votre connexion à
        votre espace personnel. Il est supprimé à la déconnexion.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble des contenus (textes, photographies, logo) est la propriété de Vite &
        Gourmand. Toute reproduction sans autorisation écrite est interdite.
      </p>

      <h2>Accessibilité</h2>
      <p>
        Vite & Gourmand s’engage à rendre son site accessible conformément au RGAA. Si vous
        rencontrez une difficulté, contactez-nous via la page Contact : nous vous proposerons une
        alternative adaptée.
      </p>
    </section>
  )
}
