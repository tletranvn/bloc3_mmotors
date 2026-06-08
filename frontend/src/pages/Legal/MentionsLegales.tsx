import StaticPageLayout from '../../components/shared/StaticPageLayout'

export default function MentionsLegales() {
  return (
    <StaticPageLayout title="Mentions légales">
      <section>
        <h2 className="text-lg font-semibold mb-2">Éditeur du site</h2>
        <p>
          Le présent site est édité par M-Motors, SAS au capital
          de 1 000 €, immatriculée au RCS de Maris-sous-bois sous le
          numéro K0214584.
        </p>
        <p>Siège social : 120 rue de la Paix, 75000 Paris.</p>
        <p>Email : contact@m-motors.fr — Téléphone : 06 74 52 12 34.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Hébergement</h2>
        <p>
          Application (back-end) hébergée par Heroku.
        </p>
        <p>
          Interface (front-end) hébergée par Vercel.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus de ce site (textes, images, logo, charte graphique) est
          la propriété de M-Motors, sauf mention contraire. Toute reproduction sans
          autorisation est interdite.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Données personnelles</h2>
        <p>
          Le traitement de vos données est décrit dans notre politique de confidentialité.
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
          suppression de vos données.
        </p>
      </section>
    </StaticPageLayout>
  )
}
