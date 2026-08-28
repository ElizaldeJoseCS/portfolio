import { profile } from '@/data'

const monogram = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-bg/60 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-lg font-bold tracking-[0.2em] text-fg">
          {monogram(profile.name)}
        </p>
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}. Built with React Three Fiber.
        </p>
      </div>
    </footer>
  )
}
