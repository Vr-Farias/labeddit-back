import { CommentsDatabase } from "../database/CommentsDataBase";
import { PostDatabase } from "../database/PostDatabase";
import { UserDatabase } from "../database/UserDatabase";
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, GetPostsOutputDTO, LikeOrDislikePostInputDTO, getPostCommentsInputDTO } from "../dtos/postsDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Posts } from "../models/Posts";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikeDislikeDB, PostWithCreatorDB, POST_LIKE, USER_ROLES } from "../types";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) {}

    public getPosts = async (
        input: GetPostsInputDTO
    ): Promise<GetPostsOutputDTO> => {
        const { token } = input

        if (token === undefined) {
            throw new BadRequestError("token ausente")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("token inválido")
        }

        const postsWithCreatorsDB: PostWithCreatorDB[] =
            await this.postDatabase
                .getPostsWithCreators()
        
        
        const posts = postsWithCreatorsDB.map(
            (postWithCreatorDB) => {
                const post = new Posts(
                    postWithCreatorDB.id,
                    postWithCreatorDB.content,
                    postWithCreatorDB.likes,
                    postWithCreatorDB.dislikes,
                    postWithCreatorDB.comments,
                    postWithCreatorDB.created_at,
                    postWithCreatorDB.updated_at,
                    postWithCreatorDB.creator_id,
                    postWithCreatorDB.creator_name
                )
               

                return post.toBusinessModel()                
                               
            }            
        )
       
        const output: GetPostsOutputDTO = posts

        return output

    }  

    public getCommentsByPostId = async (input: getPostCommentsInputDTO) => {

        const { id, token } = input

        if (token === undefined) {
            throw new BadRequestError("token é necessário")
        }

        const payload = this.tokenManager.getPayload(token)

        if (payload === null) {
            throw new BadRequestError("'token' inválido")
        }

        const postIdExists = await this.postDatabase.findPostById(id)

        if (!postIdExists) {
            throw new BadRequestError("'id' não encontrada")
        }

        const posts = await this.postDatabase.getPosts()

        const userDatabase = new UserDatabase()

        const users = await userDatabase.findUsers(id)

        const commentsDatabase = new CommentsDatabase()

        const comments = await commentsDatabase.getCommentsWithCreators()

        const post = posts.filter((post) => {
            const samePost = postIdExists.id === post.id
            return samePost
        })

        const resultPost = post.map((post) => {
            const contador = comments.filter((comments) => {
                return comments.post_id === post.id
            })

            return {
                id: post.id,
                content: post.content,
                likes: post.likes,
                dislikes: post.dislikes,
                comments: contador.length,
                created_at: post.created_at,
                updated_at: post.updated_at,
                creator: resultUser(post.creator_id),
                cmt: contador
            }
        })

        function resultUser(user: string) {
            const resultTable = users.find((result) => {
                return user === result.id
            })

            return {
                id: resultTable?.id,
                name: resultTable?.name
            }
        }

        return ({ Post: resultPost })
    }
      

 public createPost = async (input: CreatePostInputDTO): Promise<boolean> => {
    const { content, token } = input

    if (token === undefined) {
        throw new BadRequestError("token ausente")
    }

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("'token' inválido")
    }

    if (typeof content !== "string") {
        throw new BadRequestError("'content' deve ser uma string")
    }
    if(content.length <1){
        throw new BadRequestError("'content' deve ter pelo menos uma letra")
    }

    const id = this.idGenerator.generate()

    const newPost = new Posts(
        id,
        content,
        0,
        0,
        0,
        new Date().toISOString(),
        new Date().toISOString(),
        payload.id,
        payload.name
    )

    const newPostDB = newPost.toDBModel()

    await this.postDatabase.insertPost(newPostDB)

    return true
}


public editPost = async (
    input: EditPostInputDTO
): Promise<void> => {
    const { idToEdit, token, content } = input

    if (token === undefined) {
        throw new BadRequestError("token ausente")
    }

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    }

    if (typeof content !== "string") {
        throw new BadRequestError("'name' deve ser string")
    }

    const postDB = await this.postDatabase.findPostById(idToEdit)

    if (!postDB) {
        throw new NotFoundError("'id' não encontrado")
    }

    const creatorId = payload.id

    if (postDB.creator_id !== creatorId) {
        throw new BadRequestError("somente quem criou a Post pode editá-la")
    }

    const creatorName = payload.name

    const post = new Posts(
        postDB.id,
        postDB.content,
        postDB.likes,
        postDB.dislikes,
        postDB.comments,
        postDB.created_at,
        postDB.updated_at,
        creatorId,
        creatorName
    )

    post.setContent(content)
    post.setUpdatedAt(new Date().toISOString())

    const updatedPostDB = post.toDBModel()

    await this.postDatabase.update(idToEdit, updatedPostDB)
}

public deletePost = async (
    input: DeletePostInputDTO
): Promise<void> => {
    const { idToDelete, token } = input

    if (token === undefined) {
        throw new BadRequestError("token ausente")
    }

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    }

    const postDB = await this.postDatabase.findPostById(idToDelete)

    if (!postDB) {
        throw new NotFoundError("'id' não encontrado")
    }

    const creatorId = payload.id

    if (
        payload.role !== USER_ROLES.ADMIN
        && postDB.creator_id !== creatorId
    ) {
        throw new BadRequestError("somente quem criou a Post pode deletá-lo")
    }

    await this.postDatabase.delete(idToDelete)

}

public likeOrDislikePost = async (
    input: LikeOrDislikePostInputDTO
): Promise<void> => {
    const { idToLikeOrDislike, token, like } = input

    if (token === undefined) {
        throw new BadRequestError("token ausente")
    }

    const payload = this.tokenManager.getPayload(token)

    if (payload === null) {
        throw new BadRequestError("token inválido")
    }

    if (typeof like !== "boolean") {
        throw new BadRequestError("'like' deve ser boolean")
    }

    const postWithCreatorDB = await this.postDatabase
        .findPostWithCreatorById(idToLikeOrDislike)

    if (!postWithCreatorDB) {
        throw new NotFoundError("'id' não encontrado")
    }

    const userId = payload.id
    const likeSQLite = like ? 1 : 0

    const likeDislikeDB: LikeDislikeDB = {
        user_id: userId,
        post_id: postWithCreatorDB.id,
        like: likeSQLite
    }

    const post = new Posts(
        postWithCreatorDB.id,
        postWithCreatorDB.content,
        postWithCreatorDB.likes,
        postWithCreatorDB.dislikes,
        postWithCreatorDB.comments,
        postWithCreatorDB.created_at,
        postWithCreatorDB.updated_at,
        postWithCreatorDB.creator_id,
        postWithCreatorDB.creator_name
    )

    const likeDislikeExists = await this.postDatabase
        .findLikeDislike(likeDislikeDB)

    if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
        if (like) {
            await this.postDatabase.removeLikeDislike(likeDislikeDB)
            post.removeLike()
        } else {
            await this.postDatabase.updateLikeDislike(likeDislikeDB)
            post.removeLike()
            post.addDislike()
        }

    } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
        if (like) {
            await this.postDatabase.updateLikeDislike(likeDislikeDB)
            post.removeDislike()
            post.addLike()
        } else {
            await this.postDatabase.removeLikeDislike(likeDislikeDB)
            post.removeDislike()
        }

    } else {
        await this.postDatabase.likeOrDislikePost(likeDislikeDB)

        like ? post.addLike() : post.addDislike()
    }

    const updatedPostDB = post.toDBModel()

    await this.postDatabase.update(idToLikeOrDislike, updatedPostDB)
}
}