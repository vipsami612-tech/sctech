import React, { useEffect, useState } from 'react';
import { isPlaceholderSvgUrl } from '../services/thumbnailService';

interface VideoThumbnailProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackLabel?: string;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackLabel
}) => {
  const cleanSrc = (src || '').trim();
  const isInvalidOrPlaceholder = !cleanSrc || isPlaceholderSvgUrl(cleanSrc);

  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    isInvalidOrPlaceholder ? 'error' : 'loading'
  );

  useEffect(() => {
    if (!cleanSrc || isPlaceholderSvgUrl(cleanSrc)) {
      setStatus('error');
    } else {
      setStatus('loading');
    }
  }, [cleanSrc]);

  if (isInvalidOrPlaceholder || status === 'error') {
    return (
      <div
        className={`relative w-full h-full bg-zinc-900 flex items-center justify-center p-3 text-center select-none ${className}`}
      >
        <div className="space-y-1 max-w-[90%]">
          <div className="w-8 h-0.5 bg-zinc-700 mx-auto rounded-full" />
          <p className="text-[11px] font-medium text-zinc-400 line-clamp-2">
            {fallbackLabel || alt || 'Thumbnail unavailable'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-zinc-900 overflow-hidden ${className}`}>
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-zinc-800 animate-pulse"
        />
      )}
      <img
        src={cleanSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
};
