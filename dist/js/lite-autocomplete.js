function Autocomplete(input, source, parent, options) {
    this.index = -1;
    this.input = input;
    this.parent = parent;
    this.source = source;
    
    this.onselect = function(result){};
    this.activeClass = 'autocomplete-active-primary';
    this.options = {};
    
    this.setOptions = function(opt) {
        this.options = {
            minLength: 1,
            delay: 0,
            max: Infinity,
            autoFocus: false,
            mode: 'strict',
            relevance: true,
            caseSensitive: false
        };
        for (var option in opt) {
            var value = opt[option];
            this.options[option] = value;
        }
        this.values = new Array();
        for (var i in this.source) {
            if (this.options.caseSensitive)
                this.values.push(this.source[i])
            else 
                this.values.push(this.source[i].toLowerCase());
        }
    }
    
    this.setOptions(options);
    
    this.init = function() {
        var _this = this;
        this.parent.addEventListener('mouseover', function(e) {
            if (e.target.nodeName == 'LI') {
                _this.index = Array.prototype.indexOf.call(_this.parent.children, e.target);
                _this.activate();
            }
        });
        this.input.addEventListener('input', function(e) {
            var value = e.target.value;
            if (value.length >= _this.options.minLength)
                _this.match(value);
            else 
                _this.hide();
        });
        this.input.addEventListener('keydown', function(e) {
            _this._keypress(e);
        });
        this.input.addEventListener('blur', function() {
            _this.hide();
        });
        this.input.addEventListener('focus', function() {
            if(_this.options.autoFocus)
                _this.match('');
        });
        _this.parent.addEventListener('click', function(e) {
            if (e.target.nodeName == 'LI') {
                var content = e.target.textContent;
                _this.input.value = content;
                _this.onselect(content);
                _this.hide();
            }
        });
    }
    
    this._keypress = function(e) {
        var length = this.parent.children.length;
        if (length > 0) {
            switch(e.code) {
                case 'ArrowDown':
                    if (this.index == -1 || (this.index + 1) >= length)
                        this.index = 0;
                    else 
                        this.index++;
                    this.activate();
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    if (this.index == -1 || (this.index - 1) < 0)
                        this.index = length - 1;
                    else 
                        this.index--;
                    this.activate();
                    e.preventDefault();
                    break;
                case 'Enter':
                case 'NumpadEnter':
                    var content = this.parent.children[this.index].textContent;
                    this.input.value = content;
                    this.onselect(content);
                    this.onselect(content);
                case 'Escape':
                    this.hide();
                    break;
            }
        }
    }
    
    this.activate = function() {
        var previous = document.querySelector('[tag=active]');
        if (previous != null){
            previous.removeAttribute('tag');
            previous.classList.remove(this.activeClass);
        }
        var li = this.parent.children[this.index];
        li.setAttribute('tag', 'active');
        li.classList.add(this.activeClass);
    }
    
    this.hide = function() {
        var _this = this;
        window.setTimeout(function() {
            _this.index = -1;
            _this.parent.style.visibility = 'hidden';
            _this.parent.innerHTML = '';
        }, 100);
    }
    
    this.setCaseSensitive = function(mode) {
        this.options.caseSensitive = mode;
        if (mode) {
            this.values = this.source;
        } else {
            this.values = new Array();
            for (var i in this.source) {
                this.values.push(this.source[i].toLowerCase());
            }
        }
        console.log(this);
    }
    
    this._flexMatch = function(index, value) {
        var mixed = this.values[index];
        var match = new Object();
        var words = value.split(' ');
        for (var i in words) {
            var word = words[i];
            if (mixed.indexOf(word) >= 0) {
                if (match.value != undefined) {
                    match.count++;
                } else {
                    match.value = this.source[index];
                    match.count = 1;
                }
            }
        }
        return match;
    }
    
    this._strictMatch = function(index, value) {
        var mixed = this.values[index];
        var match = {count: 2};
        if (mixed.substring(0, value.length) == value) {
            match.value = this.source[index];
        } else if (mixed.indexOf(value) >= 0) {
            match.value = this.source[index];
            if (this.options.relevance)
                match.count = 1;
        }
        return match;
    }
    
    this.match = function(value) {
        if(!this.options.caseSensitive)
            value = value.toLowerCase();
        var match = [];
        var length = this.values.length, max = this.options.max;
        var _this = this;
        window.setTimeout(function() {
            for(var i = 0, count = 0; i < length && count < max; i++, count++){
                if (_this.options.mode == 'flex')
                    var result = _this._flexMatch(i, value);
                else 
                    var result = _this._strictMatch(i, value);
                if (result.value != undefined)
                    match.push(result);
                else 
                    count--;
            }
            if (_this.options.relevance) {
                var matches = match.sort(function(a, b) {
                    if (a.count < b.count)
                        return 1;
                    else if (a.count > b.count)
                        return -1;
                    return 0;
                });
            } else {
                var matches = match;
            }
            var code = '';
            for (var i in matches) {
                code += '<li>' + matches[i].value + '</li>';
            }
            if (code != '')
                _this.parent.style.visibility = 'visible';
            else 
                _this.parent.style.visibility = 'hidden';
            _this.parent.innerHTML = code;
        }, this.options.delay);
    }
}
