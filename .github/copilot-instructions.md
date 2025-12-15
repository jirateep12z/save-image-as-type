# Copilot Instructions for Save Image as Type

## Project Overview

Chrome Extension (Manifest V3) ที่แปลงและดาวน์โหลดรูปภาพเป็นฟอร์แมตต่างๆ (JPG, PNG, WebP) ใช้ React + TypeScript + Vite + Tailwind CSS

## Architecture

### Entry Points (3 bundles แยกกัน)

- **Popup** (`src/popup/Popup.tsx`) - React UI สำหรับตั้งค่าและจัดการ queue
- **Background** (`src/background/index.ts`) - Service Worker จัดการ context menu, messaging, storage
- **Content** (`src/content/index.ts`) - Inject toast notifications เข้า webpage

### Data Flow

```
Context Menu Click → Background Service Worker → chrome.storage → Badge Update
                                              → Content Script (Toast)
                                              → chrome.downloads API
Popup UI → chrome.runtime.sendMessage → Background → chrome.storage → Response
```

### Key Services (`src/background/services/`)

- `context-menu.service.ts` - สร้าง right-click menu
- `image.service.ts` - Fetch, convert (OffscreenCanvas), download images
- `queue.service.ts` - จัดการ image queue ใน `chrome.storage.local`
- `message-handler.service.ts` - Handle messages จาก popup (`get-queue`, `download-all`, etc.)
- `toast.service.ts` - ส่ง toast ไป content script via `chrome.scripting.executeScript`

## Naming Conventions (สำคัญมาก!)

### Variables & Functions

- **snake_case** สำหรับ variables, parameters: `selected_type`, `image_url`, `tab_id`
- **PascalCase** สำหรับ functions: `CreateContextMenus()`, `FetchImageAsBlob()`, `HandleMessage()`
- **UPPER_CASE** สำหรับ constants: `IMAGE_TYPES`, `MENU_ID_PREFIX`, `TOAST_CONTAINER_ID`

### Files & Folders

- **kebab-case** สำหรับไฟล์: `context-menu.service.ts`, `image.constants.ts`
- Services ใช้ suffix `.service.ts`
- Constants ใช้ suffix `.constants.ts`
- Types ใช้ suffix `.types.ts`

## Project Patterns

### Barrel Exports

ทุก folder มี `index.ts` สำหรับ re-export:

```typescript
// src/constants/index.ts
export { IMAGE_TYPES } from './image.constants';
export { MENU_ID_PREFIX, PARENT_MENU_ID } from './menu.constants';
```

**Import ผ่าน `@/constants`, `@/types`, `@/utils` เสมอ** (path alias ใน `vite.config.ts`)

### Type Derivation

Types derive จาก constants ด้วย `typeof`:

```typescript
// src/types/image.types.ts
export type ImageTypeId = (typeof IMAGE_TYPES)[number]['id']; // 'jpg' | 'png' | 'webp'
```

### Storage Keys

- `chrome.storage.sync` - User preferences: `'default-image-type'`
- `chrome.storage.local` - Queue data: `'image-queue'`

### Message Actions

Popup ↔ Background ใช้ action strings:

- `get-queue`, `remove-from-queue`, `clear-queue`, `download-all`

## Build & Development

```bash
npm run dev     # Development server (popup preview only)
npm run build   # Build to dist/ for Chrome extension
npm run lint    # ESLint fix
npm run format  # Prettier format
```

### Load Extension

1. `npm run build`
2. Chrome → `chrome://extensions/` → Developer mode → Load unpacked → select `dist/`

## Adding New Image Format

1. เพิ่มใน `src/constants/image.constants.ts`:
   ```typescript
   { id: 'gif', label: 'GIF', mimeType: 'image/gif', extension: '.gif' }
   ```
2. Type `ImageTypeId` จะ update อัตโนมัติ
3. Context menu และ UI จะแสดงฟอร์แมตใหม่อัตโนมัติ (loop จาก `IMAGE_TYPES`)

## UI Components

ใช้ Radix UI primitives + Tailwind CSS + CVA (class-variance-authority):

- Components อยู่ที่ `src/components/ui/`
- Variants แยกไฟล์: `button-variants.ts`
- Icons ใช้ `lucide-react`
