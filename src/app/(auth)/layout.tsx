import Image from "next/image"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        <Icons.logo className="h-6 w-6 text-primary" />
        Hishabkitab
      </Link>
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ModeToggle />
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px] border border-border/50 bg-card p-6 md:p-10 rounded-2xl shadow-sm">
        {children}
      </div>
    </div>
  )
}
