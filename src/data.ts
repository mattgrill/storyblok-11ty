import StoryblokClient from 'storyblok-js-client';
import fs from 'fs';
import type {
  StoryblokTo11tyConfig,
  Story,
  TransformedStory,
  DatasourceEntry,
  Datasource,
  GetStoriesParams,
  ApiResponse,
  StoryblokApiResponse,
  RequestOptions,
} from './types';

/**
 * StoryblokTo11tyData is the main class that fetches the data from Storyblok
 */
export class StoryblokTo11tyData {
  private api_version: 'draft' | 'published';
  private storyblok_api_token?: string;
  private stories_path: string;
  private datasources_path: string;
  private layouts_path: string;
  private components_layouts_map: Record<string, string>;
  private per_page: number;
  private storyblok_client_config: StoryblokTo11tyConfig['storyblok_client_config'];
  private client?: StoryblokClient;

  /**
   * Constructor
   * @param params - The params for initialising the class
   */
  constructor(params: StoryblokTo11tyConfig = {}) {
    this.api_version = params.version || 'draft';
    this.storyblok_api_token = params.token;
    this.stories_path = this.cleanPath(params.stories_path || 'storyblok');
    this.datasources_path = this.cleanPath(params.datasources_path || '_data');
    this.layouts_path = params.layouts_path || '';
    this.components_layouts_map = params.components_layouts_map || {};
    this.per_page = 100;
    this.storyblok_client_config = params.storyblok_client_config || {};

    // Init the Storyblok client
    if (
      this.storyblok_api_token ||
      (this.storyblok_client_config && this.storyblok_client_config.accessToken)
    ) {
      if (!this.storyblok_client_config.accessToken) {
        this.storyblok_client_config.accessToken = this.storyblok_api_token;
      }
      // Setting up cache settings if not specified
      if (!('cache' in this.storyblok_client_config)) {
        this.storyblok_client_config.cache = {
          clear: 'auto',
          type: 'memory',
        };
      }
      this.client = new StoryblokClient(this.storyblok_client_config);
    }
  }

  /**
   * Takes care of cleaning a path set by the user removing
   * leading and trailing slashes and add the process cwd
   * @param path - The path string
   * @returns The cleaned path
   */
  private cleanPath(path: string): string {
    const cleanedPath = path ? `/${path.replace(/^\/|\/$/g, '')}` : '';
    return `${process.cwd()}${cleanedPath}/`;
  }

  /**
   * Get data of a single datasource retrieving a specific dimension or all of them
   * @param slug - Name of the datasource
   * @param dimension_name - The name of the dimension
   * @returns An array with the datasource entries
   */
  async getDatasource(
    slug: string,
    dimension_name?: string
  ): Promise<DatasourceEntry[] | Record<string, never>> {
    const request_options: RequestOptions = { query: { datasource: slug } };

    if (typeof dimension_name === 'undefined') {
      // Get all the dimensions names of a datasource, then we'll request each
      // individual dimension data.
      let data: DatasourceEntry[] = [];
      let dimensions: string[] = [''];
      let datasource_info: ApiResponse<Datasource[]> | null = null;

      // Getting data of this datasource
      datasource_info = await this.getData<Datasource[]>(`datasources/${slug}`, 'datasource');

      if (!datasource_info.error && !datasource_info.data) {
        console.error(`Datasource with slug "${slug}" not found`);
      }
      if (datasource_info.error || !datasource_info.data) {
        return {};
      }

      // Getting the list of dimensions
      if (datasource_info.data[0]?.dimensions) {
        dimensions = dimensions.concat(
          datasource_info.data[0].dimensions.map((dimension) => dimension.entry_value)
        );
      }

      // Requesting the data of each individual datasource
      await Promise.all(
        dimensions.map(async (dimension) => {
          const dimension_entries = await this.getDatasource(slug, dimension);
          if (dimension_entries && Array.isArray(dimension_entries)) {
            data = data.concat(dimension_entries);
          }
        })
      );

      // Returning the data
      return data;
    } else {
      // If the dimension is not undefined, set the dimension parameter in the query
      // The dimension can be empty in case it's the default dimension that you are
      // trying to retrieve.
      if (request_options.query) {
        request_options.query.dimension = dimension_name;
      }
    }

    // Getting the entries of a datasource
    const datasource = await this.getData<DatasourceEntry[]>(
      'datasource_entries',
      'datasource_entries',
      request_options
    );

    if (datasource.error) {
      return [];
    } else {
      return datasource.data || [];
    }
  }

  /**
   * Get data of datasources. It can be single or multiple
   * @param slug - Name of the datasource
   * @returns An object with the data of the datasource/s requested
   */
  async getDatasources(
    slug?: string
  ): Promise<DatasourceEntry[] | Record<string, DatasourceEntry[] | Record<string, never>>> {
    const datasources: Record<string, DatasourceEntry[] | Record<string, never>> = {};

    // If the slug is set, request a single datasource
    // otherwise get the index of datasources first
    if (slug) {
      return this.getDatasource(slug);
    } else {
      const request_options: RequestOptions = {
        query: {
          per_page: this.per_page,
        },
      };

      // Get the index of the datasources of the space
      const datasources_index = await this.getData<Datasource[]>(
        'datasources',
        'datasources',
        request_options
      );

      if (!datasources_index.data || datasources_index.error) {
        return {};
      }

      // Get the entries of each individual datasource
      await Promise.all(
        datasources_index.data.map(async (datasource) => {
          datasources[datasource.slug] = await this.getDatasource(datasource.slug);
        })
      );

      return datasources;
    }
  }

  /**
   * Store a datasource to a json file
   * @param slug - Name of the datasource
   * @returns True or false depending if the script was able to store the data
   */
  async storeDatasources(slug?: string): Promise<boolean> {
    const data = await this.getDatasources(slug);

    // If the data is empty, it won't save the file
    if (
      (Array.isArray(data) && !data.length) ||
      (!Array.isArray(data) && !Object.keys(data).length)
    ) {
      return false;
    }

    // Creating the cache path if it doesn't exist
    if (!fs.existsSync(this.datasources_path)) {
      fs.mkdirSync(this.datasources_path, { recursive: true });
    }

    // If it's not a specific datasource, the filename will be "datasources"
    const filename = slug || 'datasources';

    // Storing entries as json front matter
    try {
      fs.writeFileSync(`${this.datasources_path}${filename}.json`, JSON.stringify(data, null, 4));
      console.log(`Datasources saved in ${this.datasources_path}`);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Transforms a story based on the params provided
   * @param story - The story that has to be transformed
   * @returns The transformed story
   */
  private transformStories(story: Story): TransformedStory {
    // Setting the path
    const layout_base = `${this.layouts_path.replace(/^\/|\/$/g, '')}/`;

    // Setting the collection
    const tags = story.content.component;
    const data = Object.assign({}, story.content);

    // Creating transformed story by omitting content
    const { content: _content, ...storyWithoutContent } = story;
    const transformed: TransformedStory = {
      ...storyWithoutContent,
      layout: '',
      tags,
      data,
      permalink: '',
    };

    // Adding template name
    transformed.layout =
      layout_base + (this.components_layouts_map[data.component as string] || data.component);

    // Creating the permalink using the story path override field (real path in Storyblok)
    // or the full slug
    transformed.permalink = `${(story.path || story.full_slug).replace(/\/$/, '')}/`;

    return transformed;
  }

  /**
   * Get all the stories from Storyblok
   * @param params - Filters for the stories request
   * @returns Array of transformed stories
   */
  async getStories(params?: GetStoriesParams): Promise<TransformedStory[]> {
    const request_options: RequestOptions = {
      query: {
        version: this.api_version,
        per_page: this.per_page,
      },
    };

    // Filtering by component
    if (params?.component && request_options.query) {
      request_options.query['filter_query[component][in]'] = params.component;
    }

    // Whether to resolve relations
    if (params?.resolve_relations && request_options.query) {
      request_options.query['resolve_relations'] = params.resolve_relations;
    }

    // Whether to resolve links
    if (params?.resolve_links && request_options.query) {
      request_options.query['resolve_links'] = params.resolve_links;
    }

    // Language
    if (params?.language && request_options.query) {
      request_options.query['language'] = params.language;
    }

    // Fallback language
    if (params?.fallback_lang && request_options.query) {
      request_options.query['fallback_lang'] = params.fallback_lang;
    }

    // Getting the data
    const pages = await this.getData<Story[]>('stories', 'stories', request_options);

    if (!pages.data || pages.error) {
      return [];
    }

    // Returning the transformed stories
    return pages.data.map((story) => this.transformStories(story));
  }

  /**
   * Cache stories in a folder as json files
   * @param params - Filters for the stories request
   * @returns True or false depending if the script was able to store the data
   */
  async storeStories(params?: GetStoriesParams): Promise<boolean> {
    const stories = await this.getStories(params);

    // Creating the cache path if it doesn't exist
    if (!fs.existsSync(this.stories_path)) {
      fs.mkdirSync(this.stories_path, { recursive: true });
    }

    // Storing entries as json front matter
    try {
      stories.forEach((story) => {
        fs.writeFileSync(
          `${this.stories_path}${story.uuid}.md`,
          `---json\n${JSON.stringify(story, null, 4)}\n---`
        );
      });
      console.log(`${stories.length} stories saved in ${this.stories_path}`);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Get a page of data from Storyblok API
   * @param endpoint - The endpoint to query
   * @param entity_name - The name of the entity to be retrieved from the api response
   * @param params - Parameters to add to the API request
   * @returns The data fetched from the API
   */
  private getData<T = unknown>(
    endpoint: string,
    entity_name: string,
    params?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      let data: T[] = [];
      const data_requests: Promise<StoryblokApiResponse<T>>[] = [];

      const fetchData = async () => {
        // Paginated request vs single request
        if (params?.query?.per_page) {
          // Paginated request
          params.query.page = 1;

          // Get the first page to retrieve the total number of entries
          let first_page: StoryblokApiResponse<T> | null = null;
          try {
            first_page = await this.apiRequest<T>(endpoint, params);
          } catch (err) {
            return resolve({ error: true, message: err });
          }

          if (!first_page?.data) {
            return resolve({ data: [] as unknown as T });
          }

          data = data.concat(first_page.data[entity_name] as T[]);

          // Getting the stories
          const total_entries = first_page.headers.total;
          const total_pages = Math.ceil(total_entries / this.per_page);

          // The script will request all the pages of entries at the same time
          for (let page_index = 2; page_index <= total_pages; page_index++) {
            params.query.page = page_index;
            data_requests.push(this.apiRequest<T>(endpoint, params));
          }
        } else {
          // Single request
          data_requests.push(this.apiRequest<T>(endpoint, params));
        }

        // When all the pages of entries are retrieved
        Promise.all(data_requests)
          .then((values) => {
            // Concatenating the data of each page
            values.forEach((response) => {
              if (response.data) {
                data = data.concat(response.data[entity_name] as T[]);
              }
            });
            resolve({ data: data as T });
          })
          .catch((err) => {
            // Returning an object with an error property to let
            // any method calling this one know that something went
            // wrong with the api request
            resolve({ error: true, message: err });
          });
      };

      fetchData();
    });
  }

  /**
   * Get a page of stories from Storyblok
   * @param endpoint - The endpoint to query
   * @param params - Parameters to add to the API request
   * @returns The data fetched from the API
   */
  private apiRequest<T = unknown>(
    endpoint: string,
    params?: RequestOptions
  ): Promise<StoryblokApiResponse<T>> {
    // Storyblok query options
    const request_options: Record<string, string | number> = {};

    // Adding the optional query filters
    if (params?.query) {
      Object.assign(request_options, params.query);
    }

    // API request
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Storyblok client not initialized'));
        return;
      }

      this.client
        .get(`cdn/${endpoint}`, request_options)
        .then((response) => {
          // Returning the response from the endpoint
          resolve(response as unknown as StoryblokApiResponse<T>);
        })
        .catch((err: { response?: { status: number; statusText: string } }) => {
          // Error handling
          // Returning custom errors for 401 and 404 because they might
          // be the most common
          if (err.response) {
            switch (err.response.status) {
              case 401:
                console.error(
                  '\x1b[31mStoryblokTo11ty - Error 401: Unauthorized. Probably the API token is wrong.\x1b[0m'
                );
                break;
              case 404:
                console.error(
                  "\x1b[31mStoryblokTo11ty - Error 404: The item you are trying to get doesn't exist.\x1b[0m"
                );
                break;
              default:
                console.error(
                  `\x1b[31mStoryblokTo11ty - Error ${err.response.status}: ${err.response.statusText}\x1b[0m`
                );
                break;
            }
          }
          reject(err);
        });
    });
  }
}
