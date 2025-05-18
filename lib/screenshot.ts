'use client'

type ScreenshotResult = {
  success: boolean
  imageUrl?: string
  error?: string
  message?: string
}

interface ScreenshotOptions {
  url: string
  name?: string
}

export async function takeScreenshot({ url, name }: ScreenshotOptions): Promise<ScreenshotResult> {
  try {
    const response = await fetch('/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error taking screenshot:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
