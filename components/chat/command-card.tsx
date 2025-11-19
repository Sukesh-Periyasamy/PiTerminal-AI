"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  IconPlayerPlay,
  IconCheck,
  IconX,
  IconAlertTriangle
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface CommandData {
  title: string
  explanation: string
  command: string
  follow_up: string
  status: "pending" | "error" | "success" | "suggestion"
}

interface CommandCardProps {
  commandData: CommandData
  onRun: (command: string) => void
  isExecuting?: boolean
  className?: string
}

const statusConfig = {
  pending: {
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: IconPlayerPlay,
    badge: "Ready"
  },
  error: {
    color: "bg-red-500/10 text-red-600 border-red-200",
    icon: IconX,
    badge: "Error"
  },
  success: {
    color: "bg-green-500/10 text-green-600 border-green-200",
    icon: IconCheck,
    badge: "Success"
  },
  suggestion: {
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    icon: IconAlertTriangle,
    badge: "Suggestion"
  }
}

export function CommandCard({
  commandData,
  onRun,
  isExecuting = false,
  className
}: CommandCardProps) {
  const { title, explanation, command, follow_up, status } = commandData
  const config = statusConfig[status]
  const StatusIcon = config.icon

  const handleRun = () => {
    if (command && !isExecuting) {
      onRun(command)
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl", config.color, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="size-4" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {config.badge}
          </Badge>
        </div>
        {explanation && (
          <CardDescription className="text-muted-foreground text-sm">
            {explanation}
          </CardDescription>
        )}
      </CardHeader>

      {command && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-sm text-green-400">
              <span className="text-slate-400">$ </span>
              {command}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">{follow_up}</span>

              {status !== "success" && (
                <Button
                  size="sm"
                  onClick={handleRun}
                  disabled={isExecuting}
                  className="flex items-center gap-1"
                >
                  <IconPlayerPlay className="size-3" />
                  {isExecuting ? "Running..." : "Run"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {status === "success" && !command && (
        <CardContent className="pt-0">
          <div className="text-muted-foreground text-sm">{follow_up}</div>
        </CardContent>
      )}
    </Card>
  )
}
