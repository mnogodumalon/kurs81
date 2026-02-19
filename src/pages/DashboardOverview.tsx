import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap, Users, DoorOpen, ClipboardList, TrendingUp, Euro, AlertCircle } from 'lucide-react'
import { LivingAppsService } from '@/services/livingAppsService'
import type { Kurse, Dozenten, Teilnehmer, Raeume, Anmeldungen } from '@/types/app'
import type { PageKey } from '@/components/AppLayout'

interface DashboardOverviewProps {
  onNavigate: (page: PageKey) => void
}

export default function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [kurse, setKurse] = useState<Kurse[]>([])
  const [dozenten, setDozenten] = useState<Dozenten[]>([])
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([])
  const [raeume, setRaeume] = useState<Raeume[]>([])
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      LivingAppsService.getKurse(),
      LivingAppsService.getDozenten(),
      LivingAppsService.getTeilnehmer(),
      LivingAppsService.getRaeume(),
      LivingAppsService.getAnmeldungen(),
    ]).then(([k, d, t, r, a]) => {
      setKurse(k)
      setDozenten(d)
      setTeilnehmer(t)
      setRaeume(r)
      setAnmeldungen(a)
    }).finally(() => setLoading(false))
  }, [])

  const unpaidCount = anmeldungen.filter(a => !a.fields.bezahlt).length
  const paidCount = anmeldungen.filter(a => a.fields.bezahlt).length
  const totalRevenue = anmeldungen
    .filter(a => a.fields.bezahlt)
    .reduce((sum, a) => {
      const kursRecord = kurse.find(k => k.record_id === a.fields.kurs?.split('/').pop())
      return sum + (kursRecord?.fields.preis ?? 0)
    }, 0)

  const today = new Date().toISOString().slice(0, 10)
  const activeKurse = kurse.filter(k => k.fields.enddatum && k.fields.enddatum >= today).length

  if (loading) {
    return (
      <div className="page-enter">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="kpi-card" style={{ height: 110, background: 'hsl(220, 13%, 94%)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', marginBottom: 4 }}>
          Übersicht
        </h1>
        <p style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>
          Alle wichtigen Kennzahlen auf einen Blick
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Hero KPI */}
        <div className="kpi-hero" style={{ cursor: 'pointer' }} onClick={() => onNavigate('kurse')}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={22} color="hsl(38, 92%, 60%)" />
            </div>
            <span style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'hsl(38, 92%, 70%)',
              fontSize: '0.72rem', fontWeight: 600,
              padding: '3px 10px', borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              {activeKurse} aktiv
            </span>
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'hsl(0, 0%, 100%)', lineHeight: 1, marginBottom: 6 }}>
            {kurse.length}
          </div>
          <div style={{ color: 'hsl(215, 20%, 70%)', fontSize: '0.85rem', fontWeight: 500 }}>
            Kurse gesamt
          </div>
        </div>

        {/* Dozenten */}
        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('dozenten')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38,
              background: 'hsl(38, 92%, 96%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={18} color="hsl(38, 75%, 40%)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', lineHeight: 1, marginBottom: 4 }}>
            {dozenten.length}
          </div>
          <div style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.82rem', fontWeight: 500 }}>Dozenten</div>
        </div>

        {/* Teilnehmer */}
        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('teilnehmer')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38,
              background: 'hsl(200, 80%, 96%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} color="hsl(200, 70%, 40%)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', lineHeight: 1, marginBottom: 4 }}>
            {teilnehmer.length}
          </div>
          <div style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.82rem', fontWeight: 500 }}>Teilnehmer</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Räume */}
        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('raeume')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38,
              background: 'hsl(280, 60%, 96%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <DoorOpen size={18} color="hsl(280, 50%, 45%)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', lineHeight: 1, marginBottom: 4 }}>
            {raeume.length}
          </div>
          <div style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.82rem', fontWeight: 500 }}>Räume</div>
        </div>

        {/* Anmeldungen */}
        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('anmeldungen')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38,
              background: 'hsl(142, 60%, 94%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ClipboardList size={18} color="hsl(142, 55%, 35%)" />
            </div>
            {unpaidCount > 0 && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'hsl(0, 72%, 96%)', color: 'hsl(0, 65%, 45%)',
                fontSize: '0.7rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: 20,
                border: '1px solid hsl(0, 72%, 88%)',
              }}>
                <AlertCircle size={11} />
                {unpaidCount} offen
              </span>
            )}
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', lineHeight: 1, marginBottom: 4 }}>
            {anmeldungen.length}
          </div>
          <div style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.82rem', fontWeight: 500 }}>Anmeldungen</div>
        </div>

        {/* Umsatz */}
        <div className="kpi-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{
              width: 38, height: 38,
              background: 'hsl(38, 92%, 94%)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Euro size={18} color="hsl(38, 75%, 40%)" />
            </div>
            <span style={{ color: 'hsl(142, 55%, 35%)', fontSize: '0.72rem', fontWeight: 600 }}>
              {paidCount} bezahlt
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', lineHeight: 1, marginBottom: 4 }}>
            {totalRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </div>
          <div style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.82rem', fontWeight: 500 }}>Einnahmen (bezahlt)</div>
        </div>
      </div>

      {/* Recent courses */}
      {kurse.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(222, 47%, 11%)' }}>Aktuelle Kurse</h2>
            <button
              onClick={() => onNavigate('kurse')}
              style={{ fontSize: '0.82rem', color: 'hsl(38, 75%, 40%)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Alle anzeigen →
            </button>
          </div>
          <div style={{ background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titel</th>
                  <th>Startdatum</th>
                  <th>Enddatum</th>
                  <th>Preis</th>
                </tr>
              </thead>
              <tbody>
                {kurse.slice(0, 5).map(kurs => (
                  <tr key={kurs.record_id}>
                    <td style={{ fontWeight: 600 }}>{kurs.fields.titel || '—'}</td>
                    <td style={{ color: 'hsl(220, 9%, 46%)' }}>{kurs.fields.startdatum || '—'}</td>
                    <td style={{ color: 'hsl(220, 9%, 46%)' }}>{kurs.fields.enddatum || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'hsl(38, 75%, 35%)' }}>
                      {kurs.fields.preis != null ? `${kurs.fields.preis.toLocaleString('de-DE')} €` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty welcome state */}
      {kurse.length === 0 && (
        <div style={{
          background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)',
          boxShadow: 'var(--shadow-card)',
        }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <TrendingUp size={22} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>
              Willkommen beim KursManager
            </div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)', maxWidth: 320, marginBottom: 20 }}>
              Starten Sie mit der Erfassung Ihrer Dozenten, Räume und Kurse.
            </div>
            <button
              onClick={() => onNavigate('kurse')}
              style={{
                background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)',
                padding: '10px 20px', borderRadius: 8, fontWeight: 700,
                border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                boxShadow: 'var(--shadow-amber)',
              }}
            >
              Ersten Kurs anlegen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
