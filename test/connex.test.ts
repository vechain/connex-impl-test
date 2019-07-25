import { Framework } from '@vechain/connex-framework'
import { DriverNodeJS } from '@vechain/connex.driver-nodejs'

interface Global extends NodeJS.Global{
    connex: Connex,
    location: {
        hostname: string
    }
}

declare var global: Global;
global.location = {
    hostname: 'localhost'
}

export const loadConnex = async function () {
    if (global.connex) {
        return
    }
    const driver = await DriverNodeJS.connect('https://sync-testnet.vechain.org/')
    const wallet = driver.wallet
    wallet.add('0xdce1443bd2ef0c2631adc1c67e5c93f13dc23a41c18b536effbbdcbcdb96fb65')
    wallet.add('0x597e2578f78813828306e0378036c8e06214c1d3f4da8f028b0d9660808cf481')

    global.connex = new Framework(driver)
    return
}

before(function () {
    return loadConnex()
})

require('../src/connex.test')
require('../src/error-type.test')

