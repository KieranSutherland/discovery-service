/**
 * Converts milliseconds to minutes.
 * @param mils The number of milliseconds to convert.
 * @returns The equivalent number of minutes.
 */
export function inMinutes(mils: number): number {
    if (mils < 0) {
        throw new Error('Input must be a non-negative number');
    }
    return mils / 1000 / 60;
}