import Image from "next/image"
import { CldImage } from "next-cloudinary"

interface BrandImageProps {
  src: string            // local path e.g. "/brand/logo.svg" or Cloudinary public_id
  alt: string
  width: number
  height: number
  className?: string
  cloudinaryPublicId?: string  // if provided and CLOUDINARY_CLOUD_NAME is set, uses Cloudinary
}

/**
 * BrandImage — serves brand assets via Cloudinary CDN when configured,
 * falls back to next/image from /public/brand/ otherwise.
 *
 * To activate Cloudinary: set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in env vars,
 * then upload assets to Cloudinary and pass cloudinaryPublicId.
 */
export function BrandImage({ src, alt, width, height, className, cloudinaryPublicId }: BrandImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (cloudName && cloudinaryPublicId) {
    return (
      <CldImage
        src={cloudinaryPublicId}
        alt={alt}
        width={width}
        height={height}
        className={className}
        format="auto"
        quality="auto"
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}
