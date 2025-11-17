// src/components/LogoutButton.tsx


import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth } from "@/redux/slices/authSlice";
import { logoutAll } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const LogoutButton: React.FC<{ everywhere?: boolean }> = ({ everywhere = true }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((s: any) => s.auth?.token);
  const { toast } = useToast();

  const handle = async () => {
    setLoading(true);
    try {
      if (everywhere) {
        await logoutAll(token);
      } else {
        await logoutAll(token); // fallback to same if backend only supports one
      }
    } catch (err) {
      console.warn(err);
    } finally {
      dispatch(clearAuth());
      toast({ title: "Signed out", description: "You have been logged out.", variant: "default" });
      setLoading(false);
    }
  };

  return (
    <button onClick={handle} disabled={loading} className="px-3 py-1 rounded bg-red-600 text-white">
      {loading ? "Signing out..." : everywhere ? "Logout everywhere" : "Logout"}
    </button>
  );
};

export default LogoutButton;