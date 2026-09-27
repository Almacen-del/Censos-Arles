const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
export function filterObservations(rows, filters = {}) {
 return rows.filter(r => {
  const d=r.datos;
  return r.tipo==='FLORACION' && typeof d?.observacion==='string' && d.observacion.trim()!==''
   && (!filters.lot || d.loteId===filters.lot)
   && (!filters.line || d.lineaId===filters.line)
   && (!filters.tree || normalize(d.arbolCodigo).includes(normalize(filters.tree)))
   && (!filters.worker || r.workerUid===filters.worker)
   && (!filters.census || r.censoId===filters.census)
   && (!filters.condition || (filters.condition==='dead' ? d.muerto===true : d.muerto!==true))
   && (!filters.search || normalize(d.observacion).includes(normalize(filters.search)));
 });
}
