"use client";
import {FormEvent,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
export default function VerifyRegistration(){
 const router=useRouter();const [pending,setPending]=useState<{name:string;phone:string;password:string}|null>(null),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{try{setPending(JSON.parse(sessionStorage.getItem("souqna_pending_registration")||"null"))}catch{}},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!pending)return;setBusy(true);const fd=new FormData(e.currentTarget);const r=await fetch("/api/auth/register/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...pending,code:fd.get("code")})});const d=await r.json().catch(()=>({}));if(r.ok){sessionStorage.removeItem("souqna_pending_registration");router.push("/");router.refresh();return}setMsg(d.error==="INVALID_OR_EXPIRED_CODE"?"الكود غير صحيح أو انتهت صلاحيته.":"تعذر تفعيل الحساب.");setBusy(false)}
 if(!pending)return <main className="authPage"><section className="authCard"><h1>لا يوجد تسجيل قيد التفعيل</h1><a href="/auth">العودة للتسجيل</a></section></main>;
 return <main className="authPage"><section className="authCard"><a className="authLogo" href="/">SOUQNA <span>سوقنا</span></a><h1>تفعيل الحساب</h1><p>أدخل الكود المرسل إلى {pending.phone}. هذه الخطوة تتم مرة واحدة فقط عند إنشاء الحساب.</p><form onSubmit={submit}><label>كود التفعيل<input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code"/></label>{msg&&<div className="formError">{msg}</div>}<button className="primary authSubmit" disabled={busy}>{busy?"جاري التفعيل...":"تفعيل الحساب"}</button></form></section></main>
}