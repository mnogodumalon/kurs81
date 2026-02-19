import { useState } from 'react'
import { BookOpen, Users, UserCheck, DoorOpen, ClipboardList, LayoutDashboard, Menu, X, GraduationCap } from 'lucide-react'

export type PageKey = 'dashboard' | 'kurse' | 'dozenten' | 'teilnehmer' | 'raeume' | 'anmeldungen'

interface AppLayoutProps {
  currentPage: PageKey
  onNavigate: (page: PageKey) => void
  children: React.ReactNode
}

const navItems: { key: PageKey; label: string; icon: React.ElementType; count?: number }[] = [
  { key: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { key: 'kurse', label: 'Kurse', icon: BookOpen },
  { key: 'dozenten', label: 'Dozenten', icon: GraduationCap },
  { key: 'teilnehmer', label: 'Teilnehmer', icon: Users },
  { key: 'raeume', label: 'Räume', icon: DoorOpen },
  { key: 'anmeldungen', label: 'Anmeldungen', icon: ClipboardList },
]

export default function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        width: 240,
        background: 'hsl(222, 47%, 11%)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }}
        className="max-md:translate-x-[-240px] max-md:data-[open=true]:translate-x-0"
        data-open={sidebarOpen}
      >
        {/* Logo */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid hsl(222, 35%, 18%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34,
              background: 'var(--gradient-primary)',
              borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-amber)',
            }}>
              <BookOpen size={17} color="hsl(222, 47%, 11%)" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: 'hsl(0, 0%, 100%)', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                KursManager
              </div>
              <div style={{ color: 'hsl(215, 20%, 50%)', fontSize: '0.7rem', fontWeight: 500 }}>
                Verwaltungssystem
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'none', color: 'hsl(215, 20%, 65%)', background: 'none', border: 'none', cursor: 'pointer' }}
            className="max-md:flex"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 12px', overflow: 'auto' }}>
          <div style={{ marginBottom: 6, padding: '8px 12px 4px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(215, 15%, 40%)' }}>
            Navigation
          </div>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = currentPage === item.key
            return (
              <button
                key={item.key}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                onClick={() => { onNavigate(item.key); setSidebarOpen(false) }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid hsl(222, 35%, 18%)',
          fontSize: '0.72rem',
          color: 'hsl(215, 15%, 40%)',
        }}>
          KursManager v1.0
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="max-md:ml-0">
        {/* Mobile header */}
        <header style={{
          display: 'none',
          padding: '0 16px',
          height: 56,
          background: 'hsl(222, 47%, 11%)',
          alignItems: 'center',
          gap: 12,
          position: 'sticky', top: 0, zIndex: 30,
        }} className="max-md:flex">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ color: 'hsl(215, 20%, 65%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <Menu size={20} />
          </button>
          <div style={{ color: 'hsl(0, 0%, 100%)', fontWeight: 700, fontSize: '0.9rem' }}>KursManager</div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px', maxWidth: 1200, width: '100%' }} className="max-md:px-4 max-md:py-5">
          {children}
        </main>
      </div>
    </div>
  )
}
