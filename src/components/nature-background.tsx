export function NatureBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="floating-petals">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          >
            🌸
          </div>
        ))}
      </div>

      <style>{`
        .floating-petals {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .petal {
          position: absolute;
          top: -50px;
          font-size: 1.5rem;
          opacity: 0.3;
          animation: float linear infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
