import {isComplete} from './completion.mjs';
import ExcelJS from 'exceljs';
import {sortRecords} from './lot-order.mjs';
const titles={FLORACION:'FORMATO CENSO DE FLORACIÓN',FRUTOS:'FORMATO CONTEO DE FRUTOS',PRODUCCION:'INVENTARIO DE PLANTACIÓN EN PRODUCCIÓN'};
const clone=v=>JSON.parse(JSON.stringify(v));
const value=v=>v===null||v===undefined?null:v;
function excelDate(raw){const ms=Number(raw);if(!Number.isFinite(ms)||ms<=0)return null;const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));return new Date(day+'T00:00:00Z')}
/** Produces a fresh workbook; no historical counts from the template are copied. */
export function buildWorkbook(records,type,template){
 if(!titles[type])throw Error('Inventario no válido');
 records=records.filter(r=>isComplete(r,type));
 if(!records.length)throw Error('No hay registros para exportar.');
 const rows=sortRecords(records),book=new ExcelJS.Workbook();book.creator='Arles SAS';book.created=new Date();
 const sheet=book.addWorksheet(type==='FLORACION'?'CENSO Floración':type==='FRUTOS'?'Conteo de frutos':'Producción');
 template.widths.forEach((w,i)=>sheet.getColumn(i+1).width=w);
 template.heights.forEach((h,i)=>sheet.getRow(i+1).height=h??20);
 for(const h of template.headers){const c=sheet.getCell(h.address);c.value=h.value;c.style=clone(h.style)}
 template.merges.forEach(m=>sheet.mergeCells(m));
 const logo=book.addImage({base64:template.logo.base64,extension:template.logo.extension});
 sheet.addImage(logo,{tl:{nativeCol:1,nativeColOff:781050,nativeRow:0,nativeRowOff:9525},ext:{width:84,height:76},editAs:'oneCell'});
 if(type!=='FLORACION'){
  sheet.getCell('E1').value=titles[type];sheet.getCell('J1').value='Formato operativo';sheet.getCell('J2').value='Arles SAS';sheet.getCell('J3').value=null;
  if(type==='FRUTOS'){sheet.getCell('I4').value='Cantidad de frutos';sheet.getCell('J4').value='Estado del árbol';}
  else {sheet.unMergeCells('G4:H4');sheet.unMergeCells('A4:F4');sheet.mergeCells('A4:J4');sheet.getCell('A4').value='Información del surco';
   const labels=['#','Fecha','Lote','Línea','Vivos','Muertos','Resiembras','Vivos + resiembras','Observación','Estado'];labels.forEach((label,i)=>{const c=sheet.getCell(5,i+1);c.value=label;c.style=clone(template.headers.find(h=>h.address==='A5').style);c.alignment={horizontal:'center',vertical:'middle',wrapText:true}});sheet.getRow(4).height=28;sheet.getRow(5).height=44;sheet.getColumn(9).width=45;sheet.getColumn(10).width=32.28515625;}
 }
 rows.forEach((record,index)=>{const d=record.datos;const date=excelDate(Number(d.verificadoEn)>0?d.verificadoEn:d.fechaCenso);const status=d.muerto?'Muerto':d.sexo??'Pendiente de sexo';
  const values=type==='PRODUCCION'?[index+1,date,value(d.loteNombre),value(d.lineaNumero),value(d.vivos),value(d.muertos),value(d.resiembras),typeof d.vivos==='number'&&typeof d.resiembras==='number'?{formula:`E${index+6}+G${index+6}`,result:d.vivos+d.resiembras}:null,value(d.observacion),value(d.estado)]:[index+1,date,value(d.loteNombre),value(d.siembra),value(d.lineaNumero),value(d.arbolCodigo),d.sexo==='Hembra'?'x':null,d.sexo==='Macho'?'x':null,type==='FRUTOS'?value(d.frutos):value(d.inflorescencias),type==='FRUTOS'?status:value(d.botones)];
  const row=sheet.getRow(index+6);row.height=template.dataHeight;values.forEach((v,i)=>{const c=row.getCell(i+1);c.value=v;c.style=clone(template.dataStyles[i]);if(i===1)c.numFmt='dd/mm/yyyy';else c.numFmt='General';if(type==='PRODUCCION'&&i===8)c.alignment={wrapText:true,vertical:'middle'}});
  if(type==='PRODUCCION'&&String(d.observacion??'').length>45)row.height=Math.min(120,Math.max(42,Math.ceil(String(d.observacion).length/45)*16));
 });
 sheet.views=[{state:'frozen',ySplit:5}];sheet.autoFilter={from:{row:5,column:1},to:{row:rows.length+5,column:10}};
 sheet.pageSetup={orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0,printTitlesRow:'1:5',printArea:`A1:J${rows.length+5}`,margins:{left:.25,right:.25,top:.3,bottom:.3,header:.15,footer:.15}};
 sheet.headerFooter.oddFooter='Arles SAS · Página &P de &N';
 const detail=book.addWorksheet('Detalle de captura');
 detail.columns=[{header:'Fila del formato',key:'fila',width:18},{header:'Censo',key:'censo',width:46},{header:'Trabajador UID',key:'worker',width:34},{header:'Lote',key:'lote',width:25},{header:'Línea',key:'linea',width:14},{header:'Planta',key:'planta',width:14},{header:'Sexo',key:'sexo',width:22},{header:'Muerto',key:'muerto',width:14},{header:'Estado de captura',key:'estado',width:25},{header:'Registro de origen',key:'id',width:70}];
 rows.forEach((r,i)=>detail.addRow({fila:i+6,censo:r.censoId,worker:r.workerUid,lote:r.datos.loteNombre,linea:r.datos.lineaNumero,planta:r.datos.arbolCodigo,sexo:r.datos.sexo??(type==='PRODUCCION'?'':'Pendiente'),muerto:type==='PRODUCCION'?'':r.datos.muerto?'Sí':'No',estado:r.datos.estado,id:r.id}));
 detail.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};detail.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF244331'}};detail.views=[{state:'frozen',ySplit:1}];detail.autoFilter='A1:J1';
 return book;
}
