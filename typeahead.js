"use strict"; // jshint ;_;

var $ = require('jquery');

var defaults = {
  source: []
, items: 8
, menu: '<ul class="typeahead dropdown-menu"></ul>'
, item: '<li><a href="#"></a></li>'
, minLength: 1
}

var Typeahead = function (element, options) {
  this.$element = $(element)
  this.options = $.extend({}, defaults, options)
  this.matcher = this.options.matcher || this.matcher
  this.sorter = this.options.sorter || this.sorter
  this.highlighter = this.options.highlighter || this.highlighter
  this.updater = this.options.updater || this.updater
  this.$menu = $(this.options.menu).appendTo('body')
  this.source = this.options.source
  this.shown = false
  this.listen()
}

Typeahead.prototype = {

  constructor: Typeahead

, select: function () {
    var val = this.$menu.find('.active').attr('data-value')
    this.$element
      .val(this.updater(val))
      .change()
    return this.hide()
  }

, updater: function (item) {
    return item
  }

, show: function () {
    var pos = $.extend({}, this.$element.offset(), {
      height: this.$element[0].offsetHeight
    })

    var top = pos.top + pos.height
    var bottom = 'auto'

    if (this.options.position === 'above') {
      top = 'auto'
      bottom = $(document).height() - pos.top + 3;
    }

    this.$menu.css({
      top: top
    , bottom: bottom
    , left: pos.left
    })

    this.$menu.show()
    this.shown = true
    return this
  }

, hide: function () {
    this.$menu.hide()
    this.shown = false
    return this
  }

, lookup: function (event) {
    var items

    this.query = this.$element.val()

    if (!this.query || this.query.length < this.options.minLength) {
      return this.shown ? this.hide() : this
    }

    items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source

    return items ? this.process(items) : this
  }

, process: function (items) {
    var that = this

    items = $.grep(items, function (item) {
      return that.matcher(item)
    })

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
    var that = this

    items = $(items).map(function (i, item) {
      i = $(that.options.item).attr('data-value', item)
      i.find('a').html(that.highlighter(item))
      return i[0]
    })

    items.first().addClass('active')
    this.$menu.html(items)
    return this
  }

, next: function (event) {
    var active = this.$menu.find('.active').removeClass('active')
      , next = active.next()

    if (!next.length) {
      next = $(this.$menu.find('li')[0])
    }

    next.addClass('active')
  }

, prev: function (event) {
    var active = this.$menu.find('.active').removeClass('active')
      , prev = active.prev()

    if (!prev.length) {
      prev = this.$menu.find('li').last()
    }

    prev.addClass('active')
  }

, listen: function () {
    this.$element
      .on('blur',     $.proxy(this.blur, this))
      .on('keypress', $.proxy(this.keypress, this))
      .on('keyup',    $.proxy(this.keyup, this))

    if ($.browser.chrome || $.browser.webkit || $.browser.msie) {
      this.$element.on('keydown', $.proxy(this.keydown, this))
    }

    this.$menu
      .on('click', $.proxy(this.click, this))
      .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
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
    this.suppressKeyPressRepeat = !~$.inArray(e.keyCode, [40,38,9,13,27])
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
    var that = this
    setTimeout(function () { that.hide() }, 150)
  }

, click: function (e) {
    e.stopPropagation()
    e.preventDefault()
    this.select()
  }

, mouseenter: function (e) {
    this.$menu.find('.active').removeClass('active')
    $(e.currentTarget).addClass('active')
  }
}

module.exports = Typeahead;
