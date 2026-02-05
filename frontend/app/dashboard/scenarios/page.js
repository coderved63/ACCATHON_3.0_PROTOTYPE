"use client";
import React, { useState, useEffect } from 'react';
import { financeApi } from '@/services/api';
import { SlidersHorizontal, RefreshCcw, AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import ScenarioComparisonChart from '@/components/dashboard/ScenarioComparisonChart';

const ControlSlider = ({ label, value, min, max, step, onChange, unit = "%" }) => (
    <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-bold uppercase tracking-widest">{label}</span>
            <span className="text-white font-mono font-bold text-xs">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
    </div>
);

export default function ScenariosPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Scenario States (matching seeded defaults)
    const [revGrowth, setRevGrowth] = useState(18);
    const [opMargin, setOpMargin] = useState(28);
    const [wacc, setWacc] = useState(11.5);
    const [terminalGrowth, setTerminalGrowth] = useState(5);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await financeApi.getValuation();
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const reset = () => {
        setRevGrowth(18);
        setOpMargin(28);
        setWacc(11.5);
        setTerminalGrowth(5);
    };

    if (loading) return <div className="p-10 text-slate-500 text-sm">Loading simulation environment...</div>;

    const baseValue = data?.intrinsic_value_per_share ? parseFloat(data.intrinsic_value_per_share) : 1153.60;

    // Sensitivities (calibrated for post-split Bajaj Finance)
    const revSens = 12.5;
    const marginSens = 8.0;
    const waccSens = -75.0;
    const terminalSens = 35.0;

    const scenarioValue = baseValue
        + (revGrowth - 18) * revSens
        + (opMargin - 28) * marginSens
        + (wacc - 11.5) * waccSens
        + (terminalGrowth - 5) * terminalSens;

    const diff = scenarioValue - baseValue;
    const diffPct = (diff / baseValue) * 100;

    return (
        <div className="space-y-6 text-white pb-20">
            <header className="mb-10 text-white">
                <h1 className="text-2xl font-bold tracking-tight">What-If Scenarios</h1>
                <p className="text-sm text-slate-500 mt-1">Explore how different assumptions affect the intrinsic value</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/5 w-fit px-3 py-1 rounded-full border border-indigo-500/10">
                    <Info size={12} />
                    All figures in ₹ '000 (Thousands)
                </div>
            </header>

            <div className="bg-indigo-600/5 border border-indigo-500/20 p-6 rounded-xl flex gap-4 items-start mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <SlidersHorizontal className="text-indigo-400" size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Scenario Analysis Mode</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed italic">
                        Adjust assumptions to see real-time impact on valuation. Base case is calibrated for FY2024 results.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-[#0a0a0a] p-8 rounded-xl border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-sm font-bold tracking-tight">Adjust Assumptions</h2>
                        <button onClick={reset} className="px-3 py-1 bg-white/5 text-[10px] text-slate-400 hover:text-white rounded-md border border-white/5 flex items-center gap-1.5 transition-all">
                            <RefreshCcw size={12} /> Reset to Base
                        </button>
                    </div>

                    <ControlSlider label="Revenue Growth" value={revGrowth} min={5} max={35} step={1} onChange={setRevGrowth} />
                    <ControlSlider label="Operating Margin" value={opMargin} min={15} max={45} step={1} onChange={setOpMargin} />
                    <ControlSlider label="WACC" value={wacc} min={8} max={16} step={0.5} onChange={setWacc} />
                    <ControlSlider label="Terminal Growth" value={terminalGrowth} min={2} max={8} step={0.5} onChange={setTerminalGrowth} />

                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-3 mt-10 text-[10px] text-slate-500 italic">
                        <AlertCircle size={16} className="text-indigo-500 shrink-0" />
                        Move sliders to simulate valuation sensitivity relative to base case.
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <ScenarioComparisonChart baseValue={baseValue} scenarioValue={scenarioValue} />

                    <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/5 shadow-2xl">
                        <div className={`flex justify-between items-center px-6 py-5 rounded-2xl border transition-all ${diff >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                            <div className="flex items-center gap-3">
                                {diff >= 0 ? <TrendingUp size={18} className="text-emerald-500" /> : <TrendingDown size={18} className="text-rose-500" />}
                                <span className="text-xs text-slate-400 font-medium">Value Impact per Share</span>
                            </div>
                            <span className={`text-sm font-bold font-mono ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {diff >= 0 ? '+' : ''}₹{Math.abs(diff).toFixed(2)} ({diffPct.toFixed(1)}%)
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/5 shadow-2xl">
                        <h2 className="text-sm font-bold mb-8">Sensitivity Drivers</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Rev Growth Impact', score: '+1.08%', color: 'bg-emerald-500/20' },
                                { label: 'Margin Expansion', score: '+0.69%', color: 'bg-indigo-500/20' },
                                { label: 'Discount Rate Beta', score: '-6.50%', color: 'bg-rose-500/20' },
                                { label: 'Terminal Upside', score: '+3.03%', color: 'bg-sky-500/20' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0 group">
                                    <div className={`w-1 h-8 rounded-full ${item.color}`} />
                                    <span className="text-xs text-slate-400 flex-1 font-medium">{item.label}</span>
                                    <span className={`text-xs font-bold font-mono ${item.score.startsWith('-') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {item.score}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
