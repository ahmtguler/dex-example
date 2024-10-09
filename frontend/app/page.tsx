import {BadgeDollarSign} from "lucide-react"

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center mt-32">
        <BadgeDollarSign size={64} />
        <h1 className="text-4xl font-bold mt-4">Welcome to DEX</h1>
        <p className="text-lg mt-4">A decentralized exchange</p>
      </div>
  );
}
