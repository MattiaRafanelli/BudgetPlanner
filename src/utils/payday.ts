/**
 * Calculates the payday for the given date
 * Payday is the 1st of the month
 * If the 1st falls on a weekend, it moves to the last working day before
 * (Saturday -> Friday, Sunday -> Friday)
 */
export function calculatePayday(date: Date = new Date()): Date {
  // Create a new date set to the 1st of the month
  const payday = new Date(date.getFullYear(), date.getMonth(), 1);
  
  // Get the day of the week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = payday.getDay();
  
  // If it's a weekend, move to the last working day before
  if (dayOfWeek === 0) {
    // Sunday -> move to Friday (2 days back)
    payday.setDate(payday.getDate() - 2);
  } else if (dayOfWeek === 6) {
    // Saturday -> move to Friday (1 day back)
    payday.setDate(payday.getDate() - 1);
  }
  // If it's Monday-Friday, keep the 1st
  
  return payday;
}

/**
 * Format payday as YYYY-MM-DD string
 */
export function getPaydayString(date: Date = new Date()): string {
  const payday = calculatePayday(date);
  return payday.toISOString().slice(0, 10);
}
