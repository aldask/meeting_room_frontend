import { Button, Group, Paper, Select, Table, Text } from '@mantine/core'
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPencil, IconPlayerStop, IconPlus, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Reservation, ReservationStatus, Room, User } from '../api/types'
import ErrorAlert from '../components/ErrorAlert'
import PageTitle from '../components/PageTitle'
import ReservationFormModal from '../components/ReservationFormModal'
import StatusBadge from '../components/StatusBadge'
import { formatDateTime, formatTime } from '../utils/format'

export default function ReservationsPage() {
  const [searchParams] = useSearchParams()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [roomId, setRoomId] = useState<string | null>(null)
  const [organizerId, setOrganizerId] = useState<string | null>(searchParams.get('organizer'))
  const [status, setStatus] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DatesRangeValue<string>>([null, null])

  const [formOpened, setFormOpened] = useState(false)
  const [editing, setEditing] = useState<Reservation | null>(null)

  useEffect(() => {
    Promise.all([api.getRooms(), api.getUsers()])
      .then(([roomList, userList]) => {
        setRooms(roomList)
        setUsers(userList)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    let isOutdated = false
    const [from, to] = dateRange

    api
      .getReservations({
        roomId: roomId ? Number(roomId) : undefined,
        organizerId: organizerId ? Number(organizerId) : undefined,
        status: status ? (status as ReservationStatus) : undefined,
        from: from ? dayjs(from).startOf('day').toISOString() : undefined,
        to: to ? dayjs(to).endOf('day').toISOString() : undefined,
      })
      .then((list) => {
        if (!isOutdated) setReservations(list)
      })
      .catch((err) => setError(err.message))

    return () => {
      isOutdated = true
    }
  }, [roomId, organizerId, status, dateRange, reloadKey])

  function openForm(reservation: Reservation | null) {
    setEditing(reservation)
    setFormOpened(true)
  }

  function handleSaved() {
    setFormOpened(false)
    setReloadKey((key) => key + 1)
    notifications.show({ color: 'green', title: 'Done', message: editing ? 'Reservation updated.' : 'Room booked.' })
  }

  async function runAction(action: () => Promise<unknown>, successMessage: string) {
    try {
      await action()
      notifications.show({ color: 'green', title: 'Done', message: successMessage })
      setReloadKey((key) => key + 1)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unexpected error'
      notifications.show({ color: 'red', title: 'Error', message: message })
    }
  }

  function confirmCancel(reservation: Reservation) {
    modals.openConfirmModal({
      title: 'Cancel reservation',
      children: <Text size="sm">Are you sure you want to cancel "{reservation.title}"?</Text>,
      labels: { confirm: 'Cancel reservation', cancel: 'Back' },
      confirmProps: { color: 'red' },
      onConfirm: () => runAction(() => api.cancelReservation(reservation.id), 'Reservation cancelled.'),
    })
  }

  function confirmEndEarly(reservation: Reservation) {
    modals.openConfirmModal({
      title: 'End meeting early',
      children: <Text size="sm">Do you want to end "{reservation.title}" now?</Text>,
      labels: { confirm: 'End meeting', cancel: 'Back' },
      confirmProps: { color: 'orange' },
      onConfirm: () => runAction(() => api.endReservationEarly(reservation.id), 'Meeting ended.'),
    })
  }

  return (
    <>
      <PageTitle title="Reservations">
        <Button leftSection={<IconPlus size={16} />} onClick={() => openForm(null)}>
          New reservation
        </Button>
      </PageTitle>
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <Paper withBorder shadow="xs" p="md" mb="md">
        <Group align="flex-end">
          <Select
            label="Room"
            placeholder="All rooms"
            data={rooms.map((r) => ({ value: String(r.id), label: r.name }))}
            value={roomId}
            onChange={setRoomId}
            clearable
            w={180}
          />
          <Select
            label="Organizer"
            placeholder="All organizers"
            data={users.map((u) => ({ value: String(u.id), label: `${u.firstName} ${u.lastName}` }))}
            value={organizerId}
            onChange={setOrganizerId}
            clearable
            searchable
            w={220}
          />
          <Select
            label="Status"
            placeholder="All statuses"
            data={['Booked', 'Completed', 'Cancelled']}
            value={status}
            onChange={setStatus}
            clearable
            w={160}
          />
          <DatePickerInput
            type="range"
            label="Date range"
            placeholder="Any date"
            value={dateRange}
            onChange={setDateRange}
            valueFormat="YYYY-MM-DD"
            clearable
            w={260}
          />
        </Group>
      </Paper>

      <Paper withBorder shadow="xs">
        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Room</Table.Th>
                <Table.Th>Organizer</Table.Th>
                <Table.Th>Start</Table.Th>
                <Table.Th>End</Table.Th>
                <Table.Th>Attendees</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reservations.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td fw={500}>{r.title}</Table.Td>
                  <Table.Td>{r.roomName}</Table.Td>
                  <Table.Td>{r.organizerName}</Table.Td>
                  <Table.Td>{formatDateTime(r.start)}</Table.Td>
                  <Table.Td>
                    {formatDateTime(r.end)}
                    {r.endedEarlyAt && (
                      <Text size="xs" c="orange">
                        Ended early at {formatTime(r.endedEarlyAt)}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>{r.attendees}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={r.status} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                      {r.canCancel && (
                        <>
                          <Button
                            size="xs"
                            variant="default"
                            leftSection={<IconPencil size={14} />}
                            onClick={() => openForm(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="red"
                            leftSection={<IconX size={14} />}
                            onClick={() => confirmCancel(r)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {r.canEndEarly && (
                        <Button
                          size="xs"
                          variant="light"
                          color="orange"
                          leftSection={<IconPlayerStop size={14} />}
                          onClick={() => confirmEndEarly(r)}
                        >
                          End early
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {reservations.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            No reservations found
          </Text>
        )}
      </Paper>

      {formOpened && (
        <ReservationFormModal
          onClose={() => setFormOpened(false)}
          onSaved={handleSaved}
          rooms={rooms}
          users={users}
          reservation={editing}
        />
      )}
    </>
  )
}
