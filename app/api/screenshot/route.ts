import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { z } from 'zod'
import { promises as fs } from 'fs'
import { writeFile, mkdir } from 'fs/promises'

type ScreenshotResult = {
  success: boolean
  imageUrl?: string
  error?: string
  message?: string
}

type ScreenshotRequest = {
  url: string
  name?: string
}

const RequestSchema = z.object({
  url: z.string().url({ message: 'Invalid URL provided' }),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let validatedData
  try {
    const body = await req.json()
    validatedData = RequestSchema.parse(body)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body or URL.' },
      { status: 400 }
    )
  }

  const { url, name } = validatedData
  const scriptPath = path.join(process.cwd(), '.vercel', 'output/static/screenshot-bundle.mjs')
  const outputDir = path.join(process.cwd(), 'static', 'images', 'custom')

  try {
    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true })

    // Generate a filename based on the provided name or use domain and timestamp as fallback
    let filename: string
    if (name) {
      // Remove any invalid filename characters and ensure it ends with .png
      filename = `${name.replace(/[^a-z0-9-]/gi, '_').toLowerCase()}.png`
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const domain = new URL(url).hostname.replace('www.', '')
      filename = `${domain}-${timestamp}.png`
    }
    const outputPath = path.join(outputDir, filename)

    console.log(`API: Attempting to run script: bun run ${scriptPath} ${url}`)

    // Make the script executable and handle the screenshot process
    return fs
      .chmod(scriptPath, '755')
      .then(() => {
        return new Promise<NextResponse>((resolve) => {
          const child = spawn('bun', [scriptPath, url], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: process.env,
          })

          let stdoutData = ''
          let stderrData = ''
          let processError: Error | null = null

          child.stdout.on('data', (data) => {
            stdoutData += data.toString()
          })

          child.stderr.on('data', (data) => {
            const errLine = data.toString().trim()
            if (errLine) {
              console.error(`MCP Script STDERR: ${errLine}`)
              stderrData += errLine + '\n'
            }
          })

          child.on('error', (error) => {
            console.error(`API: Failed to spawn child process: ${error.message}`)
            processError = error
          })

          child.on('close', async (code) => {
            console.log(`API: Child process exited with code ${code}`)

            if (processError) {
              return resolve(
                NextResponse.json(
                  {
                    success: false,
                    error: `Failed to start screenshot process: ${processError.message}`,
                  },
                  { status: 500 }
                )
              )
            }

            if (code !== 0) {
              return resolve(
                NextResponse.json(
                  {
                    success: false,
                    error: `Screenshot script failed (code ${code}). Check server logs.`,
                  },
                  { status: 500 }
                )
              )
            }

            if (!stdoutData) {
              return resolve(
                NextResponse.json(
                  { success: false, error: 'Screenshot script succeeded but returned no data.' },
                  { status: 500 }
                )
              )
            }

            try {
              // Save the screenshot to the filesystem
              await writeFile(outputPath, stdoutData, 'base64')
              const publicUrl = `/static/images/custom/${path.basename(outputPath)}`

              resolve(
                NextResponse.json({
                  success: true,
                  imageUrl: publicUrl,
                  message: 'Screenshot saved successfully',
                })
              )
            } catch (error) {
              console.error('Error saving screenshot:', error)
              resolve(
                NextResponse.json(
                  { success: false, error: 'Failed to save screenshot' },
                  { status: 500 }
                )
              )
            }
          })
        })
      })
      .catch((error) => {
        console.error('API Error:', error)
        return NextResponse.json(
          { success: false, error: 'Internal server error' },
          { status: 500 }
        )
      })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
