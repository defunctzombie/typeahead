# typeahead

typeahead widget

![typeahead](https://github.com/defunctzombie/typeahead/blob/gh-pages/img.png)

## use

```javascript
var Typeahead = require('typeahead');

var input = document.createElement('input');

// source is an array of items
var ta = Typeahead(input, {
    source: ['foo', 'bar', 'baz']
});

input // =>
```

To get the default style you also have to include `style.css`.

## options

### source

Array of values or function(query, result). Call result with array of return values.

```javascript
var Typeahead = require('typeahead');
var input = document.createElement('input');

// source is an array of strings
var ta = Typeahead(input, {
    source: function(query, result) {
        result(['foo', 'bar', 'baz']);
    }
});

// Alternatively, source is an array of objects 
var ta = Typeahead(input, {
    source: function(query, result) {
        result(['foo', 'bar', 'baz']);
    }
});

input // =>
```

### minLength
Minimum input length before typeahead starts.

### menu
Tag name of DOM element to create to contain the list of matches. Default is a `ul`.

### item
Tag name to contain each match. Default is 'li'. Each item is further wrapped in an `<a>` element.

### position
location of the drop down menu. Valid values are ```above```, ```below``` and ```right```. default is ```below```

### autoselect
Automatically select first item in drop down menu. Valid values are ```true```, ```false```. Default is ```true```.

### updater
Custom function to update the value of a selected item. Default returns the `value`. Should accept an DOM node and return a string.

### matcher
Custom function to match a returned `item` or `item.value` with the input query. Default does a case-insensitive search for the query in the item. Should accept an item and return true or false.

### sorter
Custom function to sort `item`s. Default puts case-sensitive matches above case-insensitive ones. Should accept and return an Array of items.

### highlighter
Custom function to highlight matches. Default bolds the matched substring. Should accept an item and return an HTML string.

## style

Custom styling can be applied for the following rules.

### .typeahead
To style the list of suggestions.

### .typeahead.hidden
To style the hidden state of the menu

### .typeahead li
To style a li container.

### .typeahead a
To style the actual item text and selection area.

### .typeahead .active > a
To style the appearance of a selected item.

## License

The current code is fork of the bootstrap typeahead component and is licensed under [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
