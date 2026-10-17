import { Alert } from '@mantine/core'

interface Props {
  error: string | null
  onClose?: () => void
}

export default function ErrorAlert({ error, onClose }: Props) {
  if (!error) return null

  return (
    <Alert color="red" title="Something went wrong" withCloseButton={!!onClose} onClose={onClose} mb="md">
      {error}
    </Alert>
  )
}
