# Screenshot Tool

This feature allows you to take screenshots of websites directly from the admin dashboard using Playwright.

## Features

- Take screenshots of any public website
- View recently taken screenshots
- Responsive design that works on all devices
- Dark mode support

## How to Use

1. Navigate to the admin dashboard
2. Click the "Take Screenshot" button
3. The screenshot will be saved to `/public/images/custom/`
4. View the screenshot directly in the dashboard or open it in a new tab

## Technical Details

- Uses Playwright for browser automation
- Screenshots are saved as PNG files with timestamps
- The API endpoint is available at `/api/screenshot`
- The UI is built with React and Tailwind CSS

## Requirements

- Node.js 18 or later
- Playwright browser binaries (installed automatically)

## Development

To test the screenshot functionality locally:

1. Make sure all dependencies are installed:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the admin dashboard at `http://localhost:3000/allset`

## Troubleshooting

- If you encounter any issues, check the browser console and server logs
- Make sure the `/public/images/custom/` directory has write permissions
- Ensure the target website allows iframe embedding (some sites block this)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
