// Using require for webpack-ed code to be shown in mocha report without webpack injects
// mocha need to setup to bdd to make describe it work
mocha.setup({
    ui: 'bdd',
    timeout: 60000,
    slow: 300, 
    bail: false
})

// mocha needs to be set-upped before import test codes
require('./connex.test')
require('./error-type.test')

// mocha.checkLeaks()
mocha.run()