// A comprehensive list of keywords related to clothing in multiple languages.
const CLOTHING_KEYWORDS = [
  // Arabic
  'قميص', 'بنطلون', 'حذاء', 'سترة', 'فستان', 'تنورة', 'جوارب', 'ملابس',
  'أزياء', 'بدلة', 'معطف', 'تيشيرت', 'بوت', 'صندل', 'قبعه', 'وشاح', 'فستان صيفي',

  // English
  'shirt', 't-shirt', 'pants', 'jeans', 'trousers', 'shoes', 'sneakers',
  'boots', 'jacket', 'hoodie', 'dress', 'skirt', 'socks', 'wear', 'apparel',
  'clothing', 'fashion', 'suit', 'coat', 'hat', 'scarf', 'footwear', 'rakhi', 'summer dress',

  // German
  'kleid', 'sommerkleid', 'hemd', 'hose', 'schuhe', 'jacke',

  // French
  'chemise', 'pantalon', 'chaussures', 'veste', 'robe', 'jupe', 'chaussettes', "robe d'été",
  
  // Spanish
  'camisa', 'pantalones', 'zapatos', 'chaqueta', 'vestido', 'falda', 'vestido de verano',

  // Italian
  'camicia', 'pantaloni', 'scarpe', 'giacca', 'vestito', 'gonna', 'abito estivo'
];

/**
 * Checks if a product title contains any clothing-related keywords.
 * The check is case-insensitive.
 * @param title The product title to check.
 * @returns `true` if the title is related to clothing, `false` otherwise.
 */
export function isClothingProduct(title: string): boolean {
  if (!title) {
    return false;
  }
  const lowerCaseTitle = title.toLowerCase();
  return CLOTHING_KEYWORDS.some(keyword => lowerCaseTitle.includes(keyword));
}
