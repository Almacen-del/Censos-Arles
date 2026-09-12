const natural=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
/** @param {unknown} name */
function lotNumber(name){const m=String(name??'').trim().match(/^lote\s*(\d+)$/i);return m?Number(m[1]):null}
/** @param {unknown} a @param {unknown} b */
export function compareLots(a,b){const x=lotNumber(a),y=lotNumber(b);if(x!==null&&y!==null)return x-y;if(x!==null)return -1;if(y!==null)return 1;return natural.compare(String(a??''),String(b??''))}
/** @template {{datos:Record<string,any>,censoId?:string,workerUid?:string,id?:string}} T @param {ReadonlyArray<T>} records @returns {T[]} */
export function sortRecords(records){return [...records].sort((a,b)=>compareLots(a.datos.loteNombre,b.datos.loteNombre)||natural.compare(a.datos.lineaNumero??'',b.datos.lineaNumero??'')||natural.compare(a.datos.arbolCodigo??'',b.datos.arbolCodigo??'')||(Number(a.datos.fechaCenso)||0)-(Number(b.datos.fechaCenso)||0)||natural.compare(a.censoId??'',b.censoId??'')||natural.compare(a.workerUid??'',b.workerUid??'')||natural.compare(a.id??'',b.id??''))}
