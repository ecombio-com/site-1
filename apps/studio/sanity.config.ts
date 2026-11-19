import {defineConfig, isDev} from 'sanity'

import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

import {visionTool} from '@sanity/vision'
import {presentationTool} from 'sanity/presentation'
import {locations} from './presentation/locations'
import {colorInput} from '@sanity/color-input'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {customDocumentActions} from './plugins/customDocumentActions'
import Navbar from './components/studio/Navbar'

const devOnlyPlugins = [visionTool()]

export default defineConfig({
  name: 'default',
  title: 'Sanity and Shopify',

  projectId: 'tkgeb9qc',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    colorInput(),
    imageHotspotArrayPlugin(),
    customDocumentActions(),
    media(),
    presentationTool({
      resolve: {locations},
      previewUrl: {
        origin: 'http://localhost:3000',
        preview: '/',
        previewMode: {
          enable: '/api/preview',
        },
      },
    }),
    ...(isDev ? devOnlyPlugins : []),
  ],

  schema: {
    types: schemaTypes,
  },

  form: {
    file: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource !== mediaAssetSource)
      },
    },
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource === mediaAssetSource)
      },
    },
  },

  studio: {
    components: {
      navbar: Navbar,
    },
  },
})