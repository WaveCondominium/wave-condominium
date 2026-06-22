export function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Wave 1 - Top */}
      <svg
        className="absolute top-0 left-0 w-full h-64 opacity-20"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#60a5fa"
          fillOpacity="0.3"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>

      {/* Wave 2 - Middle */}
      <svg
        className="absolute top-32 left-0 w-full h-64 opacity-10"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#3b82f6"
          fillOpacity="0.4"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </svg>

      {/* Wave 3 - Bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-64 opacity-15"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#93c5fd"
          fillOpacity="0.3"
          d="M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,144C672,128,768,128,864,144C960,160,1056,192,1152,192C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  );
}

export function WaveAccent() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute -bottom-1 left-0 w-full h-24"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          fill="#eff6ff"
          d="M0,50L48,55C96,60,192,70,288,70C384,70,480,60,576,55C672,50,768,50,864,55C960,60,1056,70,1152,70C1248,70,1344,60,1392,55L1440,50L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
        />
      </svg>
    </div>
  );
}

export function FloatingWaves() {
  return (
    <>
      {/* Animated floating wave 1 */}
      <div className="absolute top-1/4 -left-20 w-40 h-40 opacity-10 animate-float">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            fill="#60a5fa"
            d="M45.1,-57.7C58.1,-45.5,68.2,-30.3,71.7,-13.8C75.2,2.7,72.1,20.5,63.3,35.1C54.5,49.7,40,61.1,23.8,66.2C7.6,71.3,-10.3,70.1,-26.6,64.1C-42.9,58.1,-57.6,47.3,-65.8,32.8C-74,18.3,-75.7,0.1,-72.1,-16.5C-68.5,-33.1,-59.6,-48.1,-46.6,-60.3C-33.6,-72.5,-16.8,-81.9,-0.3,-81.5C16.2,-81.1,32.1,-69.9,45.1,-57.7Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      {/* Animated floating wave 2 */}
      <div className="absolute bottom-1/4 -right-20 w-48 h-48 opacity-10 animate-float-delayed">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            fill="#3b82f6"
            d="M40.7,-53.3C51.9,-42.5,59.3,-28.3,62.8,-12.9C66.3,2.5,66,19.1,58.9,32.1C51.8,45.1,37.9,54.5,22.8,60.3C7.7,66.1,-8.6,68.3,-23.5,64.1C-38.4,59.9,-51.9,49.3,-60.3,35.2C-68.7,21.1,-72,3.5,-68.7,-12.7C-65.4,-28.9,-55.5,-43.7,-42.5,-54.3C-29.5,-64.9,-14.8,-71.3,0.4,-71.8C15.6,-72.3,29.5,-64.1,40.7,-53.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </>
  );
}
