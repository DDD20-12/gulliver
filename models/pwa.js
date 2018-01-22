/**
 * Copyright 2015-2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const uri = require('urijs');
const URL = require('url');
const Manifest = require('../models/manifest');
const User = require('../models/user');

class Pwa {
  constructor(manifestUrl, manifestModel) {
    // remove hash from url
    manifestUrl && (this.manifestUrl = removeHash(manifestUrl));
    this._manifest = stringifyManifestIfNeeded(manifestModel);
    this.created = new Date();
    this.updated = this.created;
    this.visible = true;
  }

  get shortName() {
    if (!this.manifest) {
      return '';
    }
    return this.manifest.shortName || '';
  }

  get name() {
    if (!this.manifest) {
      return '';
    }
    return this.manifest.name || '';
  }

  get displayName() {
    return this.name ||
      this.shortName ||
      trimManifestFile(this.manifestUrl);
  }

  get description() {
    if (this.manifest && this.manifest.description) {
      return this.manifest.description;
    }

    return this.metaDescription || '';
  }

  get startUrl() {
    if (!this.manifest) {
      return '';
    }
    return this.manifest.startUrl || '';
  }

  get absoluteStartUrl() {
    if (!this.manifestUrl) {
      return '';
    }

    const startUrl = this.startUrl || '/';
    return this._cleanUrl(uri(startUrl).absoluteTo(this.manifestUrl).toString());
  }

  get backgroundColor() {
    if (!this.manifest) {
      return '#ffffff';
    }

    return this.manifest.backgroundColor || '#ffffff';
  }

  get manifest() {
    if (!this._manifest) {
      return null;
    }
    return new Manifest(this.manifestUrl, JSON.parse(this._manifest));
  }

  set manifest(value) {
    if (value && typeof value === 'object') {
      this._manifest = value.raw;
    } else {
      this._manifest = value;
    }
  }

  get manifestAsString() {
    return this._manifest;
  }

  setUser(user) {
    this.user = new User(user);
  }

  generateEncodedStartUrl() {
    const parsedUrl = URL.parse(this.absoluteStartUrl);
    this.encodedStartUrl = encodeURIComponent(parsedUrl.hostname + parsedUrl.pathname);
    return this.encodedStartUrl;
  }

  isNew() {
    return this.created === this.updated;
  }

  _cleanUrl(input) {
    const url = new URL.URL(input);
    for (const name of url.searchParams.keys()) {
      if (name.toLowerCase().startsWith('utm_')) {
        url.searchParams.delete(name);
      }
    }
    return url.toString();
  }
}

function trimManifestFile(url) {
  let startIndex = url.indexOf('//');
  if (startIndex === -1) {
    startIndex = 0;
  } else {
    startIndex += 2;
  }
  let endIndex = url.lastIndexOf('/');
  if (endIndex === -1) {
    endIndex = url.length;
  }
  return url.substring(startIndex, endIndex);
}

function stringifyManifestIfNeeded(manifest) {
  if (manifest && typeof manifest === 'object') {
    return manifest.raw;
  }
  return manifest;
}

function removeHash(urlString) {
  const url = URL.parse(urlString);
  url.hash = '';
  return url.format();
}

module.exports = Pwa;
