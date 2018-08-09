const Buffer = require('safe-buffer').Buffer
const tape = require('tape')
const swarmhash = require('../index.js')

const blobs = [
  [ 0, '011b4d03dd8c01f1049143cf9c4c817e4b167f1d1b83e5c6f0f10d89ba1e7bce' ],
  [ 0x1000 - 1, '32f0faabc4265ac238cd945087133ce3d7e9bb2e536053a812b5373c54043adb' ],
  [ 0x1000, '411dd45de7246e94589ff5888362c41e85bd3e582a92d0fda8f0e90b76439bec' ],
  [ 0x1000 + 1, '69754a0098432bbc2e84fe1205276870748a61a065ab6ef44d6a2e7b13ce044d' ],
  [ 0x2000 - 1, '69ad3c581043404f775ffa8d6f1b25ad4a9ee812971190e90209c0966116a321' ],
  [ 0x2000, 'f00222373ff82d0a178dc6271c78953e9c88f74130a52d401f5ec51475f63c43' ],
  [ 0x2000 + 1, '86d6773e79e02fd8145ee1aedba89ace0c15f2566db1249654000039a9a134bf' ],
  [ 0x80000, 'cc0854fe2c6b98e920d5c14b1a88e6d4223e55b8f78883f60939aa2485e361bf' ],
  [ 0x80020, 'ee9ffca246e70d3704740ba4df450fa6988d14a1c2439c7e734c7a77a4eb6fd3' ],
  [ 0x800020, '78b90b20c90559fb904535181a7c28929ea2f30a2329dbc25232de579709f12f' ],
  [ 2095104, 'a9958184589fc11b4027a4c233e777ebe2e99c66f96b74aef2a0638a94dd5439' ]
]

for (var i = 0; i < blobs.length; i++) {
  var blob = blobs[i]
  tape('hashing ' + blob[0] + ' zeroes', function (t) {
    t.plan(1)
    t.equal(swarmhash(Buffer.alloc(blob[0])).toString('hex'), blob[1])
  })
}
