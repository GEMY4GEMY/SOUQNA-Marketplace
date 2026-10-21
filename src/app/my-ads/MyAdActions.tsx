"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
export default function MyAdActions({id,status}:{id:string;status:string}){
 const router=useRouter();const[busy,setBusy]=useState(false);const[msg,setMsg]=useState("");
 async function run(action:"SOLD"|"ARCHIVE"){if(!confirm(action==="SOLD"?"تأكيد أن الإعلان تم بيعه؟":"تأكيد أرشفة الإعلان؟"))return;setBusy(true);setMsg("");const r=await fetch(`/api/my-ads/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action})});if(r.ok){router.refresh()}else setMsg("تعذر تحديث الإعلان.");setBusy(false)}
 return <div className="myAdActions">{status==="ACTIVE"&&<button type="button" disabled={busy} onClick={()=>run("SOLD")}>تم البيع</button>}{status!=="ARCHIVED"&&<button type="button" disabled={busy} onClick={()=>run("ARCHIVE")}>أرشفة</button>}{msg&&<small>{msg}</small>}</div>
}
