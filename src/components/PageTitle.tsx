import { Group, Title } from '@mantine/core'
import type { ReactNode } from 'react'

interface Props {
  title: string
  children?: ReactNode
}

export default function PageTitle({ title, children }: Props) {
  return (
    <Group justify="space-between" mb="lg">
      <Title order={2}>{title}</Title>
      {children}
    </Group>
  )
}
