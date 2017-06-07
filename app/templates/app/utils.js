/**
 * Utility functions.
 */

/* global window, document, pym, _ */
'use strict';

// Dependencies
import queryString from 'query-string';

// Util class
class Util {
  constructor(options) {
    this.options = options;

    // Defaults
    this.options.pym = this.options.pym === undefined ? true : this.options.pym;

    // Read in query params
    this.parseQuery();

    // Enable pym
    if (this.options.pym) {
      this.pym = !_.isUndefined(window.pym) ? new pym.Child({ polling: 500 }) : undefined;
    }
  }

  // Get query params and adjust as needed
  parseQuery() {
    this.query = queryString.parse(document.location.search);

    // Adjust options
    if (this.query.pym && this.query.pym === 'true') {
      this.options.pym = true;
    }
  }

  // Super basic deep clone
  deepClone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  // Simple check to see if embedded in iframe
  isEmbedded() {
    if (!_.isUndefined(this.embedded)) {
      return this.embedded;
    }

    try {
      this.embedded = window.self !== window.top;
    }
    catch(e) {
      this.embedded = true;
    }

    return this.embedded;
  }

  // Check for local storage
  hasLocalStorage() {
    if (!_.isUndefined(this.localStorage)) {
      return this.localStorage;
    }

    try {
      window.localStorage.setItem('test', 'test');
      window.localStorage.removeItem('test');
      this.localStorage = true;
    }
    catch(e) {
      this.localStorage = false;
    }

    return this.localStorage;
  }

  // Check for geolocation
  hasGeolocate() {
    return (window.navigator && 'geolocation' in window.navigator);
  }

  // Basic geolocation function
  geolocate(done) {
    if (this.hasGeolocate()) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        done(null, { lat: position.coords.latitude, lng: position.coords.longitude });
      }, () => {
        done('Unable to find your position.');
      });
    }
    else {
      done('Geolocation not available');
    }
  }
}

// Export a generator for the class.
export default (options) => {
  return new Util(options);
};
