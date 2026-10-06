"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode,setMode]=useState<"login"|"register">("login");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setError("");
    const fd=new FormData(e.currentTarget);
    const payload=mode==="register"
      ? {name:fd.get("name"),phone:fd.get("phone"),password:fd.get("password")}
      : {phone:fd.get("phone"),password:fd.get("password")};
    const res=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    if(res.ok){router.push("/");router.refresh();return;}
    const data=await res.json().catch(()=>({}));
    setError(data.error==="PHONE_EXISTS"?"رقم الهاتف مسجل بالفعل.":data.error==="INVALID_CREDENTIALS"?"رقم الهاتف أو كلمة المرور غير صحيحة.":"راجع البيانات وحاول مرة أخرى.");
    setBusy(false);
  }

  return <main className="authPage"><section className="authCard">
    <a className="authLogo" href="/">SOUQNA <span>سوقنا</span></a>
    <h1>{mode==="login"?"تسجيل الدخول":"إنشاء حساب جديد"}</h1>
    <p>بيع واشتري بسهولة داخل سوقنا.</p>
    <div className="authTabs"><button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>دخول</button><button className={mode==="register"?"active":""} onClick={()=>setMode("register")}>حساب جديد</button></div>
    <form onSubmit={submit}>
      {mode==="register"&&<label>الاسم<input name="name" required minLength={2} autoComplete="name"/></label>}
      <label>رقم الهاتف<input name="phone" required inputMode="tel" pattern="01[0125][0-9]{8}" placeholder="01xxxxxxxxx" autoComplete="tel"/></label>
      <label>كلمة المرور<input name="password" required type="password" minLength={8} autoComplete={mode==="login"?"current-password":"new-password"}/></label>
      {error&&<div className="formError">{error}</div>}
      <button className="primary authSubmit" disabled={busy}>{busy?"جاري التنفيذ...":mode==="login"?"دخول":"إنشاء الحساب"}</button>
    </form>
  </section></main>
}
