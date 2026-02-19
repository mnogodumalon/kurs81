import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, Mail, Phone, Calendar } from 'lucide-react'
import { LivingAppsService } from '@/services/livingAppsService'
import type { Teilnehmer } from '@/types/app'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ConfirmDialog'

type FormData = { name: string; email: string; telefon: string; geburtsdatum: string }
const empty: FormData = { name: '', email: '', telefon: '', geburtsdatum: '' }

export default function TeilnehmerPage() {
  const [items, setItems] = useState<Teilnehmer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Teilnehmer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    LivingAppsService.getTeilnehmer().then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Teilnehmer) => {
    setEditing(item)
    setForm({ name: item.fields.name || '', email: item.fields.email || '', telefon: item.fields.telefon || '', geburtsdatum: item.fields.geburtsdatum || '' })
    setDialogOpen(true)
  }
  const openDelete = (id: string) => { setDeleteTarget(id); setDeleteOpen(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const fields: Teilnehmer['fields'] = { name: form.name, email: form.email || undefined, telefon: form.telefon || undefined, geburtsdatum: form.geburtsdatum || undefined }
      if (editing) {
        await LivingAppsService.updateTeilnehmerEntry(editing.record_id, fields)
      } else {
        await LivingAppsService.createTeilnehmerEntry(fields)
      }
      setDialogOpen(false)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await LivingAppsService.deleteTeilnehmerEntry(deleteTarget)
      setDeleteOpen(false)
      load()
    } finally { setDeleting(false) }
  }

  const filtered = items.filter(i =>
    (i.fields.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const avatarColors = ['hsl(200, 70%, 94%)', 'hsl(280, 60%, 95%)', 'hsl(142, 60%, 94%)', 'hsl(38, 92%, 94%)', 'hsl(330, 70%, 95%)']
  const avatarTextColors = ['hsl(200, 70%, 35%)', 'hsl(280, 50%, 40%)', 'hsl(142, 55%, 30%)', 'hsl(38, 75%, 35%)', 'hsl(330, 60%, 40%)']

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', marginBottom: 3 }}>Teilnehmer</h1>
          <p style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>{items.length} Teilnehmer registriert</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, boxShadow: 'var(--shadow-amber)', border: 'none' }}>
          <Plus size={16} />
          Teilnehmer hinzufügen
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input placeholder="Suchen nach Name oder E-Mail..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      <div style={{ background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'hsl(220, 9%, 46%)' }}>Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={22} /></div>
            <div style={{ fontWeight: 700, color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>Keine Teilnehmer gefunden</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)', marginBottom: 16 }}>Erfassen Sie Ihre ersten Teilnehmer.</div>
            <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, border: 'none' }}>
              <Plus size={15} /> Teilnehmer hinzufügen
            </Button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th>Geburtsdatum</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.record_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: avatarColors[idx % avatarColors.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700,
                        color: avatarTextColors[idx % avatarTextColors.length],
                        flexShrink: 0,
                      }}>
                        {(item.fields.name || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.fields.name}</span>
                    </div>
                  </td>
                  <td>
                    {item.fields.email ? (
                      <a href={`mailto:${item.fields.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'hsl(38, 75%, 35%)', textDecoration: 'none', fontSize: '0.875rem' }}>
                        <Mail size={13} />{item.fields.email}
                      </a>
                    ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
                  </td>
                  <td>
                    {item.fields.telefon ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)' }}>
                        <Phone size={13} />{item.fields.telefon}
                      </span>
                    ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
                  </td>
                  <td>
                    {item.fields.geburtsdatum ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)' }}>
                        <Calendar size={13} />{item.fields.geburtsdatum}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ boxShadow: 'var(--shadow-modal)', fontFamily: 'var(--font-family)', maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 700 }}>{editing ? 'Teilnehmer bearbeiten' : 'Neuer Teilnehmer'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Max Mustermann" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>E-Mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="max@beispiel.de" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Telefon</Label>
              <Input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} placeholder="+49 123 456789" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Geburtsdatum</Label>
              <Input type="date" value={form.geburtsdatum} onChange={e => setForm(f => ({ ...f, geburtsdatum: e.target.value }))} style={{ marginTop: 5 }} />
            </div>
          </div>
          <DialogFooter style={{ marginTop: 8 }}>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
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
        title="Teilnehmer löschen"
        description="Möchten Sie diesen Teilnehmer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
