import type { NavPage } from '../types'

/**
 * The site, as data.
 *
 * The menu bar, the Start menu, the per-page <title>/<meta> and the home
 * page's index of sections all read this array, so adding a page is one entry
 * here plus a route in `App`. `public/sitemap.xml` has to be updated by hand
 * to match — it is a static file the build never sees.
 */
export const PAGES: NavPage[] = [
  {
    path: '/',
    label: 'Home',
    title: 'Jose Elizalde — Software Engineer & Game Developer',
    description:
      'CS & Engineering at UCLA. Systems in C++ and Python, and games directed and built in Unity.',
  },
  {
    path: '/about',
    label: 'About',
    title: 'About — Jose Elizalde',
    description:
      'Background, what I am working on now, interests, and the full skill breakdown across systems and game development.',
  },
  {
    path: '/projects',
    label: 'Projects',
    title: 'Projects — Jose Elizalde',
    description:
      'Software and game development projects, from a C++ Discord bot and a market data pipeline to Unity games.',
  },
  {
    path: '/experience',
    label: 'Experience',
    title: 'Experience — Jose Elizalde',
    description: 'Research and studio roles, education, and published papers including CHI 2026.',
  },
  {
    path: '/contact',
    label: 'Contact',
    title: 'Contact — Jose Elizalde',
    description: 'Email, GitHub, LinkedIn, itch.io and a copy of my resume.',
  },
]

export const pageFor = (pathname: string): NavPage | undefined =>
  PAGES.find((p) => p.path === pathname)
