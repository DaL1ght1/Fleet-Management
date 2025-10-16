# SmartStreet Keycloak Theme

A custom Keycloak login theme designed specifically for SmartStreet Smart Mobility Platform, featuring modern design, responsive layout, and brand-consistent styling.

## Features

- ✨ **Modern Design**: Clean, professional interface with SmartStreet branding
- 🎨 **Brand Colors**: Uses SmartStreet's signature gradient colors (#667eea to #764ba2)
- 📱 **Responsive**: Fully responsive design that works on all devices
- 🌐 **Multi-language**: Support for English and French (easily extensible)
- ♿ **Accessible**: Supports high contrast mode and reduced motion preferences
- 🔒 **Secure**: Built on Keycloak's secure login framework

## Theme Structure

```
smartstreet/
├── login/
│   ├── theme.properties          # Theme configuration
│   ├── template.ftl              # Base template
│   ├── login.ftl                 # Login page template
│   ├── messages/
│   │   ├── messages_en.properties # English messages
│   │   └── messages_fr.properties # French messages
│   └── resources/
│       ├── css/
│       │   └── login.css         # Custom CSS styles
│       └── img/                  # Logo and image assets
│           └── (place your logo here)
```

## Installation Instructions

### Step 1: Copy Theme to Keycloak

1. **Find your Keycloak installation directory**:
   - For standalone: `KEYCLOAK_HOME/themes/`
   - For Docker: Mount as volume to `/opt/keycloak/themes/`

2. **Copy the smartstreet folder**:
   ```bash
   cp -r smartstreet/ /path/to/keycloak/themes/
   ```

### Step 2: Add Your Logo (Optional)

1. Add your SmartStreet logo to `smartstreet/login/resources/img/smartstreet-logo.png`
2. Recommended size: 240x120px (2:1 aspect ratio)
3. Supported formats: PNG, SVG, JPG

### Step 3: Configure in Keycloak Admin Console

1. **Login to Keycloak Admin Console**
2. **Navigate to your Realm** (e.g., "Smart-Street")
3. **Go to Realm Settings → Themes**
4. **Set Login Theme** to "smartstreet"
5. **Click Save**

### Step 4: Test the Theme

1. **Logout of admin console**
2. **Go to your application login URL**
3. **Verify the SmartStreet theme is applied**

## Docker Deployment

If using Docker Compose, add volume mount:

```yaml
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    volumes:
      - ./keycloak-theme/smartstreet:/opt/keycloak/themes/smartstreet:ro
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - "8080:8080"
    command: start-dev
```

## Customization Options

### Colors

Update CSS variables in `resources/css/login.css`:

```css
:root {
  --smartstreet-primary: #667eea;     /* Primary brand color */
  --smartstreet-secondary: #764ba2;   /* Secondary brand color */
  --smartstreet-accent: #4CAF50;      /* Accent color */
  /* ... other colors ... */
}
```

### Logo

1. Replace `resources/img/smartstreet-logo.png` with your logo
2. Update the image reference in `template.ftl` if needed
3. Adjust logo sizing in CSS if necessary

### Messages

Customize text in `messages/messages_*.properties` files:

```properties
# Customize login button text
doLogIn=Sign in to SmartStreet

# Customize page title
loginTitle=SmartStreet - Smart Mobility Platform
```

### Additional Languages

1. Create new message file: `messages/messages_[lang].properties`
2. Add language code to `theme.properties`:
   ```properties
   locales=en,fr,ar,es,[new_lang]
   ```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- High contrast mode support
- Reduced motion support
- Keyboard navigation
- Screen reader friendly
- ARIA labels and roles

## Troubleshooting

### Theme Not Appearing

1. **Verify file permissions**: Ensure Keycloak can read theme files
2. **Check theme name**: Must match folder name exactly
3. **Restart Keycloak**: Theme changes require restart
4. **Clear browser cache**: Hard refresh (Ctrl+F5)

### Styling Issues

1. **Check CSS syntax**: Validate CSS for syntax errors
2. **Verify file paths**: Ensure resource paths are correct
3. **Browser DevTools**: Inspect elements to debug styles
4. **Check console**: Look for 404 errors on resources

### Custom Logo Not Showing

1. **File path**: Verify logo is in `resources/img/` folder
2. **File permissions**: Ensure file is readable
3. **File format**: Use PNG, JPG, or SVG
4. **File size**: Optimize for web (< 100KB recommended)

## Development

For theme development:

1. **Enable theme caching**: Set `KC_SPI_THEME_STATIC_MAX_AGE=-1` in environment
2. **Use browser DevTools**: Inspect and modify styles in real-time
3. **Test responsive design**: Use device emulation
4. **Validate accessibility**: Use accessibility testing tools

## Support

For issues with this theme:

1. Check the troubleshooting section
2. Verify Keycloak version compatibility
3. Test with default theme first
4. Contact your development team

## License

© 2025 SmartStreet. All rights reserved.

This theme is proprietary to SmartStreet Smart Mobility Platform.