import _ from '../ducktape.js'

_.testAsync('[SIG11] Alice calls Bob', async() => {
    let [alice, bob] = await Promise.all(
        [_.init('alice'), _.init('bob')],
    )

    // Alice first; so she can make screenshots.

    await Promise.all([
        _.steps.meta.setup(alice),
        _.steps.meta.setup(bob),
    ])

    // Alice calls Bob.
    await _.steps.call.callActor(alice, bob, {protocol: 'sig11'})
    await _.steps.call.answerActor(bob, alice, {protocol: 'sig11'})
})
