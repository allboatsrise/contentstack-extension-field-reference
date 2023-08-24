import React, { useState } from 'react'
import { ContentstackReferenceField, ContentstackReferenceFieldData } from './components'

export const App: React.FC = () => {
  const [fieldData, setFieldData] = useState<ContentstackReferenceFieldData | null>({
    uid: "test",
    title: "AI calculations and proofs",
    contentType: "Artificial Intelligence",
  })

  return <>
    <ContentstackReferenceField
      data={fieldData}
      onChange={setFieldData}
    />
  </>
}

