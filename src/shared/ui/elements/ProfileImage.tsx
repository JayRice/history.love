import React from 'react';
import RoundedImage from '@/src/shared/ui/elements/RoundedImage';

export default function ProfileImage({source, size, className}: {source: string, size: number, className?: string}) {
  const sizeInt = parseInt(`${size}`)
  return (
    <RoundedImage source={source} size={size} className={className}></RoundedImage>
  )
}