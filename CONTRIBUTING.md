# Contributing to Scrapedo MCP Server

Thank you for your interest in contributing to the Scrapedo MCP Server! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Issues

1. **Check existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Environment (OS, Node version)
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and logs

### Suggesting Features

1. **Open a discussion** first for major features
2. **Provide use cases** and examples
3. **Consider implementation complexity**

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Update documentation** as needed
6. **Submit a PR** with clear description

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- TypeScript knowledge
- Scrapedo API key for testing

### Local Development

```bash
# Clone your fork
git clone https://github.com/your-username/scrapedo-mcp-server.git
cd scrapedo-mcp-server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API key

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Avoid `any` type
- Provide proper type definitions
- Use interfaces over type aliases where appropriate

### Naming Conventions

- **Files**: kebab-case (e.g., `scraping-tools.ts`)
- **Classes**: PascalCase (e.g., `ScrapedoClient`)
- **Functions**: camelCase (e.g., `calculateCredits`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Code Quality

- Write self-documenting code
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Follow DRY principles

## Testing

### Test Structure

```typescript
describe('ToolName', () => {
  describe('method', () => {
    it('should handle normal case', async () => {
      // Test implementation
    });

    it('should handle error case', async () => {
      // Test implementation
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- scraping.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Documentation

### What to Document

- New tools and features
- API changes
- Configuration options
- Breaking changes
- Examples and use cases

### Documentation Style

- Use clear, concise language
- Provide code examples
- Include parameter tables
- Document error conditions

## Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

### Examples

```
feat(tools): add bulk scraping tool

- Implement batch processing for multiple URLs
- Add progress tracking
- Include retry logic for failed requests

Closes #123
```

## Pull Request Process

1. **Update your fork**: Sync with upstream main
2. **Create PR**: Use PR template
3. **Describe changes**: Clear, detailed description
4. **Link issues**: Reference related issues
5. **Pass CI**: Ensure all checks pass
6. **Request review**: Tag maintainers if needed
7. **Address feedback**: Respond to review comments
8. **Squash commits**: Clean history before merge

## Release Process

1. Version bumping follows semver
2. Changelog is automatically generated
3. Releases are tagged and published to npm

## Tool Development

### Adding a New Tool

1. Create tool function in appropriate file
2. Add TypeScript types
3. Implement error handling
4. Add credit calculation
5. Write comprehensive tests
6. Update API documentation
7. Add usage examples

### Tool Template

```typescript
export async function newTool(
  params: ToolParams
): Promise<ToolResponse> {
  try {
    // Validate parameters
    validateParams(params);
    
    // Calculate credits
    const credits = calculateCredits(params);
    
    // Make API call
    const response = await client.request(params);
    
    // Process response
    return formatResponse(response, credits);
  } catch (error) {
    logger.error('Tool error:', error);
    throw new McpError(
      'Tool failed',
      'TOOL_ERROR',
      error
    );
  }
}
```

## Questions?

- Open an issue for questions
- Join discussions in GitHub Discussions
- Contact maintainers for sensitive issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.