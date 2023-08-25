import '@contentstack/venus-components/build/main.css';
import { Button, EntryReferenceDetails } from '@contentstack/venus-components';
import { useState } from 'react';
import { WindowPortal } from './WindowPortal';
import { ContentstackReferenceFieldSelector } from './ContentstackRefereceFieldSelector';

export type ContentstackReferenceFieldData = {
  uid: string
  title: string
  contentType: string
}

type Props = {
  data: ContentstackReferenceFieldData | null
  onChange: (data: ContentstackReferenceFieldData | null) => void
}

export const ContentstackReferenceField: React.FC<Props> = ({data, onChange}) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {data && <EntryReferenceDetails
        title={data.title}
        contentType={data.contentType}
        onDelete={() => onChange(null)}
      />}
      {!data && <Button type="button" buttonType="outline" onClick={() => setOpen(true)}>Choose existing entry</Button>}
      {open && (
        <WindowPortal onClose={() => setOpen(false)}>
          <ContentstackReferenceFieldSelector />
        </WindowPortal>
      )}
    </>
  )
}
