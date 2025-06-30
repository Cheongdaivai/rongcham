"use client"

import { useAnimationFrame } from "motion/react"
import { useRef } from "react"

interface AnimatedLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export default function AnimatedLogo({ className = "", size = "lg" }: AnimatedLogoProps) {
  const cubeRef = useRef<HTMLDivElement>(null)

  useAnimationFrame((t) => {
    if (!cubeRef.current) return

    // Clean, fast rotation like the reference cube
    const rotateX = Math.sin(t / 10000) * 200
    const rotateY = (1 + Math.sin(t / 1000)) * -50
    const rotateZ = Math.sin(t / 8000) * 100

    cubeRef.current.style.transform = `
      translateY(${rotateY}px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateZ}deg)
    `
  })

  // Angkor Wat logo with Cambodian flag colors
  const AngkorWatLogo = () => (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <defs>
        {/* Cambodian flag colors */}
        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DE2910" />
          <stop offset="100%" stopColor="#C41E3A" />
        </linearGradient>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#032EA1" />
          <stop offset="100%" stopColor="#002868" />
        </linearGradient>
        <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F5F5" />
        </linearGradient>
      </defs>
      
      {/* Base platform - Red */}
      <rect x="10" y="85" width="100" height="8" fill="url(#redGradient)" stroke="#FFFFFF" strokeWidth="0.5" />
      
      {/* Temple steps - Blue gradient */}
      <rect x="20" y="80" width="80" height="5" fill="url(#blueGradient)" stroke="#FFFFFF" strokeWidth="0.3" />
      <rect x="25" y="75" width="70" height="5" fill="url(#blueGradient)" stroke="#FFFFFF" strokeWidth="0.3" />
      <rect x="30" y="70" width="60" height="5" fill="url(#blueGradient)" stroke="#FFFFFF" strokeWidth="0.3" />
      
      {/* Central tower - White with blue accents */}
      <rect x="52" y="25" width="16" height="45" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="1" />
      
      {/* Central tower top (main spire) - Red */}
      <polygon points="52,25 60,10 68,25" fill="url(#redGradient)" stroke="#FFFFFF" strokeWidth="0.5" />
      
      {/* Side towers - White with blue accents */}
      <rect x="30" y="40" width="12" height="30" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.8" />
      <rect x="78" y="40" width="12" height="30" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.8" />
      
      {/* Side tower tops - Red */}
      <polygon points="30,40 36,28 42,40" fill="url(#redGradient)" stroke="#FFFFFF" strokeWidth="0.5" />
      <polygon points="78,40 84,28 90,40" fill="url(#redGradient)" stroke="#FFFFFF" strokeWidth="0.5" />
      
      {/* Outer towers - Blue */}
      <rect x="15" y="50" width="10" height="20" fill="url(#blueGradient)" stroke="#FFFFFF" strokeWidth="0.5" />
      <rect x="95" y="50" width="10" height="20" fill="url(#blueGradient)" stroke="#FFFFFF" strokeWidth="0.5" />
      
      {/* Outer tower tops - White */}
      <polygon points="15,50 20,42 25,50" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.5" />
      <polygon points="95,50 100,42 105,50" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.5" />
      
      {/* Temple details - White accents */}
      <rect x="54" y="35" width="12" height="2" fill="#FFFFFF" />
      <rect x="54" y="45" width="12" height="2" fill="#FFFFFF" />
      <rect x="54" y="55" width="12" height="2" fill="#FFFFFF" />
      
      {/* Side temple details */}
      <rect x="32" y="50" width="8" height="1.5" fill="#FFFFFF" />
      <rect x="80" y="50" width="8" height="1.5" fill="#FFFFFF" />
      
      {/* Central entrance - Blue */}
      <rect x="58" y="60" width="4" height="10" fill="url(#blueGradient)" />
      
      {/* Decorative elements - Alternating colors */}
      <circle cx="25" cy="65" r="1.5" fill="url(#redGradient)" />
      <circle cx="35" cy="65" r="1.5" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.3" />
      <circle cx="45" cy="65" r="1.5" fill="url(#blueGradient)" />
      <circle cx="55" cy="65" r="1.5" fill="url(#redGradient)" />
      <circle cx="65" cy="65" r="1.5" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.3" />
      <circle cx="75" cy="65" r="1.5" fill="url(#blueGradient)" />
      <circle cx="85" cy="65" r="1.5" fill="url(#redGradient)" />
      <circle cx="95" cy="65" r="1.5" fill="url(#whiteGradient)" stroke="url(#blueGradient)" strokeWidth="0.3" />
    </svg>
  )

  // Get responsive size dimensions
  const getSize = () => {
    switch (size) {
      case 'sm': 
        return { 
          container: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', 
          cube: '48px',
          smCube: '56px',
          mdCube: '64px'
        }
      case 'md': 
        return { 
          container: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24', 
          cube: '64px',
          smCube: '80px',
          mdCube: '96px'
        }
      case 'xl': 
        return { 
          container: 'w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64', 
          cube: '192px',
          smCube: '224px',
          mdCube: '256px'
        }
      default: // lg
        return { 
          container: 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48', 
          cube: '96px',
          smCube: '128px',
          mdCube: '160px',
          lgCube: '192px'
        }
    }
  }

  const sizeConfig = getSize()

  return (
    <div className={`relative ${sizeConfig.container} ${className}`}>
      <div className="cube-container">
        <div ref={cubeRef} className="cube">
          {/* Front Face */}
          <div className="side front">
            <div className="logo-container">
              <AngkorWatLogo />
            </div>
          </div>
          {/* Left Face */}
          <div className="side left">
            <div className="logo-container">
              <AngkorWatLogo />
            </div>
          </div>
          {/* Right Face */}
          <div className="side right">
            <div className="logo-container">
              <AngkorWatLogo />
            </div>
          </div>
          {/* Top Face */}
          <div className="side top">
            <div className="logo-container">
              <AngkorWatLogo />
            </div>
          </div>
          {/* Bottom Face */}
          <div className="side bottom">
            <div className="logo-container">
              <AngkorWatLogo />
            </div>
          </div>
          {/* Back Face */}
          <div className="side back">
            <div className="logo-container">
              <AngkorWatLogo />
            </div>
          </div>
        </div>
      </div>

      {/* Sophisticated Black Glow Effects */}
      <div className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 opacity-20 blur-2xl sm:blur-3xl animate-pulse rounded-full"></div>
      <div className="absolute -inset-2 sm:-inset-3 md:-inset-4 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 opacity-30 blur-lg sm:blur-xl animate-pulse rounded-full"></div>

      <style jsx>{`
        .cube-container {
          perspective: 800px;
          width: ${sizeConfig.cube};
          height: ${sizeConfig.cube};
          margin: 0 auto;
        }

        .cube {
          width: ${sizeConfig.cube};
          height: ${sizeConfig.cube};
          position: relative;
          transform-style: preserve-3d;
        }

        .side {
          position: absolute;
          width: ${sizeConfig.cube};
          height: ${sizeConfig.cube};
          opacity: 0.9;
          border: 2px solid rgba(71, 85, 105, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .logo-container {
          width: 70%;
          height: 70%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }

        .front {
          background: linear-gradient(135deg, #1e293b, #334155);
          transform: rotateY(0deg) translateZ(${parseInt(sizeConfig.cube)/2}px);
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.1);
        }

        .left {
          background: linear-gradient(135deg, #0f172a, #1e293b);
          transform: rotateY(-90deg) translateZ(${parseInt(sizeConfig.cube)/2}px);
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.08);
        }

        .right {
          background: linear-gradient(135deg, #334155, #475569);
          transform: rotateY(90deg) translateZ(${parseInt(sizeConfig.cube)/2}px);
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.12);
        }

        .back {
          background: linear-gradient(135deg, #020617, #0f172a);
          transform: rotateY(180deg) translateZ(${parseInt(sizeConfig.cube)/2}px);
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.06);
        }

        .top {
          background: linear-gradient(135deg, #475569, #64748b);
          transform: rotateX(90deg) translateZ(${parseInt(sizeConfig.cube)/2}px);
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.15);
        }

        .bottom {
          background: linear-gradient(135deg, #020617, #0f172a);
          transform: rotateX(-90deg) translateZ(${parseInt(sizeConfig.cube)/2}px);
          box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.05);
        }

        /* Responsive adjustments */
        @media (min-width: 640px) {
          .cube-container {
            width: ${sizeConfig.smCube || sizeConfig.cube};
            height: ${sizeConfig.smCube || sizeConfig.cube};
          }

          .cube {
            width: ${sizeConfig.smCube || sizeConfig.cube};
            height: ${sizeConfig.smCube || sizeConfig.cube};
          }

          .side {
            width: ${sizeConfig.smCube || sizeConfig.cube};
            height: ${sizeConfig.smCube || sizeConfig.cube};
          }

          .front { transform: rotateY(0deg) translateZ(${parseInt(sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .left { transform: rotateY(-90deg) translateZ(${parseInt(sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .right { transform: rotateY(90deg) translateZ(${parseInt(sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .back { transform: rotateY(180deg) translateZ(${parseInt(sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .top { transform: rotateX(90deg) translateZ(${parseInt(sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .bottom { transform: rotateX(-90deg) translateZ(${parseInt(sizeConfig.smCube || sizeConfig.cube)/2}px); }
        }

        @media (min-width: 768px) {
          .cube-container {
            width: ${sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube};
            height: ${sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube};
          }

          .cube {
            width: ${sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube};
            height: ${sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube};
          }

          .side {
            width: ${sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube};
            height: ${sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube};
          }

          .front { transform: rotateY(0deg) translateZ(${parseInt(sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .left { transform: rotateY(-90deg) translateZ(${parseInt(sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .right { transform: rotateY(90deg) translateZ(${parseInt(sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .back { transform: rotateY(180deg) translateZ(${parseInt(sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .top { transform: rotateX(90deg) translateZ(${parseInt(sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube)/2}px); }
          .bottom { transform: rotateX(-90deg) translateZ(${parseInt(sizeConfig.mdCube || sizeConfig.smCube || sizeConfig.cube)/2}px); }
        }

        ${sizeConfig.lgCube ? `
          @media (min-width: 1024px) {
            .cube-container {
              width: ${sizeConfig.lgCube};
              height: ${sizeConfig.lgCube};
            }

            .cube {
              width: ${sizeConfig.lgCube};
              height: ${sizeConfig.lgCube};
            }

            .side {
              width: ${sizeConfig.lgCube};
              height: ${sizeConfig.lgCube};
            }

            .front { transform: rotateY(0deg) translateZ(${parseInt(sizeConfig.lgCube)/2}px); }
            .left { transform: rotateY(-90deg) translateZ(${parseInt(sizeConfig.lgCube)/2}px); }
            .right { transform: rotateY(90deg) translateZ(${parseInt(sizeConfig.lgCube)/2}px); }
            .back { transform: rotateY(180deg) translateZ(${parseInt(sizeConfig.lgCube)/2}px); }
            .top { transform: rotateX(90deg) translateZ(${parseInt(sizeConfig.lgCube)/2}px); }
            .bottom { transform: rotateX(-90deg) translateZ(${parseInt(sizeConfig.lgCube)/2}px); }
          }
        ` : ''}
      `}</style>
    </div>
  )
} 