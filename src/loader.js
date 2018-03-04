import {getOptions} from 'loader-utils';
import validateOptions from 'schema-utils';

const schema = {
    type: 'object',
    properties: {}
};

// noinspection JSUnusedGlobalSymbols
export default function loader(source) {
    const options = getOptions(this) || {};

    validateOptions(schema, options, 'Transmit Update Loader');

    // TODO code

    return source;
}