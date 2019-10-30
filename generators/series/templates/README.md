# <%= _.startCase(answers.name) %>

<%= answers.description %>

## STrib series-article workflow

A gulp workflow for a small Star Tribune web project that simulates, as best as we can, how your content will look when it’s eventually rendered out of the CMS.

This workflow now lives within [generator-striblab (better known as "Alan's Workflow")](https://github.com/striblab/generator-striblab). Simply run `yo @striblab/striblab:series` and answer the prompts to generate scaffolding for a series-article project.

The purpose of this workflow is to allow you to dive into designing your project without the use of the news-platform environment. This workflow allows you to write markup inside of simple HTML fragments which are then included into pages that contain all the regular Star Tribune furniture. It’s expected that your finished HTML fragments would eventually be copied and pasted into Clickability LCD content item fields or into override twigs and your compiled CSS and JS assets would be staged to static.startribune.com.

You can work with desktop and mobile-specific fragments and stylesheets, or, preferably, you can style your content responsively. In the case of a responsive approach, you'd work with content in /src/content/responsive.html and work with your styles in /src/scss/responsive.scss. When you're designing content responsively, simply remove the place-holder content in the desktop and mobile instances of your html fragments.

This workflow supports the notion of a "hero override". This follows the structure of CMS article pages and allows you code with that particular field in mind. If you use the hero override fragment, you can use responsive image markup generated from the Embed-a-writer.

### Working with CSS and scripts

When styling your project, work with the appropriate SASS partial in /src/scss. You'll work with either a desktop.scss and mobile.scss pair, or with a single responsive.scss file. Ideally, you'd be styling your project responsively and would therefore empty the desktop.scss and mobile.scss files before beginning. If you need to work independently for each platform, then you'd empty out the responsive.scss partial.

You can add your own jQuery and javascript functions to /src/js/app.js
This file is compiled up to /public/js/main.js and main.min.js and is included in your page.

### Adding additional scripts

You can add other scripts and frameworks to your project by placing the files in /src/js/vendor.
They’ll compile up to /public/js/vendor and you can add links to these files anywhere you'd like in your content.
You can also place links to these scripts into specific header and footer includes. These include the script references in the same locations as standard script blocks in news-platform twig files. For instance, if you wanted your script to be referenced in the header of the page, just below the initial jQuery link, you'd place your javascript link into /src/js/header-scripts.txt. To place your script reference at the bottom of the page, you'd add your reference to /src/js/footer-scripts.txt.

### Setup

1. Give this enclosing directory a project name
2. In terminal, navigate to this folder
3. Type `npm install`
4. Type gulp

### Sharing your projects for review

There are two methods for allowing others to review your project.

1. Share the url to your gulp-powered server. As long as you have your project's gulp process running, others can see your project at a url like this:
http://localhost:3000/d-article.html
http://localhost:3000/m-article.html

%yourIPaddress% can be found in the terminal when the gulp process is first run.

2. Move your project directory to the /preview directory at static.startribune.com. Avoid moving the "node_modules" directory when you do this. In fact, now would be a good time setup Transmit to ignore this directory. Once your project is on static.startribune.com, you can share a link like:

`http://static.startribune.com/preview/my-strib-project/public/preview/desktop.html`
