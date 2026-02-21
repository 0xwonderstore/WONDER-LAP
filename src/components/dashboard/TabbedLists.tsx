import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Languages, Globe, ExternalLink } from 'lucide-react';

const languageNameMap: { [key: string]: string } = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  // Add more mappings as needed
};

const LIST_COLORS = ["#4F46E5", "#7C3AED", "#DB2777", "#F59E0B", "#10B981"];

const ListItem = ({ item, t, onNavigate, index, total, type }: any) => {
    const percentage = total > 0 ? (item.count / total * 100).toFixed(1) : 0;
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <div className="flex items-center gap-4 flex-grow min-w-0">
                <span className="text-gray-400 dark:text-gray-500 font-semibold text-sm w-5 text-right">{index + 1}.</span>
                <div className="flex-grow min-w-0">
                  {type === 'language' ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 dark:text-white truncate cursor-pointer hover:underline" onClick={() => onNavigate({ language: item.code })}>{languageNameMap[item.code] || item.code}</span>
                        <span className="text-xs text-gray-400">({item.code})</span>
                      </div>
                  ) : (
                    <span className="font-bold text-gray-800 dark:text-white truncate cursor-pointer hover:underline" onClick={() => onNavigate({ name: item.text })}>{item.text}</span>
                  )}
                </div>
            </div>
            <div className="flex items-center gap-3 ml-4">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                   <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: LIST_COLORS[index % LIST_COLORS.length] }}></div>
                </div>
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400 w-12 text-right">{item.count}</span>
            </div>
        </div>
    );
};

const StoreItem = ({ item, t, onNavigate, index, total, type }: any) => {
    const percentage = total > 0 ? (item.totalProducts / total * 100).toFixed(1) : 0;

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-sm">
            <td className="p-4 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{index + 1}.</td>
            <td className="p-4 font-bold text-gray-800 dark:text-white whitespace-nowrap">
                <span className="cursor-pointer hover:underline" onClick={() => onNavigate({ store: item.vendor })}>{item.vendor}</span>
                {item.storeUrl && (
                   <a href={item.storeUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-600 transition-colors">
                      <ExternalLink size={14} />
                   </a>
                )}
            </td>
            <td className="p-4 text-gray-600 dark:text-gray-300 font-mono whitespace-nowrap">{item.totalProducts}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300 font-mono whitespace-nowrap">{item.newProducts30d}</td>
            <td className="p-4 text-gray-600 dark:text-gray-300 font-mono whitespace-nowrap">{item.avgDailyProducts}</td>
            <td className="p-4 w-full">
                 <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                   <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: LIST_COLORS[index % LIST_COLORS.length] }}></div>
                </div>
            </td>
             <td className="p-4 text-gray-600 dark:text-gray-300 font-mono whitespace-nowrap text-right">{percentage}%</td>
            <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.firstProductAdded}</td>
            <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.lastProductAdded}</td>
        </tr>
    );
};

export const StoreTable = ({ data, t, onNavigateWithFilter, totalProductsSum }: any) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                    <th className="p-4 font-semibold">#</th>
                    <th className="p-4 font-semibold">{t.store || 'Store'}</th>
                    <th className="p-4 font-semibold">{t.dashboard_totalProducts || 'Total Products'}</th>
                    <th className="p-4 font-semibold">{t.dashboard_newProducts30d || 'New in 30d'}</th>
                    <th className="p-4 font-semibold">{t.avg_daily_products || 'Avg. Daily'}</th>
                    <th className="p-4 font-semibold w-1/3">{t.product_share || 'Product Share'}</th>
                    <th className="p-4 font-semibold"></th>
                    <th className="p-4 font-semibold">{t.first_product_added || 'First Added'}</th>
                    <th className="p-4 font-semibold">{t.last_product_added || 'Last Added'}</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item: any, i: number) => (
                    <StoreItem key={item.vendor} item={item} t={t} onNavigate={onNavigateWithFilter} index={i} total={totalProductsSum} type="store" />
                ))}
            </tbody>
        </table>
    </div>
);

export const KeywordList = ({ data, t, onNavigateWithFilter }: any) => {
    const totalCount = data.reduce((sum: number, item: any) => sum + item.value, 0);
    return (
        <div>
            {data.map((item: any, i: number) => (
                <ListItem key={item.text} item={{ text: item.text, count: item.value }} t={t} onNavigate={onNavigateWithFilter} index={i} total={totalCount} type="keyword" />
            ))}
        </div>
    );
};

export const LanguageList = ({ data, t, onNavigateWithFilter }: any) => {
    const totalCount = data.reduce((sum: number, item: any) => sum + item.count, 0);
    return (
        <div>
            {data.map((item: any, i: number) => (
                 <ListItem key={item.code} item={item} t={t} onNavigate={onNavigateWithFilter} index={i} total={totalCount} type="language" />
            ))}
        </div>
    );
};
