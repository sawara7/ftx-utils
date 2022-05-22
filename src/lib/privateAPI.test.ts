// import { getFTXPrivateAPI } from ".."

// (async() => {
//     const api = await getFTXPrivateAPI('FTT')
//     const res = await api.getPositions({})
//     if (res.success && res.result) {
//         for (const pos of res.result) {
//             console.log(pos)
//             if (pos.future === 'FTT-PERP') {
//                 const closeSide = pos.side === 'buy'? 'sell' : 'buy';
//                 await api.placeOrder({
//                     market: pos.future,
//                     side: closeSide, 
//                     type: "market",
//                     size: pos.openSize,
//                     price: 0
//                 })
//             }
//         }
//     }
//     await api.cancelAllOrder({market: 'FTT-PERP'})
// })()