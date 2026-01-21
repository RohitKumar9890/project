export default function Logo({ size = 'md', showText = true, className = '' }) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
    xl: { icon: 48, text: 'text-3xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo SVG Icon */}
      <svg 
        width={icon} 
        height={icon} 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background */}
        <rect width="32" height="32" rx="6" fill="#3B82F6"/>
        
        {/* Graduation Cap */}
        <path d="M 8 12 L 16 8 L 24 12 L 24 13 L 16 9 L 8 13 Z" fill="#FFFFFF"/>
        <rect x="15" y="12" width="2" height="4" fill="#FFFFFF"/>
        
        {/* Book */}
        <rect x="10" y="17" width="12" height="8" fill="#FFFFFF" rx="1"/>
        <line x1="16" y1="17" x2="16" y2="25" stroke="#3B82F6" strokeWidth="1"/>
        <line x1="12" y1="20" x2="20" y2="20" stroke="#3B82F6" strokeWidth="0.5"/>
        <line x1="12" y1="22" x2="20" y2="22" stroke="#3B82F6" strokeWidth="0.5"/>
        
        {/* Checkmark */}
        <circle cx="25" cy="9" r="4" fill="#10B981"/>
        <path d="M 23 9 L 24.5 10.5 L 27 8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold text-primary-600 ${text}`}>
            Edu<span className="text-primary-500">Eval</span>
          </span>
        </div>
      )}
    </div>
  );
}
