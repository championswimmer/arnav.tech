#!/usr/bin/env bun
/**
 * Reveal.js Slide Thumbnail Generator
 * 
 * Captures a crisp, headless screenshot of the first slide of a Reveal.js presentation
 * and optimizes it using sharp into a lightweight thumbnail/cover image.
 *
 * Usage:
 *   bun run .agents/skills/slides/scripts/generate-thumbnail.ts <slug>
 *   bun run .agents/skills/slides/scripts/generate-thumbnail.ts --all
 *   bun run .agents/skills/slides/scripts/generate-thumbnail.ts --path /path/to/deck --output /path/to/cover.png
 *   bun run .agents/skills/slides/scripts/generate-thumbnail.ts <slug> --update-json
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';
import sharp from 'sharp';

interface Options {
  slug?: string;
  all?: boolean;
  dirPath?: string;
  outputPath?: string;
  updateJson?: boolean;
  width: number;
  height: number;
}

// 1. Locate Chrome / Chromium binary on the system
function findChromeExecutable(): string | null {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  const candidatePaths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    // Linux
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium',
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Check PATH via which
  const commands = ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser', 'brave-browser', 'msedge'];
  for (const cmd of commands) {
    try {
      const resolved = execSync(`which ${cmd} 2>/dev/null`, { encoding: 'utf-8' }).trim();
      if (resolved && fs.existsSync(resolved)) {
        return resolved;
      }
    } catch {
      // not found in path
    }
  }

  return null;
}

// 2. Capture screenshot of the first slide using Headless Chrome
async function captureSlideScreenshot(
  chromePath: string,
  htmlFilePath: string,
  tempImagePath: string,
  width: number = 1280,
  height: number = 720
): Promise<void> {
  const fileUrl = `file://${path.resolve(htmlFilePath)}`;

  const chromeFlags = [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    `--window-size=${width},${height}`,
    `--screenshot=${tempImagePath}`,
    fileUrl,
  ];

  execFileSync(chromePath, chromeFlags, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (!fs.existsSync(tempImagePath) || fs.statSync(tempImagePath).size === 0) {
    throw new Error(`Failed to generate screenshot for ${htmlFilePath}`);
  }
}

// 3. Optimize the thumbnail using sharp
async function optimizeThumbnail(
  sourceTempPath: string,
  destPath: string,
  width: number = 1280,
  height: number = 720
): Promise<void> {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  await sharp(sourceTempPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .png({ quality: 90, compressionLevel: 9, progressive: true })
    .toFile(destPath);
}

// 4. Update src/data/slides.json with the cover path
function updateSlidesJson(slug: string, coverPath: string, rootDir: string) {
  const slidesJsonPath = path.join(rootDir, 'src/data/slides.json');
  if (!fs.existsSync(slidesJsonPath)) return;

  const content = fs.readFileSync(slidesJsonPath, 'utf-8');
  const slides = JSON.parse(content);
  let updated = false;

  for (const slide of slides) {
    if (slide.slug === slug || slide.id === slug) {
      slide.cover = coverPath;
      updated = true;
      break;
    }
  }

  if (updated) {
    fs.writeFileSync(slidesJsonPath, JSON.stringify(slides, null, 2) + '\n', 'utf-8');
    console.log(`Updated cover in src/data/slides.json for "${slug}" -> "${coverPath}"`);
  }
}

// Main execution
async function processDeck(deckDir: string, slug: string, options: Options, chromePath: string, rootDir: string) {
  const htmlFile = path.join(deckDir, 'index.html');
  if (!fs.existsSync(htmlFile)) {
    console.warn(`Skipping ${deckDir}: no index.html found`);
    return;
  }

  const outputCover = options.outputPath || path.join(deckDir, 'cover.png');
  const tempFile = path.join('/tmp', `reveal-thumb-${slug}-${Date.now()}.png`);

  console.log(`Rendering first slide for "${slug}"...`);
  await captureSlideScreenshot(chromePath, htmlFile, tempFile, options.width, options.height);

  console.log(`Optimizing thumbnail -> ${outputCover}`);
  await optimizeThumbnail(tempFile, outputCover, options.width, options.height);

  // Clean up temp
  try {
    fs.unlinkSync(tempFile);
  } catch {}

  const sizeKb = (fs.statSync(outputCover).size / 1024).toFixed(1);
  console.log(`✓ Created thumbnail for "${slug}" (${sizeKb} KB)`);

  if (options.updateJson) {
    const webCoverPath = `/slides/${slug}/deck/cover.png`;
    updateSlidesJson(slug, webCoverPath, rootDir);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const rootDir = process.cwd();

  const options: Options = {
    width: 1280,
    height: 720,
    updateJson: true,
  };

  let explicitSlug: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') {
      options.all = true;
    } else if (arg === '--update-json') {
      options.updateJson = true;
    } else if (arg === '--no-update-json') {
      options.updateJson = false;
    } else if (arg === '--path' && args[i + 1]) {
      options.dirPath = path.resolve(args[++i]);
    } else if (arg === '--output' && args[i + 1]) {
      options.outputPath = path.resolve(args[++i]);
    } else if (arg === '--width' && args[i + 1]) {
      options.width = parseInt(args[++i], 10);
    } else if (arg === '--height' && args[i + 1]) {
      options.height = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-')) {
      explicitSlug = arg;
    }
  }

  const chromePath = findChromeExecutable();
  if (!chromePath) {
    console.error('Error: Google Chrome or Chromium executable not found on this system.');
    console.error('Please install Chrome or set the CHROME_PATH environment variable.');
    process.exit(1);
  }

  const slidesDataDir = path.join(rootDir, 'src/data/slides');

  if (options.dirPath) {
    const slug = explicitSlug || path.basename(options.dirPath);
    await processDeck(options.dirPath, slug, options, chromePath, rootDir);
    return;
  }

  if (options.all) {
    if (!fs.existsSync(slidesDataDir)) {
      console.error(`Slides directory not found: ${slidesDataDir}`);
      process.exit(1);
    }

    const entries = fs.readdirSync(slidesDataDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const deckDir = path.join(slidesDataDir, entry.name);
        if (fs.existsSync(path.join(deckDir, 'index.html'))) {
          await processDeck(deckDir, entry.name, options, chromePath, rootDir);
        }
      }
    }
    return;
  }

  if (explicitSlug) {
    const deckDir = path.join(slidesDataDir, explicitSlug);
    if (!fs.existsSync(deckDir)) {
      console.error(`Slide folder not found: ${deckDir}`);
      process.exit(1);
    }
    await processDeck(deckDir, explicitSlug, options, chromePath, rootDir);
    return;
  }

  console.log('Reveal.js Slide Thumbnail Generator');
  console.log('Usage:');
  console.log('  bun run .agents/skills/slides/scripts/generate-thumbnail.ts <slug>');
  console.log('  bun run .agents/skills/slides/scripts/generate-thumbnail.ts --all');
  console.log('  bun run .agents/skills/slides/scripts/generate-thumbnail.ts --path <dir> [--output <file>]');
}

main().catch((err) => {
  console.error('Fatal error generating thumbnail:', err);
  process.exit(1);
});
