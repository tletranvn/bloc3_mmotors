import StaticPageLayout from '../../components/shared/StaticPageLayout'

export default function PolitiqueConfidentialite() {
  return (
    <StaticPageLayout title="Politique de confidentialité">
      <section>
        <h2 className="text-lg font-semibold mb-2">Responsable du traitement</h2>
        <p>
          M-Motors est responsable du traitement des données personnelles collectées sur la
          plateforme. Pour toute question : contact@m-motors.fr.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Données collectées</h2>
        <p>Dans le cadre de votre utilisation du service, nous collectons :</p>
        <ul className="list-disc pl-6 flex flex-col gap-1">
          <li>Données d'identité : nom, prénom, email, téléphone, adresse.</li>
          <li>Données de dossier : profession, revenus, documents justificatifs.</li>
          <li>Données de connexion nécessaires à l'authentification.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Finalités</h2>
        <p>
          Ces données servent uniquement à la gestion de votre compte, à l'étude de vos
          dossiers de vente ou de location, et au suivi de la relation client. Elles ne sont
          jamais revendues à des tiers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Durée de conservation</h2>
        <p>
          Les données sont conservées le temps nécessaire au traitement de votre dossier, puis
          archivées ou supprimées conformément aux obligations légales après 5 ans.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Vos droits (RGPD)</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données, vous disposez d'un
          droit d'accès, de rectification, de suppression et de portabilité de vos données,
          ainsi que d'un droit d'opposition. Pour exercer ces droits, contactez-nous à
          contact@m-motors.fr.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Sécurité</h2>
        <p>
          Vos mots de passe sont chiffrés et l'accès aux données est restreint. Les échanges
          avec le serveur sont sécurisés (HTTPS).
        </p>
      </section>
    </StaticPageLayout>
  )
}
