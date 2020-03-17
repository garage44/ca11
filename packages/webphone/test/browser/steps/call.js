export default function(_) {

    return {
        answerActor: async function(callee, caller, {protocol}) {
            await _.step(callee, `answers call from ${caller.session.username}`)
            await callee.page.waitFor('.t-btn-options-call-accept')
            await _.screenshot(callee, `call-ringing-${caller.session.username}`)
            await callee.page.click('.t-btn-options-call-accept')

            await callee.page.waitFor('.t-st-caller-ongoing')
            await caller.page.waitFor('.t-st-caller-ongoing')

            await _.screenshot(caller, `call-${protocol}-talking-${callee.session.username}`)
            await _.screenshot(callee, `call-${protocol}-talking-${caller.session.username}`)
        },
        callActor: async function(caller, callee, {inCall = false, protocol}) {
            await _.step(caller, `calls ${callee.session.username}`)

            // Enter a number and press the call button.
            await caller.page.click('.t-btn-menu-caller')

            // Press new call button.
            if (inCall) {
                await caller.page.waitFor('.t-btn-switcher-call-new')
                await caller.page.click('.t-btn-switcher-call-new')
            }

            await caller.page.waitFor('.t-keypad__input')

            // Test by clicking the dialpad buttons.
            await caller.page.focus('.t-keypad__input')
            await caller.page.type('.t-keypad__input', callee[protocol].number)
            await _.screenshot(caller, `call-${protocol}-keypad-dial-${callee.session.username}`, {only: 'alice'})
            await caller.page.click('.t-btn-options-call-start')
            await _.screenshot(caller, `call-${protocol}-setup-${callee.session.username}`, {only: 'alice'})
        },
        /**
         * Assumes caller and callee are already calling.
         * @param {*} caller - The caller actor.
         * @param {*} callee - The callee actor.
         * @param {*} transfer - The transfer actor.
         */
        transferActor: async function(caller, callee, transfer, {protocol}) {
            _.step(callee, `transfer ${caller.session.username} to ${transfer.session.username}`)

            await callee.page.waitFor('.t-btn-options-transfer-toggle:not([disabled])')
            await callee.page.click('.t-btn-options-transfer-toggle')

            await _.screenshot(callee, `call-${protocol}-transfer-init-${caller.session.username}-${transfer.session.username}`)

            await callee.page.click(`.call-${protocol}-${caller[protocol].number}`)

            await _.screenshot(callee, `call-${protocol}-transfer-switch-${caller.session.username}-${transfer.session.username}`)

            await callee.page.waitFor('.t-btn-options-transfer-finalize')
            await callee.page.click('.t-btn-options-transfer-finalize')

            await _.screenshot(caller, `call-${protocol}-transfer-complete-${transfer.session.username}`)
        },
    }
}
