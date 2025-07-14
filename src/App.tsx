
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import ProductView from './components/ProductView';
import ScrollButtons from './components/ScrollButtons';
import { Product } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { loadProducts } from './utils/productLoader';

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useLocalStorage('currentPage', 1);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await loadProducts();
      setProducts(data);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <header className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
             <Sparkles className="w-8 h-8 text-yellow-500" />
             <h1 dir="ltr" className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">WONDER LAB</h1>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg bg-light-surface dark:bg-dark-surface" aria-label="Toggle Dark Mode">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>
           </div>
        </header>
        <ProductView 
          products={products} 
          isLoading={isLoading} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <ScrollButtons />
    </div>
  );
}

export default App;
