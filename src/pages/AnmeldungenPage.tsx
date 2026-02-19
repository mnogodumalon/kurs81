import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ClipboardList, CheckCircle2, XCircle, Calendar } from 'lucide-react'
import { LivingAppsService, createRecordUrl, extractRecordId } from '@/services/livingAppsService'
import type { Anmeldungen, Kurse, Teilnehmer } from '@/types/app'
import { APP_IDS } from '@/types/app'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ConfirmDialog'

type FormData = { teilnehmer_id: string; kurs_id: string; anmeldedatum: string; bezahlt: boolean }
const empty: FormData = { teilnehmer_id: '', kurs_id: '', anmeldedatum: new Date().toISOString().slice(0, 10), bezahlt: false }

export default function AnmeldungenPage() {
  const [items, setItems] = useState<Anmeldungen[]>([])
  const [kurse, setKurse] = useState<Kurse[]>([])
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Anmeldungen | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [filterBezahlt, setFilterBezahlt] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([LivingAppsService.getAnmeldungen(), LivingAppsService.getKurse(), LivingAppsService.getTeilnehmer()])
      .then(([a, k, t]) => { setItems(a); setKurse(k); setTeilnehmer(t) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const getTeilnehmerName = (url?: string) => {
    if (!url) return null
    const id = extractRecordId(url)
    return teilnehmer.find(t => t.record_id === id)?.fields.name || null
  }

  const getKursTitel = (url?: string) => {
    if (!url) return null
    const id = extractRecordId(url)
    return kurse.find(k => k.record_id === id)?.fields.titel || null
  }

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Anmeldungen) => {
    setEditing(item)
    setForm({
      teilnehmer_id: extractRecordId(item.fields.teilnehmer) || '',
      kurs_id: extractRecordId(item.fields.kurs) || '',
      anmeldedatum: item.fields.anmeldedatum || '',
      bezahlt: item.fields.bezahlt ?? false,
    })
    setDialogOpen(true)
  }
  const openDelete = (id: string) => { setDeleteTarget(id); setDeleteOpen(true) }

  const handleToggleBezahlt = async (item: Anmeldungen) => {
    await LivingAppsService.updateAnmeldungenEntry(item.record_id, { bezahlt: !item.fields.bezahlt })
    load()
  }

  const handleSave = async () => {
    if (!form.teilnehmer_id || !form.kurs_id || !form.anmeldedatum) return
    setSaving(true)
    try {
      const fields: Anmeldungen['fields'] = {
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, form.teilnehmer_id),
        kurs: createRecordUrl(APP_IDS.KURSE, form.kurs_id),
        anmeldedatum: form.anmeldedatum,
        bezahlt: form.bezahlt,
      }
      if (editing) {
        await LivingAppsService.updateAnmeldungenEntry(editing.record_id, fields)
      } else {
        await LivingAppsService.createAnmeldungenEntry(fields)
      }
      setDialogOpen(false)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await LivingAppsService.deleteAnmeldungenEntry(deleteTarget)
      setDeleteOpen(false)
      load()
    } finally { setDeleting(false) }
  }

  const filtered = items.filter(item => {
    const tn = getTeilnehmerName(item.fields.teilnehmer) || ''
    const kurs = getKursTitel(item.fields.kurs) || ''
    const matchSearch = tn.toLowerCase().includes(search.toLowerCase()) || kurs.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filterBezahlt === 'all' ? true : filterBezahlt === 'paid' ? item.fields.bezahlt === true : item.fields.bezahlt !== true
    return matchSearch && matchFilter
  })

  const paidCount = items.filter(i => i.fields.bezahlt).length
  const unpaidCount = items.filter(i => !i.fields.bezahlt).length

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', marginBottom: 3 }}>Anmeldungen</h1>
          <p style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>
            {items.length} Anmeldungen · <span style={{ color: 'hsl(142, 55%, 35%)' }}>{paidCount} bezahlt</span> · <span style={{ color: 'hsl(0, 65%, 45%)' }}>{unpaidCount} offen</span>
          </p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, boxShadow: 'var(--shadow-amber)', border: 'none' }}>
          <Plus size={16} />
          Anmeldung hinzufügen
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input placeholder="Suchen nach Teilnehmer oder Kurs..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'paid', 'unpaid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterBezahlt(f)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', transition: 'var(--transition-smooth)',
                background: filterBezahlt === f ? 'hsl(222, 47%, 11%)' : 'hsl(0, 0%, 100%)',
                color: filterBezahlt === f ? 'hsl(0, 0%, 100%)' : 'hsl(220, 9%, 46%)',
                border: filterBezahlt === f ? '1px solid hsl(222, 47%, 11%)' : '1px solid hsl(220, 13%, 91%)',
              }}
            >
              {f === 'all' ? 'Alle' : f === 'paid' ? '✓ Bezahlt' : '⚠ Offen'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'hsl(220, 9%, 46%)' }}>Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ClipboardList size={22} /></div>
            <div style={{ fontWeight: 700, color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>Keine Anmeldungen gefunden</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)', marginBottom: 16 }}>Melden Sie Teilnehmer für Kurse an.</div>
            <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, border: 'none' }}>
              <Plus size={15} /> Anmeldung erfassen
            </Button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Teilnehmer</th>
                <th>Kurs</th>
                <th>Anmeldedatum</th>
                <th>Bezahlt</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.record_id}>
                  <td style={{ fontWeight: 600 }}>{getTeilnehmerName(item.fields.teilnehmer) || <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}</td>
                  <td style={{ color: 'hsl(220, 9%, 46%)' }}>{getKursTitel(item.fields.kurs) || <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}</td>
                  <td>
                    {item.fields.anmeldedatum ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)' }}>
                        <Calendar size={12} />{item.fields.anmeldedatum}
                      </span>
                    ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleBezahlt(item)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title="Klicken zum Umschalten"
                    >
                      {item.fields.bezahlt ? (
                        <span className="badge-paid">
                          <CheckCircle2 size={11} />
                          Bezahlt
                        </span>
                      ) : (
                        <span className="badge-unpaid">
                          <XCircle size={11} />
                          Offen
                        </span>
                      )}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => openEdit(item)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid hsl(220, 13%, 91%)', background: 'none', cursor: 'pointer', color: 'hsl(220, 9%, 46%)' }}>
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => openDelete(item.record_id)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid hsl(0, 72%, 88%)', background: 'none', cursor: 'pointer', color: 'hsl(0, 65%, 45%)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ boxShadow: 'var(--shadow-modal)', fontFamily: 'var(--font-family)', maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 700 }}>{editing ? 'Anmeldung bearbeiten' : 'Neue Anmeldung'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Teilnehmer *</Label>
              <select
                value={form.teilnehmer_id}
                onChange={e => setForm(f => ({ ...f, teilnehmer_id: e.target.value }))}
                style={{
                  marginTop: 5, width: '100%', padding: '8px 12px',
                  border: '1px solid hsl(220, 13%, 91%)', borderRadius: 8,
                  fontFamily: 'var(--font-family)', fontSize: '0.875rem',
                  color: form.teilnehmer_id ? 'hsl(222, 47%, 11%)' : 'hsl(220, 9%, 60%)',
                  background: 'hsl(0, 0%, 100%)', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="">— Teilnehmer auswählen —</option>
                {teilnehmer.map(t => <option key={t.record_id} value={t.record_id}>{t.fields.name}</option>)}
              </select>
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Kurs *</Label>
              <select
                value={form.kurs_id}
                onChange={e => setForm(f => ({ ...f, kurs_id: e.target.value }))}
                style={{
                  marginTop: 5, width: '100%', padding: '8px 12px',
                  border: '1px solid hsl(220, 13%, 91%)', borderRadius: 8,
                  fontFamily: 'var(--font-family)', fontSize: '0.875rem',
                  color: form.kurs_id ? 'hsl(222, 47%, 11%)' : 'hsl(220, 9%, 60%)',
                  background: 'hsl(0, 0%, 100%)', cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="">— Kurs auswählen —</option>
                {kurse.map(k => <option key={k.record_id} value={k.record_id}>{k.fields.titel}</option>)}
              </select>
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Anmeldedatum *</Label>
              <Input type="date" value={form.anmeldedatum} onChange={e => setForm(f => ({ ...f, anmeldedatum: e.target.value }))} style={{ marginTop: 5 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'hsl(220, 13%, 96%)', borderRadius: 8, marginTop: 2 }}>
              <input
                type="checkbox"
                id="bezahlt"
                checked={form.bezahlt}
                onChange={e => setForm(f => ({ ...f, bezahlt: e.target.checked }))}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'hsl(38, 92%, 50%)' }}
              />
              <Label htmlFor="bezahlt" style={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', margin: 0 }}>
                Kurs bereits bezahlt
              </Label>
            </div>
          </div>
          <DialogFooter style={{ marginTop: 8 }}>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.teilnehmer_id || !form.kurs_id || !form.anmeldedatum}
              style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, border: 'none', boxShadow: 'var(--shadow-amber)' }}
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Anmeldung löschen"
        description="Möchten Sie diese Anmeldung wirklich löschen?"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
