import type { Metadata } from 'next'
import { JetBrains_Mono, Schibsted_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'

import { Nav } from '@/components/Nav'
import { getSettings } from '@/lib/data'

import './styles.css'

const sans = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

// Always read the database, so a coach sees new entries the moment they are published.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { projectName } = await getSettings()
  return {
    title: { default: projectName, template: `%s · ${projectName}` },
    description: `Process, research and planning log: ${projectName}.`,
  }
}

export default async function Layout({ children }: { children: ReactNode }) {
  const { projectName, client, coach } = await getSettings()

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <div className="wrap site-header__inner">
            <Link href="/" className="site-title">
              {projectName}
            </Link>
            <Suspense fallback={<nav className="nav" aria-label="Main" />}>
              <Nav />
            </Suspense>
          </div>
        </header>
        <main className="wrap main">{children}</main>
        <footer className="wrap site-footer">
          <span>{[client && `Client: ${client}`, coach && `Coach: ${coach}`].filter(Boolean).join(' · ')}</span>
          <Link href="/admin">Team login</Link>
        </footer>
      </body>
    </html>
  )
}
