export default function(_) {
    return {
        enableSip: async function(actor) {
            await _.step(actor, 'enable sip')
            const {page} = actor
            await page.waitFor('.t-btn-settings')
            await page.click('.t-btn-settings')
            await page.waitFor('.t-settings')

            await page.click('.t-tab-sip')
            await _.screenshot(actor, 'sip-disabled', {only: 'alice'})
            await page.click('.t-cb-sip-toggled')

            await page.type('.t-txt-sip-username', actor.sip.number)
            await page.type('.t-txt-sip-password', actor.sip.password)

            await page.click('.t-btn-settings-save')
            // Wait until the status indicates a registered device.
            await page.waitFor('.t-st-status-sip-registered')
            await page.waitFor('.t-st-status-sig11-registered')

            await _.screenshot(actor, 'sip-enabled', {only: 'alice'})

            // Go back to calls layer and switch to sip calling.
            await page.click('.t-btn-menu-caller')
            await page.waitFor('.t-rd-calls-protocol-sip')
            await page.click('.t-rd-calls-protocol-sip')

            page.waitFor('.t-st-status-sip-registered')
        },
    }
}
