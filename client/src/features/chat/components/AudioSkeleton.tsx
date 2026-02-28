import { Mic } from "lucide-react";

const AudioSkeleton = () => {
  return (
    <div className="flex items-center gap-2 bg-background/20 p-2 rounded-lg w-64">
      <Mic className="w-4 h-4 flex-shrink-0 text-muted-foreground"/>
      <div className="flex items-center gap-1 flex-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-muted-foreground/40"
            style={{
              height: `${8 + i * 3}px`,
              animation: `pulse 1.2s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioSkeleton;
