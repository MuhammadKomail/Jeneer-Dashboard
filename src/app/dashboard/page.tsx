"use client";

import React from "react";
import NavigineHeader from "@/components/navigine header/navigine header";
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { i18n, t } = useTranslation();


  return (
    <>
      <div className="mx-auto">
        <div className="space-y-12">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="p-3 bg-gray-50 min-h-screen w-full lg:w-[100%] flex flex-col gap-6">
              <NavigineHeader />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
