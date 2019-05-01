# CMS integration and publishing

If this project is meant to live within the [Star Tribune CMS](https://cms.clickability.com/cms), overall, this means that the markup and content are stored within the CMS, while the styling, javascript, and other assets are managed externally, probably on S3.

## Setup

To test the content through a local [news-platform](https://github.com/MinneapolisStarTribune/news-platform/), make sure the following is true:

- Ensure that `ASSETS_STATIC_URL` environment variable set to `http://localhost:3000/` for `news-platform`. This is necessary to use the local version of the assets in this project.
- `news-platform` is installed and running.

### News-platform

For any article that you are publishing to, it should be utilizing the `shared/generic-interactive-v01.twig` template. It is possible that some articles with these overrides are already made.

- For desktop override such as `desktop-theme/templates/override/_id/XXXXX.twig`, all you have to do is add this line: `{% extends "override/shared/generic-interactive-v01.twig" %}`
- For mobile override such as `mobile-theme/templates/override/_id/XXXXX.twig`, just have `{% extends "override.shared.generic-interactive-v01.twig" %}`

### CMS pages

To setup an article to take advantage of this workflow, for each page needed:

1. Create an article.
   - Set "Web Page View" (unsure?) to "Yes"
1. Create a connected LCD
   - See below for more about fields, but overall, these should be something like:
     - `content`: Main body of content, this is likely the `build/_index-content.html` file that is rendered.
     - `styles`: `news/projects/all/generator-test/styles.bundle.css`
     - `scripts`: `news/projects/all/generator-test/app.bundle.js`
     - `script libraries` or `style libraries`
1. Update `config.json` with article and LCD IDs.

### Configuration

Configuration to connect the project for development is managed in `config.json`. It should have at least one `pages` entry. For example:

```js
"cms": {
  // The default way to rewrite the page locally
  // when using news-platform
  "defaultArticleContentTemplateRewriteClass": "article-lcd-body-content",
  "pages": [
    {
      "id": "index",
      "articleId": "222222222",
      "lcd": "11111111",
      "default": true
    },
    {
      "id": "page-two",
      // Shared styles
      "styles": "index",
      "articleId": "33333333",
      "lcd": "4444444",
      // This will allow you to rewrite parts of the page,
      // usually this is tied to the news-platform
      // override template
      "rewriteRules": {
        "custom-class": "_template-id-to-replace"
      }
    }
  ]
}
```

So that we can develop in the `news-platform` environment, we use BrowserSync's rewrite rules to change content as its served. This allows us to put the content of our local templates into the page served through `news-platform`.

#### Shared assets across pages

By using the `styles` or `js` properties in the configuration for a page, you can specify the styles or scripts that are used in that page. For instance, if you put `index` for all the `styles` in the pages, then that one style file will be used for all pages.

You can also, edit the templates directly if you want.

## Development

You can run your project through `news-platform`. This is slow and should mostly be used as a final testing step to make sure nothing on the site will mess with the project. Simply add a flag to `gulp develop`:

```sh
gulp develop --cms
```

## Publishing

You can use `gulp cms:info` to output the cms information from the `config.json`.

The command `gulp cms:lcd` will output the data that should be inserted into the LCD fields.

This command allows you to get a specific field and copy it to the clipboard. For instance:

- `gulp cms:lcd --get="styles"`
- What's more helpful is getting `content` since this is actually all the markup for the project and lives in a file. `gulp cms:lcd --get="content"`
- By default, it uses the default page, but if there are multiple pages, use a prefix like: `gulp cms:lcd --get="page|styles"`

### Example publishing routine

Once you have the article and LCD setup for publishing, here are the common steps to get to publshing:

1. Publish assets: `gulp deploy --production`
   - Note that `deploy` will delete the build folder and rebuild the project, while `publish` will only push things up to S3.
1. Go to the LCD
1. Get the content from the project: `gulp cms:lcd --get="content"`
1. Paste the content into the LCD and save it.
