# Code Formatting with Prettier

This project uses Prettier for consistent code formatting across the entire
codebase.

## Configuration

- **`.prettierrc.json`** - Prettier configuration with project-specific settings
- **`.prettierignore`** - Files and directories excluded from formatting
- **`eslint.config.mjs`** - ESLint integration with Prettier
- **`.vscode/settings.json`** - VS Code settings for automatic formatting

## Key Settings

- **Print Width**: 100 characters
- **Single Quotes**: Enabled for JavaScript/TypeScript
- **Double Quotes**: Used for JSX attributes
- **Semicolons**: Always required
- **Trailing Commas**: ES5 compatible
- **Arrow Parens**: Avoid when possible

## Available Scripts

```bash
# Format all files
pnpm format

# Check formatting without making changes
pnpm format:check

# Format only staged files (used by pre-commit hook)
pnpm format:staged

# Run ESLint with auto-fix
pnpm lint:fix
```

## Pre-commit Hooks

This project uses Husky and lint-staged to automatically format and lint code
before commits:

1. **Prettier** formats all staged files
2. **ESLint** fixes any auto-fixable issues
3. Commit fails if there are unfixable linting errors

## VS Code Integration

The project includes VS Code settings for:

- **Format on Save**: Automatically format files when saved
- **Format on Paste**: Format pasted code
- **ESLint Auto-fix**: Fix ESLint issues on save
- **Prettier as Default Formatter**: Use Prettier for all supported file types

## File Type Support

Prettier formats the following file types:

- JavaScript/TypeScript (`.js`, `.jsx`, `.ts`, `.tsx`)
- JSON (`.json`)
- CSS/SCSS (`.css`, `.scss`)
- Markdown (`.md`)
- HTML (`.html`)

## Overrides

- **JSON files**: Wider print width (200 characters) for configuration files
- **Markdown files**: Prose wrap and 80 character limit for better readability

## Troubleshooting

If you encounter formatting issues:

1. Check that Prettier is installed: `pnpm list prettier`
2. Verify configuration: `pnpm prettier --check .`
3. Format manually: `pnpm format`
4. Check ESLint integration: `pnpm lint`

## VS Code Extensions

Recommended extensions (see `.vscode/extensions.json`):

- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
