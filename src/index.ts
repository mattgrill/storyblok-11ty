import { StoryblokTo11tyPlugin } from './plugin/index';
import { StoryblokTo11tyData } from './data';

/**
 * Main exports for StoryblokTo11ty
 */
export { StoryblokTo11tyData, StoryblokTo11tyPlugin };

export * from './types';

export default {
  importer: StoryblokTo11tyData,
  plugin: StoryblokTo11tyPlugin,
};
