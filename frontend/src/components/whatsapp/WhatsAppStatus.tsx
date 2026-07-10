import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappApi } from "../../services/whatsapp.api";
import { Smartphone, QrCode, CheckCircle, XCircle, LogOut, RefreshCw, AlertTriangle } from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";

export default function WhatsAppStatus() {
  const queryClient = useQueryClient();
  const [showQRModal, setShowQRModal] = useState(false);

  const statusQuery = useQuery({
    queryKey: ["whatsapp-status"],
    queryFn: whatsappApi.getStatus,
    refetchInterval: (data) => {
      // Only refetch every 10 seconds if not connected, otherwise 30 seconds
      return data?.isConnected ? 30000 : 10000;
    },
  });

  const generateQRMutation = useMutation({
    mutationFn: whatsappApi.generateNewQR,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
      setShowQRModal(true);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: whatsappApi.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-status"] });
      setShowQRModal(false);
    },
  });

  const status = statusQuery.data;

  const handleConnectClick = () => {
    if (!status?.qrCode) {
      generateQRMutation.mutate();
    } else {
      setShowQRModal(true);
    }
  };

  return (
    <>
      {/* Sidebar Status Button */}
      <div
        onClick={handleConnectClick}
        style={{
          padding: "12px 16px",
          margin: "8px",
          borderRadius: "8px",
          background: status?.isConnected
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "white",
          fontWeight: 600,
          fontSize: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
        }}
      >
        {status?.isConnected ? (
          <>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#fff",
              animation: "pulse 2s infinite",
            }} />
            <Smartphone size={20} />
            <span>WhatsApp Connected</span>
          </>
        ) : (
          <>
            <Smartphone size={20} />
            <span>Connect WhatsApp</span>
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && !status?.isConnected && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <QrCode size={30} color="white" />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
                Connect WhatsApp
              </h2>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Scan this QR code with your WhatsApp to start sending messages
              </p>
            </div>

            {/* Error Display */}
            {status?.error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertTriangle size={20} style={{ color: "#ef4444", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#b91c1c", margin: 0 }}>
                    {status.error}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {status?.qrCode ? (
              <div
                style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "24px",
                }}
              >
                <QRCode value={status.qrCode} size={256} />
              </div>
            ) : (
              <div
                style={{
                  padding: "60px 24px",
                  textAlign: "center",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    border: "4px solid #e5e7eb",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  Generating QR code...
                </p>
              </div>
            )}

            {/* Instructions */}
            <div
              style={{
                padding: "16px",
                background: "#eff6ff",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1e40af", marginBottom: "12px" }}>
                How to scan:
              </p>
              <ol style={{ fontSize: "13px", color: "#1e40af", margin: 0, paddingLeft: "20px" }}>
                <li>Open WhatsApp on your phone</li>
                <li>Tap Menu (⋮) or Settings</li>
                <li>Tap Linked Devices → Link a Device</li>
                <li>Point your phone at this screen to scan</li>
              </ol>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => generateQRMutation.mutate()}
                disabled={generateQRMutation.isPending}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <RefreshCw size={16} />
                {generateQRMutation.isPending ? "Generating..." : "New QR"}
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Actions Modal */}
      {showQRModal && status?.isConnected && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowQRModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <CheckCircle size={30} color="white" />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
                WhatsApp Connected
              </h2>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Your WhatsApp is ready to send and receive messages
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={() => {
                  logoutMutation.mutate();
                }}
                disabled={logoutMutation.isPending}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#ef4444",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <LogOut size={16} />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
