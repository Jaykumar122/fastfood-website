import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function NotFoundPage() {
  return <div className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 text-center"><div><p className="font-display text-8xl font-extrabold text-tangerine">404</p><h1 className="mt-4 font-display text-3xl font-bold">This order took a wrong turn.</h1><p className="mt-3 text-ink/50">The page you’re looking for isn’t on our route.</p><Link to="/"><Button className="mt-7"><ArrowLeft size={18} />Back home</Button></Link></div></div>;
}
