"use client"

import { TooltipProps } from "recharts"
import { Card } from "./card"

export type ChartConfig = {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps {
  children: React.ReactNode
  config: ChartConfig
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  return (
    <div
      style={
        {
          "--color-desktop": config.desktop?.color,
          "--color-mobile": config.mobile?.color,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

interface ChartTooltipContentProps extends TooltipProps<any, any> {
  hideLabel?: boolean
}

export function ChartTooltipContent({
  active,
  payload,
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload) return null

  return (
    <Card className="border-none shadow-none p-3 bg-background/80 backdrop-blur-sm">
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {!hideLabel && (
            <div className="font-medium" style={{ color: item.color }}>
              {item.name}:
            </div>
          )}
          <div>${Number(item.value).toFixed(2)}</div>
        </div>
      ))}
    </Card>
  )
}

export function ChartTooltip(props: TooltipProps<any, any>) {
  return <ChartTooltipContent {...props} />
}
