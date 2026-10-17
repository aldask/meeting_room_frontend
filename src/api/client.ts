import type {
  CreateUserRequest,
  Reservation,
  ReservationFilter,
  Room,
  RoomFilter,
  RoomUsage,
  SaveReservationRequest,
  User,
} from './types'

export class ApiError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

async function request<T>(url: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response

  try {
    response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('NETWORK_ERROR', 'Could not reach the server. Is the backend running?')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const code = error?.code ?? 'UNKNOWN_ERROR'
    const message = error?.message ?? error?.title ?? `Request failed with status ${response.status}`
    throw new ApiError(code, message)
  }

  return response.json()
}

function getRooms(filter: RoomFilter = {}) {
  const params = new URLSearchParams()
  if (filter.minCapacity) params.append('minCapacity', String(filter.minCapacity))
  if (filter.floor !== undefined) params.append('floor', String(filter.floor))
  for (const item of filter.equipment ?? []) {
    params.append('equipment', item)
  }

  return request<Room[]>(`/api/rooms?${params}`)
}

function getUsers() {
  return request<User[]>('/api/users')
}

function createUser(data: CreateUserRequest) {
  return request<User>('/api/users', 'POST', data)
}

function getReservations(filter: ReservationFilter = {}) {
  const params = new URLSearchParams()
  if (filter.roomId) params.append('roomId', String(filter.roomId))
  if (filter.organizerId) params.append('organizerId', String(filter.organizerId))
  if (filter.status) params.append('status', filter.status)
  if (filter.from) params.append('from', filter.from)
  if (filter.to) params.append('to', filter.to)

  return request<Reservation[]>(`/api/reservations?${params}`)
}

function createReservation(data: SaveReservationRequest) {
  return request<Reservation>('/api/reservations', 'POST', data)
}

function updateReservation(id: number, data: SaveReservationRequest) {
  return request<Reservation>(`/api/reservations/${id}`, 'PUT', data)
}

function cancelReservation(id: number) {
  return request<Reservation>(`/api/reservations/${id}/cancel`, 'POST')
}

function endReservationEarly(id: number) {
  return request<Reservation>(`/api/reservations/${id}/end-early`, 'POST')
}

function getUsageReport(from: string, to: string) {
  const params = new URLSearchParams({ from, to })
  return request<RoomUsage[]>(`/api/reports/usage?${params}`)
}

export const api = {
  getRooms,
  getUsers,
  createUser,
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  endReservationEarly,
  getUsageReport,
}
