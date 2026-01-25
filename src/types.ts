/**
 * Configuration options for StoryblokTo11tyData
 */
export interface StoryblokTo11tyConfig {
  /** The API token of the Storyblok space */
  token?: string;
  /** The version of the API to fetch (draft or published) */
  version?: 'draft' | 'published';
  /** The path to the layouts folder in 11ty */
  layouts_path?: string;
  /** The path where to store the entries */
  stories_path?: string;
  /** The path where to store the datasources */
  datasources_path?: string;
  /** An object with parameter -> value to match specific component to specific layouts */
  components_layouts_map?: Record<string, string>;
  /** The config for the Storyblok JS client */
  storyblok_client_config?: StoryblokClientConfig;
}

/**
 * Storyblok client configuration
 */
export interface StoryblokClientConfig {
  accessToken?: string;
  cache?: {
    clear?: 'auto' | 'manual';
    type?: 'memory' | 'none';
  };
  [key: string]: unknown;
}

/**
 * Story data structure from Storyblok API
 */
export interface Story {
  uuid: string;
  full_slug: string;
  path?: string;
  content: {
    component: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Transformed story with 11ty metadata
 */
export interface TransformedStory extends Omit<Story, 'content'> {
  layout: string;
  tags: string;
  data: Story['content'];
  permalink: string;
}

/**
 * Datasource entry from Storyblok
 */
export interface DatasourceEntry {
  id: number;
  name: string;
  value: string;
  dimension_value: string | null;
  [key: string]: unknown;
}

/**
 * Datasource information
 */
export interface Datasource {
  id: number;
  name: string;
  slug: string;
  dimensions?: Array<{
    id: number;
    name: string;
    entry_value: string;
  }>;
  [key: string]: unknown;
}

/**
 * Parameters for fetching stories
 */
export interface GetStoriesParams {
  /** Filter by component name */
  component?: string;
  /** Resolve relations (comma-separated component.field_name values) */
  resolve_relations?: string;
  /** Resolve links */
  resolve_links?: string;
  /** Language code */
  language?: string;
  /** Fallback language code */
  fallback_lang?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: boolean;
  message?: unknown;
}

/**
 * Storyblok API response structure
 */
export interface StoryblokApiResponse<T = unknown> {
  data: {
    [key: string]: T;
  };
  headers: {
    total: number;
    [key: string]: unknown;
  };
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  query?: Record<string, string | number>;
}

/**
 * Plugin configuration options
 */
export interface PluginConfig {
  /** The folder containing the templates of the blocks */
  blocks_folder?: string;
}

/**
 * Eleventy configuration object
 */
export interface EleventyConfig {
  addLiquidTag: (name: string, callback: (engine: unknown) => unknown) => void;
  addNunjucksTag: (name: string, callback: (engine: unknown, env: unknown) => unknown) => void;
  [key: string]: unknown;
}

/**
 * Rich text data structure
 */
export interface RichTextData {
  content?: Array<unknown>;
  [key: string]: unknown;
}
