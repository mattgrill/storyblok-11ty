import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { StoryblokTo11tyData } from '../src/data';
import type { Story, TransformedStory } from '../src/types';

describe('StoryblokTo11tyData', () => {
  // Create instance without token to avoid StoryblokClient instantiation
  const createInstanceWithoutClient = (params = {}) => {
    return new StoryblokTo11tyData(params);
  };

  describe('constructor', () => {
    it('should initialize with default values when no token', () => {
      const instance = createInstanceWithoutClient();

      expect((instance as any).api_version).toBe('draft');
      expect((instance as any).per_page).toBe(100);
      expect((instance as any).client).toBeUndefined();
    });

    it('should use provided version', () => {
      const instance = createInstanceWithoutClient({ version: 'published' });
      expect((instance as any).api_version).toBe('published');
    });

    it('should set layouts_path', () => {
      const instance = createInstanceWithoutClient({ layouts_path: 'layouts/' });
      expect((instance as any).layouts_path).toBe('layouts/');
    });

    it('should set empty layouts_path by default', () => {
      const instance = createInstanceWithoutClient();
      expect((instance as any).layouts_path).toBe('');
    });

    it('should set components_layouts_map', () => {
      const map = { page: 'page-layout' };
      const instance = createInstanceWithoutClient({ components_layouts_map: map });
      expect((instance as any).components_layouts_map).toEqual(map);
    });

    it('should set empty components_layouts_map by default', () => {
      const instance = createInstanceWithoutClient();
      expect((instance as any).components_layouts_map).toEqual({});
    });
  });

  describe('cleanPath', () => {
    let instance: StoryblokTo11tyData;

    beforeEach(() => {
      instance = createInstanceWithoutClient();
    });

    it('should add cwd and trailing slash', () => {
      const result = (instance as any).cleanPath('mypath');
      expect(result).toBe(`${process.cwd()}/mypath/`);
    });

    it('should remove leading slash', () => {
      const result = (instance as any).cleanPath('/mypath');
      expect(result).toBe(`${process.cwd()}/mypath/`);
    });

    it('should remove trailing slash', () => {
      const result = (instance as any).cleanPath('mypath/');
      expect(result).toBe(`${process.cwd()}/mypath/`);
    });

    it('should remove both leading and trailing slashes', () => {
      const result = (instance as any).cleanPath('/mypath/');
      expect(result).toBe(`${process.cwd()}/mypath/`);
    });

    it('should handle empty path', () => {
      const result = (instance as any).cleanPath('');
      expect(result).toBe(`${process.cwd()}/`);
    });

    it('should handle nested paths', () => {
      const result = (instance as any).cleanPath('path/to/something');
      expect(result).toBe(`${process.cwd()}/path/to/something/`);
    });
  });

  describe('transformStories', () => {
    it('should transform story with correct layout path', () => {
      const instance = createInstanceWithoutClient({ layouts_path: '/layouts/' });

      const story: Story = {
        uuid: '123',
        full_slug: 'test/page',
        content: { component: 'article', title: 'Test' },
      };

      const result = (instance as any).transformStories(story);

      expect(result.layout).toBe('layouts/article');
      expect(result.tags).toBe('article');
      expect(result.data.component).toBe('article');
      expect(result.data.title).toBe('Test');
      expect((result as any).content).toBeUndefined();
    });

    it('should use components_layouts_map for custom layout', () => {
      const instance = createInstanceWithoutClient({
        layouts_path: 'layouts/',
        components_layouts_map: { article: 'custom-article' },
      });

      const story: Story = {
        uuid: '123',
        full_slug: 'test/page',
        content: { component: 'article', title: 'Test' },
      };

      const result = (instance as any).transformStories(story);
      expect(result.layout).toBe('layouts/custom-article');
    });

    it('should use path for permalink if available', () => {
      const instance = createInstanceWithoutClient();

      const story: Story = {
        uuid: '123',
        path: '/custom/path',
        full_slug: 'test/page',
        content: { component: 'article' },
      };

      const result = (instance as any).transformStories(story);
      expect(result.permalink).toBe('/custom/path/');
    });

    it('should use full_slug for permalink if no path', () => {
      const instance = createInstanceWithoutClient();

      const story: Story = {
        uuid: '123',
        full_slug: 'test/page',
        content: { component: 'article' },
      };

      const result = (instance as any).transformStories(story);
      expect(result.permalink).toBe('test/page/');
    });
  });

  describe('getDatasource', () => {
    it('should fetch datasource with dimension', async () => {
      const instance = createInstanceWithoutClient();

      vi.spyOn(instance as any, 'getData').mockResolvedValueOnce({
        data: [{ name: 'entry1', value: 'value1' }],
      });

      const result = await instance.getDatasource('my-datasource', 'en');
      expect(result).toEqual([{ name: 'entry1', value: 'value1' }]);
    });

    it('should return empty object when datasource not found', async () => {
      const instance = createInstanceWithoutClient();

      vi.spyOn(instance as any, 'getData').mockResolvedValueOnce({
        error: false,
        data: null,
      });
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await instance.getDatasource('nonexistent');
      expect(result).toEqual({});
    });
  });

  describe('getStories', () => {
    it('should return empty array when getData returns error', async () => {
      const instance = createInstanceWithoutClient();

      vi.spyOn(instance as any, 'getData').mockResolvedValueOnce({
        error: true,
      });

      const result = await instance.getStories();
      expect(result).toEqual([]);
    });

    it('should return transformed stories', async () => {
      const instance = createInstanceWithoutClient({ layouts_path: 'layouts/' });

      const mockStories: Story[] = [
        {
          uuid: '123',
          full_slug: 'test/page',
          content: { component: 'article' },
        },
      ];

      vi.spyOn(instance as any, 'getData').mockResolvedValueOnce({
        data: mockStories,
      });

      const result = await instance.getStories();
      expect(result).toHaveLength(1);
      expect(result[0]?.layout).toBe('layouts/article');
    });
  });
});
