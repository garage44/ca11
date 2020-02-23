export default (app, base) => {
    /**
    * @memberof fg.components
    */
    const FieldRadio = {
        data: function() {
            return {
                // Postfix in case of multiple instances.
                postfix: shortid(),
            }
        },
        extends: base,
        props: ['options'],
        render: templates.field_radio.r,
        staticRenderFns: templates.field_radio.s,
    }

    return FieldRadio
}
