# Storyblok to 11ty

[![npm version](https://badge.fury.io/js/@mattgrill%2Fstoryblok-11ty.svg)](https://www.npmjs.com/package/@mattgrill/storyblok-11ty)

The package aims at helping you fetch all the storyblok content in order to use it in 11ty or in any SSG. The package is framework agnostic, hence you could use it with any framework or library. You won't be locked to 11ty and you'd be able to switch to other ssg or framework if needed.

The package contains two classes:
- **StoryblokTo11tyData**. It can be used to fetch content or datasources from storyblok and store them as `json` files.
- **StoryblokTo11tyPlugin**. An 11ty plugin. It gives you the opportunity to use custom tags for *blocks* and *richtexts* fields.

## Installation and Setup

This package is published to both npm and GitHub Packages:

**From npm (recommended):**
```bash
npm install @mattgrill/storyblok-11ty
# or
yarn add @mattgrill/storyblok-11ty
```

**From GitHub Packages:**
```bash
# Create .npmrc file in your project:
echo "@mattgrill:registry=https://npm.pkg.github.com" >> .npmrc

# Authenticate (requires GitHub PAT with read:packages scope)
npm login --registry=https://npm.pkg.github.com --scope=@mattgrill

# Install
npm install @mattgrill/storyblok-11ty
```

## Version 2.0 Breaking Changes

Version 2.0 is a complete rewrite in TypeScript with several improvements:
- **TypeScript Support**: Full type definitions included
- **Named Exports**: Classes are now exported as `StoryblokTo11tyData` and `StoryblokTo11tyPlugin`
- **Modern Build System**: Built with Rspack for better performance
- **ESM & CommonJS**: Supports both module systems

### Migration from 1.x

**Before (1.x):**
```javascript
const StoryblokTo11ty = require('@mattgrill/storyblok-11ty');
const sb = new StoryblokTo11ty.importer({token: 'your-token'});
```

**After (2.x):**
```javascript
// CommonJS
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');
const sb = new StoryblokTo11tyData({token: 'your-token'});

// ESM / TypeScript
import { StoryblokTo11tyData } from '@mattgrill/storyblok-11ty';
const sb = new StoryblokTo11tyData({token: 'your-token'});
```

## TypeScript Support

All types are exported and available for use:

```typescript
import { 
  StoryblokTo11tyData, 
  StoryblokTo11tyPlugin,
  StoryblokTo11tyConfig,
  Story,
  TransformedStory,
  DatasourceEntry
} from '@mattgrill/storyblok-11ty';

const config: StoryblokTo11tyConfig = {
  token: 'your-space-token',
  version: 'published'
};

const sb = new StoryblokTo11tyData(config);
```

## Data Fetching

### Class `StoryblokTo11tyData`

**Parameters**

- `config` Object (StoryblokTo11tyConfig)
  - `token` String, required. Your Storyblok access token. Check [here](https://www.storyblok.com/docs/api/content-delivery#topics/authentication) how to get it.
  - `version` String, optional. Possible values are `published` or `draft`. Default is `draft`.
  - `content_path` String, optional. The directory path where you want to store content files. Default is `_data`.
  - `datasources_path` String, optional. The directory path where you want to store datasources files. Default is `_data`.

**Examples**

**TypeScript:**
```typescript
// Example of Global Data File in the _data directory
import { StoryblokTo11tyData, type StoryblokTo11tyConfig } from '@mattgrill/storyblok-11ty';

export default async () => {
    const config: StoryblokTo11tyConfig = {
        token: 'your-space-token',
        version: 'published'
    };
    const sb = new StoryblokTo11tyData(config);
    
    // Return all the stories from storyblok
    return await sb.getStories();
}
```

**JavaScript (CommonJS):**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');

module.exports = async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    
    // Return all the stories from storyblok
    return await sb.getStories();
}
```

### Method `getStories`

With this method you can get all the Stories or a single one or a subset of them. The stories will be returned in a javascript object already parsed.

**Parameters**
- `[params]` Object (GetStoriesParams), optional. Filter and configuration options:
  - `component` String, optional. Filter stories by component name.
  - `resolve_relations` String, optional. Resolve multiple levels of content by specifying comma-separated values of `component.field_name` according to your data model (e.g., `"article.author,article.categories"`).
  - `resolve_links` String, optional. Resolve internal links. Possible values: `"url"`, `"story"`, `"link"`.
  - `language` String, optional. Language code to fetch content in a specific language.
  - `fallback_lang` String, optional. Fallback language code if the requested language is not available.

**Return**
Promise. The response of the promise is an array of `TransformedStory` objects:

```typescript
TransformedStory[]
```

Each `TransformedStory` includes the story data plus 11ty-specific fields like `layout`, `tags`, `data`, and `permalink`.

**Examples**

**TypeScript:**
```typescript
import { StoryblokTo11tyData, type TransformedStory } from '@mattgrill/storyblok-11ty';

export default async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});

    // Get all stories
    const allStories: TransformedStory[] = await sb.getStories();

    // Get only stories with a specific component
    const articles = await sb.getStories({ component: 'article' });

    // Resolve relations to get linked content
    const storiesWithRelations = await sb.getStories({
        resolve_relations: 'article.author,article.categories'
    });

    // Get stories in a specific language with fallback
    const germanStories = await sb.getStories({
        language: 'de',
        fallback_lang: 'en'
    });

    return allStories;
}
```

**JavaScript:**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');

module.exports = async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});

    // Get all stories
    return await sb.getStories();

    // Or with options:
    // return await sb.getStories({
    //     component: 'article',
    //     resolve_relations: 'article.author'
    // });
}
```

### Method `storeStories`

Store all the stories or a subset of them as markdown files with JSON front matter. Stories are stored in the folder specified through the `stories_path` parameter (default: `storyblok/`). Each story is saved as `{uuid}.md`.

**Parameters**
- `[params]` Object (GetStoriesParams), optional. Same filter options as `getStories`:
  - `component` String, optional. Filter stories by component name.
  - `resolve_relations` String, optional. Resolve relations before storing.
  - `resolve_links` String, optional. Resolve internal links.
  - `language` String, optional. Language code.
  - `fallback_lang` String, optional. Fallback language code.

**Return**
Promise. Returns `true` if stories were stored successfully, `false` otherwise.

**Examples**

**TypeScript:**
```typescript
import { StoryblokTo11tyData } from '@mattgrill/storyblok-11ty';

const sb = new StoryblokTo11tyData({
    token: 'your-space-token',
    stories_path: 'content/stories'
});

// Store all stories
await sb.storeStories();

// Store only article components with resolved relations
await sb.storeStories({
    component: 'article',
    resolve_relations: 'article.author,article.categories'
});
```

**JavaScript:**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');
const sb = new StoryblokTo11tyData({token: 'your-space-token'});

// Store all stories
await sb.storeStories();

// Store only articles with resolved author relations
await sb.storeStories({
    component: 'article',
    resolve_relations: 'article.author'
});
```

### Method `getDatasources`

With this method you can get all the datasources or one in particular. The datasources will be returned in a javascript object already parsed.

**Parameters**
- `[datasource_slug]` String, optional. The slug of the datasource you want to retrieve.

**Return**
Promise. The response of the promise is an object with all the datasources or an array of entries in case you are requesting a single datasource. 

**Examples**

**TypeScript:**
```typescript
import { StoryblokTo11tyData, type DatasourceEntry } from '@mattgrill/storyblok-11ty';

// Get all datasources
export const allDatasources = async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    return await sb.getDatasources();
}

// Get specific datasource
export const categories = async (): Promise<DatasourceEntry[]> => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    return await sb.getDatasources('categories') as DatasourceEntry[];
}
```

**JavaScript:**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');

// Get all datasources
module.exports = async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    return await sb.getDatasources();
}

// Get specific datasource (categories)
module.exports = async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    return await sb.getDatasources('categories');
}
```

### Method `storeDatasources`

With this method you can get all the datasources or one in particular. The datasources will be stored as `json` files in the `_data` folder or in the one specified through the `datasources_path` parameter of the `StoryblokTo11tyData` instance. Each datasource will be stored in a file with its name and in case you are requesting all of the datasources the name of the file will be `datasources.json`.

**Parameters**
- `[datasource_slug]` String, optional. The slug of the datasource you want to retrieve.

**Return**
Promise. Return `false` if something went wrong in the process, otherwise `true`.

**Examples**

**TypeScript:**
```typescript
import { StoryblokTo11tyData } from '@mattgrill/storyblok-11ty';

const sb = new StoryblokTo11tyData({
    token: 'your-space-token',
    datasources_path: '_data/datasources'
});

// Store all datasources in datasources.json
await sb.storeDatasources();

// Store specific datasource (categories.json)
await sb.storeDatasources('categories');
```

**JavaScript:**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');
const sb = new StoryblokTo11tyData({token: 'your-space-token'});

// Store all datasources
await sb.storeDatasources();

// Store specific datasource
await sb.storeDatasources('categories');
```

## Eleventy Plugin

### Class `StoryblokTo11tyPlugin`

**Parameters**

- `config` Object
  - `blocks_folder` String, The folder of the blocks layouts. It should include the *includes* folder path just if you are using Nunjucks.

**TypeScript:**
```typescript
import { StoryblokTo11tyPlugin } from '@mattgrill/storyblok-11ty';

export default function(eleventyConfig) {
    const sbPlugin = new StoryblokTo11tyPlugin({blocks_folder: 'components/'});
    eleventyConfig.addPlugin(sbPlugin);
}
```

**JavaScript:**
```javascript
const { StoryblokTo11tyPlugin } = require('@mattgrill/storyblok-11ty');

module.exports = function(eleventyConfig) {
    const sbPlugin = new StoryblokTo11tyPlugin({blocks_folder: 'components/'});
    eleventyConfig.addPlugin(sbPlugin);
}
```

### Custom tag for blocks fields

If you have a field of type `block` and you have several blocks inside it, you might want to output all of them using a different layout file for each block.
In order to achieve this you can use a custom tag for Liquid and Nunjucks layouts.

#### sb_blocks for Liquid

The custom tag `sb_blocks` can be used like this `{% sb_blocks name_of_blocks_field %}` and it will loop through all the blocks inside the field. For each block it'll include a template with the same name as the slugified component name. If your block is called `Home Banner` the tag will look for the template `home-banner.liquid` inside the `_includes/block/` folder or inside `includes/your_custom_folder/`. You can specify `your_custom_folder` passing the parameter `blocks_folder` to the StoryblokTo11tyPlugin instance like in the example below. You don't need to add your *includes* folder path into the `blocks_folder` parameter because 11ty will take care of that for you.

The block fields will be passed to the layout under the object `block`. If your block has a field called `heading` you can retrieve its value referencing to it as `block.heading`.

**TypeScript:**
```typescript
import { StoryblokTo11tyPlugin } from "@mattgrill/storyblok-11ty";

export default function(eleventyConfig) {
  const sbPlugin = new StoryblokTo11tyPlugin({blocks_folder: 'components/'});
  eleventyConfig.addPlugin(sbPlugin);
}
```

**JavaScript:**
```javascript
const { StoryblokTo11tyPlugin } = require("@mattgrill/storyblok-11ty");

module.exports = function(eleventyConfig) {
  const sbPlugin = new StoryblokTo11tyPlugin({blocks_folder: 'components/'});
  eleventyConfig.addPlugin(sbPlugin);
}
```

#### sb_blocks for Nunjucks

The custom tag `sb_blocks` can be used like this `{% sb_blocks name_of_blocks_field %}` and it will loop through all the blocks inside the field. For each block it'll include a template with the same name as the slugified component name. If your block is called `Home Banner` the tag will look for the template `home-banner.njk` inside the `_includes/block/` folder or inside `includes/your_custom_folder/`. You must specify `your_custom_folder` passing the parameter `blocks_folder` to the StoryblokTo11tyPlugin instance like in the example below. You must add your *includes* folder path into the `blocks_folder` parameter to make the tag work properly, unfortunately it's not the same as for Liquid.

The block fields will be passed to the layout under the object `block`. If your block has a field called `heading` you can retrieve its value referencing to it as `block.heading`.

**TypeScript:**
```typescript
import { StoryblokTo11tyPlugin } from "@mattgrill/storyblok-11ty";

export default function(eleventyConfig) {
  const sbPlugin = new StoryblokTo11tyPlugin({blocks_folder: '_includes/components/'});
  eleventyConfig.addPlugin(sbPlugin);
}
```

**JavaScript:**
```javascript
const { StoryblokTo11tyPlugin } = require("@mattgrill/storyblok-11ty");

module.exports = function(eleventyConfig) {
  const sbPlugin = new StoryblokTo11tyPlugin({blocks_folder: '_includes/components/'});
  eleventyConfig.addPlugin(sbPlugin);
}
```

### Custom tag for richtext fields

The custom tag `sb_richtext` can be used like this `{% sb_richtext name_of_richtext_field %}`. The content of the field will be rendered. The render method uses the [@storyblok/richtext](https://github.com/storyblok/richtext) package. 

**Note**: This tag works the same for both Liquid and Nunjucks templates.

## Available Types

The package exports the following TypeScript types:

```typescript
import type {
  StoryblokTo11tyConfig,  // Configuration object for StoryblokTo11tyData
  Story,                   // Story object from Storyblok
  TransformedStory,        // Transformed story with 11ty specific fields
  DatasourceEntry,         // Datasource entry object
  GetStoriesParams,        // Parameters for getStories/storeStories (component, resolve_relations, etc.)
  ApiResponse              // API response structure
} from '@mattgrill/storyblok-11ty';
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## License

MIT
