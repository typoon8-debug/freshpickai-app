# Design Tokens — Mocha Mousse Edition

## Color Palette

### Primary — Mocha Family (Pantone 17-1230 ext.)
| Token | Hex | Usage |
|---|---|---|
| `mocha-50`  | `#FAF4EC` | App canvas / hover bg |
| `mocha-100` | `#F2E7D8` | Card hover / chip bg |
| `mocha-300` | `#DBC1A4` | Dividers / disabled |
| `mocha-400` | `#C2A07F` | Latte secondary |
| `mocha-500` | `#A47551` | Mocha Mousse — secondary brand |
| `mocha-700` | `#6B4A2E` | **Primary** — buttons / links |
| `mocha-900` | `#3B2A1E` | Headings on light |

### Accent — Olive
| Token | Hex | Usage |
|---|---|---|
| `olive-100` | `#E8E5C8` | Tag bg |
| `olive-500` | `#6B7A3B` | **Accent** — CTAs / new badges |
| `olive-700` | `#4A5527` | Hover |

### Supporting
| Token | Hex | Usage |
|---|---|---|
| `paper`    | `#F7F1E6` | App background (warm cream) |
| `card`     | `#FFFFFF` | Card surface |
| `line`     | `#E8DFCF` | Borders |
| `terracotta` | `#B8736A` | Discount / sale price |
| `honey`    | `#D4A04A` | Star ratings |
| `sage`     | `#5C8A7A` | Health score |

### Ink (Text)
| Token | Hex | Usage |
|---|---|---|
| `ink-900` | `#1A1410` | Body text |
| `ink-700` | `#3A302A` | Secondary text |
| `ink-500` | `#7A6E64` | Muted / captions |
| `ink-300` | `#B8AEA2` | Placeholder |

## Typography

### Font Stack
- **Display / Heading:** `Bree Serif` (Google Fonts) — 헤드라인, 카드 타이틀, 브랜드
- **Body / UI:** `Pretendard` (orioncactus CDN) — 본문, 버튼, 라벨, 숫자

### Scale (Mobile-first)
| Role | Size / Line | Weight | Letter |
|---|---|---|---|
| Display XL | 56px / 1.05 | 400 (Bree) | -2px |
| Display    | 30px / 1.15 | 400 (Bree) | -0.8px |
| Heading    | 22px / 1.35 | 400 (Bree) | -0.5px |
| Title      | 17px / 1.3  | 700        | -0.3px |
| Body       | 14px / 1.5  | 400/600    | -0.2px |
| Caption    | 11px / 1.4  | 700 + UPPERCASE + 1.5px tracking | — |
| Label      | 10px / 1    | 800 + UPPERCASE + 2px tracking | — |

## Spacing & Radius
- Spacing scale: `2 / 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 / 32 / 40 / 56`
- **Radius rule (마켓컬리 톤):** mostly `4px` (sharp), special: `50%` (avatars), `100px` (chips, pills)

## Elevation
- `shadow-card`   : `0 1px 0 var(--line)` (paper-flat)
- `shadow-hover`  : `0 12px 28px rgba(107,74,46,0.12)`
- `shadow-cta`    : `0 4px 14px rgba(107,74,46,0.25)`

## Tailwind Mapping (`tailwind.config.ts`)

```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mocha:  { 50:'#FAF4EC',100:'#F2E7D8',300:'#DBC1A4',400:'#C2A07F',500:'#A47551',700:'#6B4A2E',900:'#3B2A1E' },
        olive:  { 100:'#E8E5C8', 500:'#6B7A3B', 700:'#4A5527' },
        paper:  '#F7F1E6',
        line:   '#E8DFCF',
        ink:    { 300:'#B8AEA2', 500:'#7A6E64', 700:'#3A302A', 900:'#1A1410' },
        terracotta:'#B8736A', honey:'#D4A04A', sage:'#5C8A7A',
      },
      fontFamily: {
        display: ['"Bree Serif"', 'serif'],
        sans:    ['Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '2px', DEFAULT: '4px', md: '6px', lg: '8px', pill: '100px' },
      boxShadow: {
        card:  '0 1px 0 #E8DFCF',
        hover: '0 12px 28px rgba(107,74,46,.12)',
        cta:   '0 4px 14px rgba(107,74,46,.25)',
      },
      letterSpacing: { tightest:'-2px', tighter:'-0.8px', tight:'-0.3px', label:'2px' },
    },
  },
};
export default config;
```
