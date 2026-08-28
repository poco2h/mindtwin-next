"use client";

import { useEffect, useState } from "react";

export type UserRole = "owner" | "follower";

const ROLE_KEY = "mindtwin_user_role";

export function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "owner";
  const params = new URLSearchParams(window.location.search);
  const qRole = params.get("role");
  if (qRole === "follower" || qRole === "owner") {
    window.localStorage.setItem(ROLE_KEY, qRole);
    return qRole;
  }
  const r = window.localStorage.getItem(ROLE_KEY);
  return r === "follower" ? "follower" : "owner";
}

export function setStoredRole(role: UserRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event("mindtwin_role_changed"));
}

export function useUserRole(): [UserRole, (r: UserRole) => void] {
  const [role, setRole] = useState<UserRole>("owner");

  useEffect(() => {
    setRole(getStoredRole());

    const handleRoleChange = () => {
      setRole(getStoredRole());
    };

    window.addEventListener("mindtwin_role_changed", handleRoleChange);
    window.addEventListener("storage", handleRoleChange);

    return () => {
      window.removeEventListener("mindtwin_role_changed", handleRoleChange);
      window.removeEventListener("storage", handleRoleChange);
    };
  }, []);

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    setStoredRole(newRole);
  };

  return [role, updateRole];
}
