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
  return bmtHash(Buffer.concat([ tmp, data ]))
//  return Buffer.from(hash.digest('bin'), 'binary')
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

// Assumes `data` is a Buffer.
function bmtHashSection (data, sectionLength) {
//  assert(data.length !== 0)
  console.log('Running hashSection', data.length, sectionLength, data)

  var section
  if (data.length === sectionLength) {
    section = data
  } else {
    const length = data.length / 2
    const left = data.slice(0, length)
    const right = data.slice(length)
    console.log(left.length, right.length)
    section = Buffer.concat([
      bmtHashSection(left, sectionLength),
      bmtHashSection(right, sectionLength)
    ])
  }
  console.log('Section', section.length, section)

  var hash = new Keccak(256)
  hash.update(section)
  return Buffer.from(hash.digest('bin'), 'binary')
}

// NOTE: this is currently hardcoded to use keccak256
function bmtHash (data) {
  // Set up hashing parameters.
  const chunkSize = 32 //4096
  const hashSize = 32 // 256-bit
  const segmentCount = Math.ceil(chunkSize / hashSize)
  const sectionLength = 2 * hashSize
  var maxDataLength = 2
  while (maxDataLength < segmentCount) maxDataLength *= 2
  maxDataLength *= hashSize

  console.log('chunkSize', chunkSize, 'segmentCount', segmentCount, 'hashSize', hashSize, 'sectionLength', sectionLength, 'maxDataLength', maxDataLength)

  assert(Buffer.isBuffer(data))

  // Need to zero pad if data is too short.
  if (data.length < maxDataLength) {
    data = Buffer.concat([
      data,
      Buffer.alloc(maxDataLength - data.length)
    ])
  }

  if (data.length > maxDataLength) {
    console.log('Should truncate input...')
    data = data.slice(0, maxDataLength)
  }
  
  console.log(data.length)

  return bmtHashSection(data, sectionLength)
}

function pyramidHash (data) {
}

module.exports = function (opts) {
  opts = opts || { mode: 'poc2' }
  if (opts.mode === 'poc2') {
    return swarmHash
  } else {
    assert(opts.mode === 'poc3')
    return bmtHash
  }
}

// Swarm hash: 09ae927d0f3aaa37324df178928d3826820f3dd3388ce4aaebfc3af410bde23a
console.log('pyramid', bmtHash(Buffer.alloc(4096)).toString('hex'))
// Swarm hash: 92672a471f4419b255d7cb0cf313474a6f5856fb347c5ece85fb706d644b630f
//console.log('pyramid', bmtHash(Buffer.from('hello world')).toString('hex'))
