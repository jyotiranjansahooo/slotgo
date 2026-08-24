import type { Parking } from "@/types/parking";

export function isParkingDetailsComplete(parking: Parking): boolean {
  const hasBasicDetails =
    Boolean(parking.parkingName?.trim()) &&
    Boolean(parking.address?.trim()) &&
    Boolean(parking.city?.trim()) &&
    Boolean(parking.state?.trim()) &&
    Boolean(parking.pincode?.trim());

  const hasOwnerDetails =
    Boolean(parking.ownerName?.trim()) &&
    Boolean(parking.contactNumber?.trim());

  const hasLocation =
    typeof parking.location?.latitude === "number" &&
    typeof parking.location?.longitude === "number";

  const hasImages =
    Array.isArray(parking.images) && parking.images.length >= 2;

  const hasFacilities =
    Array.isArray(parking.facilities) && parking.facilities.length > 0;

  const hasRules =
    Array.isArray(parking.rules) && parking.rules.length > 0;

  const hasOperatingHours =
    Boolean(parking.operatingHours?.open) &&
    Boolean(parking.operatingHours?.close);

  const hasParkingArea =
    typeof parking.parkingArea === "number" &&
    parking.parkingArea > 0;

  return (
    hasBasicDetails &&
    hasOwnerDetails &&
    hasLocation &&
    hasImages &&
    hasFacilities &&
    hasRules &&
    hasOperatingHours &&
    hasParkingArea
  );
}