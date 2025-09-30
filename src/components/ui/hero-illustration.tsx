export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full max-w-2xl mx-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient circles */}
      <defs>
        <radialGradient id="redGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id="blueGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0.1" />
        </radialGradient>
        <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      
      {/* Background elements */}
      <circle cx="650" cy="120" r="80" fill="url(#redGradient)" />
      <circle cx="150" cy="450" r="60" fill="url(#blueGradient)" />
      <circle cx="400" cy="80" r="40" fill="url(#redGradient)" />
      
      {/* Detailed city skyline */}
      <g>
        {/* Building 1 */}
        <rect x="80" y="350" width="60" height="200" fill="url(#buildingGradient)" rx="3" />
        <rect x="90" y="360" width="12" height="15" fill="#fbbf24" opacity="0.8" />
        <rect x="110" y="360" width="12" height="15" fill="#fbbf24" opacity="0.8" />
        <rect x="90" y="390" width="12" height="15" fill="#fbbf24" opacity="0.6" />
        <rect x="110" y="420" width="12" height="15" fill="#fbbf24" opacity="0.8" />
        
        {/* Building 2 */}
        <rect x="150" y="300" width="50" height="250" fill="url(#buildingGradient)" rx="3" />
        <rect x="160" y="320" width="10" height="12" fill="#fbbf24" opacity="0.7" />
        <rect x="175" y="320" width="10" height="12" fill="#fbbf24" opacity="0.9" />
        <rect x="160" y="350" width="10" height="12" fill="#fbbf24" opacity="0.6" />
        <rect x="175" y="350" width="10" height="12" fill="#fbbf24" opacity="0.8" />
        <rect x="160" y="380" width="10" height="12" fill="#fbbf24" opacity="0.7" />
        
        {/* Building 3 */}
        <rect x="210" y="320" width="45" height="230" fill="url(#buildingGradient)" rx="3" />
        <rect x="220" y="340" width="8" height="10" fill="#fbbf24" opacity="0.8" />
        <rect x="235" y="340" width="8" height="10" fill="#fbbf24" opacity="0.6" />
        <rect x="220" y="365" width="8" height="10" fill="#fbbf24" opacity="0.9" />
        <rect x="235" y="365" width="8" height="10" fill="#fbbf24" opacity="0.7" />
        
        {/* Building 4 - Tallest */}
        <rect x="265" y="250" width="70" height="300" fill="url(#buildingGradient)" rx="3" />
        <rect x="275" y="270" width="15" height="18" fill="#fbbf24" opacity="0.8" />
        <rect x="300" y="270" width="15" height="18" fill="#fbbf24" opacity="0.6" />
        <rect x="275" y="300" width="15" height="18" fill="#fbbf24" opacity="0.9" />
        <rect x="300" y="300" width="15" height="18" fill="#fbbf24" opacity="0.7" />
        <rect x="275" y="330" width="15" height="18" fill="#fbbf24" opacity="0.8" />
        <rect x="300" y="330" width="15" height="18" fill="#fbbf24" opacity="0.6" />
        
        {/* Building 5 */}
        <rect x="345" y="330" width="55" height="220" fill="url(#buildingGradient)" rx="3" />
        <rect x="355" y="350" width="12" height="15" fill="#fbbf24" opacity="0.7" />
        <rect x="375" y="350" width="12" height="15" fill="#fbbf24" opacity="0.8" />
        <rect x="355" y="380" width="12" height="15" fill="#fbbf24" opacity="0.6" />
        <rect x="375" y="380" width="12" height="15" fill="#fbbf24" opacity="0.9" />
      </g>
      
      {/* Detailed Emergency Response Scene */}
      <g transform="translate(450, 200)">
        {/* Advanced Ambulance */}
        <rect x="0" y="60" width="120" height="45" rx="8" fill="#dc2626" />
        <rect x="10" y="50" width="20" height="15" fill="#ffffff" rx="2" />
        <rect x="35" y="50" width="20" height="15" fill="#ffffff" rx="2" />
        <rect x="60" y="50" width="20" height="15" fill="#ffffff" rx="2" />
        <rect x="85" y="50" width="25" height="15" fill="#ffffff" rx="2" />
        
        {/* Wheels with detail */}
        <circle cx="25" cy="110" r="12" fill="#374151" />
        <circle cx="25" cy="110" r="8" fill="#6b7280" />
        <circle cx="95" cy="110" r="12" fill="#374151" />
        <circle cx="95" cy="110" r="8" fill="#6b7280" />
        
        {/* Red cross with shadow */}
        <rect x="55" y="65" width="5" height="25" fill="#ffffff" />
        <rect x="47" y="73" width="21" height="5" fill="#ffffff" />
        <rect x="56" y="66" width="5" height="25" fill="#f3f4f6" opacity="0.3" />
        
        {/* Emergency lights */}
        <rect x="5" y="45" width="8" height="4" fill="#ef4444" rx="2" />
        <rect x="107" y="45" width="8" height="4" fill="#ef4444" rx="2" />
      </g>
      
      {/* Detailed People/Community */}
      <g transform="translate(500, 400)">
        {/* Emergency Worker 1 */}
        <circle cx="20" cy="15" r="12" fill="#fbbf24" />
        <ellipse cx="20" cy="30" rx="15" ry="20" fill="#dc2626" />
        <rect x="12" y="35" width="6" height="25" fill="#fbbf24" />
        <rect x="22" y="35" width="6" height="25" fill="#fbbf24" />
        <rect x="14" y="60" width="5" height="18" fill="#374151" />
        <rect x="21" y="60" width="5" height="18" fill="#374151" />
        {/* Helmet */}
        <ellipse cx="20" cy="12" rx="14" ry="10" fill="#fbbf24" />
        <rect x="15" y="8" width="10" height="3" fill="#dc2626" />
        
        {/* Emergency Worker 2 */}
        <circle cx="60" cy="15" r="12" fill="#fbbf24" />
        <ellipse cx="60" cy="30" rx="15" ry="20" fill="#1e40af" />
        <rect x="52" y="35" width="6" height="25" fill="#fbbf24" />
        <rect x="62" y="35" width="6" height="25" fill="#fbbf24" />
        <rect x="54" y="60" width="5" height="18" fill="#374151" />
        <rect x="61" y="60" width="5" height="18" fill="#374151" />
        {/* Safety vest */}
        <rect x="53" y="25" width="14" height="8" fill="#fbbf24" opacity="0.8" />
        
        {/* Civilian */}
        <circle cx="100" cy="15" r="12" fill="#fbbf24" />
        <ellipse cx="100" cy="30" rx="15" ry="20" fill="#6b7280" />
        <rect x="92" y="35" width="6" height="25" fill="#fbbf24" />
        <rect x="102" y="35" width="6" height="25" fill="#fbbf24" />
        <rect x="94" y="60" width="5" height="18" fill="#374151" />
        <rect x="101" y="60" width="5" height="18" fill="#374151" />
      </g>
      
      {/* Communication Network */}
      <g>
        <path
          d="M 200 250 Q 300 180 400 220 Q 500 260 600 200"
          stroke="#dc2626"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
          strokeDasharray="8,4"
        />
        <path
          d="M 150 400 Q 250 350 350 380 Q 450 410 550 360"
          stroke="#1e40af"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
          strokeDasharray="8,4"
        />
        
        {/* Network nodes */}
        <circle cx="200" cy="250" r="6" fill="#dc2626" />
        <circle cx="400" cy="220" r="6" fill="#dc2626" />
        <circle cx="600" cy="200" r="6" fill="#dc2626" />
        <circle cx="150" cy="400" r="6" fill="#1e40af" />
        <circle cx="350" cy="380" r="6" fill="#1e40af" />
        <circle cx="550" cy="360" r="6" fill="#1e40af" />
      </g>
      
      {/* Enhanced Alert Symbols */}
      <g transform="translate(120, 180)">
        <polygon points="20,8 35,40 5,40" fill="#dc2626" />
        <polygon points="21,10 33,38 7,38" fill="#ef4444" />
        <rect x="18" y="18" width="4" height="12" fill="#ffffff" />
        <circle cx="20" cy="34" r="2" fill="#ffffff" />
      </g>
      
      <g transform="translate(600, 300)">
        <polygon points="20,8 35,40 5,40" fill="#dc2626" />
        <polygon points="21,10 33,38 7,38" fill="#ef4444" />
        <rect x="18" y="18" width="4" height="12" fill="#ffffff" />
        <circle cx="20" cy="34" r="2" fill="#ffffff" />
      </g>
      
      {/* Enhanced Shield Symbol */}
      <g transform="translate(300, 120)">
        <path
          d="M 25 10 Q 40 10 40 25 Q 40 45 25 60 Q 10 45 10 25 Q 10 10 25 10"
          fill="#1e40af"
        />
        <path
          d="M 25 15 Q 35 15 35 25 Q 35 40 25 50 Q 15 40 15 25 Q 15 15 25 15"
          fill="#3b82f6"
        />
        <path
          d="M 25 20 L 32 27 L 25 45 L 18 27 Z"
          fill="#ffffff"
        />
      </g>
      
      {/* Helicopter */}
      <g transform="translate(500, 80)">
        <ellipse cx="30" cy="25" rx="40" ry="12" fill="#dc2626" />
        <rect x="10" y="20" width="40" height="10" fill="#dc2626" rx="5" />
        <rect x="25" y="15" width="10" height="5" fill="#374151" />
        {/* Rotor */}
        <line x1="5" y1="25" x2="55" y2="25" stroke="#6b7280" strokeWidth="2" />
        <circle cx="30" cy="25" r="3" fill="#374151" />
        {/* Tail */}
        <rect x="50" y="23" width="20" height="4" fill="#dc2626" />
        <rect x="68" y="20" width="3" height="10" fill="#dc2626" />
      </g>
      
      {/* Radio Tower */}
      <g transform="translate(650, 350)">
        <rect x="15" y="0" width="4" height="120" fill="#6b7280" />
        <line x1="5" y1="30" x2="29" y2="30" stroke="#6b7280" strokeWidth="2" />
        <line x1="8" y1="60" x2="26" y2="60" stroke="#6b7280" strokeWidth="2" />
        <line x1="10" y1="90" x2="24" y2="90" stroke="#6b7280" strokeWidth="2" />
        {/* Signal waves */}
        <path d="M 17 10 Q 25 15 17 20" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.7" />
        <path d="M 17 10 Q 30 18 17 26" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M 17 10 Q 35 20 17 30" stroke="#dc2626" strokeWidth="2" fill="none" opacity="0.3" />
      </g>
      
      {/* Medical Cross Building */}
      <g transform="translate(420, 320)">
        <rect x="0" y="0" width="60" height="80" fill="#ffffff" rx="3" />
        <rect x="5" y="5" width="50" height="70" fill="#f3f4f6" rx="2" />
        <rect x="25" y="15" width="10" height="50" fill="#dc2626" />
        <rect x="10" y="30" width="40" height="10" fill="#dc2626" />
      </g>
    </svg>
  )
}