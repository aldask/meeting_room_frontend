import { Alert, Badge, Button, Group, Paper, Progress, Select, Table, Text } from '@mantine/core'
import { IconAlertTriangle, IconFileTypePdf } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { RoomUsage } from '../api/types'
import ErrorAlert from '../components/ErrorAlert'
import PageTitle from '../components/PageTitle'

const periods = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]

export default function UsagePage() {
  const [report, setReport] = useState<RoomUsage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string | null>('30')

  useEffect(() => {
    let isOutdated = false
    const from = dayjs().subtract(Number(period), 'day').startOf('day')
    const to = dayjs()

    api
      .getUsageReport(from.toISOString(), to.toISOString())
      .then((list) => {
        if (!isOutdated) setReport(list)
      })
      .catch((err) => setError(err.message))

    return () => {
      isOutdated = true
    }
  }, [period])

  const lowUsageRooms = report.filter((r) => r.isLowUsage)
  const periodLabel = periods.find((p) => p.value === period)?.label

  function exportToPdf() {
    const oldTitle = document.title
    document.title = `Usage report ${dayjs().format('YYYY-MM-DD')}`
    window.print()
    document.title = oldTitle
  }

  return (
    <>
      <PageTitle title="Usage report">
        <Group gap="sm" className="no-print">
          <Select data={periods} value={period} onChange={setPeriod} allowDeselect={false} w={170} />
          <Button variant="default" leftSection={<IconFileTypePdf size={18} />} onClick={exportToPdf}>
            Export PDF
          </Button>
        </Group>
      </PageTitle>
      <Text className="print-only" size="sm" c="dimmed" mb="md">
        {periodLabel}, generated {dayjs().format('YYYY-MM-DD HH:mm')}
      </Text>
      <ErrorAlert error={error} onClose={() => setError(null)} />

      {lowUsageRooms.length > 0 && (
        <Alert color="orange" icon={<IconAlertTriangle size={18} />} mb="md" title="Rooms with low usage">
          {lowUsageRooms.map((r) => r.roomName).join(', ')}. These rooms are booked, but meetings often end early
          or get cancelled.
        </Alert>
      )}

      <Paper withBorder shadow="xs">
        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>Room</Table.Th>
                <Table.Th>Reservations</Table.Th>
                <Table.Th>Cancelled</Table.Th>
                <Table.Th>Booked hours</Table.Th>
                <Table.Th>Used hours</Table.Th>
                <Table.Th w={240}>Utilization</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {report.map((row) => (
                <Table.Tr key={row.roomId}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {row.roomName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {row.roomCode}
                    </Text>
                  </Table.Td>
                  <Table.Td>{row.reservationCount}</Table.Td>
                  <Table.Td>{row.cancelledCount}</Table.Td>
                  <Table.Td>{row.bookedHours}</Table.Td>
                  <Table.Td>{row.usedHours}</Table.Td>
                  <Table.Td>
                    {row.reservationCount === 0 ? (
                      <Text size="sm" c="dimmed">
                        No data
                      </Text>
                    ) : (
                      <Group gap="sm" wrap="nowrap">
                        <Progress
                          value={row.utilizationPercent}
                          color={row.isLowUsage ? 'orange' : 'green'}
                          size="lg"
                          radius="xl"
                          style={{ flex: 1 }}
                        />
                        <Text size="sm" w={40} ta="right">
                          {Math.round(row.utilizationPercent)}%
                        </Text>
                      </Group>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {row.isLowUsage && (
                      <Badge color="orange" variant="light">
                        Low usage
                      </Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </>
  )
}
