var View = Ember.HTMLBars.View;

Ember.HTMLBars.helpers.view = function HTMLBars_view(params, options) {
  options.data.view.createChildView(View, options.render);
};