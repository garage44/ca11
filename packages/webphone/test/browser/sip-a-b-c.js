import _ from '../ducktape.js'

_.testAsync('[SIP] Alice calls Bob, Bob transfers Alice to Charlie', async() => {
    let [alice, bob, charlie] = await Promise.all(
        [_.init('alice'), _.init('bob'), _.init('charlie')],
    )


    await Promise.all([
        _.steps.meta.setup(alice),
        _.steps.meta.setup(bob),
        _.steps.meta.setup(charlie),
    ])

    console.log("SETUP")

    await Promise.all([
        _.steps.settings.enableSip(alice),
        _.steps.settings.enableSip(bob),
        _.steps.settings.enableSip(charlie),
    ])

    // Alice calls Bob.
    await _.steps.call.callActor(alice, bob, {protocol: 'sip'})
    await _.steps.call.answerActor(bob, alice, {protocol: 'sip'})
    await _.delay(500)
    await _.steps.call.callActor(bob, charlie, {inCall: true, protocol: 'sip'})
    await _.steps.call.answerActor(charlie, bob, {protocol: 'sip'})

    // Bob transfers Alice to Charlie.
    await _.steps.call.transferActor(alice, bob, charlie, {protocol: 'sip'})
})
