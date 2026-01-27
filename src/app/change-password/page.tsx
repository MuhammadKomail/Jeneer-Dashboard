"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const authState: any = useSelector((state: any) => state.auth);
  const didInitFromUserRef = useRef(false);

  let lsUser: any = null;
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) lsUser = JSON.parse(raw);
    }
  } catch {}

  const currentUser = authState?.user?.user || authState?.user || lsUser || null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("https://i.pravatar.cc/120?img=5");
  

  useEffect(() => {
    if (didInitFromUserRef.current) return;

    const fullName: string =
      currentUser?.full_name || currentUser?.name || currentUser?.username || "";
    const nameParts = String(fullName).trim().split(/\s+/).filter(Boolean);
    const fName = nameParts[0] || "";
    const lName = nameParts.slice(1).join(" ");
    const userEmail: string = currentUser?.email || "";

    if (fName) setFirstName(fName);
    if (lName) setLastName(lName);
    if (userEmail) setEmail(userEmail);

    const userPhoto: string =
      currentUser?.photoUrl ||
      currentUser?.photo_url ||
      currentUser?.avatar ||
      currentUser?.avatarUrl ||
      currentUser?.image ||
      "";
    if (userPhoto) setPhotoUrl(String(userPhoto));

    didInitFromUserRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    return () => {
      // Cleanup object URLs if any were created
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

      if (!token && !sessionId) {
        toast.error("You are not logged in.");
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (sessionId) {
        headers["Session-ID"] = sessionId;
      }

      const response = await fetch("/admin/api/auth/change-password", {
        method: "POST",
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      let data: any = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch {}
      } else {
        try {
          const txt = await response.text();
          data = txt ? { message: txt } : null;
        } catch {}
      }

      if (!response.ok || data?.success === false) {
        toast.error(data?.message || data?.error || "Unable to change password");
        return;
      }

      toast.success(data?.message || data?.error || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
          <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <div className="text-sm text-gray-900 font-medium">{firstName} {lastName}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">First Name</label>
                <input value={firstName} disabled onChange={(e) => setFirstName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Last Name</label>
                <input value={lastName} disabled onChange={(e) => setLastName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email Address</label>
              <div className="relative">
                <input value={email} disabled className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600" />
                <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">🔒</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Security Settings</h4>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm pr-10" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-sm leading-5 text-[#3BA049] hover:text-[#33913F]"
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm pr-10" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-sm leading-5 text-[#3BA049] hover:text-[#33913F]"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#3BA049] hover:bg-[#33913F] text-white text-sm disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
