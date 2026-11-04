import { v2 as cloudinary } from "cloudinary"

export const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return

  try {
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split("/").filter(Boolean)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (
      !url.hostname.endsWith("cloudinary.com")
      || !cloudName
      || pathSegments[0] !== cloudName
      || pathSegments[1] !== "image"
      || pathSegments[2] !== "upload"
    ) return

    const publicId = pathSegments
      .slice(3)
      .filter((segment) => !/^v\d+$/.test(segment))
      .join("/")
      .replace(/\.[^/.]+$/, "")

    if (publicId) await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error(`Unable to remove Cloudinary image: ${error.message}`)
  }
}