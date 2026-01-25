import type { EleventyConfig, PluginConfig } from '../types';
/**
 * NunjucksPlugin is the class to add custom tags for nunjucks templates
 */
export declare class NunjucksPlugin {
    private blocks_folder;
    private config;
    constructor(config: EleventyConfig, params?: PluginConfig);
    private outputBlocks;
    addTags(): void;
}
