import { getOptions } from "loader-utils";
import path from "path";
import touch from "touch";
import validateOptions from "schema-utils";

const schema = {
  type: "object",
  properties: {
    transmitRules: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          test: {
            type: "object" // RegExp
          },
          targets: {
            type: "array",
            minItems: 1,
            items: {
              type: "string"
            }
          }
        },
        required: ["test", "targets"]
      }
    },
    noCreate: {
      type: "boolean"
    }
  },
  required: ["transmitRules"]
};

const getObjectType = obj => {
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
  validateOptions(
    schema,
    options,
    "Options for transmit-update-loader are invalid."
  );

  if (options.transmitRules.some(r => getObjectType(r.test) !== "RegExp")) {
    throw new Error(
      "`transmitRules.test` should be regex in transmit-update-loader."
    );
  }
  //endregion Validation

  /** @type {string} */
  const sourcePath = this.resourcePath;
  const targetPaths = options.transmitRules.reduce(
    (acc, rule) =>
      acc.concat(
        rule.targets
          .map(target => sourcePath.replace(rule.test, target))
          .filter(
            targetPath =>
              path.normalize(sourcePath) !== path.normalize(targetPath)
          )
      ),
    []
  );

  if (targetPaths.length === 0) {
    return source;
  }

  const callback = this.async();

  Promise.all(
    targetPaths.map(targetPath =>
      touch(targetPath, {
        mtime: true,
        nocreate: options.nocreate === true
      })
    )
  ).then(() => {
    callback(null, source);
  });
}
