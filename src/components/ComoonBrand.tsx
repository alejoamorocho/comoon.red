interface ComoonBrandProps {
  size?: number;
  className?: string;
}

export default function ComoonBrand({ size = 28, className = '' }: ComoonBrandProps) {
  // Calculate text size relative to logo size
  const textClass = size >= 40 ? 'text-4xl md:text-6xl' : size >= 32 ? 'text-xl' : 'text-lg';

  return (
    <span className={`group inline-flex items-center gap-1.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 375 375"
        preserveAspectRatio="xMidYMid meet"
        className="transition-transform duration-700 group-hover:rotate-[360deg]"
      >
        <defs>
          <clipPath id={`moon-outer-${size}`}>
            <path
              d="M 59.0625 37.5 L 316.3125 37.5 L 316.3125 337.5 L 59.0625 337.5 Z"
              clipRule="nonzero"
            />
          </clipPath>
          <clipPath id={`moon-inner-${size}`}>
            <path
              d="M 153.1875 92.722656 L 315.9375 92.722656 L 315.9375 282.472656 L 153.1875 282.472656 Z"
              clipRule="nonzero"
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#moon-outer-${size})`}>
          <path
            fill="#9986bf"
            d="M 232.242188 321.746094 C 263.921875 321.746094 293.058594 310.769531 316.019531 292.398438 C 288.84375 320.152344 250.902344 337.367188 208.972656 337.367188 C 126.183594 337.367188 59.0625 270.246094 59.0625 187.457031 C 59.0625 104.671875 126.183594 37.570312 208.972656 37.570312 C 250.902344 37.570312 288.824219 54.785156 316.019531 82.539062 C 293.058594 64.167969 263.921875 53.195312 232.242188 53.195312 C 158.09375 53.195312 97.976562 113.308594 97.976562 187.457031 C 97.976562 261.628906 158.09375 321.722656 232.242188 321.722656 Z"
          />
        </g>
        <g clipPath={`url(#moon-inner-${size})`}>
          <path
            fill="#fdfdfd"
            d="M 206.285156 102.5 C 186.226562 102.5 167.777344 109.449219 153.242188 121.082031 C 170.445312 103.507812 194.46875 92.609375 221.019531 92.609375 C 273.4375 92.609375 315.9375 135.109375 315.9375 187.527344 C 315.9375 239.945312 273.4375 282.429688 221.019531 282.429688 C 194.46875 282.429688 170.460938 271.53125 153.242188 253.957031 C 167.777344 265.589844 186.226562 272.539062 206.285156 272.539062 C 253.234375 272.539062 291.296875 234.472656 291.296875 187.527344 C 291.296875 140.5625 253.234375 102.511719 206.285156 102.511719 Z"
          />
        </g>
      </svg>
      <span className={`font-bold lowercase tracking-tight ${textClass}`}>
        <span className="text-white">co</span>
        <span className="text-comoon-purple">moon</span>
      </span>
    </span>
  );
}
