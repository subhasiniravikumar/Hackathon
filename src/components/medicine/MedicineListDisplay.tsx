import type { Medicine } from '@/types/medicine';
import { MedicineCard } from './MedicineCard';

interface MedicineListDisplayProps {
  medicines: Medicine[];
}

export function MedicineListDisplay({ medicines }: MedicineListDisplayProps) {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">No medicines found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {medicines.map((medicine) => (
        <MedicineCard key={medicine.id} medicine={medicine} />
      ))}
    </div>
  );
}
