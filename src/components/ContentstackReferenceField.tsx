import '@contentstack/venus-components/build/main.css';
import { Button, EntryReferenceDetails } from '@contentstack/venus-components';

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
  return (
    <>
      {data && <EntryReferenceDetails
        title={data.title}
        contentType={data.contentType}
        onDelete={() => onChange(null)}
      />}
      {!data && <Button type="button" buttonType="outline" onClick={() => alert('todo')}>Choose existing entry</Button>}
    </>
  )
}
