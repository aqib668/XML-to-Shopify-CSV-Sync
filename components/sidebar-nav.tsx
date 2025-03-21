"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Box, Home, Package, Settings, ShoppingCart, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Shopify Importer</span>
        </Link>
        <UserNav />
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link href="/" passHref legacyBehavior>
            <Button variant={pathname === "/" ? "secondary" : "ghost"} className="w-full justify-start gap-2" asChild>
              <a>
                <Home className="h-4 w-4" />
                Dashboard
              </a>
            </Button>
          </Link>
          <Link href="/import" passHref legacyBehavior>
            <Button
              variant={pathname.startsWith("/import") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <a>
                <Box className="h-4 w-4" />
                Import Products
              </a>
            </Button>
          </Link>
          <Link href="/slow-moving" passHref legacyBehavior>
            <Button
              variant={pathname === "/slow-moving" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <a>
                <ShoppingCart className="h-4 w-4" />
                Slow-Moving Inventory
              </a>
            </Button>
          </Link>
          <Link href="/profile" passHref legacyBehavior>
            <Button
              variant={pathname === "/profile" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <a>
                <User className="h-4 w-4" />
                Profile
              </a>
            </Button>
          </Link>
          <Link href="/settings" passHref legacyBehavior>
            <Button
              variant={pathname === "/settings" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              asChild
            >
              <a>
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  )
}

