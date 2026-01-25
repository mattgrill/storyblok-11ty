(() => {
"use strict";
// The require scope
var __webpack_require__ = {};

// webpack/runtime/compat_get_default_export
(() => {
// getDefaultExport function for compatibility with non-ESM modules
__webpack_require__.n = (module) => {
	var getter = module && module.__esModule ?
		() => (module['default']) :
		() => (module);
	__webpack_require__.d(getter, { a: getter });
	return getter;
};

})();
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  StoryblokTo11tyPlugin: () => (/* reexport */ StoryblokTo11tyPlugin),
  StoryblokTo11tyData: () => (/* reexport */ StoryblokTo11tyData),
  "default": () => (/* binding */ src)
});

;// CONCATENATED MODULE: ./src/utils.ts
/**
 * Utility class for common operations
 */ class Utils {
    /**
   * Convert text to URL-friendly slug
   * @param text - The text to slugify
   * @returns Slugified string
   */ static slugify(text) {
        return (text || '').toString().toLowerCase().trim().replace(/\s+/g, '-') // Replace spaces with -
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/-+/g, '-'); // Replace multiple - with single -
    }
}

;// CONCATENATED MODULE: external "@storyblok/richtext"
const richtext_namespaceObject = require("@storyblok/richtext");
;// CONCATENATED MODULE: ./src/plugin/liquid.ts


// Create a default rich text renderer
const renderRichText = (0,richtext_namespaceObject.richTextResolver)().render;
/**
 * LiquidPlugin is the class to add custom tags for liquid templates
 */ class LiquidPlugin {
    blocks_folder;
    config;
    blocks;
    data;
    constructor(config, params = {}){
        this.blocks_folder = params.blocks_folder ? `${params.blocks_folder.replace(/^\//g, '')}` : 'blocks/';
        this.config = config;
    }
    addTags() {
        this.config.addLiquidTag('sb_blocks', (liquidEngine)=>{
            const engine = liquidEngine;
            return {
                parse: (tagToken)=>{
                    this.blocks = tagToken.args;
                },
                render: async (scope)=>{
                    const blocksValue = this.blocks || '';
                    let blocks = engine.evalValue(blocksValue, scope);
                    if (blocks && typeof blocks === 'object' && !Array.isArray(blocks)) {
                        blocks = [
                            blocks
                        ];
                    }
                    if (!blocks || !Array.isArray(blocks)) {
                        return '';
                    }
                    let html_output = '';
                    for(let index = 0; index < blocks.length; index++){
                        const block = blocks[index];
                        block.component = Utils.slugify(block.component);
                        const code = `{% include ${this.blocks_folder + block.component} %}`;
                        const tpl = engine.parse(code);
                        const html = await engine.render(tpl, {
                            block: block
                        });
                        html_output += html;
                    }
                    return Promise.resolve(html_output);
                }
            };
        });
        this.config.addLiquidTag('sb_richtext', (liquidEngine)=>{
            const engine = liquidEngine;
            return {
                parse: (tagToken)=>{
                    this.data = tagToken.args;
                },
                render: async (scope)=>{
                    const dataValue = this.data || '';
                    const data = engine.evalValue(dataValue, scope);
                    if (typeof data === 'string') {
                        return data;
                    }
                    if (typeof data === 'undefined' || data === null) {
                        return '';
                    }
                    let output = '';
                    if (typeof data === 'object' && data.content && Array.isArray(data.content)) {
                        try {
                            output = renderRichText(data);
                        } catch  {
                            output = '';
                        }
                    }
                    return Promise.resolve(output);
                }
            };
        });
    }
}

;// CONCATENATED MODULE: ./src/plugin/nunjuks.ts


/**
 * NunjucksPlugin is the class to add custom tags for nunjucks templates
 */ class NunjucksPlugin {
    blocks_folder;
    config;
    constructor(config, params = {}){
        this.blocks_folder = params.blocks_folder ? `${params.blocks_folder.replace(/^\//g, '')}` : 'blocks/';
        this.config = config;
    }
    outputBlocks(blocks, engine) {
        let blockArray = null;
        if (blocks && typeof blocks === 'object' && !Array.isArray(blocks)) {
            blockArray = [
                blocks
            ];
        } else if (Array.isArray(blocks)) {
            blockArray = blocks;
        }
        if (!blockArray || !Array.isArray(blockArray)) {
            return '';
        }
        let html_output = '';
        blockArray.forEach((block)=>{
            block.component = Utils.slugify(block.component);
            const html = engine.render(`${this.blocks_folder + block.component}.njk`, {
                block: block
            });
            html_output += html;
        });
        return html_output;
    }
    addTags() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.config.addNunjucksTag('sb_blocks', (_nunjucksEngine, nunjucksEnv)=>{
            const engine = nunjucksEnv;
            return new function() {
                this.tags = [
                    'sb_blocks'
                ];
                this.parse = function(parser, nodes) {
                    const tok = parser.nextToken();
                    const args = parser.parseSignature(null, true);
                    parser.advanceAfterBlockEnd(tok.value);
                    return new nodes.CallExtensionAsync(this, 'run', args);
                };
                this.run = function(_context, blocks, callback) {
                    const html_output = self.outputBlocks(blocks, engine);
                    return callback(null, html_output);
                };
            }();
        });
        this.config.addNunjucksTag('sb_richtext', (_nunjucksEngine, nunjucksEnv)=>{
            const engine = nunjucksEnv;
            return new function() {
                this.tags = [
                    'sb_richtext'
                ];
                this.parse = function(parser, nodes) {
                    const tok = parser.nextToken();
                    const args = parser.parseSignature(null, true);
                    parser.advanceAfterBlockEnd(tok.value);
                    return new nodes.CallExtensionAsync(this, 'run', args);
                };
                this.run = async function(_context, data, callback) {
                    if (typeof data === 'string') {
                        return callback(null, data);
                    }
                    if (typeof data === 'undefined' || data === null) {
                        return callback(null, '');
                    }
                    let output = '';
                    if (typeof data === 'object' && data.content && Array.isArray(data.content)) {
                        try {
                            const resolver = (0,richtext_namespaceObject.richTextResolver)({
                                resolvers: {
                                    blok: (node)=>{
                                        const blocks = node.attrs?.body || [];
                                        return self.outputBlocks(blocks, engine);
                                    }
                                }
                            });
                            output = resolver.render(data);
                        } catch  {
                            output = '';
                        }
                    }
                    return callback(null, output);
                };
            }();
        });
    }
}

;// CONCATENATED MODULE: ./src/plugin/index.ts


/**
 * StoryblokTo11tyPlugin is the main plugin class for Eleventy
 */ class StoryblokTo11tyPlugin {
    params;
    /**
   * Constructor
   * @param params - The params for initialising the class
   */ constructor(params = {}){
        this.params = params;
    }
    /**
   * Install the plugin into 11ty config
   * @param config - Eleventy configuration object
   */ configFunction(config) {
        const nunjucks = new NunjucksPlugin(config, this.params);
        nunjucks.addTags();
        const liquid = new LiquidPlugin(config, this.params);
        liquid.addTags();
    }
}

;// CONCATENATED MODULE: external "storyblok-js-client"
const external_storyblok_js_client_namespaceObject = require("storyblok-js-client");
var external_storyblok_js_client_default = /*#__PURE__*/__webpack_require__.n(external_storyblok_js_client_namespaceObject);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_namespaceObject);
;// CONCATENATED MODULE: ./src/data.ts


/**
 * StoryblokTo11tyData is the main class that fetches the data from Storyblok
 */ class StoryblokTo11tyData {
    api_version;
    storyblok_api_token;
    stories_path;
    datasources_path;
    layouts_path;
    components_layouts_map;
    per_page;
    storyblok_client_config;
    client;
    /**
   * Constructor
   * @param params - The params for initialising the class
   */ constructor(params = {}){
        this.api_version = params.version || 'draft';
        this.storyblok_api_token = params.token;
        this.stories_path = this.cleanPath(params.stories_path || 'storyblok');
        this.datasources_path = this.cleanPath(params.datasources_path || '_data');
        this.layouts_path = params.layouts_path || '';
        this.components_layouts_map = params.components_layouts_map || {};
        this.per_page = 100;
        this.storyblok_client_config = params.storyblok_client_config || {};
        // Init the Storyblok client
        if (this.storyblok_api_token || this.storyblok_client_config && this.storyblok_client_config.accessToken) {
            if (!this.storyblok_client_config.accessToken) {
                this.storyblok_client_config.accessToken = this.storyblok_api_token;
            }
            // Setting up cache settings if not specified
            if (!('cache' in this.storyblok_client_config)) {
                this.storyblok_client_config.cache = {
                    clear: 'auto',
                    type: 'memory'
                };
            }
            this.client = new (external_storyblok_js_client_default())(this.storyblok_client_config);
        }
    }
    /**
   * Takes care of cleaning a path set by the user removing
   * leading and trailing slashes and add the process cwd
   * @param path - The path string
   * @returns The cleaned path
   */ cleanPath(path) {
        const cleanedPath = path ? `/${path.replace(/^\/|\/$/g, '')}` : '';
        return `${process.cwd()}${cleanedPath}/`;
    }
    /**
   * Get data of a single datasource retrieving a specific dimension or all of them
   * @param slug - Name of the datasource
   * @param dimension_name - The name of the dimension
   * @returns An array with the datasource entries
   */ async getDatasource(slug, dimension_name) {
        const request_options = {
            query: {
                datasource: slug
            }
        };
        if (typeof dimension_name === 'undefined') {
            // Get all the dimensions names of a datasource, then we'll request each
            // individual dimension data.
            let data = [];
            let dimensions = [
                ''
            ];
            let datasource_info = null;
            // Getting data of this datasource
            datasource_info = await this.getData(`datasources/${slug}`, 'datasource');
            if (!datasource_info.error && !datasource_info.data) {
                console.error(`Datasource with slug "${slug}" not found`);
            }
            if (datasource_info.error || !datasource_info.data) {
                return {};
            }
            // Getting the list of dimensions
            if (datasource_info.data[0]?.dimensions) {
                dimensions = dimensions.concat(datasource_info.data[0].dimensions.map((dimension)=>dimension.entry_value));
            }
            // Requesting the data of each individual datasource
            await Promise.all(dimensions.map(async (dimension)=>{
                const dimension_entries = await this.getDatasource(slug, dimension);
                if (dimension_entries && Array.isArray(dimension_entries)) {
                    data = data.concat(dimension_entries);
                }
            }));
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
        const datasource = await this.getData('datasource_entries', 'datasource_entries', request_options);
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
   */ async getDatasources(slug) {
        const datasources = {};
        // If the slug is set, request a single datasource
        // otherwise get the index of datasources first
        if (slug) {
            return this.getDatasource(slug);
        } else {
            const request_options = {
                query: {
                    per_page: this.per_page
                }
            };
            // Get the index of the datasources of the space
            const datasources_index = await this.getData('datasources', 'datasources', request_options);
            if (!datasources_index.data || datasources_index.error) {
                return {};
            }
            // Get the entries of each individual datasource
            await Promise.all(datasources_index.data.map(async (datasource)=>{
                datasources[datasource.slug] = await this.getDatasource(datasource.slug);
            }));
            return datasources;
        }
    }
    /**
   * Store a datasource to a json file
   * @param slug - Name of the datasource
   * @returns True or false depending if the script was able to store the data
   */ async storeDatasources(slug) {
        const data = await this.getDatasources(slug);
        // If the data is empty, it won't save the file
        if (Array.isArray(data) && !data.length || !Array.isArray(data) && !Object.keys(data).length) {
            return false;
        }
        // Creating the cache path if it doesn't exist
        if (!external_fs_default().existsSync(this.datasources_path)) {
            external_fs_default().mkdirSync(this.datasources_path, {
                recursive: true
            });
        }
        // If it's not a specific datasource, the filename will be "datasources"
        const filename = slug || 'datasources';
        // Storing entries as json front matter
        try {
            external_fs_default().writeFileSync(`${this.datasources_path}${filename}.json`, JSON.stringify(data, null, 4));
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
   */ transformStories(story) {
        // Setting the path
        const layout_base = `${this.layouts_path.replace(/^\/|\/$/g, '')}/`;
        // Setting the collection
        const tags = story.content.component;
        const data = Object.assign({}, story.content);
        // Creating transformed story by omitting content
        const { content: _content, ...storyWithoutContent } = story;
        const transformed = {
            ...storyWithoutContent,
            layout: '',
            tags,
            data,
            permalink: ''
        };
        // Adding template name
        transformed.layout = layout_base + (this.components_layouts_map[data.component] || data.component);
        // Creating the permalink using the story path override field (real path in Storyblok)
        // or the full slug
        transformed.permalink = `${(story.path || story.full_slug).replace(/\/$/, '')}/`;
        return transformed;
    }
    /**
   * Get all the stories from Storyblok
   * @param params - Filters for the stories request
   * @returns Array of transformed stories
   */ async getStories(params) {
        const request_options = {
            query: {
                version: this.api_version,
                per_page: this.per_page
            }
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
        const pages = await this.getData('stories', 'stories', request_options);
        if (!pages.data || pages.error) {
            return [];
        }
        // Returning the transformed stories
        return pages.data.map((story)=>this.transformStories(story));
    }
    /**
   * Cache stories in a folder as json files
   * @param params - Filters for the stories request
   * @returns True or false depending if the script was able to store the data
   */ async storeStories(params) {
        const stories = await this.getStories(params);
        // Creating the cache path if it doesn't exist
        if (!external_fs_default().existsSync(this.stories_path)) {
            external_fs_default().mkdirSync(this.stories_path, {
                recursive: true
            });
        }
        // Storing entries as json front matter
        try {
            stories.forEach((story)=>{
                external_fs_default().writeFileSync(`${this.stories_path}${story.uuid}.md`, `---json\n${JSON.stringify(story, null, 4)}\n---`);
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
   */ getData(endpoint, entity_name, params) {
        return new Promise((resolve)=>{
            let data = [];
            const data_requests = [];
            const fetchData = async ()=>{
                // Paginated request vs single request
                if (params?.query?.per_page) {
                    // Paginated request
                    params.query.page = 1;
                    // Get the first page to retrieve the total number of entries
                    let first_page = null;
                    try {
                        first_page = await this.apiRequest(endpoint, params);
                    } catch (err) {
                        return resolve({
                            error: true,
                            message: err
                        });
                    }
                    if (!first_page?.data) {
                        return resolve({
                            data: []
                        });
                    }
                    data = data.concat(first_page.data[entity_name]);
                    // Getting the stories
                    const total_entries = first_page.headers.total;
                    const total_pages = Math.ceil(total_entries / this.per_page);
                    // The script will request all the pages of entries at the same time
                    for(let page_index = 2; page_index <= total_pages; page_index++){
                        params.query.page = page_index;
                        data_requests.push(this.apiRequest(endpoint, params));
                    }
                } else {
                    // Single request
                    data_requests.push(this.apiRequest(endpoint, params));
                }
                // When all the pages of entries are retrieved
                Promise.all(data_requests).then((values)=>{
                    // Concatenating the data of each page
                    values.forEach((response)=>{
                        if (response.data) {
                            data = data.concat(response.data[entity_name]);
                        }
                    });
                    resolve({
                        data: data
                    });
                }).catch((err)=>{
                    // Returning an object with an error property to let
                    // any method calling this one know that something went
                    // wrong with the api request
                    resolve({
                        error: true,
                        message: err
                    });
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
   */ apiRequest(endpoint, params) {
        // Storyblok query options
        const request_options = {};
        // Adding the optional query filters
        if (params?.query) {
            Object.assign(request_options, params.query);
        }
        // API request
        return new Promise((resolve, reject)=>{
            if (!this.client) {
                reject(new Error('Storyblok client not initialized'));
                return;
            }
            this.client.get(`cdn/${endpoint}`, request_options).then((response)=>{
                // Returning the response from the endpoint
                resolve(response);
            }).catch((err)=>{
                // Error handling
                // Returning custom errors for 401 and 404 because they might
                // be the most common
                if (err.response) {
                    switch(err.response.status){
                        case 401:
                            console.error('\x1b[31mStoryblokTo11ty - Error 401: Unauthorized. Probably the API token is wrong.\x1b[0m');
                            break;
                        case 404:
                            console.error("\x1b[31mStoryblokTo11ty - Error 404: The item you are trying to get doesn't exist.\x1b[0m");
                            break;
                        default:
                            console.error(`\x1b[31mStoryblokTo11ty - Error ${err.response.status}: ${err.response.statusText}\x1b[0m`);
                            break;
                    }
                }
                reject(err);
            });
        });
    }
}

;// CONCATENATED MODULE: ./src/index.ts


/**
 * Main exports for StoryblokTo11ty
 */ 

/* export default */ const src = ({
    importer: StoryblokTo11tyData,
    plugin: StoryblokTo11tyPlugin
});

module.exports = __webpack_exports__;
})()
;