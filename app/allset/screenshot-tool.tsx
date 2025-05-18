'use client'

import { useState, useEffect, useCallback } from 'react'
import { RiCameraLine, RiRefreshLine } from 'react-icons/ri'
import { takeScreenshot } from '@/lib/screenshot'
import Image from 'next/image'

interface ScreenshotTarget {
  name: string
  url: string
}

// Define screenshot targets in one place
const SCREENSHOT_TARGETS: ScreenshotTarget[] = [
  { name: 'cordova-sur', url: 'https://www.youtube.com/watch?v=CZM5TpXLzE8' },
  { name: 'cordova-norte', url: 'https://www.youtube.com/watch?v=mp3RS0y77tY' },
  { name: 'santafe-norte', url: 'https://www.youtube.com/watch?v=0Pg3S6s76IE' },
  { name: 'santafe-sur', url: 'https://www.youtube.com/watch?v=IcvugJWPXz8' },
]

export default function ScreenshotTool() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [screenshots, setScreenshots] = useState<
    Record<string, { url: string; imageUrl: string | undefined }>
  >({})

  const handleTakeScreenshot = useCallback(async (target: ScreenshotTarget) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await takeScreenshot({
        url: target.url,
        name: target.name,
      })

      if (result.success && result.imageUrl) {
        setScreenshots((prev) => ({
          ...prev,
          [target.name]: {
            url: target.url,
            imageUrl: result.imageUrl,
          },
        }))
      } else {
        setError(`Failed to take screenshot of ${target.name}: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error taking screenshot of ${target.name}:`, error)
      setError(`Failed to take screenshot of ${target.name}`)
    } finally {
      setIsLoading(false)
    }
  }, []) // No dependencies needed as it only uses setState and takeScreenshot (which is stable)

  const handleTakeAllScreenshots = useCallback(async () => {
    for (const target of SCREENSHOT_TARGETS) {
      await handleTakeScreenshot(target)
    }
  }, [handleTakeScreenshot])

  // Handle auto-refresh effect
  useEffect(() => {
    if (typeof window === 'undefined' || !isAutoRefresh) return

    // Take initial screenshot immediately when auto-refresh is turned on
    handleTakeAllScreenshots()

    // Set up interval for auto-refresh
    const intervalId = setInterval(handleTakeAllScreenshots, 3000)

    // Clean up interval when component unmounts or auto-refresh is turned off
    return () => clearInterval(intervalId)
  }, [isAutoRefresh, handleTakeAllScreenshots])

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefresh((prev) => !prev)
  }

  return (
    <div className="mt-8 rounded-lg bg-slate-100 p-6 shadow-md dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Screenshot Tool</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleTakeAllScreenshots}
            disabled={isLoading}
            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
              isLoading
                ? 'bg-primary-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            } focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 focus:outline-none`}
          >
            {isLoading ? (
              <RiRefreshLine className="mr-2 animate-spin" />
            ) : (
              <RiCameraLine className="mr-2" />
            )}
            {isLoading ? 'Taking Screenshots...' : 'Take All Screenshots'}
          </button>
          <button
            onClick={toggleAutoRefresh}
            className={`inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm ${
              isAutoRefresh
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
            } focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 focus:outline-none`}
          >
            {isAutoRefresh ? 'Stop Auto-Refresh' : 'Start Auto-Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {SCREENSHOT_TARGETS.map((target) => (
          <div key={target.name} className="rounded-lg border bg-white p-4 dark:bg-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{target.name}</h3>
                <p className="text-sm break-all text-gray-500 dark:text-gray-400">{target.url}</p>
              </div>
              <button
                onClick={() => handleTakeScreenshot(target)}
                disabled={isLoading}
                className="inline-flex items-center rounded border border-transparent bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                <RiRefreshLine className="mr-1" />
                {screenshots[target.name] ? 'Retake' : 'Capture'}
              </button>
            </div>

            {screenshots[target.name] && (
              <div className="mt-3 border-t pt-3">
                <a
                  href={screenshots[target.name].imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image
                    src={screenshots[target.name].imageUrl!}
                    alt={`Screenshot of ${target.url}`}
                    className="h-auto max-w-full rounded border shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = ''
                      target.parentElement?.classList.add('hidden')
                    }}
                  />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
