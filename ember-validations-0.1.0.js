// Last commit: e7f9413 (2013-02-24 18:48:15 -0500)


(function() {
Ember.Validations = Ember.Namespace.create({
  VERSION: '0.0.1'
});

})();



(function() {
Ember.Validations.messages = {
  render: function(attribute, context) {
    return Handlebars.compile(Ember.Validations.messages.defaults[attribute])(context);
  },
  defaults: {
    inclusion: "is not included in the list",
    exclusion: "is reserved",
    invalid: "is invalid",
    confirmation: "doesn't match {{attribute}}",
    accepted: "must be accepted",
    empty: "can't be empty",
    blank: "can't be blank",
    present: "must be blank",
    too_long: "is too long (maximum is {{count}} characters)",
    too_short: "is too short (minimum is {{count}} characters)",
    wrong_length: "is the wrong length (should be {{count}} characters)",
    not_a_number: "is not a number",
    not_an_integer: "must be an integer",
    greater_than: "must be greater than {{count}}",
    greater_than_or_equal_to: "must be greater than or equal to {{count}}",
    equal_to: "must be equal to {{count}}",
    less_than: "must be less than {{count}}",
    less_than_or_equal_to: "must be less than or equal to {{count}}",
    other_than: "must be other than {{count}}",
    odd: "must be odd",
    even: "must be even"
  }
};

})();



(function() {
Ember.Validations.Errors = Ember.Object.extend();

})();



(function() {
Ember.Validations.Mixin = Ember.Mixin.create({
  init: function() {
    this.set('errors', Ember.Validations.Errors.create());
    if (this.get('validations') === undefined) {
      this.set('validations', {});
    }
  },
  validate: function(filter) {
    var options, message, property, validator, toRun, value, index1, index2, valid = true;
    if (filter !== undefined) {
      toRun = [filter];
    } else {
      toRun = Object.keys(this.validations);
    }
    for(index1 = 0; index1 < toRun.length; index1++) {
      property = toRun[index1];
      this.errors.set(property, undefined);
      delete this.errors[property];

      for(validator in this.validations[property]) {
        value = this.validations[property][validator];
        if (typeof(value) !== 'object' || (typeof(value) === 'object' && value.constructor !== Array)) {
          value = [value];
        }

        for(index2 = 0; index2 < value.length; index2++) {
          message = Ember.Validations.validators.local[validator](this, property, value[index2]);
          if (message) {
            break;
          }
        }

        if (message) {
          this.errors.set(property, message);
          valid = false;
          break;
        }
      }
    }

    return valid;
  }
});

})();



(function() {
Ember.Validations.patterns = Ember.Namespace.create({
  numericality: /^(-|\+)?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?$/
});

})();



(function() {
Ember.Validations.validators        = Ember.Namespace.create();
Ember.Validations.validators.local  = Ember.Namespace.create();
Ember.Validations.validators.remote = Ember.Namespace.create();

})();



(function() {
Ember.Validations.validators.local.reopen({
  acceptance: function(model, property, options) {
    if (options === true) {
      options = {};
    }

    if (options.message === undefined) {
      options.message = Ember.Validations.messages.render('accepted', options);
    }

    if (options.accept) {
      if (model.get(property) !== options.accept) {
        return options.message;
      } else {
        return;
      }
    }
    if (model.get(property) !== '1' && model.get(property) !== 1 && model.get(property) !== true) {
      return options.message;
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  confirmation: function(model, property, options) {
    if (options === true) {
      options = { attribute: property };
      options = { message: Ember.Validations.messages.render('confirmation', options) };
    }

    if (model.get(property) !== model.get('' + property + 'Confirmation')) {
      return options.message;
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  exclusion: function(model, property, options) {
    var message, lower, upper;

    if (options.constructor === Array) {
      options = { 'in': options };
    }

    if (options.message === undefined) {
      options.message = Ember.Validations.messages.render('exclusion', options);
    }

    message = this.presence(model, property, options);
    if (message) {
      if (options.allow_blank === true) {
        return;
      } else {
        return message;
      }
    }

    if (options['in']) {
      if (Ember.$.inArray(model.get(property), options['in']) !== -1) {
        return options.message;
      }
    }

    if (options.range) {
      lower = options.range[0];
      upper = options.range[1];

      if (model.get(property) >= lower && model.get(property) <= upper) {
        return options.message;
      }
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  format: function(model, property, options) {
    var message;

    if (options.constructor === RegExp) {
      options = { 'with': options };
    }

    if (options.message === undefined) {
      options.message = Ember.Validations.messages.render('invalid', options);
    }

    message = this.presence(model, property, options);

    if (message) {
      if (options.allow_blank === true) {
        return;
      } else {
        return message;
      }
    }

    if (options['with'] && !options['with'].test(model.get(property))) {
      return options.message;
    }

    if (options.without && options.without.test(model.get(property))) {
      return options.message;
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  inclusion: function(model, property, options) {
    var message, lower, upper;

    if (options.constructor === Array) {
      options = { 'in': options };
    }

    if (options.message === undefined) {
      options.message = Ember.Validations.messages.render('inclusion', options);
    }

    message = this.presence(model, property, options);

    if (message) {
      if (options.allow_blank === true) {
        return;
      } else {
        return message;
      }
    }

    if (options['in']) {
      if (Ember.$.inArray(model.get(property), options['in']) === -1) {
        return options.message;
      }
    }

    if (options.range) {
      lower = options.range[0];
      upper = options.range[1];

      if (model.get(property) < lower || model.get(property) > upper) {
        return options.message;
      }
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  length: function(model, property, options) {
    var CHECKS, MESSAGES, allowBlankOptions, check, fn, message, operator, tokenized_length, tokenizer, index, keys, key;

    CHECKS = {
      'is'      : '==',
      'minimum' : '>=',
      'maximum' : '<='
    };

    MESSAGES = {
      'is'      : 'wrong_length',
      'minimum' : 'too_short',
      'maximum' : 'too_long'
    };

    if (typeof(options) === 'number') {
      options = { 'is': options };
    }

    if (options.messages === undefined) {
      options.messages = {};
    }

    keys = Object.keys(MESSAGES);
    for (index = 0; index < keys.length; index++) {
      key = keys[index];
      if (options[key] !== undefined && options.messages[key] === undefined) {
        if (Ember.$.inArray(key, Object.keys(CHECKS)) !== -1) {
          options.count = options[key];
        }
        options.messages[key] = Ember.Validations.messages.render(MESSAGES[key], options);
        if (options.count !== undefined) {
          delete options.count;
        }
      }
    }

    tokenizer = options.tokenizer || 'split("")';
    tokenized_length = new Function('value', 'return value.' + tokenizer + '.length')(model.get(property) || '');

    allowBlankOptions = {};
    if (options.is) {
      allowBlankOptions.message = options.messages.is;
    } else if (options.minimum) {
      allowBlankOptions.message = options.messages.minimum;
    }

    message = this.presence(model, property, allowBlankOptions);
    if (message) {
      if (options.allow_blank === true) {
        return;
      } else {
        return message;
      }
    }

    for (check in CHECKS) {
      operator = CHECKS[check];
      if (!options[check]) {
        continue;
      }

      fn = new Function("return " + tokenized_length + " " + operator + " " + options[check]);
      if (!fn()) {
        return options.messages[check];
      }
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  numericality: function(model, property, options) {
    var CHECKS, check, checkValue, fn, form, operator, val, index, keys, key;

    CHECKS = {
      equal_to                  :'===',
      greater_than              : '>',
      greater_than_or_equal_to  : '>=',
      less_than                 : '<',
      less_than_or_equal_to     : '<='
    };

    if (options === true) {
      options = {};
    }

    if (options.messages === undefined) {
      options.messages = { numericality: Ember.Validations.messages.render('not_a_number', options) };
    }

    if (options.only_integer !== undefined && options.messages.only_integer === undefined) {
      options.messages.only_integer = Ember.Validations.messages.render('not_an_integer', options);
    }

    keys = Object.keys(CHECKS).concat(['odd', 'even']);
    for(index = 0; index < keys.length; index++) {
      key = keys[index];
      if (options[key] !== undefined && options.messages[key] === undefined) {
        if (Ember.$.inArray(key, Object.keys(CHECKS)) !== -1) {
          options.count = options[key];
        }
        options.messages[key] = Ember.Validations.messages.render(key, options);
        if (options.count !== undefined) {
          delete options.count;
        }
      }
    }

    if (!Ember.Validations.patterns.numericality.test(model.get(property))) {
      if (options.allow_blank === true && this.presence(model, property, { message: options.messages.numericality })) {
        return;
      } else {
        return options.messages.numericality;
      }
    }

    if (options.only_integer === true && !(/^[+\-]?\d+$/.test(model.get(property)))) {
      return options.messages.only_integer;
    }

    for (check in CHECKS) {
      operator = CHECKS[check];

      if (options[check] === undefined) {
        continue;
      }

      if (!isNaN(parseFloat(options[check])) && isFinite(options[check])) {
        checkValue = options[check];
      } else if (model.get(options[check])) {
        checkValue = model.get(options[check]);
      } else {
        return;
      }

      fn = new Function('return ' + model.get(property) + ' ' + operator + ' ' + checkValue);

      if (!fn()) {
        return options.messages[check];
      }
    }

    if (options.odd && parseInt(model.get(property), 10) % 2 === 0) {
      return options.messages.odd;
    }

    if (options.even && parseInt(model.get(property), 10) % 2 !== 0) {
      return options.messages.even;
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  presence: function(model, property, options) {
    if (options === true) {
      options = {};
    }

    if (options.message === undefined) {
      options.message = Ember.Validations.messages.render('blank', options);
    }

    if (/^\s*$/.test(model.get(property) || '')) {
      return options.message;
    }
  }
});

})();



(function() {
Ember.Validations.validators.local.reopen({
  uniqueness: function(model, property, options) {
  }
});

})();



(function() {

})();



(function() {
// this is fugly, I know but no other way to get these from what I can see
// var states = (new DS.StateManager).states;
// var validating = DS.State.extend({
  // enter: function(manager) {

  // }
// });

// states.rootState.get('loaded.created').reopen({
  // validating: validating
// });

// states.rootState.get('loaded.updated').reopen({
  // validating: validating
// });

// DS.StateManager.reopen({
  // states: states
// });

})();



(function() {

})();

