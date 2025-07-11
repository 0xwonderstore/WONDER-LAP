import React, { useState } from 'react';
import { useClothingBlacklist } from '../hooks/useClothingBlacklist';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [blacklist, addKeyword, removeKeyword] = useClothingBlacklist();
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword) {
      addKeyword(newKeyword);
      setNewKeyword('');
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-light-background dark:bg-dark-background min-h-screen animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 mb-8 text-brand-primary font-semibold hover:underline">
        <ArrowLeft size={20} />
        العودة إلى المنتجات
      </button>

      <div className="max-w-4xl mx-auto bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-light-text-primary dark:text-dark-text-primary">إعدادات الفلترة</h1>
        <p className="mb-6 text-light-text-secondary dark:text-dark-text-secondary">
          أدر الكلمات المفتاحية المستخدمة في "القائمة السوداء" لإخفاء فئات معينة من المنتجات.
        </p>

        {/* Add Keyword Form */}
        <form onSubmit={handleAddKeyword} className="flex items-center gap-2 mb-8">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="أضف كلمة مفتاحية جديدة..."
            className="flex-grow p-2 rounded-lg border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background"
          />
          <button type="submit" className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primaryHover">
            <Plus size={20} />
          </button>
        </form>

        {/* Keywords List */}
        <div className="flex flex-wrap gap-3">
          {blacklist.map(keyword => (
            <div key={keyword} className="flex items-center gap-2 bg-light-background dark:bg-dark-background py-1.5 px-3 rounded-full text-sm font-medium">
              <span>{keyword}</span>
              <button onClick={() => removeKeyword(keyword)} className="text-light-text-secondary hover:text-brand-danger">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
