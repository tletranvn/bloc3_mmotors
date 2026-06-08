import StaticPageLayout from '../../components/shared/StaticPageLayout'

export default function Cgu() {
  return (
    <StaticPageLayout title="Conditions générales d'utilisation" lastUpdated="[date — À COMPLÉTER]">
      <section>
        <h2 className="text-lg font-semibold mb-2">1. Objet</h2>
        <p>
          Les présentes conditions générales d'utilisation (CGU) régissent l'accès et
          l'utilisation de la plateforme M-Motors, dédiée à la vente et à la location longue
          durée (LLD) de véhicules.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">2. Accès au service</h2>
        <p>
          La consultation du catalogue est libre. La constitution d'un dossier de vente ou de
          location nécessite la création d'un compte et l'acceptation des présentes CGU.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">3. Compte utilisateur</h2>
        <p>
          L'utilisateur s'engage à fournir des informations exactes lors de son inscription et
          à préserver la confidentialité de ses identifiants. Il est responsable des actions
          réalisées depuis son compte.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">4. Dossiers et documents</h2>
        <p>
          Les documents transmis (pièce d'identité, justificatifs) sont utilisés uniquement
          dans le cadre de l'étude du dossier. M-Motors se réserve le droit de refuser un
          dossier incomplet ou ne répondant pas aux conditions.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">5. Responsabilité</h2>
        <p>
          M-Motors s'efforce d'assurer l'exactitude des informations du catalogue mais ne
          saurait être tenue responsable d'éventuelles erreurs ou indisponibilités du service.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">6. Modification des CGU</h2>
        <p>
          M-Motors peut modifier les présentes CGU à tout moment. La version applicable est
          celle en vigueur à la date d'utilisation du service.
        </p>
      </section>
    </StaticPageLayout>
  )
}
