import { Badge } from '@mantine/core'
import type { ReservationStatus } from '../api/types'

const colors: Record<ReservationStatus, string> = {
  Booked: 'blue',
  Completed: 'green',
  Cancelled: 'gray',
}

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <Badge color={colors[status]} variant="light">
      {status}
    </Badge>
  )
}
