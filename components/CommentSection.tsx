// components/CommentSection.tsx
import { useState } from 'react';
import { Comment, CommentWithUser } from '@/types';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/nextjs';
import { Id } from '@/convex/_generated/dataModel';
interface CommentSectionProps {
  comments: CommentWithUser[];
  movieId?: Id<"movies">;
  onCommentAdded: () => void;
}

export default function CommentSection({ comments, movieId, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const { isSignedIn } = useAuth();

  const addComment = useMutation(api.comments.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    if (movieId === undefined) {
      console.error('movieId is undefined');
      return;
    }

    try {
      await addComment({
        movieId,
        content: newComment.trim()
      });

      setNewComment('');
      onCommentAdded();
    } catch (error) {
      
      console.error('Failed to add comment:', error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const formatter = new Intl.RelativeTimeFormat('en', { style: 'short' });
    const seconds = Math.round((timestamp - Date.now()) / 1000);

    if (seconds > -60) return 'just now';
    if (seconds > -3600) return formatter.format(Math.round(seconds / 60), 'minute');
    if (seconds > -86400) return formatter.format(Math.round(seconds / 3600), 'hour');
    return formatter.format(Math.round(seconds / 86400), 'day');
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Comments</h2>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">
              Add a comment
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this movie..."
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
          <p className="text-gray-100">Please sign in to leave a comment.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="font-medium text-gray-300 hover:underline">{comment.user?.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-500 ml-2">
                    {formatTimestamp(comment.createdAt)}
                  </div>
                </div>
                {comment.likes > 0 && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <span className="mr-1">❤️</span>
                    {comment.likes}
                  </div>
                )}
              </div>
              <div className="mt-2 text-gray-100">{comment.content}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}