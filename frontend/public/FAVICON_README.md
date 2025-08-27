# Resume4Me Branding & Favicon Setup

This directory contains the favicon and logo files for the Resume4Me application.

## Files Created

- **`favicon.svg`** - Vector favicon (modern browsers)
- **`favicon.png`** - 32x32 PNG favicon (fallback)
- **`logo192.png`** - 192x192 PNG for Apple touch icon and PWA
- **`logo-modern.svg`** - Modern 200x200 logo with enhanced design
- **`logo-text.svg`** - Text-based logo for headers and branding
- **`manifest.json`** - Web app manifest for PWA support
- **`favicon.ico`** - Traditional ICO format (placeholder)

## Design

The new branding features:
- Professional blue gradient background (#2563EB to #1E40AF)
- Clean white document/resume icon with realistic content lines
- "R4M" branding on favicon for instant recognition
- Modern typography and spacing
- Corner fold effect for document realism
- Consistent color scheme across all assets

## Converting to ICO Format

To create a proper ICO file from the SVG:

1. Install ImageMagick:
   ```bash
   # macOS
   brew install imagemagick
   
   # Ubuntu/Debian
   sudo apt-get install imagemagick
   
   # CentOS/RHEL
   sudo yum install ImageMagick
   ```

2. Run the conversion script:
   ```bash
   cd frontend
   ./convert-favicon.sh
   ```

## Browser Support

- **Modern browsers**: Use SVG favicon (scalable, crisp)
- **Older browsers**: Fall back to PNG favicon
- **iOS/Safari**: Use logo192.png for home screen icon
- **PWA**: Uses manifest.json for app icon

## Customization

To customize the favicon:
1. Edit `favicon.svg` to change colors, design, or layout
2. Run the conversion script to regenerate all formats
3. Update `manifest.json` if you change the theme color

## Colors Used

- Primary Blue: #2563EB
- Dark Blue: #1E40AF
- Border Blue: #1E3A8A
- Accent Blue: #60A5FA
- Text Gray: #64748B
- Light Text: #94A3B8
- Light Gray: #F1F5F9
- White: #FFFFFF

## Branding Guidelines

- **Short Name**: R4M (for favicon and compact spaces)
- **Full Name**: Resume4Me (for headers and marketing)
- **Tagline**: "Professional Resume Builder"
- **Primary Color**: #2563EB (Blue)
- **Secondary Color**: #1E40AF (Dark Blue)
- **Accent Color**: #60A5FA (Light Blue)
