import {isComplete} from './completion.mjs';
/** Sum per-tree estimates; multiplying aggregate totals would mix different trees. */
export function fruitForecast(records) {
 return records.reduce((total, record) => {
  const d = record.datos;
  if (!isComplete(record, 'FLORACION') || d.muerto === true || d.sexo !== 'Hembra') return total;
  return total + d.inflorescencias * (d.botones ?? 0) * 0.70;
 }, 0);
}
