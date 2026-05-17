import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Upload, Star } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Animal } from '@/types/database'
import { formatPrice, statusColor, speciesLabel } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'

const EMPTY: Partial<Animal> = {
  name: '',
  species: 'cow',
  breed: '',
  weight_kg: undefined,
  age_months: undefined,
  teeth: undefined,
  color: '',
  price: 0,
  description: '',
  image_urls: [],
  status: 'available',
  featured: false,
}

export function AdminAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Animal | null>(null)
  const [form, setForm] = useState<Partial<Animal>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadAnimals() {
    setLoading(true)
    const { data } = await supabase.from('animals').select('*').order('created_at', { ascending: false })
    setAnimals(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadAnimals() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setShowForm(true)
  }

  function openEdit(animal: Animal) {
    setEditing(animal)
    setForm(animal)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `animals/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('animals').upload(path, file, { upsert: true })
    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploadingImg(false)
      return
    }
    const { data: urlData } = supabase.storage.from('animals').getPublicUrl(path)
    setForm((f) => ({ ...f, image_urls: [...(f.image_urls ?? []), urlData.publicUrl] }))
    setUploadingImg(false)
    toast.success('Image uploaded!')
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, image_urls: (f.image_urls ?? []).filter((u) => u !== url) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)

    const payload = {
      name: form.name!,
      species: form.species ?? 'cow',
      breed: form.breed || null,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      age_months: form.age_months ? Number(form.age_months) : null,
      teeth: form.teeth ? Number(form.teeth) : null,
      color: form.color || null,
      price: Number(form.price),
      description: form.description || null,
      image_urls: form.image_urls ?? [],
      status: form.status ?? 'available',
      featured: form.featured ?? false,
    }

    if (editing) {
      const { error } = await supabase.from('animals').update(payload).eq('id', editing.id)
      if (error) toast.error(error.message)
      else { toast.success('Animal updated!'); closeForm(); loadAnimals() }
    } else {
      const { error } = await supabase.from('animals').insert(payload)
      if (error) toast.error(error.message)
      else { toast.success('Animal added!'); closeForm(); loadAnimals() }
    }
    setSaving(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('animals').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Animal deleted'); loadAnimals() }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary-900">Animals</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your Qurbani animal catalog</p>
        </div>
        <Button onClick={openCreate} variant="gold">
          <Plus className="w-4 h-4" />
          Add Animal
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Animal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Species</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Weight</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {animals.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {a.image_urls?.[0] ? (
                          <img src={a.image_urls[0]} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-primary-900 flex items-center gap-1">
                            {a.name}
                            {a.featured && <Star className="w-3 h-3 text-gold-500 fill-gold-500" />}
                          </div>
                          {a.breed && <div className="text-xs text-gray-400">{a.breed}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{speciesLabel(a.species)}</td>
                    <td className="px-4 py-4 text-gray-700">{a.weight_kg ? `${a.weight_kg} kg` : '—'}</td>
                    <td className="px-4 py-4 font-semibold text-primary-800">{formatPrice(a.price)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {animals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No animals yet. Add your first animal!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-display text-xl font-bold text-primary-900">
                {editing ? 'Edit Animal' : 'Add Animal'}
              </h2>
              <button onClick={closeForm} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input
                label="Name *"
                value={form.name ?? ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Khan Sahib"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Species *"
                  value={form.species ?? 'cow'}
                  onChange={(e) => setForm({ ...form, species: e.target.value })}
                >
                  <option value="cow">Cow</option>
                  <option value="bull">Bull</option>
                  <option value="goat">Goat</option>
                  <option value="sheep">Sheep</option>
                </Select>
                <Select
                  label="Status"
                  value={form.status ?? 'available'}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Animal['status'] })}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </Select>
              </div>
              <Input
                label="Breed"
                value={form.breed ?? ''}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                placeholder="e.g. Sahiwal, Nagri"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={form.weight_kg ?? ''}
                  onChange={(e) => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 350"
                />
                <Input
                  label="Age (months)"
                  type="number"
                  value={form.age_months ?? ''}
                  onChange={(e) => setForm({ ...form, age_months: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teeth"
                  type="number"
                  value={form.teeth ?? ''}
                  onChange={(e) => setForm({ ...form, teeth: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 2"
                />
                <Input
                  label="Color"
                  value={form.color ?? ''}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="e.g. White & Brown"
                />
              </div>
              <Input
                label="Price (PKR) *"
                type="number"
                value={form.price ?? ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="e.g. 150000"
                required
              />
              <Textarea
                label="Description"
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the animal's health, lineage, temperament…"
                rows={4}
              />

              {/* Featured toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured ?? false}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-primary-700"
                />
                <span className="text-sm font-medium text-gray-700">Feature on homepage</span>
              </label>

              {/* Images */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Images</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(form.image_urls ?? []).map((url) => (
                    <div key={url} className="relative w-20 h-16">
                      <img src={url} className="w-full h-full object-cover rounded-lg" alt="" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImg}
                    className="w-20 h-16 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-xs mt-1">{uploadingImg ? 'Uploading…' : 'Upload'}</span>
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={closeForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="gold" loading={saving} className="flex-1">
                  {editing ? 'Save Changes' : 'Add Animal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
