function ifUnless(straight, context, params, options) {
  if (straight) {
    options.render(context, options)
  }
};

export function ifElse(context, params, options) {
  ifUnless(context[params[0]], context, params, options);
};
