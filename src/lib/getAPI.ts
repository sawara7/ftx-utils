import { getRealTimeDatabase, sleep } from "my-utils";
import { PrivateApiClass, WebsocketAPI } from "..";

export async function getFTXPrivateAPI(subAccount: string): Promise<PrivateApiClass> {
    const rdb = await getRealTimeDatabase()
    const apiKey = await rdb.get(await rdb.getReference('settings/ftx/apiKey')) as string
    const secret = await rdb.get(await rdb.getReference('settings/ftx/apiSecret')) as string
    return new PrivateApiClass({
        apiKey: apiKey,
        apiSecret: secret,
        subAccount: subAccount
    })
}