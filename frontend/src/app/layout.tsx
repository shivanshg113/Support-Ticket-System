import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Support Desk', template: '%s · Support Desk' },
  description: 'Support ticket management system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full flex" style={{ background: '#f4f4f5' }}>

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-[228px] flex-shrink-0 fixed inset-y-0 left-0 z-40"
          style={{ background: '#111111' }}>

          {/* Workspace header */}
          <div className="flex items-center gap-2.5 h-[52px] px-4 border-b border-white/[0.06]">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white leading-none">Support Desk</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Workspace</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <div className="space-y-0.5">
              <a href="/"
                className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] text-[13px] font-medium group transition-colors">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                All Tickets
              </a>

              <a href="/tickets/new"
                className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] text-[13px] font-medium transition-colors">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
              </a>
            </div>

            {/* Section divider */}
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">Views</p>
              {[
                {
                  label: 'Open',
                  href: '/?status=OPEN',
                  dot: 'bg-blue-500',
                },
                {
                  label: 'In Progress',
                  href: '/?status=IN_PROGRESS',
                  dot: 'bg-amber-500',
                },
                {
                  label: 'Critical',
                  href: '/?priority=CRITICAL',
                  dot: 'bg-red-500',
                },
              ].map(v => (
                <a key={v.label} href={v.href}
                  className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.05] text-[13px] transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.dot}`} />
                  {v.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="px-3 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">S</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-neutral-400 truncate">Support Agent</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col md:ml-[228px] min-h-full">

          {/* Top bar */}
          <header className="sticky top-0 z-30 h-[52px] bg-white border-b border-gray-200 flex items-center px-5 gap-3">
            {/* Mobile logo */}
            <a href="/" className="flex md:hidden items-center gap-2 flex-shrink-0 mr-2">
              <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-[13px] font-semibold text-gray-900">Support Desk</span>
            </a>

            <div className="flex-1" />

            <a href="/tickets/new"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium px-3 py-1.5 rounded-md">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Ticket
            </a>

            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[11px] font-bold">
              SA
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <div className="max-w-[1100px] mx-auto px-5 py-6">
              <div className="page-enter">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
