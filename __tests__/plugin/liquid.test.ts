import { describe, it, expect, vi } from 'vitest';
import { LiquidPlugin } from '../../src/plugin/liquid';
import type { EleventyConfig } from '../../src/types';

describe('LiquidPlugin', () => {
  describe('constructor', () => {
    it('should initialize with default blocks_folder', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const plugin = new LiquidPlugin(mockConfig);
      expect((plugin as any).blocks_folder).toBe('blocks/');
    });

    it('should set custom blocks_folder', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const plugin = new LiquidPlugin(mockConfig, { blocks_folder: 'custom/' });
      expect((plugin as any).blocks_folder).toBe('custom/');
    });

    it('should remove leading slash from blocks_folder', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const plugin = new LiquidPlugin(mockConfig, { blocks_folder: '/blocks/' });
      expect((plugin as any).blocks_folder).toBe('blocks/');
    });
  });

  describe('addTags', () => {
    it('should register sb_blocks tag', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const plugin = new LiquidPlugin(mockConfig);
      plugin.addTags();

      expect(mockConfig.addLiquidTag).toHaveBeenCalledWith('sb_blocks', expect.any(Function));
    });

    it('should register sb_richtext tag', () => {
      const mockConfig = {
        addLiquidTag: vi.fn(),
        addNunjucksTag: vi.fn(),
      } as unknown as EleventyConfig;

      const plugin = new LiquidPlugin(mockConfig);
      plugin.addTags();

      expect(mockConfig.addLiquidTag).toHaveBeenCalledWith('sb_richtext', expect.any(Function));
    });
  });
});
