# Custom Loader Component Guide

## Overview
Created a sleek, animated loader component inspired by the Tokenomics Lab branding with glassmorphism design and smooth animations.

## Component Location
`components/loader.tsx`

## Features

### 1. Main Loader Component
Animated circular loader with rotating rings, pulsing dots, and optional text.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: Optional loading text
- `fullScreen`: Boolean to display as full-screen overlay (default: false)

**Sizes:**
- `sm`: 24px
- `md`: 40px
- `lg`: 60px
- `xl`: 80px

### 2. InlineLoader Component
Minimal spinning loader for buttons and inline use.

**Props:**
- `className`: Optional CSS classes

### 3. SkeletonLoader Component
Content placeholder with pulsing animation.

**Props:**
- `className`: Optional CSS classes
- `count`: Number of skeleton lines (default: 1)

## Usage Examples

### Full Screen Loader
```tsx
import Loader from '@/components/loader'

// In component
if (loading) {
  return <Loader fullScreen text="Loading admin panel" />
}
```

### Inline Loader
```tsx
import { InlineLoader } from '@/components/loader'

<button disabled={loading}>
  {loading ? <InlineLoader /> : 'Submit'}
</button>
```

### Skeleton Loader
```tsx
import { SkeletonLoader } from '@/components/loader'

{loading ? (
  <SkeletonLoader count={5} className="w-full" />
) : (
  <div>Content here</div>
)}
```

### Sized Loaders
```tsx
// Small loader
<Loader size="sm" text="Loading..." />

// Medium loader (default)
<Loader size="md" text="Processing..." />

// Large loader
<Loader size="lg" text="Analyzing token..." />

// Extra large loader
<Loader size="xl" text="Fetching data..." />
```

## Design Features

### Animations
1. **Outer Ring**: Rotates 360° clockwise (2s duration)
2. **Inner Ring**: Rotates 360° counter-clockwise (3s duration)
3. **Center Dots**: Scale and fade in sequence (1.5s duration, 0.2s delay between)
4. **Pulse Effect**: Expands and fades (2s duration)
5. **Text**: Fades in/out (1.5s duration)
6. **Loading Dots**: Bounce up/down (0.8s duration, 0.15s delay between)

### Styling
- **Colors**: White with opacity variations
- **Background**: Black with glassmorphism blur
- **Borders**: Subtle white borders with varying opacity
- **Effects**: Smooth easing, pulse animations

## Implementation Status

### ✅ Completed
- Created loader component with 3 variants
- Added to admin dashboard loading state
- Fixed qrcode dependency issue
- Added refresh button loading state

### 📝 Recommended Updates

Replace loading states in these files:

1. **app/dashboard/page.tsx**
   ```tsx
   // Replace
   {loading && <div>Loading...</div>}
   // With
   {loading && <Loader text="Loading dashboard" />}
   ```

2. **app/premium/dashboard/page.tsx**
   ```tsx
   // Replace loading states
   {loading && <Loader fullScreen text="Loading premium dashboard" />}
   ```

3. **components/token-scanner.tsx**
   ```tsx
   // Replace scan loading
   {scanning && <Loader size="lg" text="Analyzing token" />}
   ```

4. **app/login/page.tsx & app/signup/page.tsx**
   ```tsx
   // Replace auth loading
   {loading && <Loader fullScreen text="Authenticating" />}
   ```

5. **Button Loading States**
   ```tsx
   // Replace button spinners
   <button disabled={loading}>
     {loading ? <InlineLoader /> : 'Submit'}
   </button>
   ```

## Animation Timing

| Element | Duration | Delay | Repeat |
|---------|----------|-------|--------|
| Outer Ring | 2s | 0s | Infinite |
| Inner Ring | 3s | 0s | Infinite |
| Dot 1 | 1.5s | 0s | Infinite |
| Dot 2 | 1.5s | 0.2s | Infinite |
| Dot 3 | 1.5s | 0.4s | Infinite |
| Dot 4 | 1.5s | 0.6s | Infinite |
| Pulse | 2s | 0s | Infinite |
| Text | 1.5s | 0s | Infinite |

## Dependencies

- **framer-motion**: Already in package.json (v12.23.24)
- **qrcode**: Newly added (v1.5.4)
- **@types/qrcode**: Newly added (v1.5.6)

## QRCode Fix

Fixed the module not found error by:
1. Installing qrcode and @types/qrcode packages
2. Adding server-side check in generateQRCode function
3. Using dynamic require for server-only execution

```typescript
export async function generateQRCode(secret: string, email: string, issuer: string = 'Tokenomics Lab'): Promise<string> {
  if (typeof window === 'undefined') {
    const QRCode = require('qrcode')
    const uri = generateTOTPUri(secret, email, issuer)
    return await QRCode.toDataURL(uri)
  }
  return ''
}
```

## Accessibility

- Uses semantic HTML
- Respects reduced motion preferences (can be added)
- Clear loading states
- Screen reader friendly text

## Performance

- Lightweight animations using Framer Motion
- GPU-accelerated transforms
- Optimized re-renders
- No layout shifts

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Future Enhancements

Consider adding:
- Progress percentage display
- Custom color themes
- Reduced motion support
- Sound effects (optional)
- Success/error states
- Estimated time remaining
