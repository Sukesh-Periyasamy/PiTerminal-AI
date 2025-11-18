import { IconPlayerPlay } from "@tabler/icons-react"
import { FC } from "react"
import { Button } from "../ui/button"

interface RunButtonProps {
  command: string
  onRun: (command: string) => void
}

export const RunButton: FC<RunButtonProps> = ({ command, onRun }) => {
  return (
    <Button
      size="sm"
      variant="outline"
      className="mt-2 flex items-center gap-2 rounded-full px-3 py-1 text-xs"
      onClick={() => onRun(command)}
    >
      <IconPlayerPlay size={14} />
      <span>Run</span>
    </Button>
  )
}
