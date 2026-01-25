import type { EleventyConfig, PluginConfig } from '../types';
/**
 * StoryblokTo11tyPlugin is the main plugin class for Eleventy
 */
export declare class StoryblokTo11tyPlugin {
    private params;
    /**
     * Constructor
     * @param params - The params for initialising the class
     */
    constructor(params?: PluginConfig);
    /**
     * Install the plugin into 11ty config
     * @param config - Eleventy configuration object
     */
    configFunction(config: EleventyConfig): void;
}
