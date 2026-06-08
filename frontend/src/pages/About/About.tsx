import { Link } from 'react-router-dom'
import StaticPageLayout from '../../components/shared/StaticPageLayout'

export default function About() {
  return (
    <StaticPageLayout title="À propos de M-Motors">
      <p>
        M-Motors est une plateforme dédiée à la vente et à la location longue durée (LLD) de
        véhicules. Notre objectif : rendre l'accès à un véhicule simple, transparent et adapté
        à chaque besoin.
      </p>

      <section>
        <h2 className="text-lg font-semibold mb-2">Nos services</h2>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>Achat de véhicules neufs et d'occasion sélectionnés.</li>
          <li>Location longue durée avec services optionnels à la carte.</li>
          <li>Suivi de votre dossier en ligne, de la demande à la validation.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Notre engagement</h2>
        <p>
          Nous mettons l'accent sur la clarté des offres et la qualité de l'accompagnement.
          Chaque dossier est étudié avec soin par notre équipe.
        </p>
      </section>

      <p>
        Découvrez nos véhicules disponibles dans{' '}
        <Link to="/vehicles" className="hover-link text-primary">notre catalogue</Link>, ou
        <Link to="/contact" className="hover-link text-primary"> contactez-nous</Link> pour
        toute question.
      </p>
    </StaticPageLayout>
  )
}
