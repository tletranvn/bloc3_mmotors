import { Link } from 'react-router-dom'
import { MotorsLogo } from '../../shared/LogoM'
import { SiInstagram, SiFacebook } from '@icons-pack/react-simple-icons'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-black/8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MotorsLogo className="w-8 h-8 text-primary group-hover:text-foreground transition-colors" />
              <span className="text-foreground font-display font-extrabold tracking-widest text-sm">M-MOTORS</span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Application web pour la vente et la location longue durée (LLD) de véhicules.
            </p>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-foreground font-semibold text-sm mb-4 uppercase tracking-wider">Légal</h3>
            <ul className="flex flex-col gap-2">
              <li><Link to="/cgu" className="hover-link text-muted hover:text-primary text-sm">CGU</Link></li>
              <li><Link to="/mentions-legales" className="hover-link text-muted hover:text-primary text-sm">Mentions légales</Link></li>
              <li><Link to="/politique-confidentialite" className="hover-link text-muted hover:text-primary text-sm">Politique de confidentialité</Link></li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-foreground font-semibold text-sm mb-4 uppercase tracking-wider">Réseaux Sociaux</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="hover-link text-muted hover:text-primary text-sm flex items-center gap-2">
                  <SiInstagram size={16} />
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="hover-link text-muted hover:text-primary text-sm flex items-center gap-2">
                  <SiFacebook size={16} />
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-black/8 mt-8 pt-8 text-center">
          <p className="text-muted text-xs">
            © {year} M-MOTORS. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
