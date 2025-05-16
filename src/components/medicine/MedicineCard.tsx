import type { Medicine } from '@/types/medicine';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Pill } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
}

export function MedicineCard({ medicine }: MedicineCardProps) {
  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-primary flex items-center">
              <Pill className="mr-2 h-5 w-5" />
              {medicine.brandName}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{medicine.genericName}</CardDescription>
          </div>
          <Badge variant="secondary">{medicine.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-foreground">Dosage:</h4>
          <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Uses:</h4>
          <p className="text-sm text-muted-foreground">{medicine.uses}</p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">Side Effects:</h4>
          <p className="text-sm text-muted-foreground">{medicine.sideEffects}</p>
        </div>
        {medicine.warnings && (
          <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <h4 className="font-semibold text-destructive flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Warnings:
            </h4>
            <p className="text-sm text-destructive/80">{medicine.warnings}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm font-semibold text-accent">{medicine.price}</p>
      </CardFooter>
    </Card>
  );
}
