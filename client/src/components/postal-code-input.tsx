import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePostalCodeLookup } from "@/hooks/use-postal-codes";

interface PostalCodeInputProps {
  postalCodeValue: string;
  cityValue: string;
  onPostalCodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  postalCodeLabel?: string;
  cityLabel?: string;
  postalCodePlaceholder?: string;
  cityPlaceholder?: string;
  disabled?: boolean;
}

export function PostalCodeInput({
  postalCodeValue,
  cityValue,
  onPostalCodeChange,
  onCityChange,
  postalCodeLabel = "Postnummer",
  cityLabel = "Poststed",
  postalCodePlaceholder = "0123",
  cityPlaceholder = "Oslo",
  disabled = false,
}: PostalCodeInputProps) {
  const [manualCityEdit, setManualCityEdit] = useState(false);
  
  // Look up postal code automatically
  const { data: postalCodeData } = usePostalCodeLookup(postalCodeValue);

  // Auto-fill city when postal code is found
  useEffect(() => {
    if (postalCodeData && !manualCityEdit) {
      onCityChange(postalCodeData.postPlace);
    }
  }, [postalCodeData, manualCityEdit, onCityChange]);

  const handleCityChange = (value: string) => {
    setManualCityEdit(true);
    onCityChange(value);
  };

  const handlePostalCodeChange = (value: string) => {
    onPostalCodeChange(value);
    // Reset manual edit flag when postal code changes
    if (value !== postalCodeValue) {
      setManualCityEdit(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="postalCode">{postalCodeLabel}</Label>
        <Input
          id="postalCode"
          value={postalCodeValue}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          placeholder={postalCodePlaceholder}
          disabled={disabled}
          maxLength={4}
        />
      </div>
      <div>
        <Label htmlFor="city">{cityLabel}</Label>
        <Input
          id="city"
          value={cityValue}
          onChange={(e) => handleCityChange(e.target.value)}
          placeholder={cityPlaceholder}
          disabled={disabled}
        />
        {postalCodeData && !manualCityEdit && (
          <p className="text-xs text-muted-foreground mt-1">
            Auto-utfylt fra postnummer
          </p>
        )}
      </div>
    </div>
  );
}