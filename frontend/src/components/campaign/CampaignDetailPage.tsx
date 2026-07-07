import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { campaignApi } from "../../services/campaign.api";
import { ArrowLeft, Users, CheckCircle, AlertCircle } from "lucide-react";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => campaignApi.fetchCampaignById(id!),
    enabled: !!id,
  });

  if (query.isLoading) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to campaigns
        </button>
        <p className="text-slate-500">Loading campaign...</p>
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to campaigns
        </button>
        <p className="text-red-600">Campaign not found.</p>
      </div>
    );
  }

  const campaign = query.data;
  const statusColor = {
    queued: "bg-slate-200 text-slate-700",
    sending: "bg-amber-200 text-amber-800",
    completed: "bg-green-200 text-green-800",
    failed: "bg-red-200 text-red-800",
  }[campaign.status] as string;

  return (
    <div className="space-y-6 p-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
      >
        <ArrowLeft size={16} />
        Back to campaigns
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Campaign Details</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
            {campaign.status}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-500">Message template</p>
          <p className="mt-1 rounded-2xl bg-slate-50 p-3 text-sm text-slate-900">
            {campaign.messageTemplate}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-500">Recipients</p>
          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              <Users size={16} className="inline mr-1" />
              {campaign.recipients?.length ?? 0} contacts
            </p>
            {campaign.recipients?.slice(0, 5).map((contact) => (
              <p key={contact._id} className="mt-1 text-sm text-slate-700">
                {contact.name} — {contact.phoneNumber}
              </p>
            ))}
            {campaign.recipients?.length > 5 && (
              <p className="text-sm text-slate-500">...and {campaign.recipients.length - 5} more</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-500">Progress</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1 rounded-2xl bg-slate-200 h-3">
              <div
                className="h-full rounded-2xl bg-green-600"
                style={{ width: `${(campaign.sentCount / (campaign.recipients?.length ?? 1)) * 100}%` }}
              />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {campaign.sentCount} / {campaign.recipients?.length ?? 0} sent
            </p>
          </div>
        </div>

        {campaign.errors?.length > 0 && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              <AlertCircle size={16} className="inline mr-1" />
              {campaign.errors.length} delivery error(s)
            </p>
          </div>
        )}

        {!campaign.errors?.length && campaign.status === "completed" && (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">
              <CheckCircle size={16} className="inline mr-1" />
              Campaign completed successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );
}