/**
 * Indicative SAR → EUR conversion for French-language pages.
 *
 * Why (GSC + Google autocomplete FR, 26/09): French speakers search
 * "salaire <métier> arabie saoudite en euros". The riyal is pegged to the dollar
 * (3.75 SAR = 1 USD); EUR/USD from the ECB reference rate of 25/09/2026 (1.1403).
 * Update the rate and the date together.
 */
export const SAR_TO_EUR = 1 / 3.75 / 1.1403;
export const EUR_RATE_DATE_FR = "25/09/2026";

/** Rounded to the nearest 10 €, formatted the French way (1 234). */
export function sarToEurFr(sar: number): string {
  const eur = Math.round((sar * SAR_TO_EUR) / 10) * 10;
  return eur.toLocaleString("fr-FR").replace(/ | /g, " ");
}
