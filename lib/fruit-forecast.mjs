import {isComplete} from './completion.mjs';
/** Sum per-tree estimates; multiplying aggregate totals would mix different trees. */
export function fruitForecast(records) {
 return records.reduce((total, record) => {
  const d = record.datos;
  if (!isComplete(record, 'FLORACION') || d.muerto === true || d.sexo !== 'Hembra') return total;
  return total + d.inflorescencias * (d.botones ?? 0) * 0.70;
 }, 0);
}

/** Estimated kilograms using the midpoint of the supplied 30–70 g range. */
export function forecastWeightKg(fruits) {
 return fruits * 50 / 1000;
}
