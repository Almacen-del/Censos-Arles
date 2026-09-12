import {test} from 'node:test';
import assert from 'node:assert/strict';
import {csvCell,exportRecords} from '../lib/export.ts';
test('CSV preserves separators, quotes and newlines inside one cell',()=>assert.equal(csvCell('fila; "uno"\nsegunda'),'"fila; ""uno""\nsegunda"'));
test('CSV neutralizes spreadsheet formulas even after whitespace',()=>{for(const text of ['=SUM(A1)',' +1','\t=1','@SUM(A1)'])assert.ok(csvCell(text).startsWith('"\''))});
test('zero values and incomplete values remain distinguishable',()=>{assert.equal(csvCell(0),'"0"');assert.equal(csvCell(null),'""')});
test('production exports the three categories separately and keeps census ownership',()=>{const csv=exportRecords([{censoId:'c1',workerUid:'w1',datos:{estado:"COMPLETO",vivos:8,muertos:2,resiembras:3}}],'PRODUCCION');assert.ok(csv.includes('"vivos";"muertos";"resiembras"'));assert.ok(csv.includes('"c1";"w1";"";"";"8";"2";"3"'))});

test('CSV excludes drafts even when their quantities are already populated',()=>{
 const rows=['BORRADOR','PENDIENTE_SEXO','COMPLETO'].map(estado=>({censoId:estado,workerUid:'w',datos:{estado,vivos:0,muertos:0,resiembras:0}}));
 const csv=exportRecords(rows,'PRODUCCION');assert.equal(csv.split('\r\n').length,2);assert.ok(!csv.includes('BORRADOR'));assert.ok(!csv.includes('PENDIENTE_SEXO'));
});
