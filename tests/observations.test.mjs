import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterObservations} from '../lib/observations.mjs';
const r={id:'a',tipo:'FLORACION',workerUid:'w',censoId:'c',datos:{observacion:'Daño en raíz',loteId:'l',lineaId:'s',arbolCodigo:'P001',muerto:false,estado:'BORRADOR'}};
test('notes include drafts but exclude missing text and inactive inventories',()=>{
 assert.deepEqual(filterObservations([r,{...r,tipo:'PRODUCCION'},{...r,datos:{...r.datos,observacion:'  '}},{...r,datos:{}}]),[r]);
});
test('observation filters combine without treating missing measurements as complete',()=>{
 assert.equal(filterObservations([r],{lot:'l',line:'s',tree:'p001',worker:'w',census:'c',condition:'alive',search:'raiz'}).length,1);
 for(const filters of [{lot:'other'},{line:'other'},{tree:'P002'},{worker:'other'},{census:'other'},{condition:'dead'},{search:'rama'}]) assert.equal(filterObservations([r],filters).length,0);
});
