import { FragmentOpcodeCompiler } from './fragment_opcode';
import { FragmentCompiler } from './fragment';
import { HydrationOpcodeCompiler } from './hydration_opcode';
import { HydrationCompiler } from './hydration';
import { ASTWalker } from './ast_walker';

export function TemplateCompiler() {
  this.fragmentOpcodeCompiler = new FragmentOpcodeCompiler();
  this.fragmentCompiler = new FragmentCompiler();
  this.hydrationOpcodeCompiler = new HydrationOpcodeCompiler();
  this.hydrationCompiler = new HydrationCompiler();
  this.templates = [];
  this.childTemplates = [];
}

TemplateCompiler.prototype.compile = function(ast) {
  var astWalker = new ASTWalker(this);
  astWalker.visit(ast);
  return this.templates.pop();
};

TemplateCompiler.prototype.startTemplate = function(childCount) {
  this.fragmentOpcodeCompiler.startTemplate();
  this.hydrationOpcodeCompiler.startTemplate();

  this.childTemplates.length = 0;
  while(childCount--) {
    this.childTemplates.push(this.templates.pop());
  }
};

TemplateCompiler.prototype.endTemplate = function() {
  this.fragmentOpcodeCompiler.endTemplate();
  this.hydrationOpcodeCompiler.endTemplate();

  // function build(dom) { return fragment; }
  var fragmentProgram = this.fragmentCompiler.compile(
    this.fragmentOpcodeCompiler.opcodes
  );

  // function hydrate(fragment) { return mustaches; }
  var hydrationProgram = this.hydrationCompiler.compile(
    this.hydrationOpcodeCompiler.opcodes, this.childTemplates
  );

  var template =
    '(function (){\n' +
      fragmentProgram +
      hydrationProgram +
    'var cachedFragment = null;\n' +
    'return function template(context, options) {\n' +
    '  var fastBoot = false;\n' +
    '  if (cachedFragment === null) {\n' +
    '    if( options && options.data && options.data.view && options.data.view.fastBoot ) {\n'+
    '      cachedFragment = options.data.view.fastBoot.root.cloneNode(true);\n' +
    '      /* TODO: dehydrate cachedFragment */\n' +
    '      fastBoot = true\n' +
    '    } else { \n' +
    '      /* Note: If all your views are using fastBoot, you could actually have smaller templates by not including build() */\n' +
    '      cachedFragment = build(dom);\n' +
    '    }\n' +
    '  }\n' +
    '  var clone = cachedFragment.cloneNode(true);\n' +
    '  var mustaches = hydrate(clone);\n' +
    '  var helpers = options && options.helpers || {};\n' +
    '  var mustache;\n' +
    '  for (var i = 0, l = mustaches.length; i < l; i++) {\n' +
    '    mustache = mustaches[i];\n' +
    '    var name = mustache[0],\n' +
    '        params = mustache[1],\n' +
    '        helperOptions = mustache[2];\n' +
    '    helperOptions.helpers = helpers;\n' +
    '    helperOptions.data = options.data;\n' +
    '    if (name === "ATTRIBUTE") {\n' +
    '      helpers.ATTRIBUTE(context, helperOptions.name, params, helperOptions);\n' +
    '    } else {\n' +
    '      if( fastBoot == true ) {\n' +
    '        var text = helperOptions.range.end.textContent;\n' +
    '        Ember.set(context, name, text);\n' +
    '        var tmp = helperOptions.range.end.nextSibling;\n' +
    '        helperOptions.range.parent.removeChild(helperOptions.range.end);\n' +
    '        helperOptions.range.end = tmp;\n' +
    '      }\n' +
    '      helpers.RESOLVE(context, name, params, helperOptions);\n' +
    '    }\n' +
    '  }\n' +
    '  return clone;\n' +
    '};\n' +
    '}())';

  this.templates.push(template);
};

TemplateCompiler.prototype.openElement = function(element, i, l) {
  this.fragmentOpcodeCompiler.openElement(element, i, l);
  this.hydrationOpcodeCompiler.openElement(element, i, l);
};

TemplateCompiler.prototype.closeElement = function(element, i, l) {
  this.fragmentOpcodeCompiler.closeElement(element, i, l);
  this.hydrationOpcodeCompiler.closeElement(element, i, l);
};

TemplateCompiler.prototype.block = function(block, i, l) {
  this.fragmentOpcodeCompiler.block(block, i, l);
  this.hydrationOpcodeCompiler.block(block, i, l);
};

TemplateCompiler.prototype.text = function(string, i, l) {
  this.fragmentOpcodeCompiler.text(string, i, l);
  this.hydrationOpcodeCompiler.text(string, i, l);
};

TemplateCompiler.prototype.node = function (node, i, l) {
  this.fragmentOpcodeCompiler.node(node, i, l);
  this.hydrationOpcodeCompiler.node(node, i, l);
};
