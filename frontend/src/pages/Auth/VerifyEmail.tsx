import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");

        if (!token) {
            setLoading(false);
            setSuccess(false);
            setMessage("Verification token is missing.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/v1/auth/verify-email",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            token,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Email verification failed."
                    );
                }

                setSuccess(true);
                setMessage("Email verified successfully 🎉");

                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);

            } catch (error) {
                setSuccess(false);

                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Something went wrong."
                );
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [navigate]);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f8fafc",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    width: "420px",
                    padding: "40px",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    textAlign: "center",
                }}
            >
                {loading ? (
                    <>
                        <h2>Verifying Email...</h2>
                        <p>Please wait...</p>
                    </>
                ) : success ? (
                    <>
                        <h2 style={{ color: "green" }}>✅ Success</h2>
                        <p>{message}</p>
                        <p>Redirecting to Login...</p>
                    </>
                ) : (
                    <>
                        <h2 style={{ color: "red" }}>❌ Verification Failed</h2>
                        <p>{message}</p>

                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                marginTop: "20px",
                                padding: "12px 20px",
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            Go to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;