import type { EleventyConfig, PluginConfig } from '../types';
/**
 * LiquidPlugin is the class to add custom tags for liquid templates
 */
export declare class LiquidPlugin {
    private blocks_folder;
    private config;
    private blocks?;
    private data?;
    constructor(config: EleventyConfig, params?: PluginConfig);
    addTags(): void;
}
