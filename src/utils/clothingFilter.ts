/**
 * Checks if a product title contains any of the user-defined blacklist keywords.
 * The check is case-insensitive.
 * @param title The product title to check.
 * @param blacklist An array of keywords to check against.
 * @returns `true` if the title contains a blacklisted keyword, `false` otherwise.
 */
export function isClothingProduct(title: string, blacklist: string[]): boolean {
  if (!title || !blacklist) {
    return false;
  }
  const lowerCaseTitle = title.toLowerCase();
  
  // Use the dynamically provided blacklist from the hook
  return blacklist.some(keyword => lowerCaseTitle.includes(keyword));
}
