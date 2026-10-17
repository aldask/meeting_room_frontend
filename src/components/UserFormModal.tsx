import { Alert, Button, Group, Modal, SimpleGrid, Stack, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function UserFormModal({ onClose, onSaved }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter first and last name.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await api.createUser({ firstName: firstName.trim(), lastName: lastName.trim() })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unexpected error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal opened onClose={onClose} title="New user">
      <form onSubmit={handleSubmit}>
        <Stack>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={18} />} withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              required
              data-autofocus
            />
            <TextInput label="Last name" value={lastName} onChange={(e) => setLastName(e.currentTarget.value)} required />
          </SimpleGrid>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" loading={saving}>
              Create user
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
