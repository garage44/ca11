import components from './components.js'
import templates from './templates.js'


export default function(app) {
    let definitions = {}
    for (const name of Object.keys(components)) {
        let definition
        // Either define a component with a closure function for
        // additional context, or as a plain object.
        if (components[name].apply) {
            definition = components[name](app)
        } else {
            definition = components[name]
        }

        Object.assign(definition, {
            render: templates[name].r,
            staticRenderFns: templates[name].s,
        })

        definitions[name] = app.Vue.component(name, definition)
    }

    for (const name of Object.keys(templates)) {
        if (!components[name]) {
            console.warn(`component missing for template: ${name}`)
        }
    }

    return definitions
}
