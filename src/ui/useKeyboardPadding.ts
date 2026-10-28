import { useEffect, useRef, useState } from 'react';
import { Keyboard, LayoutChangeEvent, Platform } from 'react-native';

/**
 * Lifts a composer above the keyboard without double-padding.
 *
 * Android can't be relied on to resize the window for the keyboard
 * (adjustResize is ignored under enforced edge-to-edge on Android 15+,
 * and a translucent status bar disables it on older versions), so we
 * measure: if the container already shrank by ~the keyboard height the
 * OS handled it (pad 0), otherwise we add the keyboard height ourselves.
 *
 * Usage:
 *   const { pad, onContainerLayout } = useKeyboardPadding();
 *   <View style={{ flex: 1, paddingBottom: pad }} onLayout={onContainerLayout}>…
 */
export function useKeyboardPadding() {
  const [pad, setPad] = useState(0);
  const baseHeight = useRef(0);
  const containerHeight = useRef(0);
  const kbOpen = useRef(false);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, e => {
      kbOpen.current = true;
      const kb = e.endCoordinates?.height ?? 0;
      if (Platform.OS === 'ios') return setPad(kb);
      // Let the resize animation settle before measuring.
      setTimeout(() => {
        const shrunk = baseHeight.current - containerHeight.current;
        setPad(shrunk > kb * 0.5 ? 0 : kb);
      }, 120);
    });
    const h = Keyboard.addListener(hideEvt, () => {
      kbOpen.current = false;
      setPad(0);
    });
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    containerHeight.current = e.nativeEvent.layout.height;
    if (!kbOpen.current) baseHeight.current = containerHeight.current;
  };

  return { pad, onContainerLayout };
}
