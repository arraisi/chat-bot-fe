# IntelliJ IDEA-like Prettier Configuration

This project is configured with Prettier settings that closely match IntelliJ IDEA's default formatting preferences.

## Key Settings Applied:

### Code Style

- **Print Width**: 120 characters (matches IntelliJ's default)
- **Tab Width**: 2 spaces for indentation
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings (JavaScript/TypeScript style)
- **Trailing Commas**: ES5 compatible (objects, arrays)

### Spacing & Brackets

- **Bracket Spacing**: `{ foo: bar }` (spaces inside object literals)
- **Bracket Same Line**: False (closing brackets on new line for JSX)
- **Arrow Parens**: Avoid parentheses when possible `x => x`

### Vue.js Specific

- **Vue Indent Script and Style**: True (indent `<script>` and `<style>` blocks)
- **Single Attribute Per Line**: False (allows multiple attributes on same line)

### Import Organization

- **Import Sorting**: Automatic sorting and grouping of imports
- **Import Groups**:
  1. Vue core imports
  2. Vue ecosystem imports
  3. Vuetify imports
  4. Local path imports (`@/`)
  5. Relative imports (`./`, `../`)

## Available Scripts:

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Format only staged files (useful for git hooks)
npm run format:staged

# Lint and fix ESLint issues
npm run lint
```

## VS Code Integration:

The `.vscode/settings.json` file is configured to:

- Format on save automatically
- Use Prettier as the default formatter
- Organize imports on save
- Apply ESLint fixes on save

## IntelliJ IDEA Integration:

1. Install the Prettier plugin in IntelliJ IDEA
2. Go to: Settings → Languages & Frameworks → JavaScript → Prettier
3. Enable "On 'Reformat Code' action" and "On save"
4. Set the Prettier package path to your local `node_modules/prettier`
5. The `.editorconfig` file will ensure consistent indentation settings

## File Types Formatted:

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- Vue Single File Components (`.vue`)
- JSON files (`.json`, `.jsonc`)
- HTML files (`.html`)
- CSS/SCSS files (`.css`, `.scss`)
- Markdown files (`.md`)

## Files Ignored:

See `.prettierignore` for the complete list of ignored files and directories.
