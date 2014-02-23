import SafeString from 'handlebars/safe-string';
import { merge } from "htmlbars/utils";
import { SIMPLE, ATTRIBUTE } from "htmlbars/runtime/helpers";
import { ifElse } from "htmlbars/runtime/domstring/helpers/if-unless"
import { unless } from "htmlbars/runtime/domstring/helpers/if-unless"

export function runtimeHelpers(dom, extensions) {
  var markerId = 0;

  function getMarkerPair(){
    var res = [dom.createElement('script'), dom.createElement('script')];

    //This naming scheme allows for easy finding end node, having the start one (get id of start, append '-end', document.getElementById).
    //Might be helpful in runtime. Or not.
    res[0].setAttribute('id', 'htmlbars-' + markerId);
    res[1].setAttribute('id', 'htmlbars-' + markerId + '-end');

    markerId++;

    return res;
  }

  function CONTENT(placeholder, helperName, context, params, options, helpers) {
    var value;

//    console.log('CONTENT', placeholder, helperName, context, params, options);

    var helper = LOOKUP_HELPER(helperName, context, options, helpers);
    var markers = getMarkerPair();

    placeholder.clear();

    placeholder.appendChild(markers[0]);

    if (helper) {
      value = helper(context, params, options);
    } else {
      value = SIMPLE(context, helperName, options);
    }

    if (!options.escaped) {
      value = new SafeString(value);
    }

    placeholder.appendChild(value);

    placeholder.appendChild(markers[1]);
  }

  function ELEMENT(element, helperName, context, params, options, helpers) {
    var helper = LOOKUP_HELPER(helperName, context, options, helpers);
    if (helper) {
      options.element = element;
      options.helpers = helpers;
      helper(context, params, options);

      //TODO: what exactly we do need to have here?
      //TODO: Avoid multiple markers conflict on single element
      dom.setAttribute(element, "data-htmlbars", markerId);
      markerId++;
    }
  }

//  function ATTRIBUTE(context, params, options) {
//    for (var i = 1, l = params.length; i < l; ++i) {
//      if (options.types[i] === 'id') {
//        params[i] = this.SIMPLE(context, params[i], options);
//      }
//    }
//
//    options.element.setAttribute(params[0], params.slice(1).join(''));
//  }

  function SUBEXPR(helperName, context, params, options, helpers) {
    var helper = LOOKUP_HELPER(helperName, context, options, helpers);
    if (helper) {
      return helper(context, params, options);
    } else {
      return SIMPLE(context, helperName, options);
    }
  }

  function LOOKUP_HELPER(helperName, context, options, helpers) {
    if (helperName === 'ATTRIBUTE') {
      return ATTRIBUTE;
    } else {
      if ((helpers !== undefined) && (helpers[helperName] !== undefined)) {
        return helpers[ helperName ];
      }
    }
  }

//  function SIMPLE(context, name, options) {
//    return context[name];
//  }

  var base = {
    CONTENT: CONTENT,
    SUBEXPR: SUBEXPR,
    ELEMENT: ELEMENT,
    ATTRIBUTE: ATTRIBUTE,

    'if': ifElse,
    'unless': unless
  };

  return extensions ? merge(extensions, base) : base;
}
