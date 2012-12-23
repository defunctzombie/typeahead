"use strict"; // jshint ;_;

var xtend = require('xtend');
var dom = require('dom');

var defaults = {
  source: []
, items: 8
, menu: '<ul class="typeahead dropdown-menu"></ul>'
, item: '<li><a href="#"></a></li>'
, minLength: 1
}

var Typeahead = function (element, options) {
  this.element = dom(element);
  this.options = xtend({}, defaults, options);
  this.matcher = this.options.matcher || this.matcher
  this.sorter = this.options.sorter || this.sorter
  this.highlighter = this.options.highlighter || this.highlighter
  this.updater = this.options.updater || this.updater
  this.menu = dom(this.options.menu);
  dom(document.body).append(this.menu);

  this.source = this.options.source
  this.shown = false
  this.listen()
}

Typeahead.prototype = {

  constructor: Typeahead

, select: function () {
    var val = this.menu.find('.active').attr('data-value');

    this.element
      .value(this.updater(val))
      .emit('change');

    return this.hide()
  }

, updater: function (item) {
    return item
  }

, show: function () {
    var offset = this.element.offset();
    var pos = xtend({}, offset, {
      height: this.element.offsetHeight
    })

    var top = pos.top + pos.height
    var bottom = 'auto'

    if (this.options.position === 'above') {
      top = 'auto'
      bottom = document.body.clientHeight - pos.top + 3;
    }

    this.menu.css({
      top: top,
      bottom: bottom,
      left: pos.left
    });

    this.menu.show();
    this.shown = true
    return this
  }

, hide: function () {
    this.menu.hide();
    this.shown = false
    return this
  }

, lookup: function (event) {
    var items

    this.query = this.element.value();

    if (!this.query || this.query.length < this.options.minLength) {
      return this.shown ? this.hide() : this
    }

    var is_func = (this.source instanceof Function)
    items = is_func ? this.source(this.query, this.process.bind(this)) : this.source

    return items ? this.process(items) : this
  }

, process: function (items) {
    var self = this

    items = items.filter(self.matcher.bind(self));
    items = this.sorter(items)

    if (!items.length) {
      return this.shown ? this.hide() : this
    }

    return this.render(items.slice(0, this.options.items)).show()
  }

, matcher: function (item) {
    return ~item.toLowerCase().indexOf(this.query.toLowerCase())
  }

, sorter: function (items) {
    var beginswith = []
      , caseSensitive = []
      , caseInsensitive = []
      , item

    while (item = items.shift()) {
      if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
      else if (~item.indexOf(this.query)) caseSensitive.push(item)
      else caseInsensitive.push(item)
    }

    return beginswith.concat(caseSensitive, caseInsensitive)
  }

, highlighter: function (item) {
    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
    return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
      return '<strong>' + match + '</strong>'
    })
  }

, render: function (items) {
    var self = this

    items = items.map(function (item) {
      var li = dom(self.options.item);
      li.attr('data-value', item);
      li.find('a').html(self.highlighter(item));
      return li
    })

    items[0].addClass('active');
    this.menu.html(items);
    return this
  }

, next: function (event) {
    var active = this.menu.find('.active').removeClass('active');
    var next = active.next();

    if (!next.length) {
      next = this.menu.find('li').first();
    }

    next.addClass('active')
  }

, prev: function (event) {
    var active = this.menu.find('.active').removeClass('active');
    var prev = active.prev();

    if (!prev.length) {
      prev = this.menu.find('li').last();
    }

    prev.addClass('active')
  }

, listen: function () {
    var self = this;

    self.element
      .on('blur', self.blur.bind(self))
      .on('keypress', self.keypress.bind(self))
      .on('keyup', self.keyup.bind(self))
      .on('keydown', self.keydown.bind(self))

    self.menu
      .on('click', self.click.bind(self))
      .on('mouseenter', 'li', self.mouseenter.bind(self))
  }

, move: function (e) {
    if (!this.shown) return

    switch(e.keyCode) {
      case 9: // tab
      case 13: // enter
      case 27: // escape
        e.preventDefault()
        break

      case 38: // up arrow
        e.preventDefault()
        this.prev()
        break

      case 40: // down arrow
        e.preventDefault()
        this.next()
        break
    }

    e.stopPropagation()
  }

, keydown: function (e) {
    this.suppressKeyPressRepeat = [40,38,9,13,27].indexOf(e.keyCode) >= 0
    this.move(e)
  }

, keypress: function (e) {
    if (this.suppressKeyPressRepeat) return
    this.move(e)
  }

, keyup: function (e) {
    switch(e.keyCode) {
      case 40: // down arrow
      case 38: // up arrow
        break

      case 9: // tab
      case 13: // enter
        if (!this.shown) return
        this.select()
        break

      case 27: // escape
        if (!this.shown) return
        this.hide()
        break

      default:
        this.lookup()
    }

    e.stopPropagation()
    e.preventDefault()
}

, blur: function (e) {
    var self = this
    setTimeout(function () { self.hide() }, 150)
  }

, click: function (e) {
    e.stopPropagation()
    e.preventDefault()
    this.select()
  }

, mouseenter: function (e) {
    this.menu.find('.active').removeClass('active');
    dom(e.currentTarget).addClass('active');
  }
}

module.exports = Typeahead;
