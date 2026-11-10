import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

// Academic Theme Colors
// Primary Dark Blue: #071A3D (R:7, G:26, B:61)
// Primary Dark Teal/Green: #16958E (R:22, G:149, B:142)
// Secondary Sky Blue: #BCEBFF (R:188, G:235, B:255)
// Pure White: #FFFFFF (R:255, G:255, B:255)
// Accent Gold: #F59E0B (R:245, G:158, B:11)

function generateGraduationCapIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  
  // Safe zone radius: standard Android maskable safe area is 40% of size (inner 80%)
  const safeScale = isMaskable ? 0.68 : 0.82;
  const borderRadius = isMaskable ? 0 : size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Handle standard icon rounded corners
      let inBackground = true;
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx) - (cx - borderRadius));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - borderRadius));
        if (dx * dx + dy * dy > borderRadius * borderRadius) {
          inBackground = false;
        }
      }

      if (!inBackground) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        continue;
      }

      // Background: Deep Navy (#071A3D) to Midnight Teal (#092A45) gradient with soft radial glow
      const t = y / size;
      const distFromCenter = Math.sqrt(Math.pow((x - cx) / (size / 2), 2) + Math.pow((y - cy) / (size / 2), 2));
      const glow = Math.max(0, 1 - distFromCenter * 1.1) * 0.35;

      let rBg = Math.round(7 * (1 - t) + 10 * t + 22 * glow);
      let gBg = Math.round(26 * (1 - t) + 42 * t + 149 * glow * 0.4);
      let bBg = Math.round(61 * (1 - t) + 75 * t + 142 * glow * 0.3);

      // Subtle border ring inside standard icon
      if (!isMaskable && (Math.abs(x - borderRadius) < 2 || Math.abs(x - (size - borderRadius)) < 2 || y < 3 || y > size - 4)) {
        // Soft border
      }

      let r = Math.min(255, rBg);
      let g = Math.min(255, gBg);
      let b = Math.min(255, bBg);
      let a = 255;

      // Normalized coordinates within scaled emblem box (-1 to 1)
      const nx = (x - cx) / (size * 0.5 * safeScale);
      const ny = (y - cy) / (size * 0.5 * safeScale);

      // --- 1. Graduation Cap Diamond (Mortarboard Top) ---
      // Rhombus top: centered slightly above middle (nyOffset = -0.12)
      const diamondY = ny + 0.12;
      // Diamond equation: |nx / 0.88| + |diamondY / 0.36| <= 1
      const diamondDist = Math.abs(nx / 0.88) + Math.abs(diamondY / 0.36);

      // Mortarboard 3D rim/thickness underneath
      const diamondRimDist = Math.abs(nx / 0.88) + Math.abs((diamondY - 0.05) / 0.36);

      // --- 2. Cap Skull Base (The head cap under the board) ---
      // Arc / ellipse underneath
      const skullX = nx / 0.46;
      const skullY = (ny - 0.20) / 0.28;
      const isInsideSkull = (skullX * skullX + skullY * skullY <= 1.0) && (ny >= -0.10);

      // --- 3. Open Book / Academic Pages at the base (symbolizing curriculum & study) ---
      const bookNy = ny - 0.58;
      const bookDistLeft = Math.abs((nx + 0.32) / 0.38) + Math.abs(bookNy / 0.16);
      const bookDistRight = Math.abs((nx - 0.32) / 0.38) + Math.abs(bookNy / 0.16);
      const isBook = (bookDistLeft <= 1.0 || bookDistRight <= 1.0) && (ny >= 0.44 && ny <= 0.76);

      // --- 4. Tassel Ribbon & Hanging Pendant ---
      // Center button on top of cap
      const centerButtonDist = Math.sqrt(nx * nx + (diamondY) * (diamondY));
      const isCenterButton = centerButtonDist <= 0.10;

      // Tassel string hanging from center to the left side
      // Curve: connects (0, -0.12) to (-0.68, 0.28)
      const tasselLineX = -0.66;
      const isTasselHanging = (nx >= -0.70 && nx <= -0.62 && ny >= -0.05 && ny <= 0.42);
      // Tassel knot & brush
      const tasselBrushDist = Math.sqrt(Math.pow((nx - (-0.66)) / 0.09, 2) + Math.pow((ny - 0.45) / 0.14, 2));
      const isTasselBrush = tasselBrushDist <= 1.0;

      // Render elements with appropriate layering and colors:
      if (isCenterButton) {
        // Golden / Teal Center Button
        r = 245; g = 158; b = 11; // Gold #F59E0B
      } else if (diamondDist <= 1.0) {
        // Mortarboard Top surface: Clean Pure White (#FFFFFF) to Sky Blue (#BCEBFF) gradient
        const dShade = (nx * 0.3 - diamondY * 0.7);
        r = Math.round(255 - dShade * 20);
        g = Math.round(255 - dShade * 10);
        b = 255;
      } else if (diamondRimDist <= 1.0 && diamondY > 0) {
        // Mortarboard 3D edge: Academic Teal #16958E
        r = 22; g = 149; b = 142;
      } else if (isInsideSkull) {
        // Skull cap base: Deep Teal / Sky Blue Accent
        if (skullY > 0.6) {
          // Bottom rim of skull cap
          r = 188; g = 235; b = 255; // Sky Blue #BCEBFF
        } else {
          r = 22; g = 149; b = 142; // Teal #16958E
        }
      } else if (isTasselHanging) {
        // Tassel Cord: Warm Gold
        r = 245; g = 158; b = 11;
      } else if (isTasselBrush) {
        // Tassel Fringe: Bright Gold
        r = 251; g = 191; b = 36;
      } else if (isBook) {
        // Open Academic Book Pages: Soft Sky Blue & White
        if (Math.abs(nx) < 0.05) {
          // Spine of book
          r = 22; g = 149; b = 142;
        } else {
          r = 188; g = 235; b = 255;
        }
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }

  return png;
}

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate all standard PWA icon sizes
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

sizes.forEach(size => {
  const icon = generateGraduationCapIcon(size, false);
  const buffer = PNG.sync.write(icon);
  
  fs.writeFileSync(path.join(publicDir, `icon-${size}x${size}.png`), buffer);
  fs.writeFileSync(path.join(publicDir, `pwa-${size}x${size}.png`), buffer);
  
  if (size === 180) {
    fs.writeFileSync(path.join(publicDir, `apple-touch-icon.png`), buffer);
  }
  if (size === 192) {
    fs.writeFileSync(path.join(publicDir, `favicon.png`), buffer);
  }
});

// Generate Maskable 512x512 with safe-zone compliance
const maskableIcon = generateGraduationCapIcon(512, true);
const maskableBuffer = PNG.sync.write(maskableIcon);
fs.writeFileSync(path.join(publicDir, `icon-maskable-512x512.png`), maskableBuffer);
fs.writeFileSync(path.join(publicDir, `pwa-maskable-512x512.png`), maskableBuffer);

console.log('✓ All graduation cap PWA icons generated successfully with dark navy/teal academic theme!');
