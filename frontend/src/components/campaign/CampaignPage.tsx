import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { campaignApi } from "../../services/campaign.api";
import { useContacts } from "../../hooks/useContacts";
import { Megaphone, Send } from "lucide-react";

export default function CampaignPage() {
  const [messageTemplate, setMessageTemplate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const contactsQuery = useContacts();

  const campaignMutation = useMutation({
    mutationFn: (payload: { messageTemplate: string; recipientIds: string[]; imageUrl?: string }) =>
      campaignApi.sendCampaign(payload),
    onSuccess: () => {
      campaignHistoryQuery.refetch();
    },
  });

  const campaignHistoryQuery = useQuery<import("../../services/campaign.api").CampaignHistoryItem[], Error>({
    queryKey: ["campaigns"],
    queryFn: campaignApi.fetchCampaigns,
  });

  const toggleRecipient = (id: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((recipient) => recipient !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRecipients.length) return;

    try {
      await campaignMutation.mutateAsync({
        messageTemplate,
        recipientIds: selectedRecipients,
        ...(imageUrl && { imageUrl }),
      });
      
      // Clear selections on success
      setMessageTemplate("");
      setImageUrl("");
      setSelectedRecipients([]);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.message || "Failed to send campaign");
    }
  };

  return (
    <>
      <div className="premium-card">
        <div className="card-header" style={{ marginBottom: '24px' }}>
          <div>
            <h2 className="card-title">Send Campaign</h2>
            <p className="card-subtitle">
              Use the template below. <code>{`{User}`}</code> will be replaced with each contact's name.
            </p>
          </div>
          <div style={{ color: 'var(--brand-primary)', background: 'var(--brand-light)', padding: '12px', borderRadius: '50%' }}>
            <Megaphone size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <label>
            <span className="premium-label">Message template</span>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="premium-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Hello {User}, new product launch today..."
              minLength={10}
              required
            />
          </label>

          <label>
            <span className="premium-label">Image URL (optional)</span>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="premium-input"
              placeholder="https://example.com/image.jpg"
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Add a publicly accessible image URL to send with your message
            </span>
          </label>

          <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Pick recipients</h3>
            {contactsQuery.isFetching ? (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading contacts…</p>
            ) : (
              <div className="list-grid">
                {contactsQuery.data?.map((contact) => {
                  const isSelected = selectedRecipients.includes(contact._id);
                  return (
                    <div
                      key={contact._id}
                      onClick={() => toggleRecipient(contact._id)}
                      className={`picker-card ${isSelected ? 'selected' : ''}`}
                    >
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{contact.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{contact.phoneNumber}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary"
              disabled={campaignMutation.isPending || !selectedRecipients.length || !messageTemplate.trim()}
            >
              <Send size={16} />
              {campaignMutation.isPending ? "Sending campaign…" : "Send campaign"}
            </button>
          </div>
          
          {errorMessage && (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '14px' }}>
              {errorMessage}
            </div>
          )}
        </form>
      </div>

      <div className="premium-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Campaign history</h2>
            <p className="card-subtitle">Track your recent campaign activity.</p>
          </div>
        </div>

        {campaignHistoryQuery.isFetching ? (
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading campaign history…</p>
        ) : campaignHistoryQuery.isError ? (
          <p style={{ fontSize: '14px', color: '#b91c1c' }}>Unable to load campaigns.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {campaignHistoryQuery.data?.map((campaign) => (
              <div key={campaign._id} style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{campaign.messageTemplate}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sent to {campaign.recipients?.length ?? 0} contacts</p>
                  </div>
                  <span className={`badge ${campaign.status === 'completed' ? 'success' : campaign.status === 'failed' ? 'danger' : 'warning'}`}>
                    {campaign.status}
                  </span>
                </div>
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                  <span>Sent: <strong>{campaign.sentCount}</strong></span>
                  <span>Errors: <strong>{campaign.errors?.length ?? 0}</strong></span>
                </div>
                {campaign.errors?.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-md)', background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c', marginBottom: '4px' }}>Failed deliveries:</p>
                    <ul style={{ fontSize: '12px', color: '#b91c1c', margin: '0', paddingLeft: '16px' }}>
                      {campaign.errors.map((err, idx) => (
                        <li key={idx}>{err.contact?.name || 'Unknown'}: {err.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {!campaignHistoryQuery.data?.length && (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No campaigns found.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
