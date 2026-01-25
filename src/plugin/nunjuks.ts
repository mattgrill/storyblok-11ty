import { Utils } from '../utils';
import { richTextResolver } from '@storyblok/richtext';
import type { EleventyConfig, PluginConfig } from '../types';

interface Block {
  component: string;
  [key: string]: unknown;
}

interface NunjucksEngine {
  render: (template: string, context: Record<string, unknown>) => string;
}

/**
 * NunjucksPlugin is the class to add custom tags for nunjucks templates
 */
export class NunjucksPlugin {
  private blocks_folder: string;
  private config: EleventyConfig;

  constructor(config: EleventyConfig, params: PluginConfig = {}) {
    this.blocks_folder = params.blocks_folder
      ? `${params.blocks_folder.replace(/^\//g, '')}`
      : 'blocks/';
    this.config = config;
  }

  private outputBlocks(blocks: Block[] | Block | null | undefined, engine: NunjucksEngine): string {
    let blockArray: Block[] | null = null;

    if (blocks && typeof blocks === 'object' && !Array.isArray(blocks)) {
      blockArray = [blocks];
    } else if (Array.isArray(blocks)) {
      blockArray = blocks;
    }

    if (!blockArray || !Array.isArray(blockArray)) {
      return '';
    }

    let html_output = '';
    blockArray.forEach((block) => {
      block.component = Utils.slugify(block.component);
      const html = engine.render(`${this.blocks_folder + block.component}.njk`, {
        block: block,
      });
      html_output += html;
    });

    return html_output;
  }

  addTags(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    this.config.addNunjucksTag('sb_blocks', (_nunjucksEngine: unknown, nunjucksEnv: unknown) => {
      const engine = nunjucksEnv as NunjucksEngine;

      return new (function (this: any) {
        this.tags = ['sb_blocks'];

        this.parse = function (parser: any, nodes: any) {
          const tok = parser.nextToken();
          const args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);

          return new nodes.CallExtensionAsync(this, 'run', args);
        };

        this.run = function (_context: unknown, blocks: Block[] | Block, callback: any) {
          const html_output = self.outputBlocks(blocks, engine);
          return callback(null, html_output);
        };
      })();
    });

    this.config.addNunjucksTag('sb_richtext', (_nunjucksEngine: unknown, nunjucksEnv: unknown) => {
      const engine = nunjucksEnv as NunjucksEngine;

      return new (function (this: any) {
        this.tags = ['sb_richtext'];

        this.parse = function (parser: any, nodes: any) {
          const tok = parser.nextToken();
          const args = parser.parseSignature(null, true);
          parser.advanceAfterBlockEnd(tok.value);

          return new nodes.CallExtensionAsync(this, 'run', args);
        };

        this.run = async function (_context: unknown, data: any, callback: any) {
          if (typeof data === 'string') {
            return callback(null, data);
          }

          if (typeof data === 'undefined' || data === null) {
            return callback(null, '');
          }

          let output = '';
          if (typeof data === 'object' && data.content && Array.isArray(data.content)) {
            try {
              const resolver = richTextResolver({
                resolvers: {
                  blok: (node: any) => {
                    const blocks = node.attrs?.body || [];
                    return self.outputBlocks(blocks, engine);
                  },
                },
              });
              output = resolver.render(data) as string;
            } catch {
              output = '';
            }
          }

          return callback(null, output);
        };
      })();
    });
  }
}
