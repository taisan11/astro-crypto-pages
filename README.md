# Astro Encrypted Integration

A powerful Astro integration that provides client-side encryption for HTML content in your Astro applications.

## Features

- **Client-side encryption**: Securely encrypt HTML content with password protection
- **Nested content support**: Handles complex nested HTML structures
- **Multiple encryption classes**: Supports both `custom-ecnrypted` and `encrypted` classes
- **Build-time processing**: Processes content during the build phase for optimal performance
- **Automatic script injection**: Automatically injects decryption scripts into your pages

## Installation

```bash
bunx jsr add jsr:@taisan11/astro-crypto-pages
```

## Usage

### Basic Setup

Add the integration to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import encryptedIntegration from 'astro-crypto-pages';

export default defineConfig({
  integrations: [
    encryptedIntegration({
      password: 'your-secret-password'
    })
  ]
});
```

### Useage

```astro
---
import Encrypted from "astro-crypto-pages/Encrypted"
---
<Encrypted>
Hey
<Encrypted/>

```

## Configuration

### Config Interface

```typescript
interface Config {
  password: string;
}
```

- `password`: The password used for encryption/decryption

## Advanced Features

## Security Notes

- Content is encrypted client-side using the provided password
- The decryption script is injected into each page automatically
- Consider the security implications of client-side encryption for your use case

## API Reference

### `encryptedIntegration(config: Config): AstroIntegration`

The main integration function that returns an Astro integration object.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License
