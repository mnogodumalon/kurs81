import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen, Calendar, Euro, Users } from 'lucide-react'
import { LivingAppsService, createRecordUrl, extractRecordId } from '@/services/livingAppsService'
import type { Kurse, Dozenten, Raeume } from '@/types/app'
import { APP_IDS } from '@/types/app'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ConfirmDialog'

type FormData = {
  titel: string; beschreibung: string; startdatum: string; enddatum: string
  max_teilnehmer: string; preis: string; dozent_id: string; raum_id: string
}
const empty: FormData = { titel: '', beschreibung: '', startdatum: '', enddatum: '', max_teilnehmer: '', preis: '', dozent_id: '', raum_id: '' }

export default function KursePage() {
  const [items, setItems] = useState<Kurse[]>([])
  const [dozenten, setDozenten] = useState<Dozenten[]>([])
  const [raeume, setRaeume] = useState<Raeume[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Kurse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([LivingAppsService.getKurse(), LivingAppsService.getDozenten(), LivingAppsService.getRaeume()])
      .then(([k, d, r]) => { setItems(k); setDozenten(d); setRaeume(r) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const getDozentName = (url?: string) => {
    if (!url) return null
    const id = extractRecordId(url)
    return dozenten.find(d => d.record_id === id)?.fields.name || null
  }

  const getRaumName = (url?: string) => {
    if (!url) return null
    const id = extractRecordId(url)
    return raeume.find(r => r.record_id === id)?.fields.raumname || null
  }

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Kurse) => {
    setEditing(item)
    setForm({
      titel: item.fields.titel || '',
      beschreibung: item.fields.beschreibung || '',
      startdatum: item.fields.startdatum || '',
      enddatum: item.fields.enddatum || '',
      max_teilnehmer: item.fields.max_teilnehmer != null ? String(item.fields.max_teilnehmer) : '',
      preis: item.fields.preis != null ? String(item.fields.preis) : '',
      dozent_id: extractRecordId(item.fields.dozent) || '',
      raum_id: extractRecordId(item.fields.raum) || '',
    })
    setDialogOpen(true)
  }
  const openDelete = (id: string) => { setDeleteTarget(id); setDeleteOpen(true) }

  const handleSave = async () => {
    if (!form.titel.trim() || !form.startdatum) return
    setSaving(true)
    try {
      const fields: Kurse['fields'] = {
        titel: form.titel,
        beschreibung: form.beschreibung || undefined,
        startdatum: form.startdatum,
        enddatum: form.enddatum || undefined,
        max_teilnehmer: form.max_teilnehmer ? Number(form.max_teilnehmer) : undefined,
        preis: form.preis ? Number(form.preis) : undefined,
        dozent: form.dozent_id ? createRecordUrl(APP_IDS.DOZENTEN, form.dozent_id) : undefined,
        raum: form.raum_id ? createRecordUrl(APP_IDS.RAEUME, form.raum_id) : undefined,
      }
      if (editing) {
        await LivingAppsService.updateKurseEntry(editing.record_id, fields)
      } else {
        await LivingAppsService.createKurseEntry(fields)
      }
      setDialogOpen(false)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await LivingAppsService.deleteKurseEntry(deleteTarget)
      setDeleteOpen(false)
      load()
    } finally { setDeleting(false) }
  }

  const filtered = items.filter(i =>
    (i.fields.titel || '').toLowerCase().includes(search.toLowerCase())
  )

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', marginBottom: 3 }}>Kurse</h1>
          <p style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>{items.length} Kurse erfasst</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, boxShadow: 'var(--shadow-amber)', border: 'none' }}>
          <Plus size={16} />
          Kurs hinzufügen
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input placeholder="Suchen nach Kurstitel..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      <div style={{ background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'hsl(220, 9%, 46%)' }}>Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen size={22} /></div>
            <div style={{ fontWeight: 700, color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>Keine Kurse gefunden</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)', marginBottom: 16 }}>Legen Sie den ersten Kurs an.</div>
            <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, border: 'none' }}>
              <Plus size={15} /> Kurs hinzufügen
            </Button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Dozent</th>
                <th>Raum</th>
                <th>Startdatum</th>
                <th>Enddatum</th>
                <th>Preis</th>
                <th>Max. TN</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isActive = item.fields.enddatum ? item.fields.enddatum >= today : true
                return (
                  <tr key={item.record_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: isActive ? 'hsl(142, 71%, 45%)' : 'hsl(220, 9%, 65%)',
                          flexShrink: 0,
                        }} />
                        <span style={{ fontWeight: 600 }}>{item.fields.titel}</span>
                      </div>
                    </td>
                    <td>
                      {getDozentName(item.fields.dozent) ? (
                        <span style={{ fontSize: '0.875rem' }}>{getDozentName(item.fields.dozent)}</span>
                      ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
                    </td>
                    <td>
                      {getRaumName(item.fields.raum) ? (
                        <span style={{ fontSize: '0.875rem' }}>{getRaumName(item.fields.raum)}</span>
                      ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)' }}>
                        <Calendar size={12} />{item.fields.startdatum || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>{item.fields.enddatum || '—'}</td>
                    <td>
                      {item.fields.preis != null ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: 'hsl(38, 75%, 35%)' }}>
                          <Euro size={12} />{item.fields.preis.toLocaleString('de-DE')}
                        </span>
                      ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
                    </td>
                    <td>
                      {item.fields.max_teilnehmer != null ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>
                          <Users size={12} />{item.fields.max_teilnehmer}
                        </span>
                      ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
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
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ boxShadow: 'var(--shadow-modal)', fontFamily: 'var(--font-family)', maxWidth: 520 }}>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 700 }}>{editing ? 'Kurs bearbeiten' : 'Neuer Kurs'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4, maxHeight: '65vh', overflowY: 'auto' }}>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Titel *</Label>
              <Input value={form.titel} onChange={e => setForm(f => ({ ...f, titel: e.target.value }))} placeholder="Kursbezeichnung" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Beschreibung</Label>
              <textarea
                value={form.beschreibung}
                onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))}
                placeholder="Kurze Beschreibung des Kursinhalts..."
                rows={3}
                style={{
                  marginTop: 5, width: '100%', padding: '8px 12px',
                  border: '1px solid hsl(220, 13%, 91%)', borderRadius: 8,
                  fontFamily: 'var(--font-family)', fontSize: '0.875rem',
                  color: 'hsl(222, 47%, 11%)', resize: 'vertical',
                  outline: 'none', background: 'hsl(0, 0%, 100%)',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Startdatum *</Label>
                <Input type="date" value={form.startdatum} onChange={e => setForm(f => ({ ...f, startdatum: e.target.value }))} style={{ marginTop: 5 }} />
              </div>
              <div>
                <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Enddatum</Label>
                <Input type="date" value={form.enddatum} onChange={e => setForm(f => ({ ...f, enddatum: e.target.value }))} style={{ marginTop: 5 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Max. Teilnehmer</Label>
                <Input type="number" min={1} value={form.max_teilnehmer} onChange={e => setForm(f => ({ ...f, max_teilnehmer: e.target.value }))} placeholder="z.B. 20" style={{ marginTop: 5 }} />
              </div>
              <div>
                <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Preis (€)</Label>
                <Input type="number" min={0} step="0.01" value={form.preis} onChange={e => setForm(f => ({ ...f, preis: e.target.value }))} placeholder="z.B. 299.00" style={{ marginTop: 5 }} />
              </div>
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Dozent</Label>
              <select
                value={form.dozent_id}
                onChange={e => setForm(f => ({ ...f, dozent_id: e.target.value }))}
                style={{
                  marginTop: 5, width: '100%', padding: '8px 12px',
                  border: '1px solid hsl(220, 13%, 91%)', borderRadius: 8,
                  fontFamily: 'var(--font-family)', fontSize: '0.875rem',
                  color: 'hsl(222, 47%, 11%)', background: 'hsl(0, 0%, 100%)',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="">— Kein Dozent —</option>
                {dozenten.map(d => <option key={d.record_id} value={d.record_id}>{d.fields.name}</option>)}
              </select>
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Raum</Label>
              <select
                value={form.raum_id}
                onChange={e => setForm(f => ({ ...f, raum_id: e.target.value }))}
                style={{
                  marginTop: 5, width: '100%', padding: '8px 12px',
                  border: '1px solid hsl(220, 13%, 91%)', borderRadius: 8,
                  fontFamily: 'var(--font-family)', fontSize: '0.875rem',
                  color: 'hsl(222, 47%, 11%)', background: 'hsl(0, 0%, 100%)',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="">— Kein Raum —</option>
                {raeume.map(r => <option key={r.record_id} value={r.record_id}>{r.fields.raumname}{r.fields.gebaeude ? ` (${r.fields.gebaeude})` : ''}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter style={{ marginTop: 8 }}>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.titel.trim() || !form.startdatum}
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
        title="Kurs löschen"
        description="Möchten Sie diesen Kurs wirklich löschen? Alle zugehörigen Anmeldungen bleiben bestehen."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
