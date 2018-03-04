import {getOptions} from 'loader-utils';
import touch from 'touch';
import validateOptions from 'schema-utils';

const schema = {
    type: 'object',
    properties: {
        transmitRules: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    test: {
                        type: 'object' // RegExp
                    },
                    targets: {
                        type: 'array',
                        minItems: 1,
                        items: {
                            type: 'string'
                        }
                    }
                },
                required: ['test', 'targets']
            }
        },
        noCreate: {
            type: 'boolean'
        }
    },
    required: ['transmitRules']
};

const getObjectType = (obj) => {
    const str = Object.prototype.toString.call(obj); // [object FooBar]
    return str.substring(8, str.length - 1);
};

// noinspection JSUnusedGlobalSymbols
/**
 * @this webpack.loader.LoaderContext
 * @param {string} source
 * @returns {*}
 */
export default function loader(source) {
    const options = getOptions(this) || {};

    //region Validation
    validateOptions(schema, options, 'Options for transmit-update-loader are invalid.');

    if (options.transmitRules.some(r => getObjectType(r.test) !== 'RegExp')) {
        throw new Error('`transmitRules.test` should be regex in transmit-update-loader.');
    }
    //endregion Validation

    const callback = this.async();

    touch(this.resourcePath, {
        mtime: true,
        nocreate: options.nocreate === true
    }, () => {
        callback(null, source);
    });
}