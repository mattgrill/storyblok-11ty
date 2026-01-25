import type { StoryblokTo11tyConfig, TransformedStory, DatasourceEntry, GetStoriesParams } from './types';
/**
 * StoryblokTo11tyData is the main class that fetches the data from Storyblok
 */
export declare class StoryblokTo11tyData {
    private api_version;
    private storyblok_api_token?;
    private stories_path;
    private datasources_path;
    private layouts_path;
    private components_layouts_map;
    private per_page;
    private storyblok_client_config;
    private client?;
    /**
     * Constructor
     * @param params - The params for initialising the class
     */
    constructor(params?: StoryblokTo11tyConfig);
    /**
     * Takes care of cleaning a path set by the user removing
     * leading and trailing slashes and add the process cwd
     * @param path - The path string
     * @returns The cleaned path
     */
    private cleanPath;
    /**
     * Get data of a single datasource retrieving a specific dimension or all of them
     * @param slug - Name of the datasource
     * @param dimension_name - The name of the dimension
     * @returns An array with the datasource entries
     */
    getDatasource(slug: string, dimension_name?: string): Promise<DatasourceEntry[] | Record<string, never>>;
    /**
     * Get data of datasources. It can be single or multiple
     * @param slug - Name of the datasource
     * @returns An object with the data of the datasource/s requested
     */
    getDatasources(slug?: string): Promise<DatasourceEntry[] | Record<string, DatasourceEntry[] | Record<string, never>>>;
    /**
     * Store a datasource to a json file
     * @param slug - Name of the datasource
     * @returns True or false depending if the script was able to store the data
     */
    storeDatasources(slug?: string): Promise<boolean>;
    /**
     * Transforms a story based on the params provided
     * @param story - The story that has to be transformed
     * @returns The transformed story
     */
    private transformStories;
    /**
     * Get all the stories from Storyblok
     * @param params - Filters for the stories request
     * @returns Array of transformed stories
     */
    getStories(params?: GetStoriesParams): Promise<TransformedStory[]>;
    /**
     * Cache stories in a folder as json files
     * @param params - Filters for the stories request
     * @returns True or false depending if the script was able to store the data
     */
    storeStories(params?: GetStoriesParams): Promise<boolean>;
    /**
     * Get a page of data from Storyblok API
     * @param endpoint - The endpoint to query
     * @param entity_name - The name of the entity to be retrieved from the api response
     * @param params - Parameters to add to the API request
     * @returns The data fetched from the API
     */
    private getData;
    /**
     * Get a page of stories from Storyblok
     * @param endpoint - The endpoint to query
     * @param params - Parameters to add to the API request
     * @returns The data fetched from the API
     */
    private apiRequest;
}
