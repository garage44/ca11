import Field from '../../field.js'


export default {
    data: function() {
        return {
            // Postfix in case of multiple instances.
            postfix: shortid(),
        }
    },
    extends: Field,
    props: ['options'],

}
