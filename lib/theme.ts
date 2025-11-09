// Centralized brutalist/technical theme inspired by minimal, frame-based design

export const theme = {
  // Typography - Mono everywhere for technical feel
  fonts: {
    mono: "font-mono",
    bold: "font-bold",
    tracking: "tracking-wider",
  },

  // Minimalist borders - white with opacity
  borders: {
    default: "border-white/20",
    heavy: "border-white/30",
    light: "border-white/10",
    accent: "border-2 border-white",
  },

  // Backgrounds - Pure black with subtle overlays
  backgrounds: {
    main: "bg-black",
    card: "bg-black/60 backdrop-blur-lg",
    cardSolid: "bg-black",
    overlay: "bg-black/40 backdrop-blur-sm",
  },

  // Text - White/gray hierarchy
  text: {
    primary: "text-white",
    secondary: "text-gray-300",
    muted: "text-white/60",
    tiny: "text-[10px]",
    small: "text-xs",
    base: "text-sm",
    large: "text-xl",
    xlarge: "text-2xl",
    hero: "text-4xl lg:text-5xl",
  },

  // Buttons - Minimal with borders
  buttons: {
    primary: "bg-transparent border border-white text-white hover:bg-white hover:text-black transition-all duration-200 font-mono text-sm",
    secondary: "bg-white text-black hover:bg-white/90 transition-all duration-200 font-mono text-sm",
    ghost: "bg-transparent text-white/60 hover:text-white transition-all duration-200 font-mono text-sm",
  },

  // Inputs - Minimal with bottom border
  inputs: {
    default: "bg-transparent border-b border-white/30 focus:border-white text-white placeholder:text-white/40 font-mono text-sm rounded-none",
    boxed: "bg-black/60 border border-white/20 focus:border-white/40 text-white placeholder:text-white/40 font-mono text-sm",
  },

  // Decorative elements
  decorative: {
    line: "h-px bg-white",
    dot: "w-1 h-1 bg-white/40 rounded-full",
    corner: "border-white/30",
    divider: "w-8 h-px bg-white",
    infinity: "∞",
  },

  // Status indicators
  status: {
    safe: {
      text: "text-white",
      border: "border-white/30",
      bg: "bg-white/10",
      indicator: "▸",
    },
    warning: {
      text: "text-white/80",
      border: "border-white/20",
      bg: "bg-white/5",
      indicator: "◐",
    },
    danger: {
      text: "text-white/60",
      border: "border-white/10",
      bg: "bg-white/5",
      indicator: "⚠",
    },
  },

  // Layout spacing
  spacing: {
    section: "py-20",
    container: "container mx-auto px-6 lg:px-8",
    cardPadding: "p-8",
  },
}
