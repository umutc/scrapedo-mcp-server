import { jest } from '@jest/globals';
import {
  scrapeToMarkdownTool,
  handleScrapeToMarkdown,
} from '../tools/output-format.js';
import { ScrapedoClient, ScrapeResult } from '../scrapedo-client.js';

describe('Output Format Tool', () => {
  let mockClient: jest.Mocked<ScrapedoClient>;
  let mockResult: ScrapeResult;

  beforeEach(() => {
    mockResult = {
      success: true,
      statusCode: 200,
      url: 'https://example.com',
      markdown: '# Test Heading\n\nTest paragraph with **bold** text.',
    };

    mockClient = {
      scrape: jest.fn().mockResolvedValue(mockResult),
      getUsageStats: jest.fn(),
      calculateCredits: jest.fn(),
      generateProxyConfig: jest.fn(),
    } as any;
  });

  describe('scrapeToMarkdownTool definition', () => {
    it('should have correct name', () => {
      expect(scrapeToMarkdownTool.name).toBe('scrape_to_markdown');
    });

    it('should have description mentioning markdown', () => {
      expect(scrapeToMarkdownTool.description).toContain('markdown');
    });

    it('should require url parameter', () => {
      expect(scrapeToMarkdownTool.inputSchema.required).toContain('url');
    });

    it('should have render parameter', () => {
      const props = scrapeToMarkdownTool.inputSchema.properties as any;
      expect(props.render).toBeDefined();
      expect(props.render.type).toBe('boolean');
    });

    it('should have super parameter for proxy usage', () => {
      const props = scrapeToMarkdownTool.inputSchema.properties as any;
      expect(props.super).toBeDefined();
    });

    it('should have geoCode parameter', () => {
      const props = scrapeToMarkdownTool.inputSchema.properties as any;
      expect(props.geoCode).toBeDefined();
    });
  });

  describe('handleScrapeToMarkdown', () => {
    it('should set output to markdown', async () => {
      const args = { url: 'https://example.com' };

      await handleScrapeToMarkdown(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          output: 'markdown',
        })
      );
    });

    it('should return markdown content directly', async () => {
      const args = { url: 'https://example.com' };

      const result = await handleScrapeToMarkdown(mockClient, args);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('# Test Heading\n\nTest paragraph with **bold** text.');
    });

    it('should enable JavaScript rendering when render is true', async () => {
      const args = {
        url: 'https://example.com',
        render: true,
      };

      await handleScrapeToMarkdown(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          output: 'markdown',
        })
      );
    });

    it('should enable proxy when super is true', async () => {
      const args = {
        url: 'https://example.com',
        super: true,
      };

      await handleScrapeToMarkdown(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          super: true,
          output: 'markdown',
        })
      );
    });

    it('should pass geoCode parameter', async () => {
      const args = {
        url: 'https://example.com',
        geoCode: 'uk',
      };

      await handleScrapeToMarkdown(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          geoCode: 'uk',
          output: 'markdown',
        })
      );
    });

    it('should combine render, super, and geoCode', async () => {
      const args = {
        url: 'https://example.com',
        render: true,
        super: true,
        geoCode: 'de',
      };

      await handleScrapeToMarkdown(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          super: true,
          geoCode: 'de',
          output: 'markdown',
        })
      );
    });

    it('should fallback to text if markdown is not available', async () => {
      mockResult.markdown = undefined;
      mockResult.text = 'Plain text content';
      mockClient.scrape.mockResolvedValue(mockResult);

      const args = { url: 'https://example.com' };
      const result = await handleScrapeToMarkdown(mockClient, args);

      expect(result.content[0].text).toBe('Plain text content');
    });

    it('should return empty string if neither markdown nor text available', async () => {
      mockResult.markdown = undefined;
      mockResult.text = undefined;
      mockClient.scrape.mockResolvedValue(mockResult);

      const args = { url: 'https://example.com' };
      const result = await handleScrapeToMarkdown(mockClient, args);

      expect(result.content[0].text).toBe('');
    });

    it('should preserve markdown formatting', async () => {
      const markdownContent = `# Main Heading

## Subheading

This is a paragraph with [a link](https://example.com).

- List item 1
- List item 2
- List item 3

\`\`\`javascript
const foo = 'bar';
\`\`\`

**Bold** and *italic* text.`;

      mockResult.markdown = markdownContent;
      mockClient.scrape.mockResolvedValue(mockResult);

      const args = { url: 'https://example.com' };
      const result = await handleScrapeToMarkdown(mockClient, args);

      expect(result.content[0].text).toBe(markdownContent);
      expect(result.content[0].text).toContain('# Main Heading');
      expect(result.content[0].text).toContain('```javascript');
      expect(result.content[0].text).toContain('**Bold**');
    });

    it('should throw error for invalid URL', async () => {
      const args = { url: 'not-a-valid-url' };

      await expect(handleScrapeToMarkdown(mockClient, args)).rejects.toThrow();
    });

    it('should handle URLs with JavaScript-heavy content', async () => {
      const args = {
        url: 'https://spa.example.com',
        render: true,
      };

      const result = await handleScrapeToMarkdown(mockClient, args);

      expect(mockClient.scrape).toHaveBeenCalledWith(
        expect.objectContaining({
          render: true,
          output: 'markdown',
        })
      );
      expect(result.content[0].text).toBeTruthy();
    });
  });
});
