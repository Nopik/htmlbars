import { TemplateCompiler } from "htmlbars/compiler/template";
import { Placeholder } from "htmlbars/runtime/placeholder";
import { preprocess } from "htmlbars/parser";
import { domStringHelpers } from "htmlbars/runtime/domstring/dom_helpers";
import { runtimeHelpers } from "htmlbars/runtime/domstring/helpers";
import { equalHTML } from "test_helpers";

module("DomStrings");

var dom = domStringHelpers();

function helpers() {
  //Need to reset counter on each run

  return runtimeHelpers(dom, {
    foo: function(context, params,options) {
      dom.setAttribute(options.element,'foo','bar');
    }
  });
}

test("it works", function() {
  /* jshint evil: true */
//  var ast = preprocess('<div>{{#if working}}Hello {{firstName}} {{lastName}}!{{else}}Hola {{firstName}}!{{/if}}</div>{{foo}}{{#foo}}{{#bar}}{{/bar}}{{/foo}}');
//  var ast = preprocess('PRE<div>pre{{#if working}}Hello {{firstName}} {{lastName}}!{{else}}Hola {{firstName}}!{{/if}}post</div>{{foo}}POST');
//  var ast = preprocess('a{{#b}}c{{#d}}e{{/d}}f{{/b}}g{{#h}}i{{#j}}k{{/j}}l{{/h}}m');
//  var ast = preprocess('a{{#if on}}c{{else}}d{{/if}}e{{#if off}}f{{else}}g{{/if}}m');
//  var ast = preprocess('a{{#b}}c{{/b}}g{{#h}}i{{/h}}m');
  var ast = preprocess('a{{b}}g{{h}}m');
//  var ast = preprocess('<div></div>');
  var compiler = new TemplateCompiler(domStringHelpers());

  var program = compiler.compile(ast);

  var template = new Function("dom", "Placeholder", "return " + program)(dom, Placeholder);

  var compiled = template({
      foo: 42,
      on: true,
      off: false,
      b: "B",
      h: "H"
    }, {
      helpers: helpers()
  });

  equal(compiled.toString(), "a<script id=\"htmlbars-0\"></script>B<script id=\"htmlbars-0-end\"></script>g<script id=\"htmlbars-1\"></script>H<script id=\"htmlbars-1-end\"></script>m");
});

test("attribute helper works", function() {
  /* jshint evil: true */
  var ast = preprocess('<div style="foo {{a}} {{{b}}}" class="foo">bar</div>');
  var compiler = new TemplateCompiler(domStringHelpers());

  var program = compiler.compile(ast);

  var template = new Function("dom", "Placeholder", "return " + program)(dom, Placeholder);

//  console.log(program);
  var compiled = template({
      a: 'A',
      b: 'B'
    }, {
      helpers: helpers()
  });

  equal(compiled.toString(), '<div class="foo" style="foo A B" data-htmlbars="0">bar</div>');
});

test("element helper works", function() {
  /* jshint evil: true */
  var ast = preprocess('<div {{foo}}>baz</div>');
  var compiler = new TemplateCompiler(domStringHelpers());

  var program = compiler.compile(ast);

  var template = new Function("dom", "Placeholder", "return " + program)(dom, Placeholder);

  var compiled = template({
    }, {
      helpers: helpers()
  });

  equal(compiled.toString(), '<div foo="bar" data-htmlbars="0">baz</div>');
});

test("if helper works", function() {
  /* jshint evil: true */
  var ast = preprocess('a{{#if bar}}b{{/if}}c');
  var compiler = new TemplateCompiler(domStringHelpers());

  var program = compiler.compile(ast);

  var template = new Function("dom", "Placeholder", "return " + program)(dom, Placeholder);

  var compiled = template({
    }, {
      helpers: helpers()
  });

  equal(compiled.toString(), '');
});
