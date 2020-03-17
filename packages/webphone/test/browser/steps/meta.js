export default function(_) {
    return {
        setup: async function(actor) {
            await _.steps.session.new(actor)
            await _.steps.wizard.complete(actor)
        },
        setupSip: async function(actor) {
            await _.steps.session.new(actor)
            await _.steps.wizard.complete(actor)
            await _.steps.settings.enableSip(actor)
        },
    }
}
