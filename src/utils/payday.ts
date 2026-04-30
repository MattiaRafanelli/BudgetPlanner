/**
 * Swiss public holidays (non-moving holidays only)
 * Format: MMDD (month-day)
 */
const SWISS_HOLIDAYS = [
  '0101', // January 1: New Year's Day
  '0802', // August 2: Swiss National Day
  '1225', // December 25: Christmas Day
  '1226', // December 26: Boxing Day
];

/**
 * Check if a given date is a public holiday
 * @param date - The date to check
 * @returns true if the date is a public holiday
 */
export function isPublicHoliday(date: Date): boolean {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${month}${day}`;
  return SWISS_HOLIDAYS.includes(dateStr);
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - The date to check
 * @returns true if the date is Saturday (6) or Sunday (0)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Calculates the payday for the given date
 * Payday is the 25th of the month
 * If the 25th falls on a weekend or holiday, it moves to the previous working day
 */
export function calculatePayday(date: Date = new Date()): Date {
  // Create a new date set to the 25th of the month
  const payday = new Date(date.getFullYear(), date.getMonth(), 25);
  
  // If it's a weekend or holiday, move backwards until we find a working day
  let daysBack = 0;
  while ((isWeekend(payday) || isPublicHoliday(payday)) && daysBack < 7) {
    payday.setDate(payday.getDate() - 1);
    daysBack++;
  }
  
  return payday;
}

/**
 * Format payday as YYYY-MM-DD string
 */
export function getPaydayString(date: Date = new Date()): string {
  const payday = calculatePayday(date);
  return payday.toISOString().slice(0, 10);
}
