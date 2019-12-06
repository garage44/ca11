module.exports = (app, base) => {
    /**
    * @memberof fg.components
    */
    const FieldRadio = {
        extends: base,
        props: ['options'],
        render: templates.field_radio.r,
        staticRenderFns: templates.field_radio.s,
    }

    return FieldRadio
}
