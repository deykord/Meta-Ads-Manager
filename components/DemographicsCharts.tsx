import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AGE_DATA = [
  { name: '18-24', male: 400, female: 240 },
  { name: '25-34', male: 300, female: 456 },
  { name: '35-44', male: 200, female: 380 },
  { name: '45-54', male: 278, female: 190 },
  { name: '55-64', male: 189, female: 120 },
  { name: '65+', male: 100, female: 80 },
];

const PLATFORM_DATA = [
  { name: 'Facebook', value: 45, color: '#3b5998' },
  { name: 'Instagram', value: 35, color: '#C13584' },
  { name: 'Audience Net', value: 15, color: '#00bcd4' },
  { name: 'Messenger', value: 5, color: '#0084ff' },
];

const DemographicsCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Age/Gender Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Demographics (Age & Gender)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={AGE_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              <Legend />
              <Bar dataKey="female" name="Female" stackId="a" fill="#ec4899" radius={[0, 0, 4, 4]} />
              <Bar dataKey="male" name="Male" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PLATFORM_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {PLATFORM_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DemographicsCharts;