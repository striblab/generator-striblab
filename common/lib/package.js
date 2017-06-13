/**
 * Common function to build package json.
 */
'use strict';

// Dependencies
const _ = require('lodash');

// Package building function
module.exports = function(context, dependencies) {
  context = context || {};
  dependencies = dependencies || {};

  return {
    name: _.kebabCase(context.name),
    version: context.version || '0.0.1',
    description: context.description,
    author: {
      name: context.authorName,
      email: context.authorEmail
    },
    main: context.main || 'app/index.js',
    scripts: {
      test: 'jest'
    },
    keywords: context.keywords || [],
    engines: {
      node: '>=6.9'
    },
    dependencies: dependencies.dependencies || {},
    devDependencies: dependencies.devDependencies || {},
    license: 'MIT'
  };
};
