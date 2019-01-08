import 'mocha'

declare namespace global {
    interface Window{
        mocha: BrowserMocha
    }
}