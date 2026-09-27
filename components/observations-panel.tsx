"use client";
import {useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from "@/components/ui/table";
import {filterObservations} from "@/lib/observations.mjs";
import {sortRecords,compareLots} from "@/lib/lot-order.mjs";
import {isComplete} from "@/lib/completion.mjs";
type Row={id:string;tipo:string;censoId:string;workerUid:string;datos:Record<string,any>};
const workerName=(id:string)=>({"vSesIBX5JqNtg1UJjngErzXZsxq1":"Auxiliar 1","zqZAVgUwxcYOvCrLHoHdPCQhEbe2":"Auxiliar 2","JqlUlrTqpecZmKvOHsHsnV1E25w2":"Almacén"} as Record<string,string>)[id]??id;
export function ObservationsPanel({rows,loaded}:{rows:Row[];loaded:boolean}) {
 const [lot,setLot]=useState(""),[line,setLine]=useState(""),[tree,setTree]=useState(""),[worker,setWorker]=useState(""),[census,setCensus]=useState(""),[condition,setCondition]=useState(""),[search,setSearch]=useState(""),[page,setPage]=useState(0);
 const available=filterObservations(rows) as Row[];
 const filtered=sortRecords(filterObservations(rows,{lot,line,tree,worker,census,condition,search})) as Row[];
 const lots=Array.from(new Map<string,string>(available.map((r:Row)=>[r.datos.loteId,r.datos.loteNombre] as [string,string])).entries()).sort((a,b)=>compareLots(a[1],b[1]));
 const lines=Array.from(new Map<string,string>(available.filter((r:Row)=>!lot||r.datos.loteId===lot).map((r:Row)=>[r.datos.lineaId,r.datos.lineaNumero] as [string,string])).entries()).sort((a,b)=>a[1].localeCompare(b[1],"es",{numeric:true}));
 useEffect(()=>setPage(0),[rows,lot,line,tree,worker,census,condition,search]);
 return <section className="panel"><div className="panelhead"><h2>Observaciones por árbol</h2><span>{loaded?`${filtered.length} observaciones`:"Pendiente de consulta"}</span></div>
 <p className="muted" style={{padding:"16px 22px 0"}}>Incluye observaciones de fichas completas y borradores sincronizados. Una observación no completa el conteo del árbol.</p>
 <div className="filters">
 <label>Lote<select value={lot} onChange={e=>{setLot(e.target.value);setLine("")}}><option value="">Todos</option>{lots.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
 <label>Línea / surco<select value={line} onChange={e=>setLine(e.target.value)}><option value="">Todos</option>{lines.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
 <label>Árbol<Input value={tree} onChange={e=>setTree(e.target.value)} placeholder="Ej. P001"/></label>
 <label>Trabajador<select value={worker} onChange={e=>setWorker(e.target.value)}><option value="">Todos</option>{Array.from(new Set<string>(available.map((r:Row)=>r.workerUid))).map(id=><option key={id} value={id}>{workerName(id)}</option>)}</select></label>
 <label>Censo<select value={census} onChange={e=>setCensus(e.target.value)}><option value="">Todos</option>{Array.from(new Set<string>(available.map((r:Row)=>r.censoId))).map(id=><option key={id} value={id}>{new Date(available.find((r:Row)=>r.censoId===id)?.datos.fechaCenso??0).toLocaleDateString("es-CO")} · {id.slice(0,8)} · {id.split("_").at(-1)}</option>)}</select></label>
 <label>Estado de la planta<select value={condition} onChange={e=>setCondition(e.target.value)}><option value="">Todas</option><option value="alive">Viva</option><option value="dead">Muerta</option></select></label>
 <label>Buscar observación<Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Daño, plaga, rama…"/></label>
 </div>
 {filtered.length?<><div className="tablewrap"><Table><TableHeader><TableRow>{["Fecha del censo","Lote","Surco","Árbol","Trabajador","Planta","Captura","Observación"].map(h=><TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{filtered.slice(page*50,(page+1)*50).map((r:Row)=><TableRow key={r.id}><TableCell>{new Date(r.datos.fechaCenso).toLocaleDateString("es-CO")}</TableCell><TableCell>{r.datos.loteNombre}</TableCell><TableCell>{r.datos.lineaNumero}</TableCell><TableCell>{r.datos.arbolCodigo}</TableCell><TableCell>{workerName(r.workerUid)}</TableCell><TableCell>{r.datos.muerto?"Muerta":"Viva"}</TableCell><TableCell>{isComplete(r,"FLORACION")?"Completo":"Pendiente / borrador"}</TableCell><TableCell style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",minWidth:240,maxWidth:480}}>{r.datos.observacion}</TableCell></TableRow>)}</TableBody></Table></div><div className="pager"><span>{page*50+1}–{Math.min((page+1)*50,filtered.length)} de {filtered.length}</span><Button variant="outline" disabled={page===0} onClick={()=>setPage(page-1)}>Anterior</Button><Button variant="outline" disabled={(page+1)*50>=filtered.length} onClick={()=>setPage(page+1)}>Siguiente</Button></div></>:<div className="empty"><strong>{loaded?"Sin observaciones para estos filtros":"Pulsa Actualizar para consultar las observaciones"}</strong></div>}
 </section>;
}
