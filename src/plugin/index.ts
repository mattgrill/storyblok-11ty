import { LiquidPlugin } from './liquid';
import { NunjucksPlugin } from './nunjuks';
import type { EleventyConfig, PluginConfig } from '../types';

/**
 * StoryblokTo11tyPlugin is the main plugin class for Eleventy
 */
export class StoryblokTo11tyPlugin {
  private params: PluginConfig;

  /**
   * Constructor
   * @param params - The params for initialising the class
   */
  constructor(params: PluginConfig = {}) {
    this.params = params;
  }

  /**
   * Install the plugin into 11ty config
   * @param config - Eleventy configuration object
   */
  configFunction(config: EleventyConfig): void {
    const nunjucks = new NunjucksPlugin(config, this.params);
    nunjucks.addTags();

    const liquid = new LiquidPlugin(config, this.params);
    liquid.addTags();
  }
}
