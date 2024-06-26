import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostComment } from "./PostComment";
import { CreateComment } from "./createComment";

export async function CommentsSection({ postId }: { postId: string }) {
  const session = await getAuthSession();
  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      votes: true,
      author: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />

      <CreateComment postId={postId} />
      <div className='flex flex-col gap-y-4 mt-4'>
        {/* <DisplayComments postId={postId} /> */}
        {comments
          .filter((comment) => !comment.replyToId)
          .map((toplevelComment) => {
            const toplevelCommentsAmt = toplevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
              },
              0
            );
            const toplevelCommentVote = toplevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );
            return (
              <div
                key={toplevelComment.id}
                className='flex flex-col'
              >
                <div className='mb-2'>
                  <PostComment
                    postId={postId}
                    comment={toplevelComment}
                    currentVote={toplevelCommentVote}
                    currentvotesAmt={toplevelCommentsAmt}
                  />
                </div>

                {toplevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                      if (vote.type === "UP") return acc + 1;
                      if (vote.type === "DOWN") return acc - 1;
                      return acc;
                    }, 0);
                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user.id
                    );
                    return (
                      <div
                        key={reply.id}
                        className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'
                      >
                        <PostComment
                          comment={reply}
                          currentVote={replyVote}
                          currentvotesAmt={replyVotesAmt}
                          postId={postId}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
}
