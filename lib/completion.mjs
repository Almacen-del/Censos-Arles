const count = v => typeof v === 'number' && Number.isInteger(v) && v >= 0;
/** A saved draft is not a completed census, even if some fields are populated. */
export function isComplete(record, type) {
 const d = record.datos;
 if (d.estado !== 'COMPLETO') return false;
 if (type === 'PRODUCCION') return [d.vivos,d.muertos,d.resiembras].every(count);
 if (d.muerto === true) return type === 'FLORACION' ? d.inflorescencias == null && d.botones == null : type === 'FRUTOS' && d.frutos == null;
 if (!['Hembra','Macho'].includes(d.sexo)) return false;
 if (type === 'FRUTOS') return d.sexo === 'Macho' ? d.frutos == null : count(d.frutos);
 if (type === 'FLORACION') return count(d.inflorescencias) && (d.inflorescencias === 0 ? d.botones == null : count(d.botones));
 return false;
}
