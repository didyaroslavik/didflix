import didflixMark from '../assets/didflix-mark.png';

/**
 * DidFlix logo.
 *
 * `didflix-mark.png` is your actual logo artwork (transparent background,
 * cropped tight). It scales with the surrounding font size, so just wrap
 * <Logo /> in a text-size utility (text-2xl, text-5xl, etc.) to resize it.
 *
 * - variant="mark"  → icon only, for tight spaces (favicon-style badge)
 * - variant="full"  → icon + "idflix" wordmark, for headers / auth screens
 */
interface LogoProps {
  variant?: 'full' | 'mark';
  className?: string;
}

export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  const mark = (
    <img
      src={didflixMark}
      alt={variant === 'mark' ? 'DidFlix' : ''}
      aria-hidden={variant === 'full'}
      style={{ height: '1em', width: 'auto' }}
      className="inline-block select-none"
      draggable={false}
    />
  );

  if (variant === 'mark') {
    return (
      <span aria-label="DidFlix" role="img" className={`inline-flex items-center ${className}`}>
        {mark}
      </span>
    );
  }

  return (
    <span
      aria-label="DidFlix"
      className={`inline-flex items-center gap-[0.05em] font-display italic font-black tracking-tight select-none ${className}`}
    >
      {mark}
      <span className="text-bone">idflix</span>
    </span>
  );
}
