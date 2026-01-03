'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({ 
  width = 120, 
  height = 60,
  showText = false, 
  href,
  className = '' 
}: LogoProps) {
  const logoContent = (
    <div className={`flex items-center ${showText ? 'space-x-2' : ''} ${className}`}>
      <div 
        className="relative flex-shrink-0 transition-transform duration-300 hover:scale-105" 
        style={{ width, height }}
      >
        <Image
          src="/image.png"
          alt="AGRICORNS Logo"
          fill
          className="object-contain"
          priority
          sizes="(max-width: 768px) 100px, 120px"
        />
      </div>
      {showText && (
        <span className="font-heading font-bold text-2xl text-[#2d5016]">
          AGRICORNS
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

