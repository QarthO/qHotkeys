import { uIOhook, UiohookKeyboardEvent, UiohookWheelEvent } from 'uiohook-napi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type action = () => void

// export type qKeyMap = {
//   [key_name: string | number]: number
// }

// Same mapping from UiohookKey + Additions
export const qKeys = {
  Backspace: 0x000E,
  Tab: 0x000F,
  Enter: 0x001C,
  CapsLock: 0x003A,
  Escape: 0x0001,
  Space: 0x0039,
  PageUp: 0x0E49,
  PageDown: 0x0E51,
  End: 0x0E4F,
  Home: 0x0E47,
  ArrowLeft: 0xE04B,
  ArrowUp: 0xE048,
  ArrowRight: 0xE04D,
  ArrowDown: 0xE050,
  Insert: 0x0E52,
  Delete: 0x0E53,
  0: 0x000B,
  1: 0x0002,
  2: 0x0003,
  3: 0x0004,
  4: 0x0005,
  5: 0x0006,
  6: 0x0007,
  7: 0x0008,
  8: 0x0009,
  9: 0x000A,
  A: 0x001E,
  B: 0x0030,
  C: 0x002E,
  D: 0x0020,
  E: 0x0012,
  F: 0x0021,
  G: 0x0022,
  H: 0x0023,
  I: 0x0017,
  J: 0x0024,
  K: 0x0025,
  L: 0x0026,
  M: 0x0032,
  N: 0x0031,
  O: 0x0018,
  P: 0x0019,
  Q: 0x0010,
  R: 0x0013,
  S: 0x001F,
  T: 0x0014,
  U: 0x0016,
  V: 0x002F,
  W: 0x0011,
  X: 0x002D,
  Y: 0x0015,
  Z: 0x002C,
  Numpad0: 0x0052,
  Numpad1: 0x004F,
  Numpad2: 0x0050,
  Numpad3: 0x0051,
  Numpad4: 0x004B,
  Numpad5: 0x004C,
  Numpad6: 0x004D,
  Numpad7: 0x0047,
  Numpad8: 0x0048,
  Numpad9: 0x0049,
  NumpadMultiply: 0x0037,
  NumpadAdd: 0x004E,
  NumpadSubtract: 0x004A,
  NumpadDecimal: 0x0053,
  NumpadDivide: 0x0E35,
  NumpadEnd: 0xEE00 | 0x004F,
  NumpadArrowDown: 0xEE00 | 0x0050,
  NumpadPageDown: 0xEE00 | 0x0051,
  NumpadArrowLeft: 0xEE00 | 0x004B,
  NumpadArrowRight: 0xEE00 | 0x004D,
  NumpadHome: 0xEE00 | 0x0047,
  NumpadArrowUp: 0xEE00 | 0x0048,
  NumpadPageUp: 0xEE00 | 0x0049,
  NumpadInsert: 0xEE00 | 0x0052,
  NumpadDelete: 0xEE00 | 0x0053,
  F1: 0x003B,
  F2: 0x003C,
  F3: 0x003D,
  F4: 0x003E,
  F5: 0x003F,
  F6: 0x0040,
  F7: 0x0041,
  F8: 0x0042,
  F9: 0x0043,
  F10: 0x0044,
  F11: 0x0057,
  F12: 0x0058,
  F13: 0x005B,
  F14: 0x005C,
  F15: 0x005D,
  F16: 0x0063,
  F17: 0x0064,
  F18: 0x0065,
  F19: 0x0066,
  F20: 0x0067,
  F21: 0x0068,
  F22: 0x0069,
  F23: 0x006A,
  F24: 0x006B,
  Semicolon: 0x0027,
  Equal: 0x000D,
  Comma: 0x0033,
  Minus: 0x000C,
  Period: 0x0034,
  Slash: 0x0035,
  Backquote: 0x0029,
  BracketLeft: 0x001A,
  Backslash: 0x002B,
  BracketRight: 0x001B,
  Quote: 0x0028,
  Ctrl: 0x001D, // Left
  CtrlRight: 0x0E1D,
  Alt: 0x0038, // Left
  AltRight: 0x0E38,
  Shift: 0x002A, // Left
  ShiftRight: 0x0036,
  Meta: 0x0E5B,
  MetaRight: 0x0E5C,
  NumLock: 0x0045,
  ScrollLock: 0x0046,
  PrintScreen: 0x0E37,
  // + Addtions
  Pause: 0x0077, // Pause Break Key
  Cmd: 0x0E5B, // MacOS Command Key
  CmdOrCtrl: process.platform === 'darwin' ? 0x0E5B : 0x001D // Command or Control (like Electron's)
} as const

export const getKeyFromCode = (code: number): string | undefined => {
  return Object.keys(qKeys).find((key) => qKeys[key] === code)
}

export class qHotkeys {
  private keys_pressed: number[] = []
  private hotkey_map: Map<number[], action> = new Map()
  private scroll_hotkey_map: Map<number[], action[]> = new Map()
  private debug: boolean = false

  public register = (keys: number[], action: () => void): void => {
    if (!keys) return console.log(`Error: Hotkey map empty for '${action}'`)
    this.hotkey_map.set(keys, action)
  }

  public unregisterAll = (scroll = false): void => {
    this.hotkey_map.clear()
    if(this.debug) console.log('Unregistered all hotkeys')
    if(scroll) {
      this.scroll_hotkey_map.clear()
      if(this.debug) console.log('Unregistered all scroll hotkeys')
    }
  }

  public unregister = (keys: number[]): void => {
    // remove keys from the map
    this.hotkey_map.forEach((_, hotkeys: number[]) => {
      if (hotkeys.every((key) => keys.includes(key)) && hotkeys.length == keys.length) {
        if (this.debug) console.log(`Unregistered: ${hotkeys.join(' + ')}`)
        this.hotkey_map.delete(hotkeys)
      }
    })
  }

  public registerScroll = (keys: number[], upAction: () => void, downAction: () => void): void => {
    this.scroll_hotkey_map.set(keys, [upAction, downAction])
  }

  public unregisterScroll = (keys: number[]): void => {
    this.scroll_hotkey_map.forEach((_, hotkeys: number[]) => {
      if (hotkeys.every((key) => keys.includes(key)) && hotkeys.length == keys.length) {
        if (this.debug) console.log(`Unregistered: ${hotkeys.join(' + ')}`)
        this.scroll_hotkey_map.delete(hotkeys)
      }
    })
  }

  public run = (debug = false): void => {
    this.debug = debug
    uIOhook.on('keydown', this._handleKeydown)
    uIOhook.on('keyup', this._handleKeyup)
    uIOhook.on('wheel', this._handleWheel)
    uIOhook.start()
  }

  private _handleKeydown = (event: UiohookKeyboardEvent): void => {
    const key: number = event.keycode

    // ignore if already pressed
    if(this.keys_pressed.includes(key)) return

    // add to pressed keys
    this.keys_pressed.push(key)

    // debug
    if (this.debug) console.log(`Pressed: ${getKeyFromCode(key)}`)

    // Sort by priority (combinations with more keys first)
    const sortedHotkeyCombinations = Array.from(this.hotkey_map.entries())
      .sort((a, b) => b[0].length - a[0].length);
    
    // Track matched hotkeys
    let actionExecuted = false;

    // Check hotkeys in sorted order
    for (const [hotkeys, action] of sortedHotkeyCombinations) {
      // Check if all registered keys are pressed
      if(hotkeys.every((key) => this.keys_pressed.includes(key))) {
        // Exact matching - the number of pressed keys must exactly match the number of registered keys
        // Or, this could be configurable through options
        if(hotkeys.length === this.keys_pressed.length) {
          // debug
          if (this.debug) console.log(`Hotkey Map Pressed: ${hotkeys}`)
  
          // run action
          action()
          
          // Mark as matched and stop
          actionExecuted = true;
          break;
        }
      }
    }
  }

  private _handleKeyup = (event: UiohookKeyboardEvent): void => {
    const key: number = event.keycode
    const i: number = this.keys_pressed.indexOf(key)
    if (i != -1) this.keys_pressed.splice(i, 1)
    if (this.debug) console.log(`Let Go: ${getKeyFromCode(key)}`)
  }

  private _handleWheel = (event: UiohookWheelEvent): void => {
    if (this.scroll_hotkey_map.size == 0) return
    const direction = event.rotation === 1 ? 'DOWN' : 'UP'
    
    if(this.debug) console.log(`Scrolled ${direction}`)
    this.scroll_hotkey_map.forEach((actions, hotkeys: number[]) => {
      if (hotkeys.length == 0 || hotkeys.every((key) => this.keys_pressed.includes(key))) {
        if (direction === 'UP') actions[0]()
        if (direction === 'DOWN') actions[1]()
      }
    })
  }

  public stop = (): void => {
    uIOhook.removeListener('keydown', this._handleKeydown)
    uIOhook.removeListener('keyup', this._handleKeyup)
    uIOhook.removeListener('wheel', this._handleWheel)
    uIOhook.stop()
  }
}