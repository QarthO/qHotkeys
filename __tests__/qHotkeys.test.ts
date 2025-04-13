import { qKeys, qHotkeys } from '../src/index';
import { uIOhook, UiohookKeyboardEvent } from 'uiohook-napi';

// mocking uiohook module
jest.mock('uiohook-napi', () => {
  const eventHandlers: Record<string, Function[]> = {
    keydown: [],
    keyup: [],
    wheel: []
  };
  
  return {
    uIOhook: {
      on: jest.fn((event: string, handler: Function) => {
        if (!eventHandlers[event]) eventHandlers[event] = [];
        eventHandlers[event].push(handler);
      }),
      removeListener: jest.fn((event: string, handler: Function) => {
        if (eventHandlers[event]) {
          const index = eventHandlers[event].indexOf(handler);
          if (index !== -1) {
            eventHandlers[event].splice(index, 1);
          }
        }
      }),
      start: jest.fn(),
      stop: jest.fn(),
      // helper methods for testing
      __simulateKeydown: (keycode: number) => {
        const event: UiohookKeyboardEvent = { keycode } as UiohookKeyboardEvent;
        eventHandlers.keydown.forEach(handler => handler(event));
      },
      __simulateKeyup: (keycode: number) => {
        const event: UiohookKeyboardEvent = { keycode } as UiohookKeyboardEvent;
        eventHandlers.keyup.forEach(handler => handler(event));
      }
    },
    UiohookKeyboardEvent: class {}
  };
});

describe('qHotkeys', () => {
  // clear mock cache before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register and keydown/keyup events', () => {
    test('action should only be executed when all registered keys are pressed', () => {
      const hotkeys = new qHotkeys();
      const mockAction = jest.fn();
      
      // register cmd+c shortcut
      hotkeys.register([qKeys.CmdOrCtrl, qKeys.C], mockAction);
      
      // start
      hotkeys.run(true);
      
      // press only c key
      (uIOhook as any).__simulateKeydown(qKeys.C);
      expect(mockAction).not.toHaveBeenCalled();
      
      // release c key
      (uIOhook as any).__simulateKeyup(qKeys.C);
      expect(mockAction).not.toHaveBeenCalled();
      
      // press only cmd key
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      expect(mockAction).not.toHaveBeenCalled();
      
      // release cmd key
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
      expect(mockAction).not.toHaveBeenCalled();
      
      // press cmd key
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      expect(mockAction).not.toHaveBeenCalled();
      
      // press cmd+c combination (add c key)
      (uIOhook as any).__simulateKeydown(qKeys.C);
      expect(mockAction).toHaveBeenCalledTimes(1);
      
      // release keys
      (uIOhook as any).__simulateKeyup(qKeys.C);
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
      
      // test again to ensure consistent behavior
      // press cmd key
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      // press c key
      (uIOhook as any).__simulateKeydown(qKeys.C);
      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    test('triple key combination should work correctly (cmd+shift+s)', () => {
      const hotkeys = new qHotkeys();
      const mockAction = jest.fn();
      
      // register cmd+shift+s shortcut
      hotkeys.register([qKeys.CmdOrCtrl, qKeys.Shift, qKeys.S], mockAction);
      
      // start
      hotkeys.run(true);
      
      // press cmd key
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      expect(mockAction).not.toHaveBeenCalled();
      
      // add shift key
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      expect(mockAction).not.toHaveBeenCalled();
      
      // only two keys should not trigger action
      expect(mockAction).not.toHaveBeenCalled();
      
      // add s key to complete the combination
      (uIOhook as any).__simulateKeydown(qKeys.S);
      expect(mockAction).toHaveBeenCalledTimes(1);
      
      // release keys in different order
      (uIOhook as any).__simulateKeyup(qKeys.S);
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
      (uIOhook as any).__simulateKeyup(qKeys.Shift);
      
      // test with different key order
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      (uIOhook as any).__simulateKeydown(qKeys.S);
      expect(mockAction).toHaveBeenCalledTimes(1); // still 1, not all keys pressed
      
      // add the missing cmd key
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    test('special key combinations (shift+f1) should work correctly', () => {
      const hotkeys = new qHotkeys();
      const mockAction = jest.fn();
      
      // register shift+f1 shortcut
      hotkeys.register([qKeys.Shift, qKeys.F1], mockAction);
      
      // start
      hotkeys.run(true);
      
      // press only f1
      (uIOhook as any).__simulateKeydown(qKeys.F1);
      expect(mockAction).not.toHaveBeenCalled();
      
      // release f1
      (uIOhook as any).__simulateKeyup(qKeys.F1);
      
      // press shift then f1
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      expect(mockAction).not.toHaveBeenCalled();
      
      (uIOhook as any).__simulateKeydown(qKeys.F1);
      expect(mockAction).toHaveBeenCalledTimes(1);
      
      // release in reverse order
      (uIOhook as any).__simulateKeyup(qKeys.F1);
      (uIOhook as any).__simulateKeyup(qKeys.Shift);
    });

    test('numpad keys combination (ctrl+numpad1) should work correctly', () => {
      const hotkeys = new qHotkeys();
      const mockAction = jest.fn();
      
      // register ctrl+numpad1 shortcut
      hotkeys.register([qKeys.Ctrl, qKeys.Numpad1], mockAction);
      
      // start
      hotkeys.run(true);
      
      // press only numpad1
      (uIOhook as any).__simulateKeydown(qKeys.Numpad1);
      expect(mockAction).not.toHaveBeenCalled();
      
      // release numpad1
      (uIOhook as any).__simulateKeyup(qKeys.Numpad1);
      
      // press ctrl
      (uIOhook as any).__simulateKeydown(qKeys.Ctrl);
      expect(mockAction).not.toHaveBeenCalled();
      
      // add numpad1
      (uIOhook as any).__simulateKeydown(qKeys.Numpad1);
      expect(mockAction).toHaveBeenCalledTimes(1);
      
      // release all
      (uIOhook as any).__simulateKeyup(qKeys.Ctrl);
      (uIOhook as any).__simulateKeyup(qKeys.Numpad1);
    });

    test('subset hotkeys should trigger correctly (cmd+c vs cmd+shift+c)', () => {
      const hotkeys = new qHotkeys();
      const mockActionCmdC = jest.fn();
      const mockActionCmdShiftC = jest.fn();
      
      // register two shortcuts with subset relationship
      hotkeys.register([qKeys.CmdOrCtrl, qKeys.C], mockActionCmdC);
      hotkeys.register([qKeys.CmdOrCtrl, qKeys.Shift, qKeys.C], mockActionCmdShiftC);
      
      // start
      hotkeys.run(true);
      
      // press cmd+c
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      (uIOhook as any).__simulateKeydown(qKeys.C);
      
      // only cmd+c action should be called
      expect(mockActionCmdC).toHaveBeenCalledTimes(1);
      expect(mockActionCmdShiftC).not.toHaveBeenCalled();
      
      // release all keys
      (uIOhook as any).__simulateKeyup(qKeys.C);
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
      
      // reset mock counters
      mockActionCmdC.mockClear();
      mockActionCmdShiftC.mockClear();
      
      // press cmd+shift+c
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      (uIOhook as any).__simulateKeydown(qKeys.C);
      
      // ideally, only cmd+shift+c should be triggered
      // but with current implementation, both might trigger
      expect(mockActionCmdShiftC).toHaveBeenCalledTimes(1);
      
      // this assertion might fail with current implementation!
      // showing the issue with subset hotkeys
      expect(mockActionCmdC).not.toHaveBeenCalled();
      
      // release all keys
      (uIOhook as any).__simulateKeyup(qKeys.C);
      (uIOhook as any).__simulateKeyup(qKeys.Shift);
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
    });

    test('pressing more keys than registered should not trigger actions', () => {
      const hotkeys = new qHotkeys();
      const mockActionCmdShiftA = jest.fn();
      const mockActionAltShiftA = jest.fn();
      
      // register two separate shortcuts
      hotkeys.register([qKeys.CmdOrCtrl, qKeys.Shift, qKeys.A], mockActionCmdShiftA);
      hotkeys.register([qKeys.Alt, qKeys.Shift, qKeys.A], mockActionAltShiftA);
      
      // start
      hotkeys.run(true);
      
      // press cmd+shift+a (should trigger only cmd+shift+a action)
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      (uIOhook as any).__simulateKeydown(qKeys.A);
      
      expect(mockActionCmdShiftA).toHaveBeenCalledTimes(1);
      expect(mockActionAltShiftA).not.toHaveBeenCalled();
      
      // release all keys
      (uIOhook as any).__simulateKeyup(qKeys.A);
      (uIOhook as any).__simulateKeyup(qKeys.Shift);
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
      
      // reset mock counters
      mockActionCmdShiftA.mockClear();
      mockActionAltShiftA.mockClear();
      
      // press alt+shift+a (should trigger only alt+shift+a action)
      (uIOhook as any).__simulateKeydown(qKeys.Alt);
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      (uIOhook as any).__simulateKeydown(qKeys.A);
      
      expect(mockActionCmdShiftA).not.toHaveBeenCalled();
      expect(mockActionAltShiftA).toHaveBeenCalledTimes(1);
      
      // release all keys
      (uIOhook as any).__simulateKeyup(qKeys.A);
      (uIOhook as any).__simulateKeyup(qKeys.Shift);
      (uIOhook as any).__simulateKeyup(qKeys.Alt);
      
      // reset mock counters
      mockActionCmdShiftA.mockClear();
      mockActionAltShiftA.mockClear();
      
      // press cmd+alt+shift+a (should not trigger any action)
      (uIOhook as any).__simulateKeydown(qKeys.CmdOrCtrl);
      (uIOhook as any).__simulateKeydown(qKeys.Alt);
      (uIOhook as any).__simulateKeydown(qKeys.Shift);
      (uIOhook as any).__simulateKeydown(qKeys.A);
      
      // with current implementation, one of the actions might be triggered
      // but ideally, none should be triggered because no shortcut exactly matches
      expect(mockActionCmdShiftA).not.toHaveBeenCalled();
      expect(mockActionAltShiftA).not.toHaveBeenCalled();
      
      // release all keys
      (uIOhook as any).__simulateKeyup(qKeys.A);
      (uIOhook as any).__simulateKeyup(qKeys.Shift);
      (uIOhook as any).__simulateKeyup(qKeys.Alt);
      (uIOhook as any).__simulateKeyup(qKeys.CmdOrCtrl);
    });
  });
}); 