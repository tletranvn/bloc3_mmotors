import type { ReactNode } from 'react'

interface Props {
  title: string
  lastUpdated?: string
  children: ReactNode
}

// Conteneur commun aux pages statiques (légales, à propos) : largeur de lecture
// confortable, titre et espacement homogènes.
export default function StaticPageLayout({ title, lastUpdated, children }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-display font-extrabold text-foreground mb-2">{title}</h1>
      {lastUpdated && (
        <p className="text-muted text-sm mb-8">Dernière mise à jour : {lastUpdated}</p>
      )}
      <div className="flex flex-col gap-6 text-foreground text-sm leading-relaxed">
        {children}
      </div>
    </main>
  )
}
