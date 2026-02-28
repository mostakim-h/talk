const ImageSkeleton = ({ count = 1, isGrid = false }: { count?: number; isGrid?: boolean }) => {
  const gridColsClass = isGrid ? "grid-cols-2" : "grid-cols-1";
  const itemCount = Math.min(count, isGrid ? 2 : 1);

  return (
    <div className={`grid gap-2 ${gridColsClass}`}>
      {[...Array(itemCount)].map((_, index) => (
        <div
          key={index}
          className="w-48 h-48 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded-lg overflow-hidden"
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageSkeleton;
