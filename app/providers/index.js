'use strict'

/*
 favor being explicit vs implicit no fancy reading
 directories and doing something which each file
 */
module.exports = function(params) {
    var providers = {
        Auth: require('./auth').getMethods(params),
        Calendar: require('./calendar').getMethods(params)
    }

    for ( var provider in providers ){
        providers[provider].setProviders(providers)
    }

    return providers
}
