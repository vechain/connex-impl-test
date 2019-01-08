mocha.setup('bdd')

require('./connex-thor.test')

// mocha.checkLeaks()
mocha.run()