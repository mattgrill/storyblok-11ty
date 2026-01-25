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
- `[slug]` String, optional. The slug of the story or a storyblok-js-client request query, like `/stories?starts_with=blog`
- `[options]` Object, optional. It allows to pass additional parameters to the `storyblok-js-client` `getStories` call.

**Return**
Promise. The response of the promise is the data received from Storyblok. In case you are getting only one story, the structure of the object will be:

```typescript
{
    total: 1,
    stories: Story[]
}
```
Otherwise it will be:
```typescript
Array<{
    total: number
    stories: Story[]
}>
```

**Examples**

**TypeScript:**
```typescript
import { StoryblokTo11tyData, type Story } from '@mattgrill/storyblok-11ty';

export default async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    
    const result = await sb.getStories();
    return result;
}
```

**JavaScript:**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');

module.exports = async () => {
    const sb = new StoryblokTo11tyData({token: 'your-space-token'});
    
    return await sb.getStories();
}
```

### Method `storeStories`

Store all the stories or a subset of them. The stories will be stored as `json` files in the `_data` folder or in the one specified through the `content_path` parameter of the `StoryblokTo11tyData` instance. Each story will be stored in a file with its slug.

**Parameters**
- `[slug]` String, optional. The slug of the story or a storyblok-js-client request query, like `/stories?starts_with=blog`

**Return**
Promise. Return `false` if something went wrong in the process, otherwise `true`.

**Examples**

**TypeScript:**
```typescript
import { StoryblokTo11tyData } from '@mattgrill/storyblok-11ty';

const sb = new StoryblokTo11tyData({
    token: 'your-space-token',
    content_path: '_data/stories'
});

// Store all stories
await sb.storeStories();

// Store only the home story
await sb.storeStories('home');
```

**JavaScript:**
```javascript
const { StoryblokTo11tyData } = require('@mattgrill/storyblok-11ty');
const sb = new StoryblokTo11tyData({token: 'your-space-token'});

// Store all stories
await sb.storeStories();

// Store only the home story
await sb.storeStories('home');
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
  GetStoriesParams,        // Parameters for getStories method
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
