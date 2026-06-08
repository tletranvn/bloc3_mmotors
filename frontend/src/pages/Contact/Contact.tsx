import StaticPageLayout from '../../components/shared/StaticPageLayout'

export default function Contact() {
  return (
    <StaticPageLayout title="Contact">
      <p>
        Une question sur un véhicule, un dossier de vente ou de location ? Notre équipe est à
        votre disposition.
      </p>

      <section>
        <h2 className="text-lg font-semibold mb-2">Nous écrire</h2>
        <p>
          Email :{' '}
          <a href="mailto:contact@m-motors.fr" className="hover-link text-primary">
            contact@m-motors.fr
          </a>
        </p>
        <p>
          Téléphone :{' '}
          <a href="tel:+33100000000" className="hover-link text-primary">
            06 74 52 12 34
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Nous rendre visite</h2>
        <p>120 rue de la Paix, 75000 Paris</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Horaires d'ouverture</h2>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>Lundi – Vendredi : 9h00 – 18h30</li>
          <li>Samedi : 9h00 – 12h30</li>
          <li>Dimanche : fermé</li>
        </ul>
      </section>
    </StaticPageLayout>
  )
}
