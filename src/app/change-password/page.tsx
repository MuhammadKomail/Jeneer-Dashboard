"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function ChangePasswordPage() {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email] = useState("john.doe@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("https://i.pravatar.cc/120?img=5");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup object URLs if any were created
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const onPickPhoto = () => fileRef.current?.click();

  const onChangePhoto: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Basic validations
    if (!f.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (f.size > maxSize) {
      setPhotoError("Image is too large (max 3MB).");
      return;
    }
    setPhotoError(null);
    const url = URL.createObjectURL(f);
    setPhotoUrl(url);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setTimeout(() => {
      setSaving(false);
      setMessage("Changes saved successfully.");
      setCurrentPassword("");
      setNewPassword("");
    }, 800);
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
            <button type="button" onClick={onPickPhoto} className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#3BA049] text-white text-xs ring-2 ring-white">
              📷
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onChangePhoto}
            />
          </div>
          <div>
            <div className="text-sm text-gray-900 font-medium">{firstName} {lastName}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>
        </div>

        {photoError && <div className="text-xs text-red-600 mb-4">{photoError}</div>}

        <form onSubmit={onSave} className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Personal Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
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

          {message && <div className="text-sm text-green-600">{message}</div>}

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
