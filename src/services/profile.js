import { supabase } from '@/services/supabase'

const BUCKET = 'avatars'
const localKey = (userId) => `pi-avatar-${userId}`

export function getLocalAvatar(userId) {
  try {
    return localStorage.getItem(localKey(userId)) || ''
  } catch {
    return ''
  }
}

export function avatarOf(user) {
  return user?.user_metadata?.avatar_url || (user ? getLocalAvatar(user.id) : '') || ''
}

// Center-crops to a square and shrinks to `size` px so the picture stays tiny (~15-30 KB).
function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas
        .getContext('2d')
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      canvas.toBlob(
        (blob) => (blob ? resolve({ blob, dataUrl: canvas.toDataURL('image/jpeg', 0.85) }) : reject(new Error('Could not process image'))),
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Please choose a valid image (JPG, PNG or WebP)'))
    }
    img.src = url
  })
}

/**
 * Returns { url, deviceOnly }.
 *  - url:        picture URL to keep in the user's profile
 *  - deviceOnly: true when Supabase Storage was unavailable and the picture is kept in this browser only
 */
export async function uploadAvatar(user, file) {
  if (!file?.type?.startsWith('image/')) throw new Error('Please choose an image file')
  if (file.size > 8 * 1024 * 1024) throw new Error('Image is too large (max 8 MB)')
  const { blob, dataUrl } = await resizeImage(file)

  if (!supabase || user.id === 'local') return { url: dataUrl, deviceOnly: false }

  try {
    const path = `${user.id}/avatar.jpg`
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: `${data.publicUrl}?v=${Date.now()}`, deviceOnly: false }
  } catch {
    localStorage.setItem(localKey(user.id), dataUrl)
    return { url: '', deviceOnly: true, dataUrl }
  }
}

export async function removeAvatar(user) {
  try {
    localStorage.removeItem(localKey(user.id))
  } catch {
    /* ignore */
  }
  if (supabase && user.id !== 'local') {
    await supabase.storage.from(BUCKET).remove([`${user.id}/avatar.jpg`]).catch(() => {})
  }
}

// "+91 98765-43210" / "098765 43210" -> "9876543210"
export function normalizePhone(value) {
  let d = String(value || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1)
  return d
}
export const isValidPhone = (v) => /^\d{10}$/.test(normalizePhone(v))
