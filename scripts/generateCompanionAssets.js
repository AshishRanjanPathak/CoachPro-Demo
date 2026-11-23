const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'companion');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Welcoming Bonobo (smiling warmly, waving, red headband)
const welcomingSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#1A2234" />
      <stop offset="100%" stop-color="#090D16" />
    </radialGradient>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3D291F" />
      <stop offset="100%" stop-color="#231711" />
    </linearGradient>
    <linearGradient id="chestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#553A2C" />
      <stop offset="100%" stop-color="#38241A" />
    </linearGradient>
    <linearGradient id="headbandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="50%" stop-color="#F97316" />
      <stop offset="100%" stop-color="#EF4444" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Circle Canvas -->
  <rect width="512" height="512" rx="64" fill="url(#bgGrad)" />
  
  <!-- Subtle Gym Ambient Light -->
  <circle cx="256" cy="180" r="160" fill="#F97316" opacity="0.08" filter="url(#softGlow)" />

  <!-- Shadow below character -->
  <ellipse cx="256" cy="450" rx="150" ry="24" fill="#000000" opacity="0.5" />

  <!-- BODY / TORSO -->
  <path d="M150 360 C150 290 190 270 256 270 C322 270 362 290 362 360 C362 430 322 450 256 450 C190 450 150 430 150 360 Z" fill="url(#bodyGrad)" />
  <path d="M185 365 C185 305 215 295 256 295 C297 295 327 305 327 365 C327 425 297 435 256 435 C215 435 185 425 185 365 Z" fill="url(#chestGrad)" />

  <!-- LEFT ARM (Resting) -->
  <path d="M160 300 C130 320 110 370 125 410 C135 430 160 420 165 390 Z" fill="#2E1E17" />

  <!-- RIGHT ARM (Waving Hello Friendly) -->
  <path d="M350 310 C390 290 430 230 420 190 C410 160 380 180 375 220 C360 270 345 285 340 310 Z" fill="#2E1E17" />
  <!-- Waving Hand Palm & Fingers -->
  <circle cx="420" cy="180" r="28" fill="#5A3E31" />
  <circle cx="405" cy="160" r="10" fill="#5A3E31" />
  <circle cx="425" cy="155" r="10" fill="#5A3E31" />
  <circle cx="445" cy="165" r="10" fill="#5A3E31" />

  <!-- EARS -->
  <circle cx="160" cy="210" r="34" fill="#2E1E17" />
  <circle cx="160" cy="210" r="20" fill="#553A2C" />
  <circle cx="352" cy="210" r="34" fill="#2E1E17" />
  <circle cx="352" cy="210" r="20" fill="#553A2C" />

  <!-- HEAD -->
  <path d="M170 205 C170 140 210 115 256 115 C302 115 342 140 342 205 C342 270 302 285 256 285 C210 285 170 270 170 205 Z" fill="url(#bodyGrad)" />

  <!-- FACE MASK (Warm Muzzle) -->
  <path d="M190 205 C190 165 220 160 256 160 C292 160 322 165 322 205 C322 255 292 270 256 270 C220 270 190 255 190 205 Z" fill="#6A4D3D" />

  <!-- RED ATHLETIC HEADBAND -->
  <path d="M165 145 C200 135 312 135 347 145 L345 170 C310 160 202 160 167 170 Z" fill="url(#headbandGrad)" filter="url(#softGlow)" />

  <!-- EYES -->
  <circle cx="225" cy="195" r="16" fill="#FFFFFF" />
  <circle cx="228" cy="195" r="9" fill="#1A1A1A" />
  <circle cx="232" cy="192" r="4" fill="#FFFFFF" />

  <circle cx="287" cy="195" r="16" fill="#FFFFFF" />
  <circle cx="290" cy="195" r="9" fill="#1A1A1A" />
  <circle cx="294" cy="192" r="4" fill="#FFFFFF" />

  <!-- NOSTRILS -->
  <ellipse cx="248" cy="225" rx="4" ry="6" fill="#231711" />
  <ellipse cx="264" cy="225" rx="4" ry="6" fill="#231711" />

  <!-- WARM WELCOMING SMILE -->
  <path d="M228 245 C242 258 270 258 284 245" stroke="#231711" stroke-width="5" stroke-linecap="round" fill="none" />

  <!-- WELCOMING TEXT BADGE -->
  <rect x="180" y="445" width="152" height="34" rx="17" fill="#F97316" />
  <text x="256" y="467" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">WELCOME COACH</text>
</svg>
`;

// 2. Pumped / Focused Bonobo (Workout mode, holding dumbbell, energetic)
const pumpedSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradPumped" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#241B15" />
      <stop offset="100%" stop-color="#090D16" />
    </radialGradient>
    <linearGradient id="bodyGradPumped" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#442E23" />
      <stop offset="100%" stop-color="#231711" />
    </linearGradient>
    <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94A3B8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="64" fill="url(#bgGradPumped)" />
  <circle cx="256" cy="180" r="160" fill="#EF4444" opacity="0.1" />
  <ellipse cx="256" cy="450" rx="150" ry="24" fill="#000000" opacity="0.5" />

  <!-- TORSO -->
  <path d="M150 360 C150 290 190 270 256 270 C322 270 362 290 362 360 C362 430 322 450 256 450 C190 450 150 430 150 360 Z" fill="url(#bodyGradPumped)" />
  <path d="M185 365 C185 305 215 295 256 295 C297 295 327 305 327 365 C327 425 297 435 256 435 C215 435 185 425 185 365 Z" fill="#553A2C" />

  <!-- LEFT ARM (Flexing with Dumbbell) -->
  <path d="M160 310 C120 300 90 240 120 200 C140 180 170 210 160 250 Z" fill="#2E1E17" />
  <!-- DUMBBELL -->
  <rect x="75" y="180" width="22" height="60" rx="6" fill="url(#dbGrad)" />
  <rect x="97" y="202" width="45" height="16" rx="4" fill="#CBD5E1" />
  <rect x="142" y="180" width="22" height="60" rx="6" fill="url(#dbGrad)" />

  <!-- RIGHT ARM (Flexing Bicep) -->
  <path d="M350 310 C390 300 420 240 390 200 C370 180 340 210 350 250 Z" fill="#2E1E17" />
  <circle cx="400" cy="220" r="26" fill="#5A3E31" />

  <!-- EARS -->
  <circle cx="160" cy="210" r="34" fill="#2E1E17" />
  <circle cx="352" cy="210" r="34" fill="#2E1E17" />

  <!-- HEAD -->
  <path d="M170 205 C170 140 210 115 256 115 C302 115 342 140 342 205 C342 270 302 285 256 285 C210 285 170 270 170 205 Z" fill="url(#bodyGradPumped)" />
  <path d="M190 205 C190 165 220 160 256 160 C292 160 322 165 322 205 C322 255 292 270 256 270 C220 270 190 255 190 205 Z" fill="#6A4D3D" />

  <!-- RED HEADBAND -->
  <path d="M165 145 C200 135 312 135 347 145 L345 170 C310 160 202 160 167 170 Z" fill="#EF4444" />

  <!-- DETERMINED FOCUSED EYES -->
  <path d="M210 185 L242 192" stroke="#231711" stroke-width="4" stroke-linecap="round" />
  <circle cx="226" cy="200" r="14" fill="#FFFFFF" />
  <circle cx="228" cy="200" r="8" fill="#1A1A1A" />
  <circle cx="231" cy="197" r="3" fill="#FFFFFF" />

  <path d="M302 185 L270 192" stroke="#231711" stroke-width="4" stroke-linecap="round" />
  <circle cx="286" cy="200" r="14" fill="#FFFFFF" />
  <circle cx="284" cy="200" r="8" fill="#1A1A1A" />
  <circle cx="287" cy="197" r="3" fill="#FFFFFF" />

  <!-- NOSE & CONFIDENT GRIN -->
  <ellipse cx="248" cy="225" rx="4" ry="6" fill="#231711" />
  <ellipse cx="264" cy="225" rx="4" ry="6" fill="#231711" />
  <path d="M225 248 C240 262 272 262 287 248" stroke="#231711" stroke-width="5" stroke-linecap="round" fill="none" />

  <rect x="195" y="445" width="122" height="34" rx="17" fill="#EF4444" />
  <text x="256" y="467" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">PUMPED</text>
</svg>
`;

// 3. Recovery Bonobo (Caring, hydrated, holding water bottle)
const recoverySvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradRec" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#142628" />
      <stop offset="100%" stop-color="#090D16" />
    </radialGradient>
    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#0284C7" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="64" fill="url(#bgGradRec)" />
  <circle cx="256" cy="180" r="160" fill="#10B981" opacity="0.08" />
  <ellipse cx="256" cy="450" rx="150" ry="24" fill="#000000" opacity="0.5" />

  <!-- TORSO -->
  <path d="M150 360 C150 290 190 270 256 270 C322 270 362 290 362 360 C362 430 322 450 256 450 C190 450 150 430 150 360 Z" fill="#382A24" />
  <path d="M185 365 C185 305 215 295 256 295 C297 295 327 305 327 365 C327 425 297 435 256 435 C215 435 185 425 185 365 Z" fill="#4E3930" />

  <!-- WATER BOTTLE IN HAND -->
  <rect x="350" y="270" width="36" height="85" rx="10" fill="url(#bottleGrad)" />
  <rect x="358" y="258" width="20" height="14" rx="4" fill="#E2E8F0" />
  <path d="M350 300 Q368 305 386 300" stroke="#FFFFFF" stroke-width="3" opacity="0.6" fill="none" />

  <!-- EARS -->
  <circle cx="160" cy="210" r="34" fill="#2E1E17" />
  <circle cx="352" cy="210" r="34" fill="#2E1E17" />

  <!-- HEAD -->
  <path d="M170 205 C170 140 210 115 256 115 C302 115 342 140 342 205 C342 270 302 285 256 285 C210 285 170 270 170 205 Z" fill="#382A24" />
  <path d="M190 205 C190 165 220 160 256 160 C292 160 322 165 322 205 C322 255 292 270 256 270 C220 270 190 255 190 205 Z" fill="#6A4D3D" />

  <!-- HEADBAND (Emerald Recovery Green) -->
  <path d="M165 145 C200 135 312 135 347 145 L345 170 C310 160 202 160 167 170 Z" fill="#10B981" />

  <!-- GENTLE CARING EYES -->
  <circle cx="225" cy="195" r="15" fill="#FFFFFF" />
  <circle cx="227" cy="195" r="8" fill="#1A1A1A" />
  <circle cx="230" cy="192" r="3" fill="#FFFFFF" />

  <circle cx="287" cy="195" r="15" fill="#FFFFFF" />
  <circle cx="289" cy="195" r="8" fill="#1A1A1A" />
  <circle cx="292" cy="192" r="3" fill="#FFFFFF" />

  <!-- NOSE & SOFT SMILE -->
  <ellipse cx="248" cy="225" rx="4" ry="6" fill="#231711" />
  <ellipse cx="264" cy="225" rx="4" ry="6" fill="#231711" />
  <path d="M232 248 C244 256 268 256 280 248" stroke="#231711" stroke-width="4" stroke-linecap="round" fill="none" />

  <rect x="185" y="445" width="142" height="34" rx="17" fill="#10B981" />
  <text x="256" y="467" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">RECOVERY</text>
</svg>
`;

// 4. Celebration Bonobo (PR, level up, golden banana trophy)
const celebrationSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGradCel" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#2B2111" />
      <stop offset="100%" stop-color="#090D16" />
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#CA8A04" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" rx="64" fill="url(#bgGradCel)" />
  <circle cx="256" cy="180" r="160" fill="#EAB308" opacity="0.12" />
  <ellipse cx="256" cy="450" rx="150" ry="24" fill="#000000" opacity="0.5" />

  <!-- SPARKLES / STARS -->
  <polygon points="120,130 126,145 142,145 130,154 134,170 120,160 106,170 110,154 98,145 114,145" fill="#FDE047" opacity="0.8" />
  <polygon points="390,130 396,145 412,145 400,154 404,170 390,160 376,170 380,154 368,145 384,145" fill="#FDE047" opacity="0.8" />

  <!-- TORSO -->
  <path d="M150 360 C150 290 190 270 256 270 C322 270 362 290 362 360 C362 430 322 450 256 450 C190 450 150 430 150 360 Z" fill="#3D291F" />
  <path d="M185 365 C185 305 215 295 256 295 C297 295 327 305 327 365 C327 425 297 435 256 435 C215 435 185 425 185 365 Z" fill="#553A2C" />

  <!-- ARMS RAISED CELEBRATING -->
  <path d="M160 310 C120 280 100 200 130 160 C150 140 180 180 165 240 Z" fill="#2E1E17" />
  <path d="M350 310 C390 280 410 200 380 160 C360 140 330 180 345 240 Z" fill="#2E1E17" />

  <!-- GOLDEN BANANA TROPHY (Held in both hands) -->
  <path d="M210 110 C240 85 285 95 305 135 C315 155 300 170 285 160 C270 145 245 130 220 140 Z" fill="url(#goldGrad)" />
  <rect x="246" y="150" width="20" height="25" fill="#A16207" />
  <rect x="236" y="172" width="40" height="14" rx="4" fill="url(#goldGrad)" />

  <!-- EARS -->
  <circle cx="160" cy="210" r="34" fill="#2E1E17" />
  <circle cx="352" cy="210" r="34" fill="#2E1E17" />

  <!-- HEAD -->
  <path d="M170 205 C170 140 210 115 256 115 C302 115 342 140 342 205 C342 270 302 285 256 285 C210 285 170 270 170 205 Z" fill="#3D291F" />
  <path d="M190 205 C190 165 220 160 256 160 C292 160 322 165 322 205 C322 255 292 270 256 270 C220 270 190 255 190 205 Z" fill="#6A4D3D" />

  <!-- HEADBAND -->
  <path d="M165 145 C200 135 312 135 347 145 L345 170 C310 160 202 160 167 170 Z" fill="#EF4444" />

  <!-- CHEERFUL HAPPY EYES -->
  <path d="M214 200 C220 188 234 188 240 200" stroke="#231711" stroke-width="4.5" stroke-linecap="round" fill="none" />
  <path d="M272 200 C278 188 292 188 298 200" stroke="#231711" stroke-width="4.5" stroke-linecap="round" fill="none" />

  <!-- NOSE & BIG JOYFUL GRIN -->
  <ellipse cx="248" cy="225" rx="4" ry="6" fill="#231711" />
  <ellipse cx="264" cy="225" rx="4" ry="6" fill="#231711" />
  <path d="M222 242 C236 268 276 268 290 242 Z" fill="#231711" />
  <path d="M236 244 C246 252 266 252 276 244" fill="#EF4444" />

  <rect x="180" y="445" width="152" height="34" rx="17" fill="#EAB308" />
  <text x="256" y="467" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#1A1A1A" text-anchor="middle" letter-spacing="1.5">RECORD BREAKER</text>
</svg>
`;

async function buildCompanionAssets() {
  console.log("Generating high-definition Bonobo companion artwork...");

  await sharp(Buffer.from(welcomingSvg))
    .png({ quality: 95 })
    .toFile(path.join(outDir, "bonobo-welcoming.png"));

  await sharp(Buffer.from(pumpedSvg))
    .png({ quality: 95 })
    .toFile(path.join(outDir, "bonobo-pumped.png"));

  await sharp(Buffer.from(recoverySvg))
    .png({ quality: 95 })
    .toFile(path.join(outDir, "bonobo-recovery.png"));

  await sharp(Buffer.from(celebrationSvg))
    .png({ quality: 95 })
    .toFile(path.join(outDir, "bonobo-celebration.png"));

  console.log("Successfully generated all 4 companion assets in public/companion/!");
}

buildCompanionAssets().catch(err => {
  console.error("Failed to build companion assets:", err);
  process.exit(1);
});
