import { Anchor, Badge, Button, Paper, Table } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { User } from '../api/types'
import ErrorAlert from '../components/ErrorAlert'
import PageTitle from '../components/PageTitle'
import UserFormModal from '../components/UserFormModal'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [formOpened, setFormOpened] = useState(false)

  useEffect(() => {
    api
      .getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
  }, [reloadKey])

  function handleUserCreated() {
    setFormOpened(false)
    setReloadKey((key) => key + 1)
    notifications.show({ color: 'green', title: 'Done', message: 'The user has been created.' })
  }

  return (
    <>
      <PageTitle title="Users">
        <Button leftSection={<IconPlus size={16} />} onClick={() => setFormOpened(true)}>
          New user
        </Button>
      </PageTitle>
      <ErrorAlert error={error} onClose={() => setError(null)} />

      <Paper withBorder shadow="xs">
        <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>First name</Table.Th>
              <Table.Th>Last name</Table.Th>
              <Table.Th>Active reservations</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>{user.id}</Table.Td>
                <Table.Td>{user.firstName}</Table.Td>
                <Table.Td>{user.lastName}</Table.Td>
                <Table.Td>
                  <Badge variant="light" color={user.activeReservationCount > 0 ? 'blue' : 'gray'}>
                    {user.activeReservationCount}
                  </Badge>
                </Table.Td>
                <Table.Td ta="right">
                  <Anchor component={Link} to={`/reservations?organizer=${user.id}`} size="sm">
                    View reservations
                  </Anchor>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {formOpened && <UserFormModal onClose={() => setFormOpened(false)} onSaved={handleUserCreated} />}
    </>
  )
}
