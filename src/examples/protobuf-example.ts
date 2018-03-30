import { load } from "protobufjs"; // respectively "./node_modules/protobufjs"

export default async function loadAwesomeProto(): Promise<void> {
    load("./src/examples/awesome.proto", (err, root) => {
        if (err) {
            throw err;
        }

        // example code
        const AwesomeMessage = root!.lookupType("awesomepackage.AwesomeMessage");

        const message = AwesomeMessage.create({ awesomeField: "hello" });
        // tslint:disable-next-line:no-console
        console.log(`message = ${JSON.stringify(message)}`);

        const buffer = AwesomeMessage.encode(message).finish();
        // tslint:disable-next-line:no-console
        console.log(`buffer = ${Array.prototype.toString.call(buffer)}`);

        const decoded = AwesomeMessage.decode(buffer);
        // tslint:disable-next-line:no-console
        console.log(`decoded = ${JSON.stringify(decoded)}`);
    });
}
