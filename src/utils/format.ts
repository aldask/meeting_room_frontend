import dayjs, { type Dayjs } from 'dayjs'
import type { Equipment } from '../api/types'

export function formatDateTime(value: string) {
  return dayjs(value).format('YYYY-MM-DD HH:mm')
}

export function formatTime(value: string) {
  return dayjs(value).format('HH:mm')
}

export function formatDuration(start: string, end: string) {
  const minutes = dayjs(end).diff(dayjs(start), 'minute')
  if (minutes < 60) return `${minutes} min`
  if (minutes < 60 * 24) return `${+(minutes / 60).toFixed(1)} h`
  return `${+(minutes / 60 / 24).toFixed(1)} days`
}

export function toApiDate(value: string | null) {
  return value ? dayjs(value).toISOString() : undefined
}

export function toInputDate(value: string | Dayjs) {
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}

const equipmentLabels: Record<Equipment, string> = {
  Projector: 'Projector',
  TvScreen: 'TV screen',
  VideoConference: 'Video conferencing',
  Whiteboard: 'Whiteboard',
}

export function equipmentLabel(equipment: Equipment) {
  return equipmentLabels[equipment]
}
