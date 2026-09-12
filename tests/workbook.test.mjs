import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {compareLots,sortRecords} from '../lib/lot-order.mjs';
import {buildWorkbook} from '../lib/workbook.mjs';
import ExcelJS from 'exceljs';
const template=JSON.parse(readFileSync(new URL('../lib/form-template.json',import.meta.url),'utf8'));
const catalog=JSON.parse(readFileSync(new URL('../lib/catalog.json',import.meta.url),'utf8'));
const record=(lot,plant,sex,inf,buttons)=>({id:lot+plant,censoId:'CENSO-PRUEBA',workerUid:'PRUEBA',datos:{loteNombre:lot,lineaNumero:'L001',arbolCodigo:plant,sexo:sex,inflorescencias:inf,botones:buttons,siembra:2020,fechaCenso:Date.UTC(2026,8,12,2),estado:'COMPLETO',muerto:false}});
test('all nineteen numeric lots precede the three named lots',()=>{const names=catalog.lotes.map(l=>l.nombre).sort(compareLots);assert.deepEqual(names.slice(0,19).map(n=>Number(n.match(/\d+/)[0])),Array.from({length:19},(_,i)=>i+1));assert.deepEqual(names.slice(19),['Experimental','Jardin clonal H','Jardin clonal M'])});
test('record order is natural and preserves repeated trees in separate censuses',()=>{const a=record('Lote 10','P010','Hembra',0,null),b=record('lote 2','P002','Macho',5,3);const rows=[a,b,{...a,censoId:'OTRO'}];const sorted=sortRecords(rows);assert.equal(sorted[0],b);assert.equal(sorted.length,3);assert.equal(rows[0],a)});
test('floracion preserves the official header, logo, gender marks and blank vs zero',async()=>{const book=buildWorkbook([record('Lote 10','P010','Macho',5,2),record('Lote 2','P002','Hembra',0,null)],'FLORACION',template);const bytes=await book.xlsx.writeBuffer();const check=new ExcelJS.Workbook();await check.xlsx.load(bytes);const s=check.worksheets[0];assert.equal(s.getCell('J1').value,'Código: MA-F-013');assert.equal(s.getCell('C6').value,'Lote 2');assert.equal(s.getCell('G6').value,'x');assert.equal(s.getCell('I6').value,0);assert.equal(s.getCell('J6').value,null);assert.equal(s.getCell('H7').value,'x');assert.equal(s.getImages().length,1);assert.equal(s.rowCount,7);assert.equal(check.worksheets[1].getCell('B2').value,'CENSO-PRUEBA');assert.equal(s.getCell('B6').value.toISOString().slice(0,10),'2026-09-11');mkdirSync('.sites-runtime/export-check',{recursive:true});await book.xlsx.writeFile('.sites-runtime/export-check/floracion-prueba.xlsx')});
test('production keeps resiembras separate and includes them in the live total',async()=>{const r=record('Lote 1','',null,null,null);r.datos={...r.datos,vivos:8,muertos:2,resiembras:3,observacion:'Observación de prueba'};const b=buildWorkbook([r],'PRODUCCION',template);const s=b.worksheets[0];assert.equal(s.getCell('E6').value,8);assert.equal(s.getCell('F6').value,2);assert.equal(s.getCell('G6').value,3);assert.deepEqual(s.getCell('H6').value,{formula:'E6+G6',result:11});assert.equal(s.getCell('J1').value,'Formato operativo');await b.xlsx.writeFile('.sites-runtime/export-check/produccion-prueba.xlsx')});
test('fruit export retains death and unknown gender without marking a false sex',async()=>{const r=record('Lote 19','P009',null,null,null);r.datos.muerto=true;r.datos.frutos=null;const b=buildWorkbook([r],'FRUTOS',template);assert.equal(b.worksheets[0].getCell('G6').value,null);assert.equal(b.worksheets[0].getCell('H6').value,null);assert.equal(b.worksheets[0].getCell('J6').value,'Muerto');await b.xlsx.writeFile('.sites-runtime/export-check/frutos-prueba.xlsx')});

test('exports exclude empty drafts, partially counted pending sex and invalid completed rows',()=>{
 const valid=record('Lote 1','P001','Hembra',0,null);
 const empty=record('Lote 1','P002',null,null,null);empty.datos.estado='BORRADOR';
 const partial=record('Lote 1','P003',null,22,2);partial.datos.estado='PENDIENTE_SEXO';
 const invalid=record('Lote 1','P004','Hembra',null,null);
 const draft=record('Lote 1','P005','Hembra',5,2);draft.datos.estado='BORRADOR';
 const b=buildWorkbook([empty,partial,invalid,draft,valid],'FLORACION',template);
 assert.equal(b.worksheets[0].rowCount,6);assert.equal(b.worksheets[0].getCell('F6').value,'P001');
 assert.equal(b.worksheets[1].rowCount,2);
 assert.throws(()=>buildWorkbook([empty,partial,invalid,draft],'FLORACION',template),/No hay registros/);
});
