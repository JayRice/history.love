import { Image } from 'react-native';
import React from 'react';

export default function ProfileImage({source, size, className}: {source: string, size: number, className?: string}){
  const sizeInt = parseInt(`${size}`)
  return (
    <Image
      source={{ uri: source }}
      className={"rounded-full " + className}
      style={{ width: sizeInt, height: sizeInt }}
    />
  )
}