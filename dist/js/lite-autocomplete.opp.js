class Autocomplete {
    
    constructor(input, source, parent, options) {
        this.index = -1;
        this.input = input;
        this.parent = parent;
        this.source = source;
        this.setOptions(options);
        this.onselect = function(result){};
        this.activeClass = 'autocomplete-active-primary';
    }
    
    setOptions(options) {
        this.options = {
            minLength: 1,
            delay: 0,
            max: Infinity,
            autoFocus: false,
            mode: 'strict',
            relevance: true,
            caseSensitive: false
        };
        for (let option in options) {
            let value = options[option];
            this.options[option] = value;
        }
        this.values = new Array();
        for (let i in this.source) {
            if (this.options.caseSensitive)
                this.values.push(this.source[i])
            else 
                this.values.push(this.source[i].toLowerCase());
        }
    }
    
    init() {
        let _this = this;
        this.parent.addEventListener('mouseover', function(e) {
            if (e.target.nodeName == 'LI') {
                _this.index = Array.prototype.indexOf.call(_this.parent.children, e.target);
                _this.activate();
            }
        });
        this.input.addEventListener('input', function(e) {
            let value = e.target.value;
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
                let content = e.target.textContent;
                _this.input.value = content;
                _this.onselect(content);
                _this.hide();
            }
        });
    }
    
    _keypress(e) {
        let length = this.parent.children.length;
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
                    let content = this.parent.children[this.index].textContent;
                    this.input.value = content;
                    this.onselect(content);
                case 'Escape':
                    this.hide();
                    break;
            }
        }
    }
    
    activate() {
        let previous = document.querySelector('[tag=active]');
        if (previous != null){
            previous.removeAttribute('tag');
            previous.classList.remove(this.activeClass);
        }
        let li = this.parent.children[this.index];
        li.setAttribute('tag', 'active');
        li.classList.add(this.activeClass);
    }
    
    hide() {
        let _this = this;
        window.setTimeout(function() {
            _this.index = -1;
            _this.parent.style.visibility = 'hidden';
            _this.parent.innerHTML = '';
        }, 100);
    }
    
    setCaseSensitive(mode) {
        this.options.caseSensitive = mode;
        if (mode) {
            this.values = this.source;
        } else {
            this.values = new Array();
            for (let i in this.source) {
                this.values.push(this.source[i].toLowerCase());
            }
        }
        console.log(this);
    }
    
    _flexMatch(index, value) {
        let mixed = this.values[index];
        let match = new Object();
        let words = value.split(' ');
        for (let i in words) {
            let word = words[i];
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
    
    _strictMatch(index, value) {
        let mixed = this.values[index];
        let match = {count: 2};
        if (mixed.substring(0, value.length) == value) {
            match.value = this.source[index];
        } else if (mixed.indexOf(value) >= 0) {
            match.value = this.source[index];
            if (this.options.relevance)
                match.count = 1;
        }
        return match;
    }
    
    match(value) {
        if(!this.options.caseSensitive)
            value = value.toLowerCase();
        let match = [];
        let length = this.values.length, max = this.options.max;
        let _this = this;
        window.setTimeout(function() {
            for(let i = 0, count = 0; i < length && count < max; i++, count++){
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
            let code = '';
            for (let i in matches) {
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