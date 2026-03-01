import { MessageSquare, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/components/task-details/helpers";
import type { TaskComment } from "@/components/task-details/types";

export function TaskCommentsCard({
  comments,
  commentDraft,
  onCommentDraftChange,
  onAddComment,
  disabled = false,
}: {
  comments: TaskComment[];
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onAddComment: () => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 pt-0">
        <div className="space-y-2">
          {comments.length === 0 ? (
            <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">No comments yet.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground">{comment.author}</span>
                  <span className="text-muted-foreground">{formatDateTime(comment.createdAt) ?? "Just now"}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="new-comment">Add comment</Label>
          <div className="relative">
            <Textarea
              id="new-comment"
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(event.target.value)}
              placeholder={disabled ? "Comments are read-only for workers" : "Share an update or note"}
              className="min-h-24 pr-14 pb-12"
              disabled={disabled}
            />
            <Button
              type="button"
              size="icon-sm"
              className="absolute right-2 bottom-2 rounded-md"
              onClick={onAddComment}
              disabled={disabled || !commentDraft.trim()}
              aria-label="Add comment"
            >
              <SendHorizontal className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
