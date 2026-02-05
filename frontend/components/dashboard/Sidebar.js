"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, History, TrendingUp, Calculator, FileText, SlidersHorizontal, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
    <Link href={href}>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all cursor-pointer group mb-1 ${active ? 'bg-[#1e293b] text-white' : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'}`}>
            <Icon size={18} className={active ? 'text-indigo-400' : 'group-hover:text-indigo-400'} />
            <span className="text-sm font-medium">{label}</span>
        </div>
    </Link>
);

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const items = [
        { icon: LayoutGrid, label: 'Overview', href: '/dashboard' },
        { icon: History, label: 'Historical Data', href: '/dashboard/historical' },
        { icon: TrendingUp, label: '5-Year Forecast', href: '/dashboard/forecast' },
        { icon: Calculator, label: 'Valuation', href: '/dashboard/valuation' },
        { icon: FileText, label: 'Explanation', href: '/dashboard/explanation' },
        { icon: SlidersHorizontal, label: 'Scenarios', href: '/dashboard/scenarios' },
    ];

    return (
        <aside className="w-64 bg-[#050505] h-screen border-r border-white/5 flex flex-col p-5 fixed text-white">
            <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors text-[10px]">
                <ArrowLeft size={12} /> Back to Home
            </Link>

            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/20">
                    IV
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-white leading-none">IntelliValue</h1>
                    <span className="text-[10px] text-slate-500">Bajaj Valuation</span>
                </div>
            </div>

            <nav className="flex-1">
                {items.map((item) => (
                    <SidebarItem
                        key={item.label}
                        {...item}
                        active={pathname === item.href}
                    />
                ))}
            </nav>

            <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all text-sm mt-auto"
            >
                <LogOut size={18} />
                <span className="font-medium">Sign Out</span>
            </button>
        </aside>
    );
}
