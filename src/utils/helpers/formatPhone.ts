/**
 * Formats a phone number by adding a space after the country code
 * Examples: 
 *   +9779861465033 -> +977 9861465033
 *   +619810101010 -> +61 9810101010
 *   +10423534483 -> +1 0423534483
 * @param phoneNumber - The phone number string (e.g., "+9779861465033")
 * @returns Formatted phone number with space after country code, or original string if it doesn't match the pattern
 */

// Known phone code options used in the system
const phoneCodeOptions = ["+977", "+61", "+91", "+1"];

export const formatPhoneNumber = (phoneNumber: string | null | undefined): string => {
  if (!phoneNumber || phoneNumber === "N/A") {
    return phoneNumber || "N/A";
  }

  // If already formatted (contains space after +), return as is
  if (phoneNumber.includes(" ") && phoneNumber.startsWith("+")) {
    return phoneNumber;
  }

  // Check against known phone codes first (longest first to avoid partial matches)
  const sortedCodes = phoneCodeOptions.sort((a, b) => b.length - a.length);
  for (const code of sortedCodes) {
    if (phoneNumber.startsWith(code)) {
      return `${code} ${phoneNumber.slice(code.length)}`;
    }
  }

  // Fallback: Try to match any + followed by 1-3 digits (for other country codes)
  const match = phoneNumber.match(/^(\+\d{1,3})(\d+)$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  // Return original if it doesn't match the pattern
  return phoneNumber;
};

