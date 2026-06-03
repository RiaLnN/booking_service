
export interface BookResponse {
    id: number,
    start_time: string,
    end_time: string,
    is_booked: boolean
}

export interface BookCreate {
    start_time: string,
    end_time: string,
    resource_id: number
}