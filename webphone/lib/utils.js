String.prototype.ca = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}
String.prototype.uc = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

String.prototype.sid = function() {
    return this.substring(0, 10) + '...'
}


export const copyObject = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}


export const isObject= (item) => {
    return (item && typeof item === 'object' && !Array.isArray(item))
}


/**
 * Get an object reference from a keypath.
 * @param {Object} obj - The object to find the reference in.
 * @param {Array} keypath - The keypath to search.
 * @returns {*|undefined} - The reference when found, undefined otherwise.
*/
export const getKeyPath = (obj, keypath) => {
    if (keypath.length === 1) {
    // Arrived at the end of the keypath. Check if the property exists.
    // eslint-disable-next-line no-prototype-builtins
        if (!obj || !obj.hasOwnProperty(keypath[0])) return undefined
        return obj[keypath[0]]
    } else {
        if (!obj) return undefined
        return getKeyPath(obj[keypath[0]], keypath.slice(1))
    }
}


export const mergeDeep = (target, ...sources) => {
    if (!sources.length) return target
    const source = sources.shift()

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}})
                mergeDeep(target[key], source[key])
            } else if (Array.isArray(source[key])) {
                Object.assign(target, {[key]: source[key]})
            } else {
                target[key] = source[key]
            }
        }
    }

    return mergeDeep(target, ...sources)
}


export const setKeyPath = (vm, obj, keypath, value) => {
    if (keypath.length === 1) {
        // Arrived at the end of the path. Make the property reactive.
        if (!obj[keypath[0]]) vm.$set(obj, keypath[0], value)
        return obj[keypath[0]]
    } else {
        if (!obj[keypath[0]]) obj[keypath[0]] = {}
        return setKeyPath(vm, obj[keypath[0]], keypath.slice(1), value)
    }
}


export const sortByMultipleKey = (keys, order = 1) => {
    return (a, b) => {
        if (keys.length === 0) return 0
        var key = keys[0]
        if (a[key] < b[key]) return -order
        else if (a[key] > b[key]) return order
        else return sortByMultipleKey(keys.slice(1))(a, b)
    }
}

export default {
    copyObject,
    sortByMultipleKey,
}
