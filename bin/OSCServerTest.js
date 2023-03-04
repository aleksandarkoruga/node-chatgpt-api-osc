 //import ChatGPTClient from '@waylaidwanderer/chatgpt-api';
import { ChatGPTClient } from '../index.js';
import fs from 'fs';
import { pathToFileURL } from 'url'
import { KeyvFile } from 'keyv-file';
import osc from 'osc';





const arg = process.argv.find((arg) => arg.startsWith('--settings'));
let path;
if (arg) {
    path = arg.split('=')[1];
} else {
    path = './settings.js';
}

let settings;
if (fs.existsSync(path)) {
    // get the full path
    const fullPath = fs.realpathSync(path);
    settings = (await import(pathToFileURL(fullPath).toString())).default;
} else {
    if (arg) {
        console.error(`Error: the file specified by the --settings parameter does not exist.`);
    } else {
        console.error(`Error: the settings.js file does not exist.`);
    }
    process.exit(1);
}

if (settings.storageFilePath && !settings.cacheOptions.store) {
    // make the directory and file if they don't exist
    const dir = settings.storageFilePath.split('/').slice(0, -1).join('/');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(settings.storageFilePath)) {
        fs.writeFileSync(settings.storageFilePath, '');
    }

    settings.cacheOptions.store = new KeyvFile({ filename: settings.storageFilePath });
}

const clientToUse = settings.apiOptions?.clientToUse || settings.clientToUse || 'chatgpt';

let chatGptClient;
switch (clientToUse) {
    case 'bing':
        chatGptClient = new BingAIClient(settings.bingAiClient);
        break;
    case 'chatgpt-browser':
        chatGptClient = new ChatGPTBrowserClient(
            settings.chatGptBrowserClient,
            settings.cacheOptions,
        );
        break;
    default:
        chatGptClient = new ChatGPTClient(
            settings.openaiApiKey,
            settings.chatGptClient,
            settings.cacheOptions,
        );
        break;
}






// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 7773,
    metadata: true,


    remoteAddress: "127.0.0.1",
    remotePort: 7772,
    metadata: true
});
udpPort.open();
// Listen for incoming OSC messages.
udpPort.on("message", function (oscMsg, timeTag, info) {
    console.log("osc message:", oscMsg);
    console.log("info: ", oscMsg.args[0].value);

    var msg=String(oscMsg.args[0].value);



    ( async (chatGptClient,udpPort,msg) => {
        console.log("message",msg);
        var response = await chatGptClient.sendMessage(msg);
        console.log("response", response);
        udpPort.send({
            address: "/GPTSource",
            args: [
                {
                    type: "s",
                    value: response.response
                }
               
            ]
        }, "127.0.0.1", 7772);

    })(chatGptClient,udpPort,msg);

    

});
