define(['masseuse', 'validationLibrary', 'underscore', 'resources'],
    function (masseuse, validationLibrary, _, resources) {
    'use strict';

    var Model = masseuse.MasseuseModel,
        ComputedProperty = masseuse.ComputedProperty;

    return Model.extend({
        validate : _validate,
        defaults : {
            resources : resources,
            username : '',
            password : '',
            usernameError : new ComputedProperty(['username'], _validateUserLoginAttribute, true),
            passwordError : new ComputedProperty(['password'], _validateUserLoginAttribute, true),
            hasError : new ComputedProperty(['usernameError', 'passwordError'], _checkForErrors)
        }
    });

    function _validate (attributes) {
        var self = this,
            invalid;

        _.forEach([
            'username',
            'password'
        ], function (attribute) {
            var value = attributes[attribute];

            // Part of validation the model is to make sure all computed values are set
            self.set(attribute, value);

            // Validate the individual attribute
            if (!validationLibrary.stringHasLength(value)) {
                invalid = true;
            }
        });
        return invalid;
    }

    function _validateUserLoginAttribute (attribute) {
        return validationLibrary.stringHasLength(attribute) ? undefined : 'Too Short.';
    }

    function _checkForErrors (usernameError, passwordError) {
        return !!(usernameError || passwordError);
    }
});