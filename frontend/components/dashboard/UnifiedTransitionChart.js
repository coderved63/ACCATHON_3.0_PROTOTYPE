"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

export default function UnifiedTransitionChart({ historical, forecast, title, color = "#6366f1" }) {
    // To make the lines connect, the forecast data should ideally start from the last historical point
    // but with a dashed style.

    // 1. Create a merged dataset where each point has 'histValue' and/or 'foreValue'
    const lastHist = historical[historical.length - 1];

    // Add the last historical point to the start of forecast to ensure connection
    const forecastWithConnection = lastHist
        ? [{ year: lastHist.year, value: lastHist.value }, ...forecast]
        : forecast;

    const allYears = Array.from(new Set([
        ...historical.map(d => d.year),
        ...forecastWithConnection.map(d => d.year)
    ])).sort((a, b) => {
        const yrA = parseInt(a.replace(/\D/g, ''));
        const yrB = parseInt(b.replace(/\D/g, ''));
        return yrA - yrB;
    });

    const combinedData = allYears.map(yr => {
        const h = historical.find(d => d.year === yr);
        const f = forecastWithConnection.find(d => d.year === yr);
        return {
            year: yr,
            historical: h ? h.value : null,
            forecast: f ? f.value : null
        };
    });

    return (
        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}: Continuum</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 bg-indigo-500" />
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Audited</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 border-t-2 border-dashed border-indigo-400" />
                        <span className="text-[9px] text-indigo-400 font-bold uppercase">Forecast</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#050505',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                            formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'historical' ? 'Audited' : 'Forecast']}
                        />

                        {lastHist && (
                            <ReferenceLine x={lastHist.year} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.3}>
                                <Label
                                    value="FORECAST BEGINS"
                                    position="top"
                                    fill="#6366f1"
                                    fontSize={8}
                                    fontWeight={900}
                                    offset={10}
                                />
                            </ReferenceLine>
                        )}

                        {/* Historical Line (Solid) */}
                        <Line
                            type="monotone"
                            dataKey="historical"
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, strokeWidth: 2, r: 4, stroke: '#0a0a0a' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls={false}
                        />

                        {/* Forecast Line (Dashed) */}
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke={color}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#0a0a0a', stroke: color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
