
const _ = require('../test')

const {CA11, options} = require('../../src/js')

_.test('[bg] starting up sequence', function(t) {
    t.plan(2)

    const ca11 = new CA11(options)

    ca11.on('factory-defaults', () => {
        // The schema is set after a factory reset.
        t.equal(
            ca11.stateStore.get('schema'),
            ca11.stateStore.schema, `storage: schema version (${ca11.stateStore.schema}) present after factory reset`,
        )
    })
    // There is no schema in the database on a fresh start.
    t.equal(ca11.stateStore.get('schema'), null, 'storage: schema absent on startup')
})


