import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import {useDocument, useWindow} from '@fluentui/react-window-provider'
import useLatest from '@react-hook/latest'

type Props = {
  children: React.ReactNode
  width?: number
  height?: number
  focus: boolean
  onFocus?: (focus: boolean) => void
  onClose?: () => void
}

export const WindowPortal: React.FC<Props> = ({children, width = 600, height = 600, onClose, focus, onFocus}) => {
  const document = useDocument()
  const window = useWindow()

  const [externalWindow, setExternalWindow] = useState<Window | null>(null)
  const externalWindowRef = useLatest(externalWindow)

  const onCloseRef = useLatest(onClose)
  const onFocusRef = useLatest(onFocus)
  
  // create a container <div>
  const containerEl = useMemo(() => document!.createElement('div'), [document])

  useEffect(() => {
    if (externalWindowRef.current) return

    const {left, top} = popupCenterPosition(width, height)
    const newWindow = window!.open('', 'asdf', `width=${width},height=${height},left=${left},top=${top}`)
    if (!newWindow) return

    // apply styles from parent to new window
    copyStyles(document!, newWindow.document);

    // append the container <div> (that has props.chi.dren append to it) to 
    // the body of the new MyWindowPortal
    newWindow.document.body.appendChild(containerEl)

    const interval = setInterval(() => {
      if (!newWindow.closed) return
      clearInterval(interval)
      onCloseRef.current?.()
    }, 100)

    newWindow.addEventListener('blur', () => onFocusRef.current?.(false))
    newWindow.addEventListener('focus', () => onFocusRef.current?.(true))
    
    window!.addEventListener('beforeunload', () => onCloseRef.current?.())

    setExternalWindow(newWindow)


    return () => {
      // This will fire when this.state.showWindowPortal in the parent componentDidMount
      // become false. So we tidy up by closing the window
      newWindow?.close()
      clearInterval(interval)
    }
  }, [containerEl, document, externalWindowRef, height, onCloseRef, onFocusRef, width, window])

  useEffect(() => {
    if (!externalWindow) return
    if (!focus) return
    externalWindow.focus()
  }, [externalWindow, focus])

  return (
    // append children to the container <div>
    ReactDOM.createPortal(children, containerEl)
  )
}

const copyStyles = (sourceDoc: Document, targetDoc: Document) => {
  Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    if (styleSheet.cssRules) { // for <style> elements
      const newStyleEl = sourceDoc.createElement('style');

      Array.from(styleSheet.cssRules).forEach(cssRule => {
        let text = cssRule.cssText

        // rewrite any relative paths to absolute
        text = text.replace(/(url\(")\//g, `$1${document.location.origin}${document.location.pathname}`)

        // write the text of each rule into the body of the style element
        newStyleEl.appendChild(sourceDoc.createTextNode(text));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) { // for <link> elements loading CSS from a URL
      const newLinkEl = sourceDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

/**
 * Based on https://stackoverflow.com/a/16861050
 */
const popupCenterPosition = (w: number, h: number) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;

  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop

  return {left, top}
}
