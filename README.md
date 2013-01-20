# typeahead

typeahead widget

## use

```javascript
var Typeahead = require('typeahead');

var ta = new Typeahead(document.getElementById('input-elem') [, opt]);
```

## options

### source
> array of values or function(query, result). Call result with array of return values.

```javascript
function(query, result) {
    // AJAX query here...
    result(['foo', 'bar']);
}
```

### position
> location of the drop down menu. Valid values are ```above```, ```below```. default is ```below```

## style

Custom styling can be applied for the following rules.

### ul.typeahead
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
