/**
 * Test for front-end app utils.js
 */

// Available from Jest
// https://facebook.github.io/jest/docs/en/api.html#content
// https://facebook.github.io/jest/docs/en/expect.html#content

// Implicit dependencies
/* global describe, it, expect */

// Dependenciest to test
import utils from '../../app/utils.js';

// Test core utils object
describe('utils', () => {
  it('should load', () => {
    expect(utils).toBeTruthy();
  });
});

// Test enablePym function
describe('enablePym', () => {
  it('should be a function', () => {
    expect(utils.enablePym).toBeDefined();
  });
});

// Test environment function
describe('environment', () => {
  it('should be a function', () => {
    expect(utils.environment).toBeDefined();
  });

  it('should default to production', () => {
    expect(utils.environment(undefined, '').id).toBe('production');
  });

  it('should handle localhost', () => {
    expect(utils.environment(undefined, 'http://localhost/').id).toBe(
      'develop'
    );
    expect(utils.environment(undefined, 'http://127.0.0.1/').id).toBe(
      'develop'
    );
    expect(utils.environment(undefined, 'http://localhost:3000/').id).toBe(
      'develop'
    );
    expect(
      utils.environment(undefined, 'http://localhost:3000/?thing=1').id
    ).toBe('develop');
    expect(
      utils.environment(undefined, 'https://localhost:3000/path/?thing=1').id
    ).toBe('develop');
    expect(utils.environment(undefined, 'localhost:3000').id).toBe('develop');
  });

  it('should handle staging', () => {
    expect(utils.environment(undefined, 'http://example.com/staging/').id).toBe(
      'staging'
    );
    expect(
      utils.environment(
        undefined,
        'http://startribune/news/staging/project/index.html?thing=2'
      ).id
    ).toBe('staging');
  });
});
