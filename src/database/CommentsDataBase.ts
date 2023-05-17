import { CommentsDB, CommentsWithCreatorDB, COMMENTS_LIKE, LikeDislikeCommentsDB } from "../types"
import { BaseDatabase } from "./BaseDatabase"

export class CommentsDatabase extends BaseDatabase {

    public static TABLE_COMMENTS = "comments"
    public static TABLE_LIKES_DISLIKES = "likes_dislikes"
    public static TABLE_COMMENTS_LIKES_DISLIKES = "comments_likes_dislikes"

    public async findCommentsById(id: string): Promise<CommentsDB | undefined> {
        const result: CommentsDB[] = await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .select()
            .where({ id })

        return result[0]
    }

    public getCommentsWithCreators = async (): Promise<CommentsWithCreatorDB[]> => {
        const result: CommentsWithCreatorDB[] = await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .select(
                "comments.id",
                "comments.post_id",
                "comments.user_id",
                "comments.comments",
                "comments.likes",
                "comments.dislikes",
                "comments.created_at",
                "users.name AS creator_name"
            )
            .join("users", "comments.user_id", "=", "users.id")
   console.log(result)
        return result
    }

    public findCommentsWithPostId = async (
        commentsId: string
    ): Promise<CommentsWithCreatorDB | undefined> => {
        const result: CommentsWithCreatorDB[] = await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .select(
                "comments.id",
                "comments.post_id",
                "comments.user_id",
                "comments.comments",
                "comments.likes",
                "comments.dislikes",
                "comments.created_at",
                "post.id"
            )
            .join("posts", "comments.id", "=", "posts.id")
            .where("comments.id", commentsId)

        return result[0]
    }

    public async insertComments(newCommentsDB: CommentsDB): Promise<void> {
        await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .insert(newCommentsDB)
    }

    public async updateComments(newCommentsDB: CommentsDB, id: string): Promise<void> {
        await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .update(newCommentsDB)
            .where({ id })
    }

    public async deleteComments(id: string): Promise<void> {
        await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .delete()
            .where({ id })
    }

    public findCommentsWithCreatorById = async (
       commentsId: string
    ): Promise<CommentsWithCreatorDB | undefined> => {
        const result: CommentsWithCreatorDB[] = await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS)
            .select(
                "comments.id",
                "comments.post_id",
                "comments.user_id",
                "comments.comments",
                "comments.likes",
                "comments.dislikes",
                "comments.created_at",
                "users.name AS creator_name"
            )
            .join("users", "comments.user_id", "=", "users.id")
            .where("comments.id", commentsId)

        return result[0]
    }

    public likeOrDislikeComments = async (likeDislike: LikeDislikeCommentsDB): Promise<void> => {
        await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .insert(likeDislike)
    }

    public findLikeDislike = async (likeDislikeDBToFind: LikeDislikeCommentsDB): Promise<COMMENTS_LIKE | null> => {
        const [likeDislikeDB]: LikeDislikeCommentsDB[] = await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .select()
            .where({
                post_id: likeDislikeDBToFind.post_id,
                user_id: likeDislikeDBToFind.user_id,
                comments_id: likeDislikeDBToFind.comments_id
            })

        if (likeDislikeDB) {
            return likeDislikeDB.like === 1
                ? COMMENTS_LIKE.ALREADY_LIKED
                : COMMENTS_LIKE.ALREADY_DISLIKED

        } else {
            return null
        }
    }

    public removeLikeDislike = async (likeDislikeDB: LikeDislikeCommentsDB): Promise<void> => {
        await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .delete()
            .where({
                post_id: likeDislikeDB.post_id,
                user_id: likeDislikeDB.user_id,
                comments_id: likeDislikeDB.comments_id
            })
    }

    public updateLikeDislike = async (likeDislikeDB: LikeDislikeCommentsDB) => {
        await BaseDatabase
            .connection(CommentsDatabase.TABLE_COMMENTS_LIKES_DISLIKES)
            .update(likeDislikeDB)
            .where({
                post_id: likeDislikeDB.post_id,
                user_id: likeDislikeDB.user_id,
               comments_id: likeDislikeDB.comments_id
            })
    }

}