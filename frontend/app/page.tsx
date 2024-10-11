import { Button } from "@/components/ui/button";
import {BadgeDollarSign} from "lucide-react"
import Link from 'next/link'

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center mt-32">
        <BadgeDollarSign size={64} />
        <h1 className="text-4xl font-bold mt-4">Welcome to DEX</h1>
        <p className="text-lg mt-4">A decentralized exchange</p>
        <div className="flex gap-4 mt-8">
        <Link href="/swap" legacyBehavior passHref>
            <Button>Swap</Button>
          </Link>
          <Link href="/liquidity" legacyBehavior passHref>
            <Button>Liquidity</Button>
          </Link>
          </div>  
      </div>
  );
}
