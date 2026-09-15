import { useState } from 'react'
import './App.css'

const menus = [
  {
    id: 1,
    title: 'Menu Bordeaux classique',
    description: 'Un menu traditionnel et généreux pour vos repas de famille.',
    theme: 'Classique',
    diet: 'Classique',
    minPeople: 6,
    price: 168,
    stock: 8,
    dishes: [
      'Entrée : salade de chèvre chaud',
      'Plat : bœuf mijoté et pommes grenailles',
      'Dessert : cannelé bordelais',
    ],
  },
  {
    id: 2,
    title: 'Menu végétarien de saison',
    description:
      'Une proposition fraîche, colorée et adaptée aux repas végétariens.',
    theme: 'Événement',
    diet: 'Végétarien',
    minPeople: 8,
    price: 192,
    stock: 5,
    dishes: [
      'Entrée : tartare de légumes croquants',
      'Plat : risotto aux champignons de saison',
      'Dessert : tarte fine aux pommes',
    ],
  },
  {
    id: 3,
    title: 'Menu de Noël gourmand',
    description: 'Un repas festif complet pour célébrer Noël en toute sérénité.',
    theme: 'Noël',
    diet: 'Classique',
    minPeople: 10,
    price: 320,
    stock: 3,
    dishes: [
      'Entrée : foie gras et chutney de figues',
      'Plat : suprême de volaille et sauce aux morilles',
      'Dessert : bûche chocolat-praliné',
    ],
  },
]

const reviews = [
  {
    id: 1,
    name: 'Claire M.',
    text: 'Un repas de famille parfaitement organisé. Les invités se sont régalés.',
  },
  {
    id: 2,
    name: 'Thomas R.',
    text: 'Une équipe ponctuelle, professionnelle et très attentive à nos demandes.',
  },
  {
    id: 3,
    name: 'Sophie L.',
    text: 'Le menu végétarien était frais, généreux et apprécié de tous.',
  },
]

const openingHours = [
  'Lundi : 09h00 - 18h00',
  'Mardi : 09h00 - 18h00',
  'Mercredi : 09h00 - 18h00',
  'Jeudi : 09h00 - 18h00',
  'Vendredi : 09h00 - 18h00',
  'Samedi : 10h00 - 17h00',
  'Dimanche : fermé',
]

function App() {
  const [showTip, setShowTip] = useState(false)
  const [selectedPeople, setSelectedPeople] = useState('Tous')
  const [activePage, setActivePage] = useState('home')
  const [selectedMenu, setSelectedMenu] = useState(null)

  const filteredMenus =
    selectedPeople === 'Tous'
      ? menus
      : menus.filter((menu) => menu.minPeople === Number(selectedPeople))

  function goToPage(page) {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function showMenuDetail(menu) {
    setSelectedMenu(menu)
    goToPage('menu-detail')
  }

  function goBackToMenus() {
    setSelectedMenu(null)
    goToPage('menus')
  }

  return (
    <main className="app">
      <header className="header">
        <nav className="navigation" aria-label="Navigation principale">
          <button type="button" onClick={() => goToPage('home')}>
            Accueil
          </button>

          <button type="button" onClick={() => goToPage('menus')}>
            Nos menus
          </button>

          <button type="button" onClick={() => goToPage('login')}>
            Connexion
          </button>

          <button type="button" onClick={() => goToPage('contact')}>
            Contact
          </button>
        </nav>

        <p className="eyebrow">Vite & Gourmand</p>

        <h1>Des menus traiteur pour vos événements.</h1>

        <p className="intro">
          Julie et José vous accompagnent depuis 25 ans à Bordeaux pour vos
          repas de famille, événements et moments de fête.
        </p>
      </header>

      {activePage === 'home' && (
        <>
          <section className="home-section" aria-labelledby="about-title">
            <p className="eyebrow">Notre entreprise</p>

            <h2 id="about-title">Une cuisine généreuse, locale et sur mesure</h2>

            <p>
              Vite & Gourmand est une entreprise familiale fondée par Julie et
              José. Leur objectif est de proposer des menus accessibles,
              gourmands et adaptés à chaque événement.
            </p>
          </section>

          <section className="home-section" aria-labelledby="quality-title">
            <p className="eyebrow">Notre engagement</p>

            <h2 id="quality-title">
              Le professionnalisme au service de vos repas
            </h2>

            <p>
              Nous préparons chaque commande avec soin, dans le respect des
              régimes alimentaires, des allergènes et des conditions de
              conservation.
            </p>
          </section>

          <section className="reviews" aria-labelledby="reviews-title">
            <p className="eyebrow">Avis validés</p>

            <h2 id="reviews-title">Ce que nos clients disent de nous</h2>

            <div className="reviews-grid">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <p>“{review.text}”</p>
                  <h3>{review.name}</h3>
                </article>
              ))}
            </div>
          </section>

          <button
            type="button"
            className="tip-button"
            onClick={() => goToPage('menus')}
          >
            Découvrir nos menus
          </button>
        </>
      )}

      {activePage === 'menus' && (
        <>
          <section className="home-section" aria-labelledby="menus-intro-title">
            <p className="eyebrow">Nos menus</p>

            <h2 id="menus-intro-title">Un menu adapté à votre événement</h2>

            <p>
              Consultez nos propositions et choisissez celle qui correspond à
              votre repas, au nombre de convives et à vos préférences.
            </p>
          </section>

          <section className="recipes" aria-labelledby="menus-title">
            <div className="recipes-heading">
              <div>
                <p className="eyebrow">Catalogue</p>
                <h2 id="menus-title">Nos menus disponibles</h2>
              </div>

              <div
                className="filters"
                aria-label="Filtrer les menus par nombre de personnes"
              >
                {['Tous', '6', '8', '10'].map((people) => (
                  <button
                    key={people}
                    type="button"
                    className={
                      selectedPeople === people
                        ? 'filter-button active'
                        : 'filter-button'
                    }
                    onClick={() => setSelectedPeople(people)}
                  >
                    {people === 'Tous'
                      ? 'Tous les menus'
                      : `${people} personnes`}
                  </button>
                ))}
              </div>
            </div>

            {filteredMenus.map((menu) => (
              <article className="recipe-card" key={menu.id}>
                <p className="recipe-time">
                  {menu.minPeople} personnes minimum
                </p>

                <p className="recipe-category">{menu.theme}</p>

                <h3>{menu.title}</h3>

                <p>{menu.description}</p>

                <p className="recipe-category">Régime : {menu.diet}</p>

                <p className="recipe-time">
                  Prix : {(menu.price / menu.minPeople).toFixed(2)} € par
                  personne
                </p>

                <p className="recipe-time">
                  Minimum de commande : {menu.price.toFixed(2)} € pour{' '}
                  {menu.minPeople} personnes
                </p>

                <p className="recipe-time">
                  Stock disponible : {menu.stock}
                </p>

                <button
                  type="button"
                  className="tip-button"
                  onClick={() => showMenuDetail(menu)}
                >
                  Voir le détail
                </button>
              </article>
            ))}
          </section>

          <button
            type="button"
            className="tip-button"
            onClick={() => setShowTip(!showTip)}
          >
            {showTip ? 'Masquer l’astuce' : 'Afficher l’astuce'}
          </button>

          {showTip && (
            <p className="tip">
              Astuce : commandez à l’avance afin de garantir la disponibilité du
              menu choisi.
            </p>
          )}
        </>
      )}

      {activePage === 'menu-detail' && selectedMenu && (
        <section className="home-section" aria-labelledby="menu-detail-title">
          <p className="eyebrow">Détail du menu</p>

          <h2 id="menu-detail-title">{selectedMenu.title}</h2>

          <p>{selectedMenu.description}</p>

          <p className="recipe-category">Thème : {selectedMenu.theme}</p>

          <p className="recipe-category">Régime : {selectedMenu.diet}</p>

          <p className="recipe-time">
            Prix : {(selectedMenu.price / selectedMenu.minPeople).toFixed(2)} €
            par personne
          </p>

          <p className="recipe-time">
            Minimum de commande : {selectedMenu.price.toFixed(2)} € pour{' '}
            {selectedMenu.minPeople} personnes
          </p>

          <p className="recipe-time">
            Stock disponible : {selectedMenu.stock}
          </p>

          <h3>Composition du menu</h3>

          <ul>
            {selectedMenu.dishes.map((dish) => (
              <li key={dish}>{dish}</li>
            ))}
          </ul>

          <button
            type="button"
            className="tip-button"
            onClick={goBackToMenus}
          >
            Retour aux menus
          </button>
        </section>
      )}

      {activePage === 'login' && (
        <section className="home-section" aria-labelledby="login-title">
          <p className="eyebrow">Espace client</p>

          <h2 id="login-title">Connexion</h2>

          <p>
            La connexion sera développée avec une authentification sécurisée,
            des rôles utilisateur, employé et administrateur.
          </p>

          <button type="button" className="tip-button">
            Se connecter
          </button>
        </section>
      )}

            {activePage === 'contact' && (
        <section className="home-section" aria-labelledby="contact-title">
          <p className="eyebrow">Nous contacter</p>

          <h2 id="contact-title">
            Une question sur un menu ou un événement ?
          </h2>

          <p>
            Contactez Julie et José pour une demande personnalisée. Le
            formulaire de contact sera relié à l’API lors de la partie back-end.
          </p>

          <button type="button" className="tip-button">
            Accéder au formulaire de contact
          </button>
        </section>
      )}

      <footer className="footer">
        <div>
          <p className="eyebrow">Horaires</p>

          <h2>Quand nous joindre</h2>

          {openingHours.map((hour) => (
            <p key={hour}>{hour}</p>
          ))}
        </div>

        <div>
          <p className="eyebrow">Informations</p>

          <h2>Documents légaux</h2>

          <button type="button">Mentions légales</button>

          <button type="button">Conditions générales de vente</button>
        </div>
      </footer>
    </main>
  )
}

export default App