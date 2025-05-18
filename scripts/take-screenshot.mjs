// scripts/take-screenshot.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { z } from 'zod'; // MCP SDK uses zod internally, useful for validation

const UrlSchema = z.string().url();

async function run() {
  const targetUrl = process.argv[2];

  // Validate URL input
  try {
    UrlSchema.parse(targetUrl);
  } catch (error) {
    console.error('Invalid URL provided:', targetUrl);
    process.exit(1);
  }

  // Configure the transport to launch the @playwright/mcp server via npx
  // We add --vision to ensure screenshot capabilities work as expected visually
  // We add --headless for potentially running without a GUI visible
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['@playwright/mcp@latest', '--headless', '--viewport-size=1720,920'], // Add other flags like --browser if needed
  });

  const client = new Client(
    {
      name: 'nextjs-poc-client',
      version: '1.0.0',
    },
    {
      // Declare capabilities we intend to use (optional but good practice)
      capabilities: {
        tools: {},
      },
    }
  );

  try {
    // Connect using the transport (this launches the server process)
    await client.connect(transport);
    console.error(`MCP Client connected. Navigating to: ${targetUrl}`); // Log to stderr

    // Navigate
    await client.callTool({
      name: 'browser_navigate',
      arguments: { url: targetUrl },
    });
    console.error('Navigation complete. Taking screenshot...'); // Log to stderr

    // await client.callTool({
    //   name: 'browser_wait_for',
    //   arguments: { time: 3 },
    // });

    

    // Step 3: Get accessibility snapshot of the current page
    const snapshot = await client.callTool({name: 'browser_snapshot'});
    console.error('Accessibility Snapshot Retrieved');
    console.error(JSON.stringify(snapshot, null, 2));


    // // Attempt to click the "Reject All" button
    try {
      await client.callTool({
        name: 'browser_click',
        arguments: { element: 'Reject the use of cookies and other data for the purposes described', ref: 'e256' },
      });
      console.error('"Reject All" button clicked successfully.'); // Log to stderr
    } catch (error) {
      console.error('"Reject All" button not found or click failed. Continuing without clicking.'); // Log to stderr
    }


    

    try {
      await client.callTool({
        name: 'browser_press_key',
        arguments: { key: 'F'},
      });
      console.error('"F" key pressed successfully.'); // Log to stderr
    } catch (error) {
      console.error('"F" key NOT  pressed'); // Log to stderr
    }

    await client.callTool({
      name: 'browser_wait_for',
      arguments: { time: 3 },
    });

    // Take screenshot - assuming 'raw: true' gives base64 PNG based on docs
    // The exact response structure needs careful checking. Let's assume it's in result.content[0].text or similar
     const result = await client.callTool({
       name: 'browser_take_screenshot',
       arguments: { raw: false }, // Request raw PNG data
     });
    console.error('Screenshot taken. Processing result...'); // Log to stderr

    // --- Add this line to inspect the actual result object ---
    // console.error('MCP Screenshot RAW Result:', JSON.stringify(result, null, 2));

    // --- IMPORTANT: Inspect the actual 'result' object ---
    // You might need to `console.error(JSON.stringify(result, null, 2))` here
    // during testing to find where the base64 data actually resides.
    // Common patterns: result.content[0].text, result.content[0].base64, result.base64Data etc.
    // Assuming it's result.content[0].text for now based on other tool examples.
    // Adjust the line below based on your findings!
    // -----------------------------------------------------
    let base64Data = '';
    // console.error(result)
    if (result?.content?.[0]?.data && result?.content?.[0]?.type === 'image') {
        base64Data = result.content[0].data;
        console.error("Successfully extracted base64 data from result.content[0].data");
    } else {
         console.error('Could not find base64 data in the expected structure: result.content[0].data');
    }
    // ----------------------------------------------------

    // Print ONLY the base64 data to standard output IF found
    if (base64Data) {
        process.stdout.write(base64Data);
    } else {
        process.stdout.write(''); // Ensure nothing is written if extraction failed
        console.error("No base64 data extracted, writing empty stdout.");
    }

  } catch (error) {
    console.error('MCP Script log:', error);
    process.exit(1); // Exit with log code
  } finally {
    // Ensure disconnection happens
    if (client.state === 'connected') {
      console.error('Disconnecting MCP client...'); // Log to stderr
      await client.disconnect();
      console.error('MCP Client disconnected.'); // Log to stderr
    }
  }
  process.exit(0); // Explicit success exit
}

run();
