import '@contentstack/venus-components/build/main.css';
import { Button, EntryReferenceDetails } from '@contentstack/venus-components';
import { useState } from 'react';
import Contentstack from 'contentstack'
import { WindowPortal } from './WindowPortal';
import { ContentstackReferenceFieldSelector } from './ContentstackRefereceFieldSelector';
import { ReferenceFieldDataValueSchemaType } from '../schemas';

type Props = {
  query: Contentstack.Query
  queryColumns: Array<{
    name: string;
    id: string;
  }>
  data: ReferenceFieldDataValueSchemaType | null
  onChange: (data: Omit<ReferenceFieldDataValueSchemaType, 'content_type'> | null) => void
  editable?: boolean
}

export const ContentstackReferenceField: React.FC<Props> = ({query, queryColumns, data, onChange, editable = true}) => {
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(false)

  return (
    <>
      {data && <EntryReferenceDetails
        title={data.fields[queryColumns[0].id] as string}
        contentType={`${data.content_type} (uid: ${data.uid})`}
        onDelete={editable ? () => onChange(null) : undefined}
      />}
      {!data && <Button type="button" buttonType="outline" onClick={() => {
        setFocus(true)
        setOpen(true)
      }}>Choose existing entry</Button>}
      {open && (
        <WindowPortal focus={focus} onFocus={setFocus} onClose={() => setOpen(false)}>
          <ContentstackReferenceFieldSelector query={query} queryColumns={queryColumns} onReferenceSelected={(reference) => {
            onChange({
              uid: reference.uid,
              fields: Object.fromEntries(queryColumns.map(({id}) => {
                
                // support targeting nested fields with dot notation
                // e.g. 'field.nestedField'
                const keys:string[] = id.split('.');
                const value = keys.reduce((acc: unknown, key: string) => {
                  if (acc === null || acc === undefined) {
                    return;
                  }
                  if (typeof acc !== 'object') {
                    return acc
                  }                  
                  return (acc as {[key: string]: unknown})[key];
                }, {...reference})
                
                // Contentstack doesn't allow '.' in the field name, so we replace with '-'
                const key = id.replace(/\./g, '-');
                return [key, value]
              }),) 
            })
            setOpen(false)
          }} />
        </WindowPortal>
      )}
    </>
  )
}
