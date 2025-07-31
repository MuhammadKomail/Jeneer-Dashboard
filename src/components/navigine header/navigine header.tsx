import React from 'react';
import { usePathname } from "next/navigation";
import { useTranslation } from 'react-i18next';

export default function NavigineHeader() {
    const { t } = useTranslation();
    const pathname = usePathname()?.replace(/^\/+/, '') || ''; // Ensure pathname is a string

    return (
        <div>
            <div className="text-black text-2xl font-bold">Admin Portal</div>

            {/* {pathname !== 'dashboard' && (
                <div className="text-gray-500 text-sm">
                    Admin Portal / <span className="capitalize">{pathname}</span>
                </div>
            )} */}
        </div>
    );
}