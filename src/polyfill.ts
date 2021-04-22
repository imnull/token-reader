export const arrayFind = <T>(arr: T[], fn: { (item: T, index: number): boolean }) => {
    let i = 0, len = arr.length
    while(i < len) {
        const it = arr[i]
        if(fn(it, i)) {
            return it
        }
        i++
    }
    return null
}