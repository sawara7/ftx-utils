import { getRealTimeDatabase } from "firebase-utils-server"
import { FTXPrivateApiClass } from "..";

export async function getFTXPrivateAPI(subAccount: string): Promise<FTXPrivateApiClass> {
    const rdb = await getRealTimeDatabase()
    const apiKey = await rdb.get(await rdb.getReference('settings/ftx/apiKey')) as string
    const secret = await rdb.get(await rdb.getReference('settings/ftx/apiSecret')) as string
    return new FTXPrivateApiClass({
        apiKey: apiKey,
        apiSecret: secret,
        subAccount: subAccount
    })
}