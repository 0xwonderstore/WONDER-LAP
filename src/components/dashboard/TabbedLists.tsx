import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, SortingState, ColumnDef } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import { StoreRow, KeywordItem, LanguageItem } from '../../types';

// --- Animation Variants ---
const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } },
};

const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.2, ease: 'easeInOut' },
  }),
};

// --- Shared Components ---
const MetaAdLibraryLink: React.FC<{ vendor: string; t: any }> = ({ vendor, t }) => {
  const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(vendor)}&search_type=keyword_unordered`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={t.searchInMeta} className="inline-flex items-center justify-center p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" alt="Meta AdLibrary" className="w-5 h-5" />
    </a>
  );
};

const ListItem: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    animate="visible"
    variants={itemVariants}
    transition={{ delay: index * 0.03 }}
    className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
  >
    {children}
  </motion.div>
);

// --- Store Table ---
interface StoreTableProps {
  data: StoreRow[];
  t: any;
  onNavigateWithFilter: (f: { store: string }) => void;
  totalProductsSum: number;
}

const PositiveChangeCell: React.FC<{ value: number }> = ({ value }) => (
    <span className={`font-bold text-sm ${value > 0 ? 'text-teal-500' : 'text-gray-400 dark:text-gray-500'}`}>{value > 0 ? `+${value}` : '-'}</span>
);

const PercentageCell: React.FC<{ value: number }> = ({ value }) => (
  <span className={`font-bold text-sm ${value > 10 ? 'text-green-500' : value > 0 ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`}>
    {value.toFixed(1)}%
  </span>
);

const ProgressBarCell: React.FC<{ value: number; colorClass: string }> = ({ value, colorClass }) => (
  <div className="w-full min-w-[100px]">
    <div className="flex justify-between mb-1">
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value.toFixed(1)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
      <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min(value, 100)}%` }}></div>
    </div>
  </div>
);


export const StoreTable: React.FC<StoreTableProps> = ({ data, t, onNavigateWithFilter, totalProductsSum }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { storeColumnsVisibility } = useDashboardStore();

  const columns = React.useMemo<ColumnDef<StoreRow>[]>(() => [
    {
      accessorKey: 'vendor',
      header: t.storeName,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-sm">{row.original.vendor.substring(0, 2).toUpperCase()}</div>
          <span onClick={() => onNavigateWithFilter({ store: row.original.vendor })} className="cursor-pointer font-bold text-gray-800 dark:text-gray-100 hover:text-indigo-500 transition-colors truncate max-w-[150px]">{row.original.vendor}</span>
        </div>
      ),
    },
    ...(storeColumnsVisibility.totalProducts ? [{
      accessorKey: 'totalProducts',
      header: t.totalProducts,
      cell: ({ row }) => (
        <div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{row.original.totalProducts}</span>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
            <div className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full" style={{ width: `${(row.original.totalProducts / totalProductsSum) * 100}%` }}></div>
          </div>
        </div>
      ),
    }] : []),
    ...(storeColumnsVisibility.newProducts30d ? [{ accessorKey: 'newProducts30d', header: t.dashboard_newProducts30d_store, cell: ({ row }) => <PositiveChangeCell value={row.original.newProducts30d} /> }] : []),
    ...(storeColumnsVisibility.newProducts60d ? [{ accessorKey: 'newProducts60d', header: t.dashboard_newProducts60d_store, cell: ({ row }) => <PositiveChangeCell value={row.original.newProducts60d} /> }] : []),
    ...(storeColumnsVisibility.newProducts90d ? [{ accessorKey: 'newProducts90d', header: t.dashboard_newProducts90d_store, cell: ({ row }) => <PositiveChangeCell value={row.original.newProducts90d} /> }] : []),
    ...(storeColumnsVisibility.newProducts180d ? [{ accessorKey: 'newProducts180d', header: t.dashboard_newProducts180d_store, cell: ({ row }) => <PositiveChangeCell value={row.original.newProducts180d} /> }] : []),
    ...(storeColumnsVisibility.newProducts30dPercentage ? [{ accessorKey: 'newProducts30dPercentage', header: t.dashboard_newProducts30d_percentage_store, cell: ({ row }) => <PercentageCell value={row.original.newProducts30dPercentage} /> }] : []),
    ...(storeColumnsVisibility.newProducts60dPercentage ? [{ accessorKey: 'newProducts60dPercentage', header: t.dashboard_newProducts60d_percentage_store, cell: ({ row }) => <PercentageCell value={row.original.newProducts60dPercentage} /> }] : []),
    ...(storeColumnsVisibility.newProducts90dPercentage ? [{ accessorKey: 'newProducts90dPercentage', header: t.dashboard_newProducts90d_percentage_store, cell: ({ row }) => <PercentageCell value={row.original.newProducts90dPercentage} /> }] : []),
    ...(storeColumnsVisibility.newProducts180dPercentage ? [{ accessorKey: 'newProducts180dPercentage', header: t.dashboard_newProducts180d_percentage_store, cell: ({ row }) => <PercentageCell value={row.original.newProducts180dPercentage} /> }] : []),
    
    // New Activity Rate Columns
    ...(storeColumnsVisibility.activityRate30d ? [{ 
        accessorKey: 'activityRate30d', 
        header: t.dashboard_activityRate30d, 
        cell: ({ row }) => <ProgressBarCell value={row.original.activityRate30d} colorClass="bg-green-500" /> 
    }] : []),
    ...(storeColumnsVisibility.activityRate60d ? [{ 
        accessorKey: 'activityRate60d', 
        header: t.dashboard_activityRate60d, 
        cell: ({ row }) => <ProgressBarCell value={row.original.activityRate60d} colorClass="bg-blue-500" /> 
    }] : []),
    ...(storeColumnsVisibility.activityRate90d ? [{ 
        accessorKey: 'activityRate90d', 
        header: t.dashboard_activityRate90d, 
        cell: ({ row }) => <ProgressBarCell value={row.original.activityRate90d} colorClass="bg-orange-500" /> 
    }] : []),
    ...(storeColumnsVisibility.activityRate180d ? [{ 
        accessorKey: 'activityRate180d', 
        header: t.dashboard_activityRate180d, 
        cell: ({ row }) => <ProgressBarCell value={row.original.activityRate180d} colorClass="bg-red-500" /> 
    }] : []),

    ...(storeColumnsVisibility.lastProductAdded ? [{
      accessorKey: 'lastProductAdded',
      header: t.dashboard_lastProductAdded,
      cell: ({ row }) => <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{row.original.lastProductAdded}</span>,
    }] : []),
    ...(storeColumnsVisibility.firstProductAdded ? [{
      accessorKey: 'firstProductAdded',
      header: t.dashboard_firstProductAdded,
      cell: ({ row }) => <span className="text-sm font-medium text-gray-500 dark:text-gray-400 font-mono">{row.original.firstProductAdded}</span>,
    }] : []),
    ...(storeColumnsVisibility.metaAdLibrary ? [{
      id: 'metaAdLibrary',
      header: () => <div className="text-center">{t.searchInMeta}</div>,
      cell: ({ row }) => (<div className="flex justify-center items-center"><MetaAdLibraryLink vendor={row.original.vendor} t={t} /></div>),
    }] : []),
  ], [t, onNavigateWithFilter, storeColumnsVisibility, totalProductsSum]);

  const table = useReactTable({ data, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left rtl:text-right border-collapse">
        <thead>
          {table.getHeaderGroups().map(hg => (
            <tr key={hg.id} className="border-b border-gray-100 dark:border-gray-700">
              {hg.headers.map(h => (
                <th key={h.id} className={`p-5 text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold ${h.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={h.column.getToggleSortingHandler()}>
                  <div className="flex items-center gap-2">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: <ChevronDown size={14} className="rotate-180" />, desc: <ChevronDown size={14} /> }[h.column.getIsSorted() as string]}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <AnimatePresence>
            {table.getRowModel().rows.map((row, i) => (
              <motion.tr
                custom={i}
                variants={tableRowVariants}
                initial="hidden"
                animate="visible"
                key={row.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-5 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

// --- Keyword List ---
interface KeywordListProps {
  data: KeywordItem[];
  t: any;
  onNavigateWithFilter: (f: { name: string }) => void;
}

export const KeywordList: React.FC<KeywordListProps> = ({ data, t, onNavigateWithFilter }) => (
  <div className="divide-y divide-gray-100 dark:divide-gray-700">
    {data.map(({ text, value }, index) => (
      <ListItem key={text} index={index}>
        <div className="flex items-center gap-4">
          <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${index < 3 ? 'bg-amber-400/20 text-amber-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>#{index + 1}</span>
          <span onClick={() => onNavigateWithFilter({ name: text })} className="font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-indigo-500 transition-colors text-lg">{text}</span>
        </div>
        <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">{value}</span>
      </ListItem>
    ))}
  </div>
);

// --- Language List ---
interface LanguageListProps {
  data: LanguageItem[];
  t: any;
  onNavigateWithFilter: (f: { language: string }) => void;
}

export const LanguageList: React.FC<LanguageListProps> = ({ data, t, onNavigateWithFilter }) => (
  <div className="divide-y divide-gray-100 dark:divide-gray-700">
    {data.map(({ code, count }, index) => (
      <ListItem key={code} index={index}>
        <div className="flex items-center gap-4">
          <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${index < 3 ? 'bg-rose-400/20 text-rose-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>#{index + 1}</span>
          <span onClick={() => onNavigateWithFilter({ language: code })} className="font-bold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-indigo-500 transition-colors text-lg uppercase">{t[code] || code}</span>
        </div>
        <span className="font-mono text-sm font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">{count}</span>
      </ListItem>
    ))}
  </div>
);
