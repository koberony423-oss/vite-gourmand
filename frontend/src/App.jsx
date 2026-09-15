// Composant racine : déclare toutes les routes de l'application dans le gabarit commun (Layout).
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Accueil from './pages/Accueil.jsx'
import Menus from './pages/Menus.jsx'
import MenuDetail from './pages/MenuDetail.jsx'
import Connexion from './pages/Connexion.jsx'
import Inscription from './pages/Inscription.jsx'
import MotDePasseOublie from './pages/MotDePasseOublie.jsx'
import ReinitialiserMotDePasse from './pages/ReinitialiserMotDePasse.jsx'
import Contact from './pages/Contact.jsx'
import Commander from './pages/Commander.jsx'
import MonEspace from './pages/MonEspace.jsx'
import EspaceEmploye from './pages/EspaceEmploye.jsx'
import EspaceAdmin from './pages/EspaceAdmin.jsx'
import MentionsLegales from './pages/MentionsLegales.jsx'
import CGV from './pages/CGV.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/menus" element={<Menus />} />
        <Route path="/menus/:id" element={<MenuDetail />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/reinitialiser" element={<ReinitialiserMotDePasse />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cgv" element={<CGV />} />

        <Route
          path="/commander/:menuId"
          element={
            <ProtectedRoute>
              <Commander />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mon-espace"
          element={
            <ProtectedRoute>
              <MonEspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/espace-employe"
          element={
            <ProtectedRoute roles={['employe', 'administrateur']}>
              <EspaceEmploye />
            </ProtectedRoute>
          }
        />
        <Route
          path="/espace-admin"
          element={
            <ProtectedRoute roles={['administrateur']}>
              <EspaceAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
