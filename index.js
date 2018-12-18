const assert = require('assert')
const Buffer = require('safe-buffer').Buffer
const Keccak = require('keccakjs')

// NOTE: it only supports 48 bit lengths
function swarmHashBlock (data, totalLength) {
  var hash = new Keccak(256)
  var tmp = Buffer.alloc(8)
  tmp.writeUIntLE(totalLength, 0, 6)
  hash.update(tmp)
  hash.update(data)
  return Buffer.from(hash.digest('bin'), 'binary')
}

function swarmHash (data) {
  const length = data.length

  if (length <= 4096) {
    return swarmHashBlock(data, length)
  }

  var maxSize = 4096
  while ((maxSize * (4096 / 32)) < length) {
    maxSize *= (4096 / 32)
  }

  var innerNodes = []
  for (var i = 0; i < length; i += maxSize) {
    const size = (maxSize < (length - i)) ? maxSize : (length - i)
    innerNodes.push(swarmHash(data.slice(i, i + size)))
  }
  return swarmHashBlock(Buffer.concat(innerNodes), length)
}

function keccak256Buffer (data) {
  var hash = new Keccak(256)
  hash.update(data)
  return Buffer.from(hash.digest('bin'), 'binary')
}

// Assumes `data` is a Buffer.
function pyramidHashSection (data, sectionLength) {
  var section
  if (data.length === sectionLength) {
    section = data
  } else {
    const length = data.length / 2
    section = Buffer.concat([
      pyramidHashSection(data.slice(0, length), length),
      pyramidHashSection(data.slice(length), length)
    ])
//    section = Buffer.concat([ keccak256Buffer(data.slice(0, length)), keccak256Buffer(data.slice(length)) ])
  }
  console.log(section)

  var hash = new Keccak(256)
  hash.update(section)
  return Buffer.from(hash.digest('bin'), 'binary')
}

// NOTE: this is currently hardcoded to use keccak256
function pyramidHash (data) {
  const chunkSize = 4096
  const hashSize = 32
  const sectionLength = 2 * hashSize
  var maxDataLength = 2
  const segmentCount = Math.ceil(chunkSize / hashSize)
  while (maxDataLength < segmentCount) maxDataLength *= 2
  maxDataLength *= hashSize

  console.log(chunkSize, segmentCount, hashSize, sectionLength, maxDataLength)

  assert(Buffer.isBuffer(data))

  // Need to zero pad if data is too short.
  if (data.length < maxDataLength) {
    data = Buffer.concat([
      data,
      Buffer.alloc(maxDataLength - data.length)
    ])
  }
  
  console.log(data.length)

  return pyramidHashSection(data, maxDataLength)
}

module.exports = function (opts) {
  opts = opts || { mode: 'poc3' }
  if (opts.mode === 'poc2') {
    return swarmHash
  } else {
    assert(opts.mode === 'poc3')
    return pyramidHash
  }
}
