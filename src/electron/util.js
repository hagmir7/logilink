import { app } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';


// Path Resolver
export function getUIPath() {
    return path.join(app.getAppPath(), '/dist-react/index.html');
}

export function getPreloadPath() {
    return path.join(app.getAppPath(), isDev ? "." : "..", 'src/electron/preload.cjs')
}


export function getAssetsPath(){
    return path.join(app.getAppPath(), isDev ? "." : "..", 'src/electron/assets')
}

// Utils
export function isDev() {
    return process.env.NODE_ENV === "development";
}


export function validateEventFrame(frame) {
    console.log(frame.url);
    if (isDev() && new URL(frame.url).host === 'localhost:5123') {
        return;
    }
    if (frame.url !== pathToFileURL(getUIPath()).toString()) {
        throw new Error('Malicious event');
    }
}