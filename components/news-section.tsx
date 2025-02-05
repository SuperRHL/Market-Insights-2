"use client"
import React, { useEffect, useState } from 'react'
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { typography } from "@/styles/typography"

interface NewsItem {
  title: string
  description: string
  link: string
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news')
        const data = await response.json()
        setNews(data)
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-8 w-64 mb-6" />
        {[...Array(5)].map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            {index < 4 && (
              <div className="my-4">
                <Separator />
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {news.map((item, index) => (
        <div key={index}>
          <div className="mb-4 grid grid-cols-[25px_1fr] items-start gap-2">
            <span className="flex h-2 w-2 translate-y-2.5 rounded-full bg-sky-500" />
            <div className="space-y-1 min-w-0">
              <Button 
                variant="link" 
                className={cn(
                  "h-auto p-0 text-base font-semibold w-full text-left justify-start",
                  typography.h4,
                  "hover:no-underline"
                )}
                onClick={() => window.open(item.link, '_blank')}
              >
                <span className="line-clamp-2 break-words text-left">
                  {item.title}
                </span>
              </Button>
              <p className={cn(
                "text-sm text-muted-foreground line-clamp-2 break-words",
                typography.p
              )}>
                {item.description}
              </p>
            </div>
          </div>
          {index < news.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
