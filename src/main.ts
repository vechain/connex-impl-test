// Using require for webpack-ed code to be shown in mocha report without webpack injects
// mocha need to setup to bdd to make describe it work
mocha.setup({
    ui: 'bdd',
    timeout: 20000,
    bail: true
})

require('./connex-thor.test')

// mocha.checkLeaks()
mocha.run()