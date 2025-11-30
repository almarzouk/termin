"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Clinic {
  id: number;
  name: string;
  address?: string;
  city?: string;
}

interface ClinicSelectProps {
  clinics: Clinic[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function ClinicSelect({
  clinics,
  value,
  onChange,
  placeholder = "Klinik auswählen...",
  required = false,
  disabled = false,
}: ClinicSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Ensure clinics is an array
  const clinicsList = Array.isArray(clinics) ? clinics : [];

  const selectedClinic = value
    ? clinicsList.find((clinic) => clinic.id.toString() === value.toString())
    : null;

  // Filter clinics based on search
  const filteredClinics = clinicsList.filter((clinic) => {
    const searchLower = search.toLowerCase();
    return (
      clinic.name.toLowerCase().includes(searchLower) ||
      clinic.city?.toLowerCase().includes(searchLower) ||
      clinic.address?.toLowerCase().includes(searchLower)
    );
  });

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open]);

  const handleSelect = (clinicId: number) => {
    onChange(clinicId.toString());
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full justify-between",
          !selectedClinic && "text-muted-foreground"
        )}
        disabled={disabled}
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 shrink-0" />
          {selectedClinic ? (
            <span className="truncate">{selectedClinic.name}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedClinic && !disabled && (
            <X
              className="h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <Input
              placeholder="Klinik suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          <div className="max-h-[300px] overflow-auto p-1">
            {filteredClinics.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Keine Klinik gefunden.
              </div>
            ) : (
              filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => handleSelect(clinic.id)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100",
                    selectedClinic?.id === clinic.id && "bg-gray-100"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedClinic?.id === clinic.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{clinic.name}</span>
                    {(clinic.address || clinic.city) && (
                      <span className="text-xs text-gray-500">
                        {clinic.address}
                        {clinic.address && clinic.city && ", "}
                        {clinic.city}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
