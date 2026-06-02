# ReSonance Lab Logo Package

This package contains the ReSonance Lab logo system:

- `assets/logo-animated.svg` - animated website logo
- `assets/logo-static.svg` - static fallback SVG
- `assets/favicon.svg` - simplified favicon
- `examples/index.html` - minimal implementation example

## Favicon

Place `favicon.svg` in your public/static assets folder and add this to the page `<head>`:

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

## Website Logo

Use the animated SVG directly:

```html
<img
  src="/logo-animated.svg"
  alt="ReSonance Lab"
  width="320"
  height="320"
/>
```

The animation is CSS-only and respects `prefers-reduced-motion`.

## Static Fallback

Use the static mark where animation is not appropriate:

```html
<img
  src="/logo-static.svg"
  alt="ReSonance Lab"
  width="320"
  height="320"
/>
```

## Recommended Placement

For the front page, use the animated logo as the primary mark. The concept is that the visible identity is not the circles themselves, but the field that emerges where they overlap.
