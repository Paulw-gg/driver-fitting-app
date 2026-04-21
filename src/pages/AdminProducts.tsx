import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { DriverProduct } from '../types';
import { FALLBACK_PRODUCTS } from '../lib/recommendProducts';

const EMPTY: Omit<DriverProduct, 'id'> = {
  brand: '', model: '', loftOptions: [], cogType: 'low-back',
  drawBias: false, lowSpin: false, highMoi: false,
  weightAdjustable: false, weightOptions: [], moiRating: 'high',
  availableInShop: true, notes: '',
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<DriverProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DriverProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await supabase.from('driver_products').select('*').order('brand');
      if (data) {
        setProducts(data.map((r: Record<string, unknown>) => ({
          id: r.id as string, brand: r.brand as string, model: r.model as string,
          loftOptions: r.loft_options as string[], cogType: r.cog_type as DriverProduct['cogType'],
          drawBias: r.draw_bias as boolean, lowSpin: r.low_spin as boolean,
          highMoi: r.high_moi as boolean, weightAdjustable: r.weight_adjustable as boolean,
          weightOptions: r.weight_options as string[], moiRating: r.moi_rating as string,
          availableInShop: r.available_in_shop as boolean, notes: r.notes as string | undefined,
        })));
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch {
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleAvailable(p: DriverProduct) {
    try {
      await supabase.from('driver_products').update({ available_in_shop: !p.availableInShop }).eq('id', p.id);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, availableInShop: !x.availableInShop } : x));
    } catch { /* ignore */ }
  }

  async function saveProduct() {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        brand: editing.brand, model: editing.model, loft_options: editing.loftOptions,
        cog_type: editing.cogType, draw_bias: editing.drawBias, low_spin: editing.lowSpin,
        high_moi: editing.highMoi, weight_adjustable: editing.weightAdjustable,
        weight_options: editing.weightOptions, moi_rating: editing.moiRating,
        available_in_shop: editing.availableInShop, notes: editing.notes,
      };
      if (editing.id.startsWith('new-')) {
        await supabase.from('driver_products').insert(payload);
      } else {
        await supabase.from('driver_products').update(payload).eq('id', editing.id);
      }
      await load();
      setShowModal(false);
      setEditing(null);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Produkt wirklich löschen?')) return;
    try {
      await supabase.from('driver_products').delete().eq('id', id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Produktdatenbank</h1>
        <button
          onClick={() => { setEditing({ ...EMPTY, id: `new-${Date.now()}` }); setShowModal(true); }}
          className="flex items-center gap-1.5 bg-[#185FA5] text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Neues Produkt
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Lade Produkte…</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Marke / Modell</th>
                <th className="px-4 py-3 text-left">CoG</th>
                <th className="px-4 py-3 text-left">Features</th>
                <th className="px-4 py-3 text-center">Shop</th>
                <th className="px-4 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.brand}</div>
                    <div className="text-gray-500">{p.model}</div>
                    <div className="text-xs text-gray-400">{p.loftOptions.join(', ')}°</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.cogType}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.lowSpin && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">LS</span>}
                      {p.drawBias && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">Draw</span>}
                      {p.highMoi && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Hi-MOI</span>}
                      {p.weightAdjustable && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Adj.</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleAvailable(p)} className="text-gray-400 hover:text-gray-600 transition-colors">
                      {p.availableInShop
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(p); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                        <Save size={15} />
                      </button>
                      <button onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh]">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                {editing.id.startsWith('new-') ? 'Neues Produkt' : 'Produkt bearbeiten'}
              </h3>
            </div>
            <div className="p-5 grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Marke</label>
                  <input className={inputCls} value={editing.brand} onChange={e => setEditing({ ...editing, brand: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Modell</label>
                  <input className={inputCls} value={editing.model} onChange={e => setEditing({ ...editing, model: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Loft-Optionen (kommagetrennt)</label>
                <input className={inputCls} value={editing.loftOptions.join(',')}
                  onChange={e => setEditing({ ...editing, loftOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">CoG-Typ</label>
                <select className={inputCls} value={editing.cogType}
                  onChange={e => setEditing({ ...editing, cogType: e.target.value as DriverProduct['cogType'] })}>
                  <option value="low-back">Low-Back</option>
                  <option value="low-forward">Low-Forward</option>
                  <option value="adjustable">Adjustable</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">MOI-Rating</label>
                <select className={inputCls} value={editing.moiRating}
                  onChange={e => setEditing({ ...editing, moiRating: e.target.value })}>
                  <option value="high">High</option>
                  <option value="above-average">Above Average</option>
                  <option value="average">Average</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['drawBias', 'Draw-Bias'],
                  ['lowSpin', 'Low-Spin'],
                  ['highMoi', 'High-MOI'],
                  ['weightAdjustable', 'Gewicht verstellbar'],
                  ['availableInShop', 'Im Shop verfügbar'],
                ] as [keyof DriverProduct, string][]).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={!!editing[key]}
                      onChange={e => setEditing({ ...editing, [key]: e.target.checked })}
                      className="w-4 h-4 rounded accent-blue-600" />
                    {label}
                  </label>
                ))}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Notizen</label>
                <input className={inputCls} value={editing.notes ?? ''}
                  onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => { setShowModal(false); setEditing(null); }}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Abbrechen
              </button>
              <button onClick={saveProduct} disabled={saving}
                className="flex-1 py-2 rounded-lg bg-[#185FA5] text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
                {saving ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
