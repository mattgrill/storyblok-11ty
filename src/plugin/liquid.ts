import { Utils } from '../utils';
import { richTextResolver } from '@storyblok/richtext';
import type { EleventyConfig, PluginConfig } from '../types';

// Create a default rich text renderer
const renderRichText = richTextResolver().render;

interface Block {
  component: string;
  [key: string]: unknown;
}

interface LiquidEngine {
  evalValue: (value: string, scope: unknown) => unknown;
  parse: (code: string) => unknown;
  render: (template: unknown, context: Record<string, unknown>) => Promise<string>;
}

/**
 * LiquidPlugin is the class to add custom tags for liquid templates
 */
export class LiquidPlugin {
  private blocks_folder: string;
  private config: EleventyConfig;
  private blocks?: string;
  private data?: string;

  constructor(config: EleventyConfig, params: PluginConfig = {}) {
    this.blocks_folder = params.blocks_folder
      ? `${params.blocks_folder.replace(/^\//g, '')}`
      : 'blocks/';
    this.config = config;
  }

  addTags(): void {
    this.config.addLiquidTag('sb_blocks', (liquidEngine: unknown) => {
      const engine = liquidEngine as LiquidEngine;

      return {
        parse: (tagToken: { args: string }) => {
          this.blocks = tagToken.args;
        },
        render: async (scope: unknown) => {
          const blocksValue = this.blocks || '';
          let blocks = engine.evalValue(blocksValue, scope);

          if (blocks && typeof blocks === 'object' && !Array.isArray(blocks)) {
            blocks = [blocks];
          }

          if (!blocks || !Array.isArray(blocks)) {
            return '';
          }

          let html_output = '';
          for (let index = 0; index < blocks.length; index++) {
            const block = blocks[index] as Block;
            block.component = Utils.slugify(block.component);
            const code = `{% include ${this.blocks_folder + block.component} %}`;
            const tpl = engine.parse(code);
            const html = await engine.render(tpl, { block: block });
            html_output += html;
          }

          return Promise.resolve(html_output);
        },
      };
    });

    this.config.addLiquidTag('sb_richtext', (liquidEngine: unknown) => {
      const engine = liquidEngine as LiquidEngine;

      return {
        parse: (tagToken: { args: string }) => {
          this.data = tagToken.args;
        },
        render: async (scope: unknown) => {
          const dataValue = this.data || '';
          const data = engine.evalValue(dataValue, scope);

          if (typeof data === 'string') {
            return data;
          }

          if (typeof data === 'undefined' || data === null) {
            return '';
          }

          let output = '';
          if (
            typeof data === 'object' &&
            (data as any).content &&
            Array.isArray((data as any).content)
          ) {
            try {
              output = renderRichText(data as any) as string;
            } catch {
              output = '';
            }
          }

          return Promise.resolve(output);
        },
      };
    });
  }
}
