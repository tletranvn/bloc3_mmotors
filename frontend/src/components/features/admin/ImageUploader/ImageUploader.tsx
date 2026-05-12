import { useRef, useState } from 'react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
const MAX_SIZE_MB = 10

interface Props {
  onUpload: (url: string) => void
  currentImageUrl?: string
}

export default function ImageUploader({ onUpload, currentImageUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`L'image ne doit pas dépasser ${MAX_SIZE_MB} Mo.`)
      return
    }

    setPreview(URL.createObjectURL(file))
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const res = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload échoué')

      const data = await res.json() as { secure_url: string }
      onUpload(data.secure_url)
    } catch {
      setError("L'upload a échoué. Veuillez réessayer.")
      setPreview(currentImageUrl ?? null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {preview && (
        <img
          src={preview}
          alt="Aperçu du véhicule"
          className="w-40 h-28 object-cover rounded border border-black/10"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="hover-btn bg-gray-100 text-foreground text-sm font-medium px-4 py-2 rounded border border-black/10 disabled:opacity-50"
        >
          {isUploading ? 'Upload en cours…' : preview ? 'Changer l\'image' : 'Choisir une image'}
        </button>
        <span className="text-xs text-muted">JPEG ou PNG, max {MAX_SIZE_MB} Mo</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
        data-testid="image-input"
      />

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  )
}
