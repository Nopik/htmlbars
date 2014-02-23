require('ember-htmlbars/view');

Ember.HTMLBars.helpers.each = function(params, options) {
  var view = options.data.view,
      template = function(context, templateOptions) {
        options.data = templateOptions.data;
        return options.render(context, options);
      },
      eachView = view.createChildView(EachView, template);

  eachView.element = options.range;
  eachView.templateData = options.data;

  params[0].subscribe(function(value) {
    eachView.arrayStream.updateObj(value);
  });
  // return eachView.arrayStream;
};

var View = Ember.HTMLBars.View,
    VirtualView = Ember.HTMLBars.VirtualView;

var EachView = Ember.HTMLBars.EachView = function EachView(template, parentView, items) {
  var self = this;
  items = Ember.HTMLBars.A(items);
  View.call(this, template, parentView, items);
  this.arrayStream = new Ember.HTMLBars.ArrayObserverStream();
  this.arrayStream.subscribe(function(value) {
    Ember.run.schedule('render', self, 'arrayDidChange', value.obj, value.start, value.removed, value.added);
  });
  this.contextDidChange();
};

EachView.prototype = Object.create(View.prototype);

Ember.merge(EachView.prototype, {
  isVirtual: true,
  tagName: null,

  render: function(parentEl) {
    var el = this.element,
        childViews = this.childViews,
        childView;

    if (!childViews) { return; }
    for (var i = 0, l = childViews.length; i < l; i++) {
      childView = childViews[i];
      childView.render(el);
    }
  },

  createChildView: function(ViewClass, template, context) {
    ViewClass = ViewClass || View;
    var childView = new ViewClass(template, this, context);
    return childView;
  },

  contextWillChange: function() {},
  contextDidChange: function() {
    var context = this.context;
    if (context) {
      this.arrayStream.updateObj(context);
    }
  },

  // arrayWillChange: function(content, start, removed, added) {

  // },

  arrayDidChange: function(content, start, removed, added) {
    // teardown old views
    var childViews = this.childViews, childView, idx;

    if (childViews) {
      for (idx = start; idx < start+removed; idx++) {
        childView = childViews[idx];
        childView.element.clear();
        childView.destroy();
      }
    }

    var spliceArgs = childViews ? [start, removed] : new Array(added);

    for (idx = start; idx < start+added; idx++) {
      var item = content[idx];
      childView = this.createChildView(VirtualView, this.template, item);
      spliceArgs.push(childView);
      childView.render(this.element);
    }

    if (childViews) {
      childViews.splice.apply(childViews, spliceArgs);
    } else {
      this.childViews = spliceArgs;
    }
  }
});