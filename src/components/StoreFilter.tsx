import React, { useState, useMemo } from 'react';
import { StoreRow } from '../types'; // Assuming StoreRow is exported from types.ts
import Select from './Select';
import { translations } from '../translations';
import { useLanguageStore } from '../stores/languageStore';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import MetaAdLibraryLink from './MetaIcon'; // Assuming MetaIcon is now MetaAdLibraryLink or similar

interface StoreFilterProps {
  data: StoreRow[];
  onNavigateWithFilter: (filter: { name?: string; store?: string; language?: string }) => void;
}

const StoreFilter: React.FC<StoreFilterProps> = ({ data, onNavigateWithFilter }) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const [sortBy, setSortBy] = useState<string>('totalProducts');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sorting, setSorting] = useState<SortingState>([{ id: sortBy, desc: true }]);

  const languageOptions = useMemo(() => {
    const uniqueLanguages = Array.from(new Set(data.map(store => store.language).filter(Boolean))) as string[];
    const options = uniqueLanguages.map(lang => ({ value: lang, label: t[lang] || lang.toUpperCase() }));
    return [{ value: 'all', label: t.allLanguages }, ...options];
  }, [data, t]);

  const sortedAndFilteredData = useMemo(() => {
    let filtered = data;
    if (languageFilter !== 'all') {
      filtered = data.filter(store => store.language === languageFilter);
    }
    return filtered;
  }, [data, languageFilter]);

  const columns = useMemo<ColumnDef<StoreRow>[]>(() => [
    {
      accessorKey: 'vendor',
      header: t.storeName,
      cell: ({ row }) => (
        <span
          onClick={() => onNavigateWithFilter({ store: row.original.vendor })}
          className="cursor-pointer hover:underline text-brand-primary"
          title={t.dashboard_filterByStore}
        >
          {row.original.vendor}
        </span>
      )
    },
    {
      accessorKey: 'totalProducts',
      header: t.totalProducts
    },
    {
      accessorKey: 'language',
      header: t.language,
      cell: ({ row }) => row.original.language ? t[row.original.language] || row.original.language.toUpperCase() : 'N/A'
    },
    {
      accessorKey: 'newProducts30d',
      header: t.dashboard_newProducts30d_store,
      cell: ({ row }) => row.original.newProducts30d
    },
    {
      accessorKey: 'lastProductAdded',
      header: t.dashboard_lastProductAdded,
      cell: ({ row }) => row.original.lastProductAdded
    },
    {
      accessorKey: 'firstProductAdded',
      header: t.dashboard_firstProductAdded,
      cell: ({ row }) => row.original.firstProductAdded
    },
    {
      id: 'metaAdLibrary',
      header: () => <div className="text-center">{t.searchInMeta}</div>,
      cell: ({ row }) => (<div className="flex justify-center items-center"><MetaAdLibraryLink vendor={row.original.vendor} t={t} /></div>)
    }
  ], [t, onNavigateWithFilter]);

  const table = useReactTable({
    data: sortedAndFilteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="sortBy" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
            {t.sortBy}
          </label>
          <Select
            id="sortBy"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setSorting([{ id: e.target.value, desc: true }]);
            }}
            options={[
              { value: 'totalProducts', label: t.totalProducts },
              { value: 'newProducts30d', label: t.dashboard_newProducts30d_store },
              { value: 'lastProductAdded', label: t.dashboard_lastProductAdded },
              { value: 'firstProductAdded', label: t.dashboard_firstProductAdded },
            ]}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="languageFilter" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">
            {t.language}
          </label>
          <Select
            id="languageFilter"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            options={languageOptions}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-light-border dark:border-dark-border">
                {hg.headers.map(h => (
                  <th key={h.id} className={`p-4 font-semibold ${h.column.getCanSort() ? 'cursor-pointer select-none' : ''}`} onClick={h.column.getToggleSortingHandler()}>
                    <div className="flex items-center gap-2">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: <ChevronDown size={16} className="rotate-180"/>, desc: <ChevronDown size={16}/> }[h.column.getIsSorted() as string] ?? (h.column.getCanSort() ? <ChevronsUpDown size={16} className="text-gray-400"/> : null)}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-background-hover dark:hover:bg-dark-background-hover">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoreFilter;