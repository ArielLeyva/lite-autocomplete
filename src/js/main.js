let formController;
window.addEventListener('load', function() {
    formController = new FormController();
    formController.autocomplete.onselect = function(result) {
        console.log('Seleccionaste: ' + result);
    }
});

class FormController {
    
    constructor() {
        this.defaultOptions = {
            minLength: 1,
            delay: 0,
            max: Infinity,
            autoFocus: false,
            mode: 'strict',
            relevance: true,
            caseSensitive: false
        };
        this.type = {
            minLength: 'number', 
            delay: 'number', 
            max: 'number', 
            autoFocus: 'boolean',
            mode: 'select', 
            relevance: 'boolean', 
            caseSensitive: 'boolean'
        };
        
        let parent = document.getElementById('parent');
        this.autocomplete = new Autocomplete(document.getElementById('input'), countries, parent, this.defaultOptions);
        this.autocomplete.init();
        
        let form = document.getElementById('optionsForm');
        let _this = this;
        form.addEventListener('reset', function(e) {
            _this.autocomplete.setOptions(_this.defaultOptions);
            for (let name in _this.defaultOptions)
                _this.showDescription(name, _this.defaultOptions[name]);
        });
        form.reset();
        this.addFormListener();
    }
    
    addFormListener() {
        this.options = {};
        for (let name in this.defaultOptions)
            this.options[name] = this.defaultOptions[name];
        let _this = this;
        for (let name in this.type) {
            let input = document.getElementById(name);
            if (this.type[name] == 'boolean' || this.type[name] == 'select') {
                input.addEventListener('change', function() {
                    _this.stateChange(input, name)
                });
            } else {
                input.addEventListener('input', function() {
                    _this.inputChange(input, name);
                });
            }
        }
    }
    
    stateChange(input, name) {
        if (this.type[name] == 'boolean') {
            this.options[name] = input.checked;
            this.showDescription(name, input.checked);
        } else {
            this.options[name] = input.value;
            this.showDescription(name, input.value);
        }
        this.autocomplete.setOptions(this.options);
    }
    
    inputChange(input, name) {
        if (input.value != '')
            this.options[name] = input.value;
        else
            this.options[name] = this.defaultOptions[name];
        this.autocomplete.setOptions(this.options);
        this.showDescription(name, input.value);
    }
    
    showDescription(option, value) {
        if (option != 'relevance') {
            let small = document.getElementById(option + 'Description');
            if (this.defaultOptions[option] == value) {
                small.innerText = descriptions[option].def;
            } else {
                let des = descriptions[option].des;
                if (des.indexOf('%value%') >= 0) 
                    small.innerText = des.replace('%value%', value)
                else 
                    small.innerText = des;
            }
        }
    }
}