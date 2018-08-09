# swarmhash

[![Build Status](https://img.shields.io/travis/axic/swarmhash.svg?branch=master&style=flat-square)](https://travis-ci.org/axic/swarmhash)

This library can be used to calculate Ethereum Swarm hashes of data blobs.

## Usage

The only input it supports is a `Buffer` and will return a `Buffer` containing the 256 bit hash.

Example:
```js
const swarmhash = require('swarmhash')

swarmhash(Buffer.from('Hello World')).toString('hex') // d85117d40c1b74239bf0b0c4f8201e2be7d85c36efbbddc77fb9b58ed3964287
```

## License

MIT License

Copyright (C) 2016 Alex Beregszaszi
