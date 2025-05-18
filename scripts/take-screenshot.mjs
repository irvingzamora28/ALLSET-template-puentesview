// scripts/take-screenshot.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { z } from 'zod'

const UrlSchema = z.string().url()

async function run() {
  const targetUrl = process.argv[2]

  // Validate URL input
  try {
    UrlSchema.parse(targetUrl)
  } catch (error) {
    console.error('Invalid URL provided:', targetUrl)
    process.exit(1)
  }

  // Configure the transport to launch the @playwright/mcp server via bunx
  const transport = new StdioClientTransport({
    command: 'bunx',
    args: ['@playwright/mcp@latest', '--headless', '--viewport-size=1720,920'],
  })

  const client = new Client(
    {
      name: 'nextjs-poc-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  try {
    await client.connect(transport)
    console.error(`MCP Client connected. Navigating to: ${targetUrl}`)

    await client.callTool({
      name: 'browser_navigate',
      arguments: { url: targetUrl },
    })
    console.error('Navigation complete. Taking screenshot...')

    const snapshot = await client.callTool({ name: 'browser_snapshot' })
    console.error('Accessibility Snapshot Retrieved')
    console.error(JSON.stringify(snapshot, null, 2))

    try {
      await client.callTool({
        name: 'browser_click',
        arguments: {
          element: 'Reject the use of cookies and other data for the purposes described',
          ref: 'e256',
        },
      })
      console.error('"Reject All" button clicked successfully.')
    } catch (error) {
      console.error('"Reject All" button not found or click failed. Continuing without clicking.')
    }

    try {
      await client.callTool({
        name: 'browser_press_key',
        arguments: { key: 'F' },
      })
      console.error('"F" key pressed successfully.')
    } catch (error) {
      console.error('"F" key NOT pressed')
    }

    await client.callTool({
      name: 'browser_wait_for',
      arguments: { time: 3 },
    })

    const result = await client.callTool({
      name: 'browser_take_screenshot',
      arguments: { raw: false },
    })
    console.error('Screenshot taken. Processing result...')

    let base64Data = ''
    if (result?.content?.[0]?.data && result?.content?.[0]?.type === 'image') {
      base64Data = result.content[0].data
      console.error('Successfully extracted base64 data from result.content[0].data')
    } else {
      console.error('Could not find base64 data in the expected structure: result.content[0].data')
    }

    if (base64Data) {
      process.stdout.write(base64Data)
    } else {
      process.stdout.write('')
      console.error('No base64 data extracted, writing empty stdout.')
    }
  } catch (error) {
    console.error('MCP Script log:', error)
    process.exit(1)
  } finally {
    try {
      // @ts-ignore - The disconnect method exists at runtime
      if (typeof client.disconnect === 'function') {
        console.error('Disconnecting MCP client...')
        // @ts-ignore - The disconnect method exists at runtime
        await client.disconnect()
        console.error('MCP Client disconnected.')
      }
    } catch (error) {
      console.error('Error disconnecting client:', error)
    }
  }
  process.exit(0)
}

run().catch(console.error)
