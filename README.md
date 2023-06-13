# qHotkeys
Electron global hotkeys without overriding native hotkeys

# Important note
This project is a wrapper that utilizes [uiohook-napi](https://npmjs.org/uiohook-napi). It depends on them and might not work on every system nor node/electron version.

My purpose in creating qHotkeys was to be a replacement for [Electron]'s [globalShortcut]. globalShotcut overrides the native os's shortcuts. With qHotkeys you can create a shortcut such as ``CTRL + C`` and if you're on windows, will still copy whatever to your clipboard AND perform the action qHotkeys was passed.


This is a work in progress. So expect bugs [Issues/Ideas?](https://github.com/qartho/qhotkeys/issues/)

## Installation

Install qHotkeys using npm:

```
npm i qHotkeys
```


##### Keyboard Inputs

```JavaScript

import { qKeys, qHotkeys } from 'qHotkeys'

var hotkeys = new qHotkeys()

// ... 
app.whenReady().then(() => {

    // ...
    const hotkeyAction = () => {
        console.log("I pressed my hotkeys!")
    }

    const scrollUpAction = () => {
        console.log("I scrolled up!")
    }

    const scrollDownAction = () => {
        console.log("I scrolled down!")
    }

    const KEY_CMD_OR_CTRL = process.platform === 'darwin' ? qKeys.Cmd : qKeys.Ctrl
    hotkeys.register([KEY_CMD_OR_CTRL, qKeys.X], action)
    hotkeys.registerScroll(scrollUpAction, scrollDownAction)
    
    hotkeys.run()
    
    // ...
})

```

## To-Do List
This project is early in development and I have lots of ideas to expand the capabilities. Here's a roadmap of expected additions.

- Implement built in keymap that way you don't need to use raw numbers
- Have action functions callback with event info
- Individual scroll registers
- Check os platform (Native CMD_OR_CTRL enum key)

Anymore ideas? Create an issue on the github page!

## License

MIT

Maintained by [QarthO](https://github.com/qartho).

