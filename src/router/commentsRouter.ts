import express from "express"
import { CommentBusiness } from "../business/CommentsBusiness"
import { CommentsController } from "../controller/CommentsController"
import { CommentsDatabase } from "../database/CommentsDataBase"
import { PostDatabase } from "../database/PostDatabase"
import { IdGenerator } from "../services/IdGenerator"
import { TokenManager } from "../services/TokenManager"

export const commentsRouter = express.Router()

const commentsController = new CommentsController(
    new CommentBusiness(
        new PostDatabase(),
        new CommentsDatabase(),
        new IdGenerator(),
        new TokenManager(),
    )
)
commentsRouter.post("/:id", commentsController.createComments)
commentsRouter.put("/:id", commentsController.editComments)
commentsRouter.delete("/:id", commentsController.deleteComments)
commentsRouter.get("/", commentsController.getComments)
commentsRouter.get("/:id", commentsController.getCommentsById)
commentsRouter.put("/:id/like", commentsController.likeDislike)