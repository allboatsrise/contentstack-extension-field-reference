import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {useDocument, useWindow} from '@fluentui/react-window-provider'
import useLatest from '@react-hook/latest'

type Props = {
  children: React.ReactNode
  onClose?: () => void
}

export const WindowPortal: React.FC<Props> = ({children, onClose}) => {
  const document = useDocument()
  const window = useWindow()

  const onCloseRef = useLatest(onClose)
  
  // create a container <div>
  const containerEl = useMemo(() => document!.createElement('div'), [document])

  useEffect(() => {
    const newWindow = window!.open('', '', 'width=600,height=400,left=200,top=200')
    if (!newWindow) return

    // apply styles from parent to new window
    copyStyles(document!, newWindow.document);

    // append the container <div> (that has props.chi.dren append to it) to 
    // the body of the new MyWindowPortal
    newWindow?.document.body.appendChild(containerEl)

    const interval = setInterval(() => {
      if (!newWindow.closed) return
      clearInterval(interval)
      onCloseRef.current?.()
    }, 100)

    return () => {
      // This will fire when this.state.showWindowPortal in the parent componentDidMount
      // become false. So we tidy up by closing the window
      newWindow?.close()
      clearInterval(interval)
    }
  }, [containerEl, document, onCloseRef, window])

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