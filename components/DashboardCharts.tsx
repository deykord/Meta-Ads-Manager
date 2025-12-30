import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Campaign } from '../types';

interface DashboardChartsProps {
  campaigns: Campaign[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ campaigns }) => {
  // Sort by spend for the bar chart
  const barData = [...campaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10)
    .map(c => ({
      name: c.name.split('-')[0].trim(),
      spend: c.spend,
      conversions: c.conversions
    }));

  // Simulate daily trend data
  const trendData = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      spend: Math.floor(Math.random() * 2000 + 1000),
      roas: (Math.random() * 2 + 1.5).toFixed(2), // Random ROAS between 1.5 and 3.5
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 1. Spend vs Conversions (Bar) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Campaigns</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              <Bar yAxisId="left" dataKey="spend" name="Spend ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="right" dataKey="conversions" name="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Daily Spend & ROAS Trend (Composed) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Trend (Spend vs ROAS)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 6]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="spend" name="Spend ($)" yAxisId="left" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSpend)" />
              <Line type="monotone" dataKey="roas" name="ROAS" yAxisId="right" stroke="#f59e0b" strokeWidth={2} dot={{r:3}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;