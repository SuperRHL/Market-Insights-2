"use client"
import { useEffect, useState } from "react"
import {
    Calculator,

    Settings,
    Search,
    TrendingUp,
    LineChart,
    BarChart,
    DollarSign,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { typography } from "@/styles/typography"

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
  } from "@/components/ui/command"
  

import { Input } from "@/components/ui/input"

export function CommandMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const router = useRouter()

    const suggestions = ["AAPL", "MSFT", "NVDA", "META", "SNAP"]
    const filtered = query 
        ? suggestions.filter(item => item.toLowerCase().includes(query.toLowerCase()))
        : suggestions

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/search/${encodeURIComponent(query.trim())}`)
            setIsOpen(false)
            setQuery("")
        }
    }

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setIsOpen((isOpen) => !isOpen)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <div className="w-full max-w-2xl">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-8 bg-muted/50 pr-20 hover:bg-muted/100 cursor-pointer [&::placeholder]:text-muted-foreground/50 hover:[&::placeholder]:text-muted-foreground/90 transition-all"
                        onClick={() => setIsOpen(true)}
                    />
                    <div className="absolute right-2 top-2 text-sm text-muted-foreground">
                        Press{" "}
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>J
                        </kbd>
                    </div>
                </div>
            </div>
            <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
                <Command className="rounded-lg border shadow-md w-[640px]">
                    <CommandInput 
                        placeholder="Search stocks, tools, or commands..." 
                        value={query}
                        className={`${typography.input} ${typography.p}`}
                        onValueChange={setQuery}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleSearch()
                            }
                        }}
                    />
                    <CommandList>
                        <CommandEmpty className={`pl-6 py-4 ${typography.p}`}>Search for <span className="font-semibold">{query}</span></CommandEmpty>
                        <CommandGroup heading="Market Research" className={typography.h4}>
                            {filtered.map(item => (
                                <CommandItem
                                    key={item}
                                    className={`${typography.p} flex items-center`}
                                    onSelect={() => {
                                        setQuery(item)
                                        handleSearch()
                                    }}
                                >
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    <span>{item}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Tools" className={typography.h4}>
                            <CommandItem className={typography.p}>
                                <Calculator className="mr-2 h-4 w-4" />
                                <span>Stock Calculator</span>
                                <CommandShortcut>⌘C</CommandShortcut>
                            </CommandItem>
                            <CommandItem className={typography.p}>
                                <LineChart className="mr-2 h-4 w-4" />
                                <span>Technical Analysis</span>
                                <CommandShortcut>⌘T</CommandShortcut>
                            </CommandItem>
                            <CommandItem className={typography.p}>
                                <BarChart className="mr-2 h-4 w-4" />
                                <span>Market Overview</span>
                                <CommandShortcut>⌘M</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Account" className={typography.h4}>
                            <CommandItem className={typography.p}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                <span>Portfolio</span>
                                <CommandShortcut>⌘P</CommandShortcut>
                            </CommandItem>
                            <CommandItem className={typography.p}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                                <CommandShortcut>⌘S</CommandShortcut>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>        </>    )}