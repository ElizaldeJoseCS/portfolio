import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteShell } from '@/components/SiteShell'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ExperiencePage } from '@/pages/ExperiencePage'
import { ContactPage } from '@/pages/ContactPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

/**
 * Five pages inside one window.
 *
 * `BrowserRouter` rather than a hash router because the host already rewrites
 * every unmatched path to index.html and serves clean URLs (see vercel.json) —
 * so /projects is a real, linkable, crawlable address rather than
 * /#/projects.
 *
 * No lazy routes: the whole site is a few kilobytes of JSX over data that is
 * already in the main bundle, and code-splitting five pages that size buys a
 * request per navigation and saves nothing worth having.
 */
export default function App() {
  return (
    <BrowserRouter>
      {/*
        The skip link sits outside the shell so it is the first focusable thing
        in the document, ahead of the window chrome.
      */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-3 focus:font-display focus:text-bg"
      >
        Skip to content
      </a>

      <Routes>
        <Route element={<SiteShell />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
