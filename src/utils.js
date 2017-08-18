export const utils = {
  arraysDiffer(a, b) {
    let isDifferent = false;
    if (a.length !== b.length) {
      isDifferent = true;
    } else {
      a.forEach(function forEach(item, index) {
        if (!this.isSame(item, b[index])) {
          isDifferent = true;
        }
      }, this);
    }
    return isDifferent;
  },
  objectsDiffer(a, b) {
    let isDifferent = false;
    if (Object.keys(a).length !== Object.keys(b).length) {
      isDifferent = true;
    } else {
      Object.keys(a).forEach(function forEach(key) {
        if (!this.isSame(a[key], b[key])) {
          isDifferent = true;
        }
      }, this);
    }
    return isDifferent;
  },
  isSame(a, b) {
    if (typeof a !== typeof b) {
      return false;
    } else if (Array.isArray(a) && Array.isArray(b)) {
      return !this.arraysDiffer(a, b);
    } else if (typeof a === 'function') {
      return a.toString() === b.toString();
    } else if (typeof a === 'object' && a !== null && b !== null) {
      return !this.objectsDiffer(a, b);
    }

    return a === b;
  },
  find(collection, fn) {
    for (let i = 0, l = collection.length; i < l; i += 1) {
      const item = collection[i];
      if (fn(item)) {
        return item;
      }
    }
    return null;
  },
};

export const componentUtils = {
  convertValidationsToObject(validations) {
    if (typeof validations === 'string') {
      return validations.split(/,(?![^{[]*[}\]])/g).reduce((acc, validation) => {
        let args = validation.split(':');
        const validateMethod = args.shift();

        args = args.map((arg) => {
          try {
            return JSON.parse(arg);
          } catch (e) {
            return arg; // It is a string if it can not parse it
          }
        });

        if (args.length > 1) {
          throw new Error('Formsy does not support multiple args on string validations. Use object format of validations instead.');
        }

        acc[validateMethod] = args.length ? args[0] : true;
        return acc;
      }, {});
    }

    return validations || {};
  },
  getDisplayName(Component) {
    return (
      Component.displayName ||
      Component.name ||
      (typeof Component === 'string' ? Component : 'Component')
    );
  },
  getTruthyValue(primary, secondary, key) {
    if (typeof primary[key] !== 'undefined') {
      return primary[key];
    } else if (secondary && secondary[key]) {
      return secondary[key];
    }
    return undefined;
  },
};

export default { utils, componentUtils };
