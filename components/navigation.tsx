'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils"
import { typography } from "@/styles/typography"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "./theme-toggle";
import { CommandMenu } from "./command-menu";
import { Button } from "@/components/ui/button"

const Navigation = () => {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center justify-between">
                <div className="flex h-14 items-center justify-start">
                    <div className="flex items-center mr-6">
                        <Link href="/" className={`${typography.h3} pl-4`}>
                            Market Insights
                        </Link>
                    </div>
                    <NavigationMenu className="w-full">
                        <NavigationMenuList className="w-full justify-end items-center">
                            <NavigationMenuItem>
                                <Link href="/">
                                    <Button variant="link" className={`${typography.p} h-8 ${pathname === "/" ? "underline" : ""}`}>
                                        Dashboard
                                    </Button>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/learn">
                                    <Button variant="link" className={`${typography.p} h-8 ${pathname === "/learn" ? "underline" : ""}`}>
                                        Learn
                                    </Button>
                                </Link>
                            </NavigationMenuItem>
                           
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="mr-4 flex items-center gap-4">
                    <CommandMenu />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className={`${typography.p} text-sm font-medium leading-none`}>{title}</div>
                    <p className={`${typography.p} line-clamp-2 text-sm leading-snug text-muted-foreground`}>
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

export default Navigation;


