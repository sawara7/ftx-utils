"use strict";
// import { sleep } from "my-utils"
// import { getRealTimeDatabase } from "firebase-utils-server"
// import { WebsocketAPI } from ".."
// (async ()=> {
//     const rdb = await getRealTimeDatabase()
//     const apiKey = await rdb.get(await rdb.getReference('settings/ftx/apiKey')) as string
//     const secret = await rdb.get(await rdb.getReference('settings/ftx/apiSecret')) as string
//     let flg = false
//     const wsAPI = new WebsocketAPI({
//         apiKey: apiKey,
//         apiSecret: secret,
//         subAccount: '01_BONAMPING',
//         onWebSocketOpen: () => {
//             wsAPI.login()
//         },
//         onError: (code, message) => {
//             console.log(code, message)
//             flg = true
//         }
//     })
//     await sleep(1000)
//     if (flg) {
//         console.log('Failed login')
//     }
// })()
