export function isDecString(val: string) {
    return typeof val === 'string' && /^[0-9]+$/.test(val)
}

export function isHexString(val: string) {
    return /^0x[0-9a-f]+$/i.test(val)
}

export function isHexBytes(val: string) {
    return /^0x[0-9a-f]*$/i.test(val)
}

export function isAddress(val: string) {
    return /^0x[0-9a-f]{40}$/.test(val)
}

export function isBytes4(val: string) {
    return /^0x[0-9a-f]{8}$/.test(val)
}

export function isBytes8(val: string) {
    return /^0x[0-9a-f]{16}$/.test(val)
}

export function isBytes32(val: string) {
    return /^0x[0-9a-f]{64}$/.test(val)
}

export function isUint8(val: number) {
    return val >= 0 && val < 2 ** 8 && Number.isInteger(val)
}

export function isUint32(val: number) {
    return val >= 0 && val < 2 ** 32 && Number.isInteger(val)
}

export function isUint64(val: number) {
    return val >= 0 && val < 2 ** 64 && Number.isInteger(val)
}

export function isInt(val: number) {
    return Number.isInteger(val)
}

export function isSemVer(val: string) {
    return /[0-9]*\.[0-9*]\.[0-9]*$/.test(val)
}