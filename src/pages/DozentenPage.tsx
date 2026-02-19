import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, GraduationCap, Mail, Phone, Tag } from 'lucide-react'
import { LivingAppsService } from '@/services/livingAppsService'
import type { Dozenten } from '@/types/app'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ConfirmDialog'

type FormData = { name: string; email: string; telefon: string; fachgebiet: string }
const empty: FormData = { name: '', email: '', telefon: '', fachgebiet: '' }

export default function DozentenPage() {
  const [items, setItems] = useState<Dozenten[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Dozenten | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    LivingAppsService.getDozenten().then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Dozenten) => {
    setEditing(item)
    setForm({ name: item.fields.name || '', email: item.fields.email || '', telefon: item.fields.telefon || '', fachgebiet: item.fields.fachgebiet || '' })
    setDialogOpen(true)
  }
  const openDelete = (id: string) => { setDeleteTarget(id); setDeleteOpen(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await LivingAppsService.updateDozentenEntry(editing.record_id, form)
      } else {
        await LivingAppsService.createDozentenEntry(form)
      }
      setDialogOpen(false)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await LivingAppsService.deleteDozentenEntry(deleteTarget)
      setDeleteOpen(false)
      load()
    } finally { setDeleting(false) }
  }

  const filtered = items.filter(i =>
    (i.fields.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.fachgebiet || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', marginBottom: 3 }}>Dozenten</h1>
          <p style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>{items.length} Dozenten erfasst</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, boxShadow: 'var(--shadow-amber)', border: 'none' }}>
          <Plus size={16} />
          Dozent hinzufügen
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Suchen nach Name, Fachgebiet, E-Mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      <div style={{ background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'hsl(220, 9%, 46%)' }}>Laden...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><GraduationCap size={22} /></div>
            <div style={{ fontWeight: 700, color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>Keine Dozenten gefunden</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)', marginBottom: 16 }}>Legen Sie den ersten Dozenten an.</div>
            <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, border: 'none' }}>
              <Plus size={15} /> Dozent hinzufügen
            </Button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fachgebiet</th>
                <th>E-Mail</th>
                <th>Telefon</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.record_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'hsl(38, 92%, 94%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'hsl(38, 75%, 35%)',
                        flexShrink: 0,
                      }}>
                        {(item.fields.name || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.fields.name}</span>
                    </div>
                  </td>
                  <td>
                    {item.fields.fachgebiet ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'hsl(220, 13%, 94%)', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500 }}>
                        <Tag size={11} />
                        {item.fields.fachgebiet}
                      </span>
                    ) : <span style={{ color: 'hsl(220, 9%, 65%)' }}>—</span>}
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
            <DialogTitle style={{ fontWeight: 700 }}>{editing ? 'Dozent bearbeiten' : 'Neuer Dozent'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Max Mustermann" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Fachgebiet</Label>
              <Input value={form.fachgebiet} onChange={e => setForm(f => ({ ...f, fachgebiet: e.target.value }))} placeholder="z.B. Informatik, Mathematik..." style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>E-Mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="max@beispiel.de" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Telefon</Label>
              <Input value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} placeholder="+49 123 456789" style={{ marginTop: 5 }} />
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
        title="Dozent löschen"
        description="Möchten Sie diesen Dozenten wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
