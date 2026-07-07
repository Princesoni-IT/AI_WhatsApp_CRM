import { useContacts } from "../../hooks/useContacts";
import { Users, UploadCloud } from "lucide-react";

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

export default function DashboardHome() {
  const contactsQuery = useContacts();
  const totalContacts = contactsQuery.data?.length ?? 0;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>
          <p className="stat-value">{contactsQuery.isPending ? "..." : totalContacts}</p>
          <p className="stat-label">Total contacts</p>
        </div>

        <div className="stat-card" style={{ '--brand-primary': '#10b981', '--brand-light': '#d1fae5' } as React.CSSProperties}>
          <div className="stat-icon"><UploadCloud size={20} /></div>
          <p className="stat-value">{contactsQuery.isPending ? "Loading" : contactsQuery.isError ? "Error" : "Synced"}</p>
          <p className="stat-label">Contact data status</p>
        </div>
      </div>

      <div className="premium-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Contacts</h2>
            <p className="card-subtitle">Latest contacts imported into your CRM.</p>
          </div>
        </div>

        {contactsQuery.isPending ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading contacts...
          </div>
        ) : contactsQuery.isError ? (
          <div style={{ padding: '20px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px' }}>
            {contactsQuery.error?.message || "Failed to load contacts."}
          </div>
        ) : (
          <div className="premium-table-wrap">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {contactsQuery.data?.slice(0, 5).map((contact) => (
                  <tr key={contact._id}>
                    <td style={{ fontWeight: 600 }}>{contact.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{contact.phoneNumber}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(contact.createdAt)}</td>
                  </tr>
                ))}
                {!contactsQuery.data?.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No contacts found. Add or import contacts to populate this dashboard.
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
