export type Equipment = 'Projector' | 'TvScreen' | 'VideoConference' | 'Whiteboard'

export const ALL_EQUIPMENT: Equipment[] = ['Projector', 'TvScreen', 'VideoConference', 'Whiteboard']

export type ReservationStatus = 'Booked' | 'Completed' | 'Cancelled'

export interface Room {
  id: number
  code: string
  name: string
  capacity: number
  floor: number
  equipment: Equipment[]
  isActive: boolean
}

export interface User {
  id: number
  firstName: string
  lastName: string
  activeReservationCount: number
}

export interface Reservation {
  id: number
  roomId: number
  roomName: string
  organizerId: number
  organizerName: string
  title: string
  start: string
  end: string
  endedEarlyAt: string | null
  attendees: number
  status: ReservationStatus
  canCancel: boolean
  canEndEarly: boolean
}

export interface SaveReservationRequest {
  roomId: number
  organizerId: number
  title: string
  start: string
  end: string
  attendees: number
}

export interface RoomUsage {
  roomId: number
  roomCode: string
  roomName: string
  reservationCount: number
  cancelledCount: number
  bookedHours: number
  usedHours: number
  utilizationPercent: number
  isLowUsage: boolean
}

export interface RoomFilter {
  minCapacity?: number
  floor?: number
  equipment?: Equipment[]
}

export interface ReservationFilter {
  roomId?: number
  organizerId?: number
  status?: ReservationStatus
  from?: string
  to?: string
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
}
