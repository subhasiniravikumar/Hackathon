export interface Medicine {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  category: string;
  uses: string;
  sideEffects: string;
  price: string;
  warnings?: string;
  language: string[];
}
