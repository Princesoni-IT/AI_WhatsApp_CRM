import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api/v1";

type ProtectedRouteProps = {
  children: React.ReactElement;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        let response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
          });
        }

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();

        if (!isMounted) return;

        setUser(data?.data ?? null);
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) return;
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", color: "#0f172a" }}>
        Checking session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ user: any }>, { user })
    : children;
};

export default ProtectedRoute;
