# Pages

Multiple pages can easily be managed by naming things similarly. For instance, the default page is `index`, which correspondes to:

- `templates/index.svelte.html`
  - `templates/_index-content.svelte.html`: Note that this is hard/non-automatic link that is managed in the template.
- `app/index.js`
- `styles/index.scss`

To add another page, simple create new files, while replacing the `index` part.

## In config

You can also manage pages in `config.json`. This is specifically helpful to share files, like styles, across pages. The pages config assumes that there is a JS and Styles with the same name unless specified otherwise.

For instance, this config, shares styles across multipe pages:

```js

  "cms": {
    "pages": [
      {
        "id": "index",
        "default": true
      },
      {
        "id": "map",
        // This tells the build to use the styles/index.scss file that
        // index is using already
        "styles": "index"
      }
    ]
  },
```

You would create the following files, for the new `map` page:

- `templates/_map-content.svelte.html`: The main place for the content.
- `templates/map.svelte.html`: The core page container. This can be copied from `templates/_index.svelte.html`, but will need to make sure the content template points to the map one above.
- `app/map.js`: This is the core client side logic.

_TODO: Put pages outside cms config._

## Multiple pages and CMS integration

Overall, this is similar with some more configuration for the CMS.

See [CMS section](./cms.md).
