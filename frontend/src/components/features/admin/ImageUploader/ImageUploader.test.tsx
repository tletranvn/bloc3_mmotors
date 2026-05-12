import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageUploader from './ImageUploader'

vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'test-cloud')
vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', 'test-preset')

function makeFile(name: string, sizeBytes: number, type = 'image/jpeg') {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: sizeBytes })
  return file
}

describe('ImageUploader', () => {

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche le bouton "Choisir une image" par défaut', () => {
    render(<ImageUploader onUpload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /choisir une image/i })).toBeInTheDocument()
  })

  it('affiche l\'aperçu quand currentImageUrl est fourni', () => {
    render(<ImageUploader onUpload={vi.fn()} currentImageUrl="https://example.com/car.jpg" />)
    const img = screen.getByRole('img', { name: /aperçu/i })
    expect(img).toHaveAttribute('src', 'https://example.com/car.jpg')
  })

  it('affiche "Changer l\'image" quand une image est déjà présente', () => {
    render(<ImageUploader onUpload={vi.fn()} currentImageUrl="https://example.com/car.jpg" />)
    expect(screen.getByRole('button', { name: /changer l'image/i })).toBeInTheDocument()
  })

  it('affiche une erreur si le fichier dépasse 10 Mo', () => {
    render(<ImageUploader onUpload={vi.fn()} />)
    const input = screen.getByTestId('image-input')
    const bigFile = makeFile('gros.jpg', 11 * 1024 * 1024)
    fireEvent.change(input, { target: { files: [bigFile] } })
    expect(screen.getByText(/ne doit pas dépasser 10 mo/i)).toBeInTheDocument()
  })

  it('n\'appelle pas onUpload si le fichier est trop lourd', () => {
    const onUpload = vi.fn()
    render(<ImageUploader onUpload={onUpload} />)
    const input = screen.getByTestId('image-input')
    const bigFile = makeFile('gros.jpg', 11 * 1024 * 1024)
    fireEvent.change(input, { target: { files: [bigFile] } })
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('accepte un fichier dans la limite (< 10 Mo) et démarre l\'upload', async () => {
    const onUpload = vi.fn()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ secure_url: 'https://res.cloudinary.com/test/image.jpg' }),
    })
    render(<ImageUploader onUpload={onUpload} />)
    const input = screen.getByTestId('image-input')
    const smallFile = makeFile('voiture.jpg', 2 * 1024 * 1024)
    fireEvent.change(input, { target: { files: [smallFile] } })
    expect(screen.getByRole('button', { name: /upload en cours/i })).toBeInTheDocument()
  })

  it('affiche une erreur si l\'upload Cloudinary échoue', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    render(<ImageUploader onUpload={vi.fn()} />)
    const input = screen.getByTestId('image-input')
    const file = makeFile('voiture.jpg', 1 * 1024 * 1024)
    fireEvent.change(input, { target: { files: [file] } })
    await screen.findByText(/l'upload a échoué/i)
  })

})
