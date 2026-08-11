import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';

interface Note {
  id: string;
  note: string;
  createdAt: string;
}

interface CustomerDetailData {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  type: string;
  status: string;
  address?: string;
  followUpNotes: Note[];
}

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerDetailData | null>(null);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get(`/customers/${id}`).then(({ data }) => setCustomer(data));
  }

  useEffect(load, [id]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      await api.post(`/customers/${id}/notes`, { note: newNote });
      setNewNote('');
      load(); // refresh to show the new note
    } finally {
      setSaving(false);
    }
  }

  if (!customer) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <Link to="/customers" className="text-sm text-blue-600 hover:underline">
        ← Back to customers
      </Link>

      <div className="bg-white border rounded-lg p-6 mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-400">Name</div>
          <div className="font-medium">{customer.name}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Mobile</div>
          <div className="font-medium">{customer.mobile}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Business</div>
          <div className="font-medium">{customer.businessName || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">GST Number</div>
          <div className="font-medium">{customer.gstNumber || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Type</div>
          <div className="font-medium">{customer.type}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Status</div>
          <div className="font-medium">{customer.status}</div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-gray-400">Address</div>
          <div className="font-medium">{customer.address || '-'}</div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 mt-4">
        <h2 className="font-bold mb-3">Follow-up Notes</h2>

        <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a follow-up note..."
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {customer.followUpNotes.length === 0 ? (
          <div className="text-sm text-gray-400">No notes yet.</div>
        ) : (
          <ul className="space-y-2">
            {customer.followUpNotes.map((n) => (
              <li key={n.id} className="border-l-2 border-blue-200 pl-3 text-sm">
                <div>{n.note}</div>
                <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
