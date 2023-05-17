import { Request, Response } from "express"
import { CommentBusiness } from "../business/CommentsBusiness"
import { CreateCommentsInputDTO, DeleteCommentsInputDTO, EditCommentsInputDTO, GetCommentsInputDTO, LikeOrDislikeCommentsInputDTO } from "../dtos/commentsDTO"
import { BaseError } from "../errors/BaseError"

export class CommentsController {
    constructor(
        private commentsBusiness: CommentBusiness
    ) { }

    public getComments = async (req: Request, res: Response) => {
        try {
            const input: GetCommentsInputDTO = {
                token: req.headers.authorization,
                id: req.params.id
            }

            const output = await this.commentsBusiness.getComments(input)

            res.status(200).send(output)
        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }


    public getCommentsById = async (req: Request, res: Response) => {
        try {
            const input: GetCommentsInputDTO = {
                id: req.params.id,
                token: req.headers.authorization
            }

            const output = await this.commentsBusiness.getCommentsById(input)

            res.status(200).send(output)
        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }

    public createComments = async (req: Request, res: Response) => {
        try {
            const input: CreateCommentsInputDTO = {
                postId: req.params.id,
                token: req.headers.authorization,
                comments: req.body.comments
            }
                                 
            await this.commentsBusiness.createComments(input)
            
            res.status(201).end()
        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }

    public editComments = async (req: Request, res: Response) => {
        try {
            const input: EditCommentsInputDTO = {
                idToEdit: req.params.id,
                comments: req.body.content,
                token: req.headers.authorization
            }

            const output = await this.commentsBusiness.editComments(input)

            res.status(200).send(output)
        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }

    public deleteComments = async (req: Request, res: Response) => {
        try {
            const input: DeleteCommentsInputDTO = { 
                idToDelete: req.params.id,
                token: req.headers.authorization
            }

            const output = await this.commentsBusiness.deleteComments(input)

            res.status(200).send(output)

        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }

    public likeDislike = async (req: Request, res: Response) => {
        try {

            const input: LikeOrDislikeCommentsInputDTO = {
                idToLikeOrDislike: req.params.id,
                token: req.headers.authorization,
                like: req.body.like
            }
           
            await this.commentsBusiness.likeOrDislikeComments(input)

            res.status(200).end()
        } catch (error) {
            console.log(error)

            if (error instanceof BaseError) {
                res.status(error.statusCode).send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }
}