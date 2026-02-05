import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartData {
  date: string;
  products: number;
  posts: number;
}

interface ChartProps {
  data: ChartData[];
  title: string;
  t?: any;
}

const Chart: React.FC<ChartProps> = ({ data, title, t }) => {
  // Calculate totals for summary context
  const totalProducts = data.reduce((acc, curr) => acc + curr.products, 0);
  const totalPosts = data.reduce((acc, curr) => acc + curr.posts, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-xl">
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">Activity Trend</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
               Products & Posts over the last <span className="font-bold text-indigo-500">180 Days</span>
            </p>
          </div>
        </div>
        
        {/* Quick Legend / Summary */}
        <div className="flex gap-6 text-xs font-medium bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
             <div className="flex flex-col items-center">
                 <span className="text-gray-500 dark:text-gray-400 mb-1">Total Products</span>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">{totalProducts}</span>
                 </div>
             </div>
             <div className="w-px bg-gray-200 dark:bg-gray-600 h-8"></div>
             <div className="flex flex-col items-center">
                 <span className="text-gray-500 dark:text-gray-400 mb-1">Total Posts</span>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                    <span className="text-pink-600 dark:text-pink-400 font-bold text-sm">{totalPosts}</span>
                 </div>
             </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.1)" vertical={false} />
            <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10}
                interval="preserveStartEnd" // Optimize ticks for 180 days
                minTickGap={30}
            />
            <YAxis 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                padding: '12px',
                fontSize: '12px'
              }}
              itemStyle={{ paddingBottom: '4px' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontWeight: 600 }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="products" 
              name={t?.products || "Products"} 
              stroke="#6366f1" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorProducts)" 
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area 
              type="monotone" 
              dataKey="posts" 
              name={t?.instagram_posts || "Posts"} 
              stroke="#ec4899" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#colorPosts)" 
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
