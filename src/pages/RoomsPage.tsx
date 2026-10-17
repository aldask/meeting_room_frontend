import { Badge, Button, Group, MultiSelect, NumberInput, Paper, Select, Table, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconCalendar, IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { ALL_EQUIPMENT, type Equipment, type Room, type User } from '../api/types'
import ErrorAlert from '../components/ErrorAlert'
import PageTitle from '../components/PageTitle'
import ReservationFormModal from '../components/ReservationFormModal'
import RoomScheduleDrawer from '../components/RoomScheduleDrawer'
import { equipmentLabel } from '../utils/format'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [allRooms, setAllRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  const [minCapacity, setMinCapacity] = useState<number | string>('')
  const [floor, setFloor] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<string[]>([])

  const [bookingRoom, setBookingRoom] = useState<Room | null>(null)
  const [scheduleRoom, setScheduleRoom] = useState<Room | null>(null)

  useEffect(() => {
    Promise.all([api.getRooms(), api.getUsers()])
      .then(([roomList, userList]) => {
        setAllRooms(roomList)
        setUsers(userList)
      })
      .catch((err) => setError(err.message))
  }, [])

  useEffect(() => {
    let isOutdated = false

    api
      .getRooms({
        minCapacity: minCapacity === '' ? undefined : Number(minCapacity),
        floor: floor === null ? undefined : Number(floor),
        equipment: equipment as Equipment[],
      })
      .then((list) => {
        if (!isOutdated) setRooms(list)
      })
      .catch((err) => setError(err.message))

    return () => {
      isOutdated = true
    }
  }, [minCapacity, floor, equipment])

  const floors = [...new Set(allRooms.map((r) => r.floor))].sort((a, b) => a - b)

  function handleBooked() {
    setBookingRoom(null)
    notifications.show({ color: 'green', title: 'Done', message: 'The room has been booked.' })
  }

  return (
    <>
      <PageTitle title="Rooms" />
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <Paper withBorder shadow="xs" p="md" mb="md">
        <Group align="flex-end">
          <NumberInput
            label="Min. capacity"
            placeholder="Any"
            value={minCapacity}
            onChange={setMinCapacity}
            min={1}
            allowDecimal={false}
            allowNegative={false}
            w={140}
          />
          <Select
            label="Floor"
            placeholder="All floors"
            data={floors.map((f) => ({ value: String(f), label: `Floor ${f}` }))}
            value={floor}
            onChange={setFloor}
            clearable
            w={160}
          />
          <MultiSelect
            label="Equipment"
            placeholder={equipment.length === 0 ? 'Any equipment' : undefined}
            data={ALL_EQUIPMENT.map((e) => ({ value: e, label: equipmentLabel(e) }))}
            value={equipment}
            onChange={setEquipment}
            clearable
            miw={280}
          />
        </Group>
      </Paper>

      <Paper withBorder shadow="xs">
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Floor</Table.Th>
                <Table.Th>Equipment</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rooms.map((room) => (
                <Table.Tr key={room.id}>
                  <Table.Td>{room.code}</Table.Td>
                  <Table.Td fw={500}>{room.name}</Table.Td>
                  <Table.Td>{room.capacity}</Table.Td>
                  <Table.Td>{room.floor}</Table.Td>
                  <Table.Td>{room.equipment.length === 0 ? '-' : room.equipment.map(equipmentLabel).join(', ')}</Table.Td>
                  <Table.Td>
                    <Badge color={room.isActive ? 'green' : 'red'} variant="light">
                      {room.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end" wrap="nowrap">
                      <Button
                        size="xs"
                        variant="default"
                        leftSection={<IconCalendar size={14} />}
                        onClick={() => setScheduleRoom(room)}
                      >
                        Schedule
                      </Button>
                      <Button
                        size="xs"
                        leftSection={<IconPlus size={14} />}
                        disabled={!room.isActive}
                        onClick={() => setBookingRoom(room)}
                      >
                        Book
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {rooms.length === 0 && (
          <Text c="dimmed" ta="center" py="xl">
            No rooms found
          </Text>
        )}
      </Paper>

      {bookingRoom && (
        <ReservationFormModal
          onClose={() => setBookingRoom(null)}
          onSaved={handleBooked}
          rooms={allRooms}
          users={users}
          defaultRoomId={bookingRoom.id}
        />
      )}

      {scheduleRoom && (
        <RoomScheduleDrawer key={scheduleRoom.id} room={scheduleRoom} onClose={() => setScheduleRoom(null)} />
      )}
    </>
  )
}
