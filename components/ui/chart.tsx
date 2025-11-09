'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface PayloadItem {
  name?: string;
  value?: any;
  payload?: any;
  dataKey?: string | number;
  color?: string;
  [key: string]: any;
}

// Define a simplified version of the Tooltip props that we actually use
type ChartTooltipContentProps = {
  active?: boolean;
  payload?: Array<{
    value: any;
    name: string | number;
    payload: any;
    color: string;
    dataKey: string | number;
    [key: string]: any;
  }>;
  className?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  nameKey?: string;
  labelKey?: string;
  label?: any;
  labelClassName?: string;
  // Make the formatter more permissive to match Recharts' expectations
  formatter?: <TValue, TName>(
    value: TValue,
    name: TName,
    entry: PayloadItem,
    index: number,
    payload?: any
  ) => React.ReactNode;
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
  color?: string;
}

const ChartTooltipContent = ({
  active,
  payload = [],
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
  ...props
}: ChartTooltipContentProps) => {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  const itemConfig = payload[0]?.dataKey ? config[String(payload[0].dataKey)] : null

  return (
    <div
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
        className
      )}
      {...props}
    >
      {!hideLabel && payload[0]?.payload?.name && (
        <p className="mb-1 font-medium">
          {payload[0].payload.name}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((item, index) => {
          const itemConfig = item.dataKey ? config[String(item.dataKey)] : null
          const itemColor = item.color || itemConfig?.color

          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2',
                indicator === 'dot' && 'h-5',
                indicator === 'line' && 'h-1',
                indicator === 'dashed' && 'h-0.5'
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : itemConfig?.icon ? (
                <itemConfig.icon />
              ) : !hideIndicator ? (
                <div
                  className={cn(
                    'shrink-0 rounded-[2px] border border-border bg-background',
                    {
                      'h-2.5 w-2.5': indicator === 'dot',
                      'w-1': indicator === 'line',
                      'w-0 border-[1.5px] border-dashed bg-transparent':
                        indicator === 'dashed',
                    }
                  )}
                  style={{
                    backgroundColor: itemColor,
                  }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

ChartTooltipContent.displayName = 'ChartTooltipContent'

const ChartLegend = RechartsPrimitive.Legend as React.ComponentType<{
  content?: React.ReactNode;
  payload?: Array<{
    value: any;
    id: string;
    type?: string;
    color?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}>;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload = [],
  verticalAlign = 'bottom',
  nameKey,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  hideIcon?: boolean;
  payload?: Array<{
    value: any;
    id: string;
    type?: string;
    color?: string;
    [key: string]: any;
  }>;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  nameKey?: string;
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={
              '[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3'
            }
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload as Record<string, unknown>
      : undefined

  let configLabelKey: string = key

  if (key in payload) {
    const value = (payload as Record<string, unknown>)[key]
    if (typeof value === 'string') {
      configLabelKey = value
    }
  } else if (payloadPayload && key in payloadPayload) {
    const value = payloadPayload[key]
    if (typeof value === 'string') {
      configLabelKey = value
    }
  }

  return config[configLabelKey] || config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
