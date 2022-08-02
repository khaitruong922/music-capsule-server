// Receive
export const CREATE_ROOM = "CREATE_ROOM"
export const REQUEST_ROOMS = "REQUEST_ROOMS"
export const JOIN_ROOM = "JOIN_ROOM"
export const LEAVE_ROOM = "LEAVE_ROOM"
export const JOIN_LOBBY = "JOIN_LOBBY"

// Send
export const LOBBY_JOINED = "LOBBY_JOINED"
export const JOIN_CREATED_ROOM = "JOIN_CREATED_ROOM"
export const ROOM_CREATED = "ROOM_CREATED"
export const ROOM_DELETED = "ROOM_DELETED"
export const POPULATE_ROOMS = "POPULATE_ROOMS"
export const USER_JOIN_ROOM = "USER_JOIN_ROOM"
export const USER_LEAVE_ROOM = "USER_LEAVE_ROOM"
export const ROOM_USER_COUNT_CHANGED = "ROOM_USER_COUNT_CHANGED"

export interface RoomDeletedEventPayload {
    roomId: string
}
