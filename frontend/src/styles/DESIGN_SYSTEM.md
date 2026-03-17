# Design System Documentation

This document outlines the design system extracted from the new frontend and applied to the existing application.

## Color Palette

### Primary Backgrounds
- **Primary Background**: `#020617` (slate-950) - Main app background
- **Secondary Background**: `rgba(15, 23, 42, 0.5)` (slate-900/50) - Card backgrounds
- **Tertiary Background**: `rgba(30, 41, 59, 0.4)` (slate-800/40) - Nested elements

### Accent Colors
- **Purple Primary**: `#a855f7` (purple-500)
- **Purple Secondary**: `#9333ea` (purple-600)
- **Cyan Primary**: `#06b6d4` (cyan-500)
- **Sky Primary**: `#0ea5e9` (sky-500)
- **Sky Secondary**: `#0284c7` (sky-600)

### Text Colors
- **Primary Text**: `#ffffff` (white)
- **Secondary Text**: `#94a3b8` (slate-400)
- **Tertiary Text**: `#9ca3af` (gray-400)
- **Accent Text**: `#0ea5e9` (sky-500)

### Border Colors
- **Primary Border**: `rgba(255, 255, 255, 0.1)` - Standard borders
- **Secondary Border**: `rgba(255, 255, 255, 0.05)` - Subtle dividers

## Typography

### Font Family
- **Primary**: 'Space Grotesk' - Modern, geometric sans-serif
- **Fallback**: 'Inter', system-ui, sans-serif

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800
- **Black**: 900

### Usage Guidelines
- **Headings**: Use font-black (900) or font-bold (700) with tracking-tighter
- **Body Text**: Use font-medium (500) or font-semibold (600)
- **Small Text**: Use text-xs to text-sm with uppercase and tracking-widest for labels

## Component Patterns

### Glass Morphism
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(35px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
```

**Tailwind Classes**: `bg-white/[0.03] backdrop-blur-3xl border border-white/10`

### Rounded Corners
- **Small**: `rounded-xl` (12px)
- **Medium**: `rounded-2xl` (16px)
- **Large**: `rounded-3xl` (24px)
- **Extra Large**: `rounded-[32px]`, `rounded-[48px]`, `rounded-[60px]`

### Gradients

#### Primary Gradient (Sky to Cyan)
```css
background: linear-gradient(to right, #0ea5e9, #06b6d4);
```
**Tailwind**: `bg-gradient-to-r from-sky-500 to-cyan-500`

#### Accent Gradient (Purple to Pink)
```css
background: linear-gradient(to right, #a855f7, #ec4899);
```
**Tailwind**: `bg-gradient-to-r from-purple-500 to-pink-500`

#### Text Gradient (White to Cyan)
```css
background: linear-gradient(to right, #ffffff, #7dd3fc, #22d3ee);
background-clip: text;
color: transparent;
```
**Tailwind**: `bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent`

## Button Styles

### Primary Button
```tsx
className="relative group"
// Glow effect
<div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
// Button content
<div className="relative bg-gradient-to-r from-sky-500 to-cyan-500 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transform group-hover:scale-105 transition-all duration-300" />
```

### Secondary Button
```tsx
className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
```

## Card Styles

### Primary Card
```tsx
className="relative group"
// Hover glow
<div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
// Card content
<div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500" />
```

### Secondary Card
```tsx
className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
```

## Animations

### Hover Effects
- **Lift**: `transform hover:scale-105 hover:-translate-y-1 transition-all duration-300`
- **Scale**: `transform hover:scale-105 transition-all duration-300`
- **Rotate**: `transform hover:rotate-6 transition-all duration-300`

### Loading Animations
- **Pulse**: `animate-pulse`
- **Spin**: `animate-spin`
- **Slow Spin**: `animate-spin-slow` (4s)
- **Pulse Glow**: `animate-pulse-glow`

### Entrance Animations
- **Fade In**: `animate-fade-in`
- **Slide In Left**: `animate-slide-in-left`
- **Slide In Right**: `animate-slide-in-right`
- **Zoom In**: `animate-zoom-in`

## Spacing

### Consistent Gaps
- **Small**: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)
- **Medium**: `gap-6` (24px), `gap-8` (32px)
- **Large**: `gap-12` (48px), `gap-16` (64px), `gap-20` (80px)

### Padding
- **Cards**: `p-6` to `p-10`
- **Buttons**: `px-6 py-3` to `px-8 py-4`
- **Sections**: `px-6 py-20`

## Shadows

### Glow Effects
- **Sky Glow**: `shadow-[0_0_20px_rgba(14,165,233,0.5)]`
- **Purple Glow**: `shadow-[0_0_20px_rgba(168,85,247,0.5)]`
- **Cyan Glow**: `shadow-[0_0_20px_rgba(6,182,212,0.5)]`

### Standard Shadows
- **Small**: `shadow-lg`
- **Medium**: `shadow-xl`
- **Large**: `shadow-2xl`

## Usage Examples

### Hero Section
```tsx
<section className="relative pt-32 pb-20 px-6">
  <div className="max-w-7xl mx-auto">
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
      <span className="bg-gradient-to-r from-white via-sky-100 to-cyan-200 bg-clip-text text-transparent">
        Your Heading
      </span>
    </h1>
  </div>
</section>
```

### Feature Card
```tsx
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-sky-400/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
  <div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 transform group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500">
    {/* Content */}
  </div>
</div>
```

### Input Field
```tsx
<input
  className="w-full bg-slate-800/80 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
  placeholder="Enter text..."
/>
```

## Best Practices

1. **Consistency**: Always use the defined color palette and spacing system
2. **Accessibility**: Ensure sufficient contrast ratios for text
3. **Performance**: Use backdrop-blur sparingly as it can impact performance
4. **Responsive**: Always include responsive breakpoints (sm, md, lg, xl)
5. **Animations**: Keep animations smooth and purposeful (300-500ms duration)
6. **Glass Effects**: Use glass morphism for overlays and floating elements
7. **Gradients**: Use gradients for CTAs and accent elements
8. **Hover States**: Always provide visual feedback on interactive elements
