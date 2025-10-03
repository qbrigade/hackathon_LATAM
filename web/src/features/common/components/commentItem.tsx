import { User } from "lucide-react";
import { Link } from "wouter";

export type commentItemProps = {
  id: string;
  author: string;
  created_at: string;
  content: string;
  avatar?: string;
};

export function CommentItem({ author, created_at, content, avatar, id }: commentItemProps) {
  return (
    <div className="flex gap-3 py-4">
      <div className="w-8 h-8 rounded-full">
        <Link to={`/u/${id}`}>
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar de usuario"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center border border-[#c5c5c5] rounded-full w-8 h-8">
              <User size={32} strokeWidth={1} />
            </div>
          )}
        </Link>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">
          <Link to={`/u/${id}`}>{author}</Link> <span className="text-gray-500 font-normal">• {created_at}</span>
        </p>
        <p className="text-sm text-gray-700">{content}</p>
        {/* <button className="mt-1 text-xs text-gray-500 hover:underline">Responder</button> */}
      </div>
    </div>
  );
}
