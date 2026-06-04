

export interface UserRegister {
    username: string,
    email: string,
    password: string
}

export interface UserLogin {
    email: string,
    password: string
}

export interface UserResponse {
    user: {
        id: number,
        username: string,
        is_admin: boolean
    },
    token: string
}