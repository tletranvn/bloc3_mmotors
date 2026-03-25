import { Link } from 'react-router-dom'
import {
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  KeyIcon,
} from '@heroicons/react/24/outline'
import type { ComponentType } from 'react'

interface Advantage {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
  title: string
  description: string
}

const advantages: Advantage[] = [
  {
    icon: ShieldCheckIcon,
    title: 'Garantie qualité',
    description: 'Tous nos véhicules sont contrôlés et certifiés avant mise en vente.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Service après-vente',
    description: 'Une équipe dédiée pour vous accompagner après votre achat ou location.',
  },
  {
    icon: CreditCardIcon,
    title: 'Financement',
    description: 'Des solutions de financement adaptées à tous les profils.',
  },
  {
    icon: KeyIcon,
    title: 'Essai gratuit',
    description: 'Testez le véhicule de votre choix sans engagement.',
  },
]

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section
        aria-label="Présentation principale"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center gap-6"
      >
        <h1 className="animate-fade-in-up animation-delay-0 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
          Trouvez votre véhicule idéal
        </h1>
        <p className="animate-fade-in-up animation-delay-150 text-muted text-lg sm:text-xl max-w-2xl">
          Achat ou location longue durée — M-Motors vous propose une sélection de véhicules de qualité, avec un accompagnement personnalisé.
        </p>
        <Link
          to="/vehicles"
          className="animate-fade-in-up animation-delay-300 hover-btn bg-primary text-white font-semibold px-8 py-3 rounded text-base"
        >
          Découvrir nos véhicules
        </Link>
      </section>

      {/* Advantages Section */}
      <section aria-label="Nos avantages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-2xl font-extrabold text-foreground text-center mb-12">
          Pourquoi choisir M-Motors ?
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0">
          {advantages.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="hover-card bg-surface rounded-lg p-6 flex flex-col gap-3 border border-black/8"
            >
              <Icon className="w-8 h-8 text-primary" aria-hidden="true" />
              <h3 className="text-foreground font-semibold text-base">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{description}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* About Section */}
      <section aria-label="À propos de M-Motors" className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-6">
          <h2 className="font-display text-3xl font-extrabold text-foreground">M-Motors</h2>
          <p className="text-muted text-base leading-relaxed max-w-5xl">
            Créée en 1987, M-Motors est un spécialiste reconnu de la vente de véhicules d'occasion.
            Après plus de 30 ans d'activité, l'entreprise s'est imposée parmi les 10 premières du secteur
            au niveau national, grâce à une approche centrée sur la satisfaction client.
          </p>
          <p className="text-muted text-base leading-relaxed max-w-5xl">
            Nous proposons une gamme variée de marques, modèles, motorisations et budgets pour répondre
            aux besoins de chaque client. Chaque véhicule bénéficie de contrôles techniques approfondis,
            de remises en état et de garanties assurant fiabilité et sécurité.
          </p>
          <p className="text-muted text-base leading-relaxed max-w-5xl">
            Notre service commercial et après-vente vous accompagne avec des conseils personnalisés,
            des essais routiers sans engagement, des solutions de financement adaptées en partenariat
            avec des organismes financiers, ainsi que la possibilité de reprendre votre ancien véhicule
            pour faciliter votre achat.
          </p>
        </div>
      </section>
    </main>
  )
}
