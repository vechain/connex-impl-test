
export function promiseWrapper(p: Promise<void>, done: (...args: any[]) => void) {
    p.catch(err => {
        done(err)
    })
}