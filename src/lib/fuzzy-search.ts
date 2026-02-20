/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score (0-1, higher is better)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Exact match
  if (s1 === s2) return 1;

  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;

  // Calculate based on Levenshtein distance
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
}

/**
 * Check if a medicine matches the search term with fuzzy matching
 */
export function fuzzyMatch(medicine: any, searchTerm: string, threshold: number = 0.6): boolean {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // Exact substring match (highest priority)
  if (
    medicine.brandName.toLowerCase().includes(lowerSearchTerm) ||
    medicine.genericName.toLowerCase().includes(lowerSearchTerm) ||
    medicine.uses.toLowerCase().includes(lowerSearchTerm) ||
    medicine.category.toLowerCase().includes(lowerSearchTerm)
  ) {
    return true;
  }

  // Fuzzy match on brand name and generic name
  const brandSimilarity = calculateSimilarity(medicine.brandName, searchTerm);
  const genericSimilarity = calculateSimilarity(medicine.genericName, searchTerm);

  return brandSimilarity >= threshold || genericSimilarity >= threshold;
}

/**
 * Get similarity score for sorting
 */
export function getMedicineSimilarityScore(medicine: any, searchTerm: string): number {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // Highest score for exact substring matches
  if (medicine.brandName.toLowerCase().includes(lowerSearchTerm)) return 1.0;
  if (medicine.genericName.toLowerCase().includes(lowerSearchTerm)) return 0.95;
  if (medicine.uses.toLowerCase().includes(lowerSearchTerm)) return 0.85;
  if (medicine.category.toLowerCase().includes(lowerSearchTerm)) return 0.8;

  // Fuzzy match scores
  const brandSimilarity = calculateSimilarity(medicine.brandName, searchTerm);
  const genericSimilarity = calculateSimilarity(medicine.genericName, searchTerm);

  return Math.max(brandSimilarity * 0.75, genericSimilarity * 0.75);
}
