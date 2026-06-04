
export interface Room {
    id: number,
    name: string,
    room_type: "room" | "desc",
    is_active: boolean 
}

export interface RoomCreate {
    name: string,
    room_type: "room" | "desc",
    is_active: boolean
}
