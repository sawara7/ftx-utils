export function sleep(waitSec: number) {
    return new Promise<void>(function (resolve) {
        setTimeout(function() { resolve() }, waitSec);
    });
}

export type OrderSide = 'buy' | 'sell'

export type OrderType = 'limit' | 'market'