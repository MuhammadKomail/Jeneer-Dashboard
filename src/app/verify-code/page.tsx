"use client";

import * as React from "react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import leftImage from "@/assets/images/login-side.png";
import styles from "../login/login.module.css";

export default function VerifyCode() {
  const router = useRouter();
  const [values, setValues] = useState(["", "", "", ""]);
  const inputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const onChange = (idx: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...values];
    next[idx] = d;
    setValues(next);
    if (d && idx < inputs.length - 1) inputs[idx + 1].current?.focus();
  };

  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      inputs[idx - 1].current?.focus();
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (values.join("").length === 4) router.push("/new-password");
  };

  return (
    <div className={styles.authMainContainer}>
      <div className="min-h-screen md:flex bg-white">
        <div className="hidden md:block relative md:min-h-screen md:basis-1/2 md:flex-none overflow-hidden">
          <Image src={leftImage} alt="left-image" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-white md:rounded-r-[32px] md:min-h-screen">
          <div className="w-full max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-semibold mb-2 text-black text-left">Reset Password</h2>
            <p className="text-gray mb-8 text-left">Please enter the 4 digit OTP code sent to your email.</p>

            <form onSubmit={submit} className="space-y-6">
              <div className="flex gap-4">
                {values.map((v, i) => (
                  <input
                    key={i}
                    ref={inputs[i]}
                    value={v}
                    onChange={(e) => onChange(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-20 h-16 rounded-md border border-gray-300 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-[#3BA049]"
                  />
                ))}
              </div>
              <Button type="submit" className="w-full text-center bg-[#3BA049] hover:bg-[#33913F] text-sm sm:text-base py-3 sm:py-3 rounded-md text-white">Reset Password</Button>
              <div className="text-center text-sm"><Link href="/forgot-password" className="text-[#3BA049] hover:text-[#33913F]">Back</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
