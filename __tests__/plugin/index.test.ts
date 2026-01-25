import { describe, it, expect, vi } from 'vitest';
import { StoryblokTo11tyPlugin } from '../../src/plugin/index';
import type { EleventyConfig } from '../../src/types';

describe('StoryblokTo11tyPlugin', () => {
  describe('constructor', () => {
    it('should initialize with empty params', () => {
      const plugin = new StoryblokTo11tyPlugin();
      expect((plugin as any).params).toEqual({});
    });

    it('should store provided params', () => {
      const params = { blocks_folder: 'custom/' };
      const plugin = new StoryblokTo11tyPlugin(params);
      expect((plugin as any).params).toEqual(params);
    });
  });

  describe('configFunction', () => {
    it('should register both liquid and nunjucks plugins', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const plugin = new StoryblokTo11tyPlugin();
      plugin.configFunction(mockConfig);

      // Should have registered tags for both engines
      expect(mockConfig.addLiquidTag).toHaveBeenCalled();
      expect(mockConfig.addNunjucksTag).toHaveBeenCalled();
    });

    it('should pass params to sub-plugins', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const params = { blocks_folder: 'custom/' };
      const plugin = new StoryblokTo11tyPlugin(params);
      plugin.configFunction(mockConfig);

      // Verify the tags were registered
      expect(mockConfig.addLiquidTag).toHaveBeenCalled();
      expect(mockConfig.addNunjucksTag).toHaveBeenCalled();
    });
  });
});
