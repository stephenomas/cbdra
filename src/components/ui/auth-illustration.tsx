export function AuthIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
          <linearGradient id="emergencyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="peopleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="400" height="300" fill="url(#bgGradient)" />

        {/* Ground */}
        <ellipse cx="200" cy="280" rx="180" ry="15" fill="#D1D5DB" opacity="0.3" />

        {/* Buildings in background */}
        <rect x="50" y="120" width="30" height="80" fill="url(#buildingGradient)" rx="2" />
        <rect x="90" y="100" width="25" height="100" fill="url(#buildingGradient)" rx="2" />
        <rect x="320" y="110" width="35" height="90" fill="url(#buildingGradient)" rx="2" />
        
        {/* Building windows */}
        <rect x="55" y="130" width="4" height="6" fill="#FCD34D" />
        <rect x="65" y="130" width="4" height="6" fill="#FCD34D" />
        <rect x="55" y="150" width="4" height="6" fill="#FCD34D" />
        <rect x="95" y="120" width="4" height="6" fill="#FCD34D" />
        <rect x="105" y="120" width="4" height="6" fill="#FCD34D" />
        <rect x="325" y="130" width="4" height="6" fill="#FCD34D" />
        <rect x="340" y="130" width="4" height="6" fill="#FCD34D" />

        {/* Emergency vehicle */}
        <g transform="translate(150, 220)">
          {/* Vehicle body */}
          <rect x="0" y="10" width="60" height="25" fill="url(#emergencyGradient)" rx="3" />
          {/* Vehicle cabin */}
          <rect x="35" y="0" width="25" height="15" fill="url(#emergencyGradient)" rx="2" />
          {/* Wheels */}
          <circle cx="10" cy="40" r="6" fill="#374151" />
          <circle cx="50" cy="40" r="6" fill="#374151" />
          {/* Emergency light */}
          <rect x="20" y="5" width="8" height="3" fill="#FCD34D" rx="1" />
          {/* Cross symbol */}
          <rect x="15" y="18" width="8" height="2" fill="white" />
          <rect x="18" y="15" width="2" height="8" fill="white" />
        </g>

        {/* People helping each other */}
        <g transform="translate(80, 180)">
          {/* Person 1 - Helper */}
          <circle cx="15" cy="15" r="8" fill="#FBBF24" />
          <rect x="10" y="23" width="10" height="20" fill="url(#peopleGradient)" rx="2" />
          <rect x="8" y="28" width="6" height="12" fill="url(#peopleGradient)" rx="1" />
          <rect x="16" y="28" width="6" height="12" fill="url(#peopleGradient)" rx="1" />
          
          {/* Person 2 - Being helped */}
          <circle cx="35" cy="18" r="8" fill="#FBBF24" />
          <rect x="30" y="26" width="10" height="20" fill="#10B981" rx="2" />
          <rect x="28" y="31" width="6" height="12" fill="#10B981" rx="1" />
          <rect x="36" y="31" width="6" height="12" fill="#10B981" rx="1" />
        </g>

        {/* Communication tower */}
        <g transform="translate(280, 140)">
          <rect x="18" y="0" width="4" height="60" fill="#6B7280" />
          <polygon points="20,0 15,10 25,10" fill="#EF4444" />
          <rect x="16" y="15" width="8" height="2" fill="#6B7280" />
          <rect x="14" y="25" width="12" height="2" fill="#6B7280" />
          <rect x="12" y="35" width="16" height="2" fill="#6B7280" />
          
          {/* Signal waves */}
          <path d="M 30 20 Q 35 15 30 10" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M 32 25 Q 38 20 32 15" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M 34 30 Q 41 25 34 20" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.2" />
        </g>

        {/* Shield/Protection symbol */}
        <g transform="translate(200, 80)">
          <path 
            d="M 0 20 Q 0 10 10 5 Q 20 0 30 5 Q 40 10 40 20 L 40 35 Q 40 45 20 55 Q 0 45 0 35 Z" 
            fill="#10B981" 
            opacity="0.8"
          />
          <path 
            d="M 12 25 L 18 31 L 28 21" 
            stroke="white" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </g>

        {/* Floating particles/dots for connectivity */}
        <circle cx="120" cy="60" r="2" fill="#3B82F6" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="180" cy="45" r="2" fill="#10B981" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="250" cy="70" r="2" fill="#EF4444" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="50" r="2" fill="#F59E0B" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
        </circle>

        {/* Connection lines */}
        <path 
          d="M 120 60 Q 150 40 180 45" 
          stroke="#3B82F6" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.3"
          strokeDasharray="2,2"
        >
          <animate attributeName="stroke-dashoffset" values="0;4" dur="1s" repeatCount="indefinite" />
        </path>
        <path 
          d="M 180 45 Q 215 35 250 70" 
          stroke="#10B981" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.3"
          strokeDasharray="2,2"
        >
          <animate attributeName="stroke-dashoffset" values="0;4" dur="1.2s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  )
}