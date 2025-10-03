export function CommentSkeletonItem() {
  return (
    <div className="flex gap-3 py-4 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-300" />
      <div className="flex-1">
        <p className="text-sm font-semibold bg-gray-300 h-4 w-1/2 mb-2" />
        <p className="text-sm text-gray-700 bg-gray-300 h-4 w-full" />
        {/* <button className="mt-1 text-xs text-gray-500 hover:underline">Responder</button> */}
      </div>
    </div>
  );
}