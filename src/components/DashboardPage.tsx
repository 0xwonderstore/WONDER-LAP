import React from 'react';
import { Product, Locale } from '../types';
import { TrendingUp, Package, Store, Clock } from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { subDays, format, parseISO } from 'date-fns';
import { translations } from '../translations';

// --- Types ---
interface DashboardPageProps {
  products: Product[];
  locale: Locale;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

// --- Main Component ---
const DashboardPage: React.FC<DashboardPageProps> = ({ products, locale }) => {
  const t = translations[locale];

  const dashboardData = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const recentProducts = products.filter(p => parseISO(p.created_at) >= thirtyDaysAgo);
    
    const uniqueStores = new Set(products.map(p => p.vendor));
    const recentUniqueStores = new Set(recentProducts.map(p => p.vendor));

    const dailyProductCounts = recentProducts.reduce((acc, product) => {
        const day = format(parseISO(product.created_at), 'yyyy-MM-dd');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const trendData = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, i);
        const dayKey = format(date, 'yyyy-MM-dd');
        return {
            x: format(date, 'MM-dd'),
            y: dailyProductCounts[dayKey] || 0,
        };
    }).reverse();
    
    return {
        totalProducts: products.length,
        totalStores: uniqueStores.size,
        newProducts30d: recentProducts.length,
        newStores30d: recentUniqueStores.size,
        trendData: [{ id: 'New Products', data: trendData }],
    };
  }, [products]);

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title={t.dashboard_totalProducts} value={dashboardData.totalProducts} icon={<Package className="text-blue-500" />} />
        <KpiCard title={t.dashboard_totalStores} value={dashboardData.totalStores} icon={<Store className="text-purple-500" />} />
        <KpiCard title={t.dashboard_newProducts30d} value={dashboardData.newProducts30d} icon={<TrendingUp className="text-green-500" />} />
        <KpiCard title={t.dashboard_newStores30d} value={dashboardData.newStores30d} icon={<Clock className="text-yellow-500" />} />
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow p-6 h-[400px]">
         <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-brand-primary" />
            {t.dashboard_productTrends}
        </h3>
        <ResponsiveLine
            data={dashboardData.trendData}
            margin={{ top: 20, right: 40, bottom: 60, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Date',
                legendOffset: 50,
                legendPosition: 'middle',
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Count',
                legendOffset: -40,
                legendPosition: 'middle',
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            useMesh={true}
            colors={['#6366f1']}
            theme={{
                axis: { ticks: { text: { fill: 'var(--color-text-secondary)' } }, legend: { text: { fill: 'var(--color-text-secondary)' } } },
                grid: { line: { stroke: 'var(--color-border)', strokeWidth: 0.5 } },
                tooltip: { container: { background: 'var(--color-bg-surface-strong)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' } }
            }}
        />
      </div>
    </div>
  );
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => (
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow flex items-center gap-6">
        <div className="bg-light-background dark:bg-dark-background p-4 rounded-full">
            {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-light-text-secondary dark:text-dark-text-secondary">{title}</h3>
            <p className="text-4xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">{value}</p>
        </div>
    </div>
);


export default DashboardPage;
