class Utils {

    constructor() {
        String.prototype.ca = function() {
            return this.charAt(0).toUpperCase() + this.slice(1)
        }
        String.prototype.uc = function() {
            return this.charAt(0).toUpperCase() + this.slice(1)
        }

        String.prototype.sid = function() {
            return this.substring(0, 10) + '...'
        }
    }

    copyObject(obj) {
        return JSON.parse(JSON.stringify(obj))
    }


    sortByMultipleKey(keys, order = 1) {
        return (a, b) => {
            if (keys.length === 0) return 0
            var key = keys[0]
            if (a[key] < b[key]) return -order
            else if (a[key] > b[key]) return order
            else return this.sortByMultipleKey(keys.slice(1))(a, b)
        }
    }


    stringifySearch(params) {
        return Object
            .keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&')
    }
}

export default Utils
