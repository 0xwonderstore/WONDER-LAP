import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const BLACKLIST_KEY = 'clothing_blacklist';

// The initial default list of keywords. Users can modify this.
const INITIAL_BLACKLIST = [
  'قميص', 'بنطلون', 'حذاء', 'سترة', 'فستان', 'تنورة', 'جوارب', 'ملابس',
  'أزياء', 'بدلة', 'معطف', 'تيشيرت', 'بوت', 'صندل', 'قبعه', 'وشاح', 'فستان صيفي',
  'shirt', 't-shirt', 'pants', 'jeans', 'trousers', 'shoes', 'sneakers',
  'boots', 'jacket', 'hoodie', 'dress', 'skirt', 'socks', 'wear', 'apparel',
  'clothing', 'fashion', 'suit', 'coat', 'hat', 'scarf', 'footwear', 'rakhi', 'summer dress',
  'kleid', 'sommerkleid', 'hemd', 'hose', 'schuhe', 'jacke',
  'chemise', 'pantalon', 'chaussures', 'veste', 'robe', 'jupe', 'chaussettes', "robe d'été",
  'camisa', 'pantalones', 'zapatos', 'chaqueta', 'vestido', 'falda', 'vestido de verano',
  'camicia', 'pantaloni', 'scarpe', 'giacca', 'vestito', 'gonna', 'abito estivo'
];

export function useClothingBlacklist(): [string[], (keyword: string) => void, (keyword: string) => void] {
  const [blacklist, setBlacklist] = useLocalStorage<string[]>(BLACKLIST_KEY, INITIAL_BLACKLIST);

  const addKeyword = useCallback((keyword: string) => {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (lowerKeyword && !blacklist.includes(lowerKeyword)) {
      setBlacklist(prev => [...prev, lowerKeyword]);
    }
  }, [blacklist, setBlacklist]);

  const removeKeyword = useCallback((keyword: string) => {
    setBlacklist(prev => prev.filter(k => k !== keyword));
  }, [setBlacklist]);

  return [blacklist, addKeyword, removeKeyword];
}
