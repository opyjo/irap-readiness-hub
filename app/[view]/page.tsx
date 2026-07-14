import { notFound } from "next/navigation";
import { PrepHub } from "../PrepHub";
import { navGroups, type ViewId } from "../data";

const views=navGroups.flatMap(group=>group.items.map(item=>item.id));

export function generateStaticParams(){return views.filter(view=>view!=="overview").map(view=>({view}));}

export default async function WorkspacePage({params}:{params:Promise<{view:string}>}){
  const {view}=await params;
  if(!views.includes(view as ViewId)||view==="overview")notFound();
  return <PrepHub initialView={view as ViewId}/>;
}
