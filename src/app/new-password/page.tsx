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
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function NewPassword() {
  const router = useRouter();
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwd1 || !pwd2) return;
    if (pwd1 !== pwd2) return;
    // TODO: integrate API then redirect
    router.push("/login");
  };

  return (
    <div className={styles.authMainContainer}>
      <div className="min-h-screen md:flex bg-white">
        <div className="hidden md:block relative md:min-h-screen md:basis-1/2 overflow-hidden">
          <Image src={leftImage} alt="left-image" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white md:rounded-r-[32px] md:min-h-screen">
          <div className="w-full max-w-xl">
            <h2 className="text-2xl sm:text-4xl font-semibold mb-2 text-black text-left">Reset Password</h2>
            <p className="text-gray mb-8 text-left">Reset your password</p>
            <form onSubmit={submit} className="space-y-4">
              <div className="relative space-y-2 pb-2">
                <Label htmlFor="newpwd" className="text-sm text-black font-bold">New Password</Label>
                <Input id="newpwd" type={show1 ? "text" : "password"} placeholder="Password" value={pwd1} onChange={(e)=>setPwd1(e.target.value)} className="text-sm text-gray p-5 pr-10" />
                <button type="button" className="absolute inset-y-0 top-3 right-3 flex items-center text-[#3BA049]" onClick={()=>setShow1(!show1)} aria-label={show1?"Hide password":"Show password"}>
                  {show1 ? <IoEye size={20}/> : <IoEyeOff size={20}/>}
                </button>
              </div>
              <div className="relative space-y-2 pb-2">
                <Label htmlFor="confirmpwd" className="text-sm text-black font-bold">Confirm Password</Label>
                <Input id="confirmpwd" type={show2 ? "text" : "password"} placeholder="Password" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} className="text-sm text-gray p-5 pr-10" />
                <button type="button" className="absolute inset-y-0 top-3 right-3 flex items-center text-[#3BA049]" onClick={()=>setShow2(!show2)} aria-label={show2?"Hide password":"Show password"}>
                  {show2 ? <IoEye size={20}/> : <IoEyeOff size={20}/>}
                </button>
              </div>
              <Button type="submit" className="w-full text-center bg-[#3BA049] hover:bg-[#33913F] text-sm sm:text-base py-3 sm:py-3 rounded-md text-white">Update Password</Button>
              <div className="text-center text-sm"><Link href="/login" className="text-[#3BA049] hover:text-[#33913F]">Back to login</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
