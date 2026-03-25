type LogoVariant = 'light' | 'dark';

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

export const MotorsLogo = ({ variant = 'light', className = 'w-full h-full' }: LogoProps) => (
  <svg viewBox="0 0 100 100" className={className}>
    {/* Left Pillar */}
    <path
      d="M10 90V10L40 60V90H10Z"
      fill={variant === 'dark' ? '#FFFFFF' : '#3B3B3B'}
    />
    {/* Right Pillar */}
    <path
      d="M90 90V10L60 60V90H90Z"
      fill={variant === 'dark' ? '#FFB5A0' : '#AC2E00'}
    />
    {/* Connecting Bridge */}
    <path
      d="M40 60L50 45L60 60H40Z"
      fill={variant === 'dark' ? '#FFB5A0' : '#AC2E00'}
      opacity={0.8}
    />
  </svg>
);