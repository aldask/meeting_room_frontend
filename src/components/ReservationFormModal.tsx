import { Alert, Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import type { Reservation, Room, User } from '../api/types'
import { formatDuration, toApiDate, toInputDate } from '../utils/format'

interface Props {
  onClose: () => void
  onSaved: () => void
  rooms: Room[]
  users: User[]
  reservation?: Reservation | null
  defaultRoomId?: number
}

export default function ReservationFormModal({ onClose, onSaved, rooms, users, reservation, defaultRoomId }: Props) {
  const isEdit = reservation != null
  const initialRoomId = reservation ? reservation.roomId : defaultRoomId

  const [roomId, setRoomId] = useState<string | null>(initialRoomId ? String(initialRoomId) : null)
  const [organizerId, setOrganizerId] = useState<string | null>(reservation ? String(reservation.organizerId) : null)
  const [title, setTitle] = useState(reservation ? reservation.title : '')
  const [start, setStart] = useState(reservation ? toInputDate(reservation.start) : '')
  const [end, setEnd] = useState(reservation ? toInputDate(reservation.end) : '')
  const [attendees, setAttendees] = useState<number | string>(reservation ? reservation.attendees : 1)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedRoom = rooms.find((r) => String(r.id) === roomId)

  const roomOptions = rooms.map((r) => ({
    value: String(r.id),
    label: r.isActive ? `${r.name} (${r.code})` : `${r.name} (${r.code}) - inactive`,
  }))
  const userOptions = users.map((u) => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))

  function handleStartChange(value: string) {
    setStart(value)
    if (value && (!end || !dayjs(end).isAfter(value))) {
      setEnd(toInputDate(dayjs(value).add(1, 'hour')))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!roomId || !organizerId || !start || !end || !title.trim()) {
      setError('Please fill in all fields.')
      return
    }

    const data = {
      roomId: Number(roomId),
      organizerId: Number(organizerId),
      title: title.trim(),
      start: toApiDate(start)!,
      end: toApiDate(end)!,
      attendees: Number(attendees),
    }

    setSaving(true)
    setError(null)

    try {
      if (reservation) {
        await api.updateReservation(reservation.id, data)
      } else {
        await api.createReservation(data)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unexpected error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened onClose={onClose} title={isEdit ? 'Edit reservation' : 'New reservation'} size="lg">
      <form onSubmit={handleSubmit}>
        <Stack>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />} withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextInput label="Meeting title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select label="Room" data={roomOptions} value={roomId} onChange={setRoomId} searchable required />
            <Select
              label="Organizer"
              data={userOptions}
              value={organizerId}
              onChange={setOrganizerId}
              searchable
              required
            />
          </SimpleGrid>

          {selectedRoom && (
            <Text size="sm" c="dimmed">
              Capacity: {selectedRoom.capacity} people, floor {selectedRoom.floor}
            </Text>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              type="datetime-local"
              label="Start"
              value={start}
              onChange={(e) => handleStartChange(e.currentTarget.value)}
              min={toInputDate(dayjs())}
              required
            />
            <TextInput
              type="datetime-local"
              label="End"
              value={end}
              onChange={(e) => setEnd(e.currentTarget.value)}
              min={start || toInputDate(dayjs())}
              required
            />
          </SimpleGrid>

          <NumberInput
            label="Attendees"
            value={attendees}
            onChange={setAttendees}
            min={1}
            allowDecimal={false}
            allowNegative={false}
            required
            w={140}
          />

          <Group justify="space-between" mt="sm">
            <Text size="sm" c="dimmed">
              {start && end && dayjs(end).isAfter(start) ? `Duration: ${formatDuration(start, end)}` : ''}
            </Text>
            <Group gap="sm">
              <Button variant="default" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" loading={saving}>
                {isEdit ? 'Save changes' : 'Book room'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
