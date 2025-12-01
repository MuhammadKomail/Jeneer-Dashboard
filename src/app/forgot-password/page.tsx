"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import leftImage from "@/assets/images/login-side.png";
import styles from "../login/login.module.css";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/verify-code");
  };

  return (
    <div className={styles.authMainContainer}>
      <div className="min-h-screen md:flex bg-white">
        <div className="hidden md:block relative md:min-h-screen md:basis-1/2 overflow-hidden">
          <Image src={leftImage} alt="left-image" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 bg-white md:rounded-r-[32px]">
          <div className="w-full max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-semibold mb-2 text-black text-left">Lost your Password?</h2>
            <p className="text-gray mb-8 text-left">Enter your email to receive a recovery code</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 pb-2">
                <Label htmlFor="email" className="text-sm text-black font-bold">Email</Label>
                <Input id="email" placeholder="john.doe@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm text-gray p-5" />
              </div>
              <Button type="submit" className="w-full text-center bg-[#3BA049] hover:bg-[#33913F] text-sm sm:text-base py-3 sm:py-3 rounded-md text-white">Receive Code</Button>
              <div className="text-center text-sm"><Link href="/login" className="text-[#3BA049] hover:text-[#33913F]">Back to login</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
