import {getOptions} from 'loader-utils';
import touch from 'touch';
import validateOptions from 'schema-utils';

const schema = {
    type: 'object',
    properties: {}
};

// noinspection JSUnusedGlobalSymbols
/**
 * @this webpack.loader.LoaderContext
 * @param {string} source
 * @returns {*}
 */
export default function loader(source) {
    const options = getOptions(this) || {};

    validateOptions(schema, options, 'Transmit Update Loader');

    const callback = this.async();

    touch(this.resourcePath, {
        mtime: true
    }, () => {
        callback(null, source);
    });
}