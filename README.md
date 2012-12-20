# typeahead

Bootstrap compatible typeahead component.

## use

```javascript
var Typeahead = require('typeahead');

var ta = new Typeahead(document.getElementById('input-elem') [, opt]);
```

Note: you will need to have the [jquery](https://github.com/shtylman/node-jquery) module installed with your app dependencies to use this. In the future this will change to be self containing.

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

The Typeahead menu list has the following classes applied.

* typeahead
* dropdown-menu

Each menu item is an ```a``` inside of a ```li```. When an item is selected, the ```active``` class is set on the ```li``` element.

## License

The current code is a copy of the bootstrap typeahead component and is licensed under [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
