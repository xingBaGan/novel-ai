/**
 * Word counter for Chinese and English text
 * @param text - The input text to count words/characters from
 * @returns Total count of Chinese characters and English words
 */
export const chineseEnglishWordCounter = (text: string): number => {
  if (!text || text.trim() === '') {
    return 0;
  }

  // Remove HTML tags and normalize whitespace
  const cleanText = text.replace(/<[^>]*>/g, ' ').trim();
  
  // Count Chinese characters (CJK Unified Ideographs)
  const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g) || [];
  const removeChinese = cleanText.replace(/[\u4e00-\u9fff]/g, '');
  // Count English words by splitting on whitespace
  const englishWords = removeChinese
    // whitespace
    .split(/[\s\u00a0\u2000-\u200f\u2028-\u202f\u205f-\u206f\u3000]+/)
    // punctuation
    .map(word => word.split(/[,，。！？；：.、()]/).map(word => word.trim()))
    .flat()
    .filter(word => word.length > 0 && /[a-zA-Z]/.test(word))
    .length;

  // Return total count: Chinese characters + English words
  return chineseChars.length + englishWords;
};
