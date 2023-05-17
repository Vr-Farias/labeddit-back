import { CommentsModel } from "../types"

export interface GetCommentsInputDTO {
    id: string,
    token: string | undefined
}

export interface GetCommentsInputDTO {
    token: string | undefined
}

export type GetCommentsOutputDTO = CommentsModel[]

export interface CreateCommentsInputDTO {
    postId: string,
    token: string | undefined,
    comments: unknown
}

export interface CreateCommentsOutputDTO {
    message: string,
    comments: string
}

export interface EditCommentsInputDTO {
    idToEdit: string,
    token: string | undefined,
    comments: unknown
}

export interface DeleteCommentsInputDTO {
    idToDelete: string,
    token: string | undefined
}

export interface LikeOrDislikeCommentsInputDTO {
    idToLikeOrDislike: string,
    token: string | undefined,
    like: unknown
}