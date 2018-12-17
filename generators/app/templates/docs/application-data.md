# Application data

Data to pull into the application for HTML rendering or to put into `assets/` for the client can be handled in the `config.json` or in a `data.js` file if you want more control. Different local and remote sources can be easily brought into the application this way. Any remote sources will be cached locally.

- Add entries in the `data` key in `config.json`.
- Or export entries in a `data.js` file in the project root.

## Data sources

Data sources can be described in a number of ways.

- Just use a local path, like `sources/data.json`, so your config might looks something like:
  ```js
  {
    ...
    "data": {
      templateData: 'sources/custom-data.json'
    },
    ...
  }
  ```
  - This provides the variable, `templateData`, for use in the template.
- You can also do the same with a remote source, like `http://example.com/some-data.csv`
- If you have a "Published to the web" CSV of a Google Sheet, you can use that as well; such as `https://docs.google.com/spreadsheets/d/e/XXXXXX/pub?output=csv`
- Or a "Published to the web" Google Document in [ArchieML](http://archieml.org/) format; such as `https://docs.google.com/document/d/e/XXXXX/pub`.
- For more control, you can use more options. You can force a specific type of data with the type paramter:
  ```js
  {
    source: 'sources/example.jsonext',
    type: 'json'
  }
  ```
- We can also connect to Airtable. Make sure to have the `AIRTABLE_API_KEY` environment variable set:
  ```js
  {
    type: 'airtable',
    base: 'XXXXX',
    table: 'Table name',
    ttl: 600000
  }
  ```
- For private Google Docs or Spreadsheets, make sure to have an API config file, and set the path in the `GOOGLE_APPLICATION_CREDENTIALS` environment variables. From there, we can use just the file ID as the source.
  ```js
  {
    type: 'google-doc',
    id: 'XXXXXXX'
  }
  ```
- For a Google Spreadsheet that has a key and value columns, and you want to transform into an object, the spreadsheet needs to have the `Key`, `Value`, and `Type` columns set up, then you can just add the `keyColumn` option.
  ```js
  {
    type: 'google-sheet',
    id: 'XXXXXXX',
    sheet: 'XXXXXX',
    keyColumn: true
  }
  ```
- If you need to just directly pass some data, you can use the `data` property:
  ```js
  {
    data: {
      custom: 'data',
      such: 'as a variable',
      from: 'other JS things'
    }
  }
  ```

## Transform data

You can use a `postprocess` function to transform data. This happens after any caching. For instance.

```js
{
  processedData: {
    source: 'https://example.com/data.csv',
    postprocess: (input) => {
      return input.map(i => {
        return {
          field: i.FIELD,
          altered: i.value * 2
        };
      });
    }
  }
}
```

## Locally save data

You can also easily save the fully processed data locally. This is helpful for using the same data for local rendering and for use in the client. By default, it will save the files in `assets/data/`.

```js
{
  processedData: {
    source: 'https://example.com/data.csv',
    local: 'processed-data.json'
  }
}
```

Then, if you wanted to use this data in the client, you could add something like the following the client application logic (for instance, `app/index.js`):

```js
const processedData = require("../assets/data/processed-data.json");

const app = new Content({
  target: document.querySelector(".article-lcd-body-content"),
  data: {
    processedData
  }
});
```

The build process uses [indian ocean](https://www.npmjs.com/package/indian-ocean) for some conversion types, that means if it makes sense, you can use different file exentions for your local file, such as:

```js
{
  processedData: {
    source: 'https://example.com/data.csv',
    local: 'processed-data.yaml'
  }
}
```

## Caching

The build process will cache the data for 10 minutes by default. This can be changed for each dataset, which may be helpful for large datasets that don't change often.

```js
{
  bigBigData: {
    source: 'https://example.com/BIG.json',
    // Milliseconds 1000 * 60 * 60 * 24
    ttl: 86400000,
    local: 'processed-data.json'
  }
}
```

## Data.js file

A `data.js` file at the project root can be used to provide application data. It should export configuration. For example:

```js
// Dependencies
const parsingLib = require("parsing-lib");

// Parsing function
function parsingFunction(stringInput) {
  return parsingLib.magic(stringInput);
}

module.exports = {
  externalData: {
    source: "http://example.com/data-source.other",
    postprocess: parsingFunction
  }
};
```
