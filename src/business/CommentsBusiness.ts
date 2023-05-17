import { CommentsDatabase } from "../database/CommentsDataBase";
import { PostDatabase } from "../database/PostDatabase";
import { CreateCommentsInputDTO, DeleteCommentsInputDTO, EditCommentsInputDTO, GetCommentsInputDTO, GetCommentsOutputDTO, LikeOrDislikeCommentsInputDTO } from "../dtos/commentsDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { Comments } from "../models/Comment";
import { NotFoundError } from "../errors/NotFoundError";
import { CommentsModel, CommentsWithCreatorDB, COMMENTS_LIKE, LikeDislikeCommentsDB, USER_ROLES } from "../types";

export class CommentBusiness{
    constructor(
        private postDataBase:PostDatabase,
        private commentDataBase:CommentsDatabase,
        private idGenerator: IdGenerator,
        private tokenManager:TokenManager 
    ){}
    
        public getComments = async (input: GetCommentsInputDTO): Promise<GetCommentsOutputDTO> => {

            const { token } = input
    
            if (token === undefined) {
                throw new BadRequestError("token é necessário")
            }
    
            const payload = this.tokenManager.getPayload(token)
    
            if (payload === null) {
                throw new BadRequestError("'token' inválido")
            }
    
            const commentsWithCreatorsDB: CommentsWithCreatorDB[] =
                await this.commentDataBase.getCommentsWithCreators()
    
            const comments = commentsWithCreatorsDB.map((commentsWithCreatorDB) => {
                const comment = new Comments (
                    commentsWithCreatorDB.id,
                    commentsWithCreatorDB.post_id,
                    commentsWithCreatorDB.creator_name,
                    commentsWithCreatorDB.comments,
                    commentsWithCreatorDB.likes,
                    commentsWithCreatorDB.dislikes,
                    commentsWithCreatorDB.created_at,
                )
                console.log(comment)
                return comment.toBusinessModel()
            })
            const output: GetCommentsOutputDTO = comments
    
            return output
        }
    
    
        public getCommentsById = async (input: GetCommentsInputDTO): Promise<CommentsModel> => {
    
            const { id, token } = input
    
            if (token === undefined) {
                throw new BadRequestError("token é necessário")
            }
    
            const payload = this.tokenManager.getPayload(token)
    
            if (payload === null) {
                throw new BadRequestError("'token' inválido")
            }
    
            const commentsDB = await this.commentDataBase.findCommentsById(id)
    
            if (!commentsDB) {
                throw new NotFoundError("'id' não encontrado")
            }
    
            const comments = new Comments(
                commentsDB.id,
                commentsDB.post_id,
                commentsDB.user_id,
                commentsDB.comments,
                commentsDB.likes,
                commentsDB.dislikes,
                commentsDB.created_at,
            ).toBusinessModel()
    
            return comments
        }
    
        public createComments = async (input: CreateCommentsInputDTO) => {
            const { postId, comments, token } = input
            console.log(input);
            
            if (token === undefined) {
                throw new BadRequestError("token ausente")
            }
    
            const payload = this.tokenManager.getPayload(token)
            
            if (payload === null) {
                throw new BadRequestError("'token' inválido")
            }
            const postDBExists = await this.postDataBase.findPostById(postId)
            
            if (postDBExists === null) {
                throw new NotFoundError("'id' não encontrado")
            }
                    
            if (typeof comments !== "string") {
               
                throw new BadRequestError("'comments' deve ser uma string")
            }
            if(comments.length <1){
                throw new BadRequestError("'comments' deve ter pelo menos uma letra")
            }
    
            const newId = this.idGenerator.generate()
    
            const newComments = new Comments(
                newId,
                postId,
                payload.id,
                comments,
                0,
                0,
                new Date().toISOString(),
            )
    
            const newCommentsDB = newComments.toDBModel()
    
            await this.commentDataBase.insertComments(newCommentsDB)
            }
    
        public editComments = async (input: EditCommentsInputDTO): Promise<void> => {
            const { idToEdit, token, comments } = input
    
            if (token === undefined) {
                throw new BadRequestError("token é necessário")
            }
    
            const payload = this.tokenManager.getPayload(token)
    
            if (payload === null) {
                throw new BadRequestError("'token inválido");
            }
    
            if (typeof comments !== "string") {
                throw new BadRequestError("'comments' deve ser uma string")
            }
    
            const newCommentsDB = await this.commentDataBase.findCommentsById(idToEdit)
    
            if (!newCommentsDB) {
                throw new NotFoundError("'id' não encontrado")
            }
    
            const creatorId = payload.id
    
            if (newCommentsDB.user_id !== creatorId) {
                throw new BadRequestError("somente o criador do Comment pode editá-lo")
            }
    
            const comment = new Comments(
                newCommentsDB.id,
                newCommentsDB.post_id,
                newCommentsDB.user_id,
                newCommentsDB.comments,
                newCommentsDB.likes,
                newCommentsDB.dislikes,
                newCommentsDB.created_at,
            )
    
            comment.setComments(comments)
    
            const updatedCommentsDB = comment.toDBModel()
    
            await this.commentDataBase.updateComments(updatedCommentsDB, idToEdit)
    
        }
    
        public deleteComments = async (input: DeleteCommentsInputDTO): Promise<void> => {
            const { idToDelete, token } = input
    
            if (token === undefined) {
                throw new BadRequestError("token é necessário")
            }
    
            const payload = this.tokenManager.getPayload(token)
    
            if (payload === null) {
                throw new BadRequestError("Usuário não está logado")
            }
    
            const commentsDBExists = await this.commentDataBase.findCommentsById(idToDelete)
    
            if (!commentsDBExists) {
                throw new NotFoundError("'id' não encontrado")
            }
    
            const creatorId = payload.id
    
            if (payload.role !== USER_ROLES.ADMIN && commentsDBExists.user_id !== creatorId) {
                throw new BadRequestError("somenste o criador do Comment pode deleta-lo");
            }
    
    
            await this.commentDataBase.deleteComments(idToDelete)
    
        }
    
        public likeOrDislikeComments = async (input: LikeOrDislikeCommentsInputDTO): Promise<void> => {
            const { idToLikeOrDislike, token, like } = input
    
            if (token === undefined) {
                throw new BadRequestError("token é necessário")
            }
    
            const payload = this.tokenManager.getPayload(token)
    
            if (payload === null) {
                throw new BadRequestError("token inválido")
            }
    
            if (typeof like !== "boolean") {
                throw new BadRequestError("'like' deve ser boolean")
            }
            
    
            const commentsWithCreatorDB = await this.commentDataBase.findCommentsWithCreatorById(idToLikeOrDislike)
            
            if (!commentsWithCreatorDB) {
                throw new NotFoundError("'id' não encontrado")
            }
    
            const userId = payload.id
            const likeSQLite = like ? 1 : 0
    
            const likeDislikeDB: LikeDislikeCommentsDB = {
                comments_id: commentsWithCreatorDB.id,
                post_id: commentsWithCreatorDB.post_id,
                user_id: userId,
                like: likeSQLite
            }
    
            const comments = new Comments(
                commentsWithCreatorDB.id,
                commentsWithCreatorDB.post_id,
                commentsWithCreatorDB.user_id,            
                commentsWithCreatorDB.comments,
                commentsWithCreatorDB.likes,
                commentsWithCreatorDB.dislikes,
                commentsWithCreatorDB.created_at
            )
    
            const likeDislikeExists = await this.commentDataBase
                .findLikeDislike(likeDislikeDB)
    
            if (likeDislikeExists === COMMENTS_LIKE.ALREADY_LIKED) {
                if (like) {
                    await this.commentDataBase.removeLikeDislike(likeDislikeDB)
                    comments.removeLike()
                } else {
                    await this.commentDataBase.updateLikeDislike(likeDislikeDB)
                    comments.removeLike()
                    comments.addDislike()
                }
    
            } else if (likeDislikeExists === COMMENTS_LIKE.ALREADY_DISLIKED) {
                if (like) {
                    await this.commentDataBase.updateLikeDislike(likeDislikeDB)
                    comments.removeDislike()
                    comments.addLike()
                } else {
                    await this.commentDataBase.removeLikeDislike(likeDislikeDB)
                    comments.removeDislike()
                }
    
            } else {
                await this.commentDataBase.likeOrDislikeComments(likeDislikeDB)
    
                like ? comments.addLike() : comments.addDislike()
            }
    
            const updatedCommentsDB = comments.toDBModel()
            console.log("chegou aqui")
    
            await this.commentDataBase.updateComments(updatedCommentsDB, idToLikeOrDislike)
        }
    }