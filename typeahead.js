var defaults = {
    source: [],
    items: 8,
    menu: 'ul',
    item: 'li',
    minLength: 1,
    autoselect: true
}

var offset = function(el) {
    var curleft = 0,
        curtop = 0;

    if (el.offsetParent)
        do {
            curleft += el.offsetLeft;
            curtop += el.offsetTop;
        } while (el = el.offsetParent)

    return {
        left: curleft,
        top: curtop
    }
};

export default function Typeahead(element, options) {
    this.element = element;
    this.options = {};

    // update keys in defaults function
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key))
            this.options[key] = options[key] || defaults[key];
    }

    // update functions
    this.matcher = options.matcher || this.matcher;
    this.sorter = options.sorter || this.sorter;
    this.highlighter = options.highlighter || this.highlighter;
    this.updater = options.updater || this.updater;

    this.menu = document.createElement(this.options.menu);
    this.menu.classList.add('typeahead');
    this.menu.classList.add('hidden');
    document.body.appendChild(this.menu);

    return this.listen();
}

// for minification
var proto = Typeahead.prototype;

proto.constructor = Typeahead;

proto.active = function () {
    return this.menu.getElementsByClassName('active').item(0);
}

// select the current item
proto.select = function() {
    var ev = new Event('change.typeahead');
    var active = this.active()

    // add attributes to input element
    Object.keys(active.dataset).forEach(function(e) {
        this.element.dataset[e] = active.dataset[e];
    }, this);

    this.element.value = this.updater(active);
    this.element.dispatchEvent(ev);
    this.hide();
}

proto.updater = function (item) {
    return item.dataset.value;
}

// show the popup menu
proto.show = function () {
    var self = this,
        scroll = 0,
        pos = offset(self.element),
        parent = self.element;

    pos.height = self.element.offsetHeight;

    while (parent = parent.parentElement) {
        // prevent adding window scroll
        var tag = self.element.tagName.toLowerCase();
        if (tag === 'html' || tag === 'body') {
            continue;
        }
        scroll += parent.scrollTop
    }

    // if page has scrolled we need real position in viewport
    var top = pos.top + pos.height - scroll;
    var bottom = 'auto'
    var left = pos.left;

    if (self.options.position === 'above') {
        top = 'auto'
        bottom = (document.body.clientHeight - pos.top + 3) + 'px';
    } else if (self.options.position === 'right') {
        top = (top - self.element.offsetHeight) + 'px';
        left = (pos.left + self.element.offsetWidth);
    } else {
        top = top + 'px';
    }

    self.menu.style.top = top;
    self.menu.style.bottom = bottom;
    self.menu.style.left = left + 'px';
    self.menu.classList.remove('hidden');
    return self;
}

// hide the popup menu
proto.hide = function () {
    this.menu.classList.add('hidden');
    return this;
}

/**
 * Returns true if the menu is currently show
 */
proto.shown = function () {
    return !this.menu.classList.contains('hidden');
}

proto.lookup = function () {
    var self = this;
    self.query = self.element.value;

    if (!self.query || self.query.length < self.options.minLength) {
        return self.shown() ? self.hide() : self;
    }

    if (self.options.source instanceof Function) {
        self.options.source(self.query, self.process.bind(self));
    }

    else {
        self.process(self.options.source);
    }
    return self;
}

proto.process = function (items) {
    var self = this;

    items = items.filter(self.matcher, self);
    items = self.sorter(items)

    if (!items.length) {
      return self.shown() ? self.hide() : self
    }

    self.render(items.slice(0, self.options.items))
        .show()
}

proto.matcher = function (item) {
    var v = (typeof(item) === 'string') ? item : item.value;
    return ~v.toLowerCase().indexOf(this.query.toLowerCase())
}

proto.sorter = function (items) {
    var beginswith = [];
    var caseSensitive = [];
    var caseInsensitive = [];

    items.forEach(function(item) {
        var v = (typeof(item) === 'string') ? item : item.value;

        if (!v.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~v.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
    }, this);

    return beginswith.concat(caseSensitive, caseInsensitive)
}

proto.highlighter = function (value) {
    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    return value.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
    })
}

proto.render = function (items) {
    var self = this;

    items = items.map(function (item) {

        var li = document.createElement(self.options.item),
            a = document.createElement('a');

        if (typeof(item) === 'string') {
            li.dataset.value = item;
            a.innerHTML = self.highlighter(item);
        } else {
            // we expect to have an object, and will fill up the dataset.
            Object.keys(item).forEach(function(x) {
                li.dataset[x] = item[x];
            });
            a.innerHTML = self.highlighter(item.value);
        }
        
        li.appendChild(a);
        return li;
    });

    if (self.options.autoselect)
        items[0].classList.add('active');

    self.menu.innerHTML = '';
    items.forEach(function(item) {
        self.menu.appendChild(item);
    });

    return self;
}

proto.next = function () {
    var active = this.active();
    var next = active.nextElementSibling;
    active.classList.remove('active');

    if (!next) {
        next = this.menu.getElementsByTagName(this.options.item).item(0);
    }

    next.classList.add('active');
}

proto.prev = function () {
    var active = this.active();
    var prev = active.previousElementSibling;
    active.classList.remove('active');

    if (!prev) {
        var items = this.menu.getElementsByTagName(this.options.item);
        prev = items.item(items.length-1);
    }

    prev.classList.add('active');
}

proto.listen = function () {
    var self = this,
        element = self.element;

    element.addEventListener('blur', self.blur.bind(self));
    element.addEventListener('keypress', self.keypress.bind(self));
    element.addEventListener('keyup', self.keyup.bind(self));
    element.addEventListener('keydown', self.keydown.bind(self));

    self.menu.addEventListener('click', self.click.bind(self));
    self.menu.addEventListener('mouseenter', self.mouseenter.bind(self));

    return self;
}

proto.move = function (e) {
    var self = this;
    if (!this.shown()) return

    switch(e.keyCode) {
    case 9: // tab
    case 13: // enter
    case 27: // escape
        e.preventDefault()
        break

    case 38: // up arrow
        e.preventDefault()
        self.prev()
        break

    case 40: // down arrow
        e.preventDefault()
        self.next()
        break
    }

    e.stopPropagation()
}

proto.keydown = function (e) {
    this.suppressKeyPressRepeat = [40,38,9,13,27].indexOf(e.keyCode) >= 0
    this.move(e)
}

proto.keypress = function (e) {
    if (this.suppressKeyPressRepeat) return
    this.move(e)
}

proto.keyup = function (e) {
    var self = this;

    switch(e.keyCode) {
    case 40: // down arrow
    case 38: // up arrow
            break

    case 9: // tab
    case 13: // enter
        if (!this.shown()) return
        self.select()
        break

    case 27: // escape
        if (!self.shown()) return
        self.hide()
        break

    default:
        self.lookup()
    }

    e.stopPropagation()
    e.preventDefault()
}

proto.blur = function () {
    var self = this;
    setTimeout(function () { self.hide() }, 150);
}

proto.click = function (e) {
    e.stopPropagation();
    e.preventDefault();
    this.select();
}

proto.mouseenter = function (e) {
    this.active().classList.remove('active');
    e.currentTarget.classList.add('active');
}
