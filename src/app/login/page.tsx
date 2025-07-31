"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setCookie, getCookie, hasCookie } from "cookies-next";
import Link from "next/link";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { logInUser } from "@/redux/action/authAction/authAction";
import { Dots } from "react-activity";
import { assetPaths } from "@/paths/path";
import styles from "./login.module.css";
import messages from "@/utils/messages/messages";
import { useTranslation } from 'react-i18next';

interface FormStates {
  email: string;
  password: string;
  loader: boolean;
  showPassword: boolean;
  showToast: boolean;
  message: string;
  messageStatus: string;
  rememberMe: boolean;
}

const LogIn: React.FC = () => {

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; // 'en' or 'ar'

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { error, user, loading } = useAppSelector((state) => state.authStates);

  const [formStates, setFormStates] = useState<FormStates>({
    email: "",
    password: "",
    loader: false,
    showPassword: false,
    showToast: false,
    message: "",
    messageStatus: "",
    rememberMe: false,
  });

  // Load saved credentials from cookies on component mount
  useEffect(() => {
    if (hasCookie("rememberedEmail") && hasCookie("rememberedPassword")) {
      setFormStates((prevState) => ({
        ...prevState,
        email: getCookie("rememberedEmail") as string,
        password: getCookie("rememberedPassword") as string,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormStates((prevState) => ({
      ...prevState,
      [id]: value.trimStart(),
    }));
  };

  const handleClickShowPassword = () =>
    setFormStates({ ...formStates, showPassword: !formStates.showPassword });

  const handleRememberMeChange = () => {
    setFormStates((prevState) => ({
      ...prevState,
      rememberMe: !prevState.rememberMe,
    }));
  };

  const clearStates = () => {
    setFormStates({
      email: "",
      password: "",
      loader: false,
      showPassword: false,
      showToast: false,
      message: "",
      messageStatus: "",
      rememberMe: false,
    });
  };

  const closeShowMessage = () => {
    setFormStates({
      ...formStates,
      showToast: false,
      message: "",
      messageStatus: "",
    });
  };

  const resHandler = (res: any) => {
    if (res && res?.message === "Network Error") {
      setFormStates({
        ...formStates,
        loader: false,
        showToast: true,
        message: "Server is not working, Please try again later!",
        messageStatus: messages.error,
      });
    } else if (res && res?.message === "Internal Server Error") {
      setFormStates({
        ...formStates,
        loader: false,
        showToast: true,
        message: res?.data?.message,
        messageStatus: messages.error,
      });
    } else if (res && !res?.status?.toString().startsWith("2")) {
      setFormStates({
        ...formStates,
        loader: false,
        showToast: true,
        message: res?.data?.message,
        messageStatus: messages.error,
      });
    } else {
      toast.success("You have logged in successfully");
      setFormStates({
        ...formStates,
        showToast: true,
        message: "You have logged in successfully",
        messageStatus: messages.success,
      });

      // Save credentials to cookies if "Remember Me" is checked
      if (formStates.rememberMe) {
        setCookie("rememberedEmail", formStates.email, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
        setCookie("rememberedPassword", formStates.password, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
      }

      setCookie("AuthToken", res?.data?.token, { maxAge: 60 * 60 * 24 * 7 });
      setCookie("user_object", JSON.stringify(res?.data), { maxAge: 60 * 60 * 24 * 7 });
      setCookie("UserAuthenticated", true, { maxAge: 60 * 60 * 24 * 7 });
      clearStates();
      router.replace("/dashboard");
    }
  };

  const logInHandler = () => {
    const email = formStates.email.trim();
    const password = formStates.password.trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let hasError = false;

    if (!email) {
      toast.error("Email is required");
      hasError = true;
    } else if (!isEmailValid.test(email)) {
      toast.error("Invalid email address");
      hasError = true;
    }

    if (!password) {
      toast.error("Password is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setFormStates((prevState) => ({
      ...prevState,
      loader: true,
    }));

    const formDataClone = { email, password };

    dispatch(logInUser(formDataClone))
      .unwrap()
      .then((res) => {
        resHandler({ status: 200, data: res });
      })
      .catch((err) => {
        resHandler({ message: err });
      });
  };

  return (
    <div className={styles.authMainContainer}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-md relative ${styles.innerauthMainContainer}`}>
          {/* <div>
            <Image
              className={`d-block ${styles.LoginLeftImg}`}
              src={assetPaths.LoginLeftImg}
              alt="left-image"
              width={100}
            />
          </div> */}
          <div className="bg-white shadow-2xl rounded-lg p-10 sm:p-10">
            <div className={styles.mainXourceLogo}>
              <Image
                className={`d-block ${styles.XourceIcon}`}
                src={assetPaths.XourceIcon}
                alt="xource-logo"
                width={70}
              />
            </div>
            <h2 className="text-xl sm:text-3xl text-center mb-1 sm:mb-4 text-black">
              Sign In
            </h2>
            <p className="text-center text-sm sm:text-base text-gray mb-4 sm:mb-6">
              Welcome to Xource.AI
            </p>
            <div className="space-y-4">
              <div className="space-y-2 pb-4">
                <Label htmlFor="email" className="text-sm text-black font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Email"
                  value={formStates.email}
                  onChange={handleInputChange}
                  className="text-sm text-gray p-5"
                />
              </div>
              <div className="relative space-y-2 pb-4">
                <Label htmlFor="password" className="text-sm text-black font-bold">
                  Password
                </Label>
                <Input
                  id="password"
                  type={formStates.showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formStates.password}
                  onChange={handleInputChange}
                  className={`text-sm text-gray p-5 ${currentLang === 'ar' ? 'pr-3 pl-10' : 'pl-3 pr-10'}`}
                  style={{
                    direction: currentLang === 'ar' ? 'rtl' : 'ltr'
                  }}
                />
                <button
                  type="button"
                  className={`absolute inset-y-0 top-3 flex items-center text-xs sm:text-sm leading-5 text-main hover:text-main ${currentLang === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'}`}
                  onClick={handleClickShowPassword}
                  aria-label={formStates.showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {formStates.showPassword ? <IoEye size={20} /> : <IoEyeOff size={20} />}
                </button>
              </div>
              {formStates.loader ? (
                <Dots className="text-center bg-main hover:bg-main text-sm sm:text-base py-3 sm:py-3 rounded-md text-white" />
              ) : (
                <Button
                  className="w-full text-center bg-main hover:bg-main text-sm sm:text-base py-3 sm:py-3 rounded-md text-white"
                  onClick={logInHandler}
                  type="submit"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
          {/* <div>
            <Image
              className={`d-block ${styles.LoginRightImg}`}
              src={assetPaths.LoginRightImg}
              alt="right-image"
              width={100}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LogIn;