'use client'

import Link from 'next/link'
import Connect from "../connect"
import { Navigation } from './navigation'
import { BadgeDollarSign } from "lucide-react"
import ThemeToggle from "@/components/theme-toggle";

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-start">
            {/* Logo and Name */}
            <div className="flex items-center mr-4">
              <BadgeDollarSign size={32} />
              <Link href="/" className="text-2xl font-bold">
                DEX
              </Link>
            </div>
            {/* Navigation */}
            <Navigation />
          </div>
          {/* Connect Button */}
          <div className="flex items-center justify-end gap-3">
            {/* Connect Button */}
            <div className='flex justify-end'>
              <Connect />
            </div>
            {/* Mode Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}