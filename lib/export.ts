import {plantValue} from "./plant-display.mjs";
import {isComplete} from "./completion.mjs";
import {sortRecords} from "./lot-order.mjs";
export function csvCell(value:unknown):string {
 const text=String(value??"");
 const safe=/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text)?"'"+text:text;
 return '"'+safe.replaceAll('"','""')+'"';
}
export function exportRecords(rows:ReadonlyArray<{censoId:string;workerUid:string;datos:Record<string,unknown>}>,type:string):string {
 const columns=["censoId","workerUid","loteNombre","lineaNumero",...(type==="PRODUCCION"?["vivos","muertos","resiembras","observacion"]:["arbolCodigo","sexo","muerto",...(type==="FRUTOS"?["frutos"]:["inflorescencias","botones"])]),"estado","fechaCenso"];
 return [columns.map(csvCell).join(";"),...sortRecords(rows.filter(r=>isComplete(r,type))).map(r=>columns.map(k=>csvCell(k==="censoId"?r.censoId:k==="workerUid"?r.workerUid:k==="muerto"?(r.datos.muerto===true?"Muerta":"No"):plantValue(r.datos,k))).join(";"))].join("\r\n");
}
