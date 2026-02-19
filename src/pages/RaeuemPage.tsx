import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, DoorOpen, Building2, Users } from 'lucide-react'
import { LivingAppsService } from '@/services/livingAppsService'
import type { Raeume } from '@/types/app'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ConfirmDialog'

type FormData = { raumname: string; gebaeude: string; kapazitaet: string }
const empty: FormData = { raumname: '', gebaeude: '', kapazitaet: '' }

export default function RaeumePage() {
  const [items, setItems] = useState<Raeume[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<Raeume | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(empty)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    LivingAppsService.getRaeume().then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setDialogOpen(true) }
  const openEdit = (item: Raeume) => {
    setEditing(item)
    setForm({ raumname: item.fields.raumname || '', gebaeude: item.fields.gebaeude || '', kapazitaet: item.fields.kapazitaet != null ? String(item.fields.kapazitaet) : '' })
    setDialogOpen(true)
  }
  const openDelete = (id: string) => { setDeleteTarget(id); setDeleteOpen(true) }

  const handleSave = async () => {
    if (!form.raumname.trim()) return
    setSaving(true)
    try {
      const fields: Raeume['fields'] = {
        raumname: form.raumname,
        gebaeude: form.gebaeude || undefined,
        kapazitaet: form.kapazitaet ? Number(form.kapazitaet) : undefined,
      }
      if (editing) {
        await LivingAppsService.updateRaeumeEntry(editing.record_id, fields)
      } else {
        await LivingAppsService.createRaeumeEntry(fields)
      }
      setDialogOpen(false)
      load()
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await LivingAppsService.deleteRaeumeEntry(deleteTarget)
      setDeleteOpen(false)
      load()
    } finally { setDeleting(false) }
  }

  const filtered = items.filter(i =>
    (i.fields.raumname || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.fields.gebaeude || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'hsl(222, 47%, 11%)', marginBottom: 3 }}>Räume</h1>
          <p style={{ color: 'hsl(220, 9%, 46%)', fontSize: '0.875rem' }}>{items.length} Räume erfasst</p>
        </div>
        <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, boxShadow: 'var(--shadow-amber)', border: 'none' }}>
          <Plus size={16} />
          Raum hinzufügen
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input placeholder="Suchen nach Raumname oder Gebäude..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      {/* Card grid layout for rooms */}
      {loading ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: 'hsl(220, 9%, 46%)' }}>Laden...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'hsl(0, 0%, 100%)', borderRadius: 12, border: '1px solid hsl(220, 13%, 91%)', boxShadow: 'var(--shadow-card)' }}>
          <div className="empty-state">
            <div className="empty-state-icon"><DoorOpen size={22} /></div>
            <div style={{ fontWeight: 700, color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>Keine Räume gefunden</div>
            <div style={{ fontSize: '0.875rem', color: 'hsl(220, 9%, 46%)', marginBottom: 16 }}>Legen Sie die ersten Räume an.</div>
            <Button onClick={openCreate} style={{ background: 'var(--gradient-primary)', color: 'hsl(222, 47%, 11%)', fontWeight: 700, border: 'none' }}>
              <Plus size={15} /> Raum hinzufügen
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map(item => (
            <div key={item.record_id} className="kpi-card" style={{ position: 'relative', paddingTop: 20, paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40,
                  background: 'hsl(280, 60%, 96%)',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DoorOpen size={18} color="hsl(280, 50%, 45%)" />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(item)} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid hsl(220, 13%, 91%)', background: 'none', cursor: 'pointer', color: 'hsl(220, 9%, 46%)' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => openDelete(item.record_id)} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid hsl(0, 72%, 88%)', background: 'none', cursor: 'pointer', color: 'hsl(0, 65%, 45%)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'hsl(222, 47%, 11%)', marginBottom: 6 }}>{item.fields.raumname}</div>
              {item.fields.gebaeude && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'hsl(220, 9%, 46%)', marginBottom: 4 }}>
                  <Building2 size={12} />{item.fields.gebaeude}
                </div>
              )}
              {item.fields.kapazitaet != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'hsl(220, 9%, 46%)' }}>
                  <Users size={12} />{item.fields.kapazitaet} Plätze
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ boxShadow: 'var(--shadow-modal)', fontFamily: 'var(--font-family)', maxWidth: 420 }}>
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 700 }}>{editing ? 'Raum bearbeiten' : 'Neuer Raum'}</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Raumname *</Label>
              <Input value={form.raumname} onChange={e => setForm(f => ({ ...f, raumname: e.target.value }))} placeholder="z.B. A101" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Gebäude</Label>
              <Input value={form.gebaeude} onChange={e => setForm(f => ({ ...f, gebaeude: e.target.value }))} placeholder="z.B. Hauptgebäude" style={{ marginTop: 5 }} />
            </div>
            <div>
              <Label style={{ fontWeight: 600, fontSize: '0.82rem' }}>Kapazität</Label>
              <Input type="number" min={1} value={form.kapazitaet} onChange={e => setForm(f => ({ ...f, kapazitaet: e.target.value }))} placeholder="z.B. 30" style={{ marginTop: 5 }} />
            </div>
          </div>
          <DialogFooter style={{ marginTop: 8 }}>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.raumname.trim()}
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
        title="Raum löschen"
        description="Möchten Sie diesen Raum wirklich löschen?"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
