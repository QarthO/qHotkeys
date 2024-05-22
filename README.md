# qHotkeys
Global shotcut replacement for [Electron's implementation](https://www.electronjs.org/docs/latest/api/global-shortcut) without preventing native OS shortcuts.

This project utilizes [uiohook-napi](https://npmjs.org/uiohook-napi). It depends on them and might not work on every system nor node/electron version.

My purpose in creating qHotkeys was to be a replacement for Electron's global shortcut. With qHotkeys you can create a shortcut such as ``CommandOrControl + X`` and your app will still recognize the input AND your os will perform the 'cut' action

This project is early in development. Report any bugs or issues on the [GitHub](https://github.com/qartho/qhotkeys/issues/) issue tracker.

## Installation

Install qHotkeys using npm:

```
npm i qhotkeys
```

## Example Implementation

```JavaScript

import { qKeys, qHotkeys } from 'qHotkeys'

// Create instance
var hotkeys = new qHotkeys()

// ... 
app.whenReady().then(() => {

    // ...

    // Your custom actions
    const hotkeyAction = () => {
        console.log("I pressed my hotkeys!")
    }

    const scrollUpAction = () => {
        console.log("I scrolled up!")
    }

    const scrollDownAction = () => {
        console.log("I scrolled down!")
    }

    // Registers your hotkey actions
    // Command or Control + X = hotkeyAction called
    hotkeys.register([qKeys.CmdOrCtrl, qKeys.X], hotkeyAction)
    
    // Registers your scroll actions
    // Command or Control + ScrollUp = scrollUpAction called
    // Command or Control + ScrollDown = scrollDownAction called
    hotkeys.registerScroll([qKeys.CmdOrCtrl], scrollUpAction, scrollDownAction)
    
    // For scroll register, the hotkey list can be empty
    hotkeys.registerScroll([], scrollUpAction, scrollDownAction)

    // Starts
    hotkeys.run()
    
    // ...
})
```

## To-Do List
This project is early in development and I have lots of ideas to expand the capabilities. Here's a roadmap of planned additions to qHotkeys.

- Add event info to the action callbacks
- Ability to unregister a hotkey
- Individual scroll registers
- Add mouse buttons
- Add mouse move
- Horizontal Scroll

Anymore ideas? Create an issue on the github page!

## License

[MIT](https://github.com/QarthO/qHotkeys/blob/main/LICENSE)

Maintained by [QarthO](https://github.com/qartho).

