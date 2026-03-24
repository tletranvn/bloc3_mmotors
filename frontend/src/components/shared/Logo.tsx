interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 24, className = 'text-primary' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="currentColor" />
    </svg>
  )
}
