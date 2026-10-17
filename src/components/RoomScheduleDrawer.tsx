import { ActionIcon, Drawer, Group, Stack, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Reservation, Room } from '../api/types'
import { formatDateTime, formatTime } from '../utils/format'

interface Props {
  room: Room
  onClose: () => void
}

function getMonday(date: Dayjs) {
  const daysSinceMonday = (date.day() + 6) % 7
  return date.subtract(daysSinceMonday, 'day').startOf('day')
}

function isOnDay(reservation: Reservation, day: Dayjs) {
  const start = dayjs(reservation.start)
  const end = dayjs(reservation.endedEarlyAt ?? reservation.end)
  return start.isBefore(day.endOf('day')) && end.isAfter(day.startOf('day'))
}

function formatTimeRange(reservation: Reservation) {
  const sameDay = dayjs(reservation.start).isSame(reservation.end, 'day')
  if (sameDay) {
    return `${formatTime(reservation.start)} - ${formatTime(reservation.end)}`
  }
  return `${formatDateTime(reservation.start)} - ${formatDateTime(reservation.end)}`
}

export default function RoomScheduleDrawer({ room, onClose }: Props) {
  const [weekStart, setWeekStart] = useState(getMonday(dayjs()))
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    let isOutdated = false

    api
      .getReservations({
        roomId: room.id,
        from: weekStart.toISOString(),
        to: weekStart.add(7, 'day').toISOString(),
      })
      .then((list) => {
        if (!isOutdated) setReservations(list)
      })
      .catch(() => setReservations([]))

    return () => {
      isOutdated = true
    }
  }, [room, weekStart])

  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(weekStart.add(i, 'day'))
  }

  return (
    <Drawer opened onClose={onClose} position="right" size="md" title={room.name}>
      <Group justify="space-between" mb="lg">
        <ActionIcon variant="default" onClick={() => setWeekStart(weekStart.subtract(7, 'day'))}>
          <IconChevronLeft size={16} />
        </ActionIcon>
        <Text fw={500}>
          {weekStart.format('D MMM')} - {weekStart.add(6, 'day').format('D MMM')}
        </Text>
        <ActionIcon variant="default" onClick={() => setWeekStart(weekStart.add(7, 'day'))}>
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>

      <Stack gap="md">
        {days.map((day) => {
          const dayReservations = reservations
            .filter((r) => isOnDay(r, day))
            .sort((a, b) => a.start.localeCompare(b.start))

          return (
            <div key={day.toString()}>
              <Text size="sm" fw={600} c={day.isSame(dayjs(), 'day') ? 'blue' : undefined}>
                {day.format('dddd, D MMM')}
              </Text>

              {dayReservations.length === 0 && (
                <Text size="sm" c="dimmed">
                  Free all day
                </Text>
              )}

              {dayReservations.map((r) => (
                <Text
                  key={r.id}
                  size="sm"
                  td={r.status === 'Cancelled' ? 'line-through' : undefined}
                  c={r.status === 'Booked' ? undefined : 'dimmed'}
                >
                  {formatTimeRange(r)} {r.title} ({r.organizerName})
                </Text>
              ))}
            </div>
          )
        })}
      </Stack>
    </Drawer>
  )
}
