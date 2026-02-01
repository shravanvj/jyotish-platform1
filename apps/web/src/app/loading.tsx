export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {/* Animated mandala spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-transparent border-t-secondary-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-4 flex items-center justify-center">
            <span className="text-2xl">☉</span>
          </div>
        </div>
        
        <p className="text-muted-foreground animate-pulse">
          Aligning the celestial bodies...
        </p>
      </div>
    </div>
  );
}
