/** Presentation only: death must not look like a missing count.
 * @param {Record<string, unknown>} data
 * @param {string} key
 * @param {unknown} empty
 */
export function plantValue(data, key, empty = null) {
 if (data.muerto === true && (['inflorescencias', 'botones', 'frutos'].includes(key) || (key === 'sexo' && data.sexo == null))) return 'Muerta';
 return data[key] ?? empty;
}
