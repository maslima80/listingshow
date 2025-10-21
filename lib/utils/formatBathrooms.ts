/**
 * Format bathroom count with proper ½ character for .5 values
 * 
 * @param baths - Number of bathrooms (supports .5 increments)
 * @returns Formatted string like "2 Baths", "2½ Baths", "1 Bath", "½ Bath"
 * 
 * @example
 * formatBathrooms(2) → "2 Baths"
 * formatBathrooms(2.5) → "2½ Baths"
 * formatBathrooms(1.5) → "1½ Baths"
 * formatBathrooms(1) → "1 Bath"
 * formatBathrooms(0.5) → "½ Bath"
 * formatBathrooms(null) → ""
 */
export function formatBathrooms(baths?: number | null): string {
  if (baths == null || Number.isNaN(baths)) return "";
  
  // Round to nearest 0.5 just in case
  const rounded = Math.round(baths * 2) / 2;

  const whole = Math.floor(rounded);
  const fraction = rounded - whole;

  const halfChar = "½";
  const hasHalf = Math.abs(fraction - 0.5) < 1e-8;

  const label =
    rounded === 1 || rounded === 1.0 || (whole === 1 && !hasHalf)
      ? "Bath"
      : "Baths";

  const display = hasHalf ? `${whole}${halfChar}` : `${whole}`;

  // Handle 0.5 edge case (rare, but safe)
  if (whole === 0 && hasHalf) {
    return `½ ${label}`;
  }
  
  return `${display} ${label}`;
}
