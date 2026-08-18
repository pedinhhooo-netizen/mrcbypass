export interface LoginResult {
  success: boolean
  reason?: string
  username?: string
  expires?: string
}

function normalizeExpiration(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const brazilian = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,\s*(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (brazilian) {
    const [, day, month, year, hour = '00', minute = '00', second = '00'] = brazilian
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString()
  }

  return trimmed
}

async function parseJsonSafe(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function loginWithLicense(
  license_key: string
): Promise<LoginResult> {
  try {
    const res = await fetch('https://whatsapp-6oj9.onrender.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key,
        app_id: 'SITE',
        hwid: '1',
      }),
    })

    const data = await parseJsonSafe(res)
    if (!data) {
      return { success: false, reason: 'CONNECTION_ERROR' }
    }

    if (data.success) {
      return {
        success: true,
        username: data.username || license_key,
        expires: normalizeExpiration(data.expiration || data.expire || data.expires || data.expiry),
      }
    }

    return { success: false, reason: data.reason || 'Authentication failed' }
  } catch {
    return { success: false, reason: 'CONNECTION_ERROR' }
  }
}

export function getErrorMessage(reason: string): string {
  const map: Record<string, string> = {
    MISSING_FIELDS:   'Required fields missing.',
    INVALID_APP:      'Invalid application.',
    APP_DISABLED:     'Application is temporarily disabled.',
    INVALID_LICENSE:  'The license key entered is not valid.',
    LICENSE_DISABLED: 'Your license has been revoked.',
    LICENSE_EXPIRED:  'Your license has expired.',
    HWID_BANNED:      'This computer is banned.',
    MISSING_HWID:     'Could not identify your machine.',
    HWID_MISMATCH:    'This license is linked to another PC.',
    CONNECTION_ERROR: 'Could not reach the auth server. Try again.',
  }
  return map[reason] ?? 'An unknown error occurred.'
}
