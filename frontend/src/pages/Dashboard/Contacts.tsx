import { useState } from "react";
import { CheckCircle, UploadCloud, Plus, AlertTriangle } from "lucide-react";
import { useContacts, useCreateContact, useUploadContacts } from "../../hooks/useContacts";
import type { Contact, ContactPayload } from "../../services/contacts.api";

export default function ContactsPage() {
  const [form, setForm] = useState<ContactPayload>({
    name: "",
    phoneNumber: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const contactsQuery = useContacts();
  const createContact = useCreateContact();
  const uploadContacts = useUploadContacts();

  const handleChange = (key: keyof ContactPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    try {
      await createContact.mutateAsync(form);
      setStatusMessage("Contact added successfully.");
      setForm({ name: "", phoneNumber: "" });
    } catch (error: any) {
      setStatusMessage(error?.message || "Unable to add contact.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleUpload = async () => {
    setStatusMessage(null);

    if (!file) {
      setStatusMessage("Please select a CSV or Excel file to upload.");
      return;
    }

    try {
      await uploadContacts.mutateAsync(file);
      setStatusMessage("Contacts imported successfully.");
      setFile(null);
    } catch (error: any) {
      setStatusMessage(error?.message || "Unable to upload contacts.");
    }
  };

  return (
    <>
      <div className="premium-card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div>
            <h2 className="card-title">Manage your WhatsApp contacts</h2>
            <p className="card-subtitle">
              Add contacts manually or import a validated CSV/XLSX file. Contacts are stored for campaign targeting and chat automation.
            </p>
          </div>
          <div style={{ color: 'var(--brand-primary)', background: 'var(--brand-light)', padding: '12px', borderRadius: '50%' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Add Manually */}
          <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Add a Contact</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label>
                <span className="premium-label">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="premium-input"
                  placeholder="e.g. Priya Sharma"
                  required
                />
              </label>

              <label>
                <span className="premium-label">Phone number</span>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  className="premium-input"
                  placeholder="e.g. +919876543210"
                  required
                />
              </label>

              <button type="submit" className="btn-primary" disabled={createContact.isPending} style={{ marginTop: '8px' }}>
                <Plus size={16} />
                {createContact.isPending ? "Saving..." : "Save Contact"}
              </button>
            </form>
          </div>

          {/* Bulk Import */}
          <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Bulk import contacts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px dashed var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Upload a CSV or Excel file with columns: <strong>Name</strong> and <strong>Phone</strong>.
              </div>

              <label style={{ display: 'block', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '14px', color: file ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file ? file.name : "Choose a contact file..."}
                  </span>
                  <UploadCloud size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={handleUpload} className="btn-secondary" disabled={uploadContacts.isPending} style={{ background: '#0f172a', color: '#fff' }}>
                  {uploadContacts.isPending ? "Uploading..." : "Import Contacts"}
                </button>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max file size 5MB.</span>
              </div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div style={{ marginTop: '24px', padding: '16px', borderRadius: 'var(--radius-md)', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <AlertTriangle size={18} />
            {statusMessage}
          </div>
        )}
      </div>

      <div className="premium-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Contact list</h3>
            <p className="card-subtitle">Review contacts imported for your account.</p>
          </div>
          <div className="badge" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
            {(Array.isArray(contactsQuery.data) ? contactsQuery.data.length : 0)} contacts
          </div>
        </div>

        {contactsQuery.isPending ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading contacts...
          </div>
        ) : contactsQuery.isError ? (
          <div style={{ padding: '20px', background: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-md)' }}>
            {contactsQuery.error?.message || "Failed to load contacts."}
          </div>
        ) : (
          <div className="premium-table-wrap" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(contactsQuery.data) ? contactsQuery.data : []).map((contact: Contact) => (
                  <tr key={contact._id}>
                    <td style={{ fontWeight: 600 }}>{contact.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{contact.phoneNumber}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(contact.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!Array.isArray(contactsQuery.data) || contactsQuery.data.length === 0) && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No contacts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
