import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFile, mkdir } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const outDir = join(process.cwd(), '.vercel', 'output/static')
const outFile = join(outDir, 'screenshot-bundle.mjs')

// Ensure output directory exists
await mkdir(outDir, { recursive: true })

// Bundle the script
await build({
  entryPoints: [join(__dirname, 'take-screenshot.mjs')],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  outfile: outFile,
  external: ['playwright'],
  format: 'esm',
  banner: {
    js: "// @ts-ignore\nimport { createRequire } from 'module';\nconst require = createRequire(import.meta.url);",
  },
})

console.log(`Screenshot script bundled successfully to ${outFile}`)
