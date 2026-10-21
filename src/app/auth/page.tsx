import AuthClient from "./AuthClient";

type Props={searchParams:Promise<{next?:string}>};
export default async function AuthPage({searchParams}:Props){
 const p=await searchParams;
 const requested=p.next;
 const next=requested&&requested.startsWith("/")&&!requested.startsWith("//")?requested:"/";
 return <AuthClient next={next}/>;
}
