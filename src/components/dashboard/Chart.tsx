import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartData {
  date: string;
  count: number;
}

interface ChartProps {
  data: ChartData[];
  title: string;
}

const Chart: React.FC<ChartProps> = ({ data, title }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-lg">
        <BarChart3 size={24} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
    </div>
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" vertical={false} />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ color: '#e2e8f0' }}
            cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
          />
          <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default Chart;
