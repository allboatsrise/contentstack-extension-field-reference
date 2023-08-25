import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Contentstack from 'contentstack'
import ContentstackUIExtension from '@contentstack/ui-extensions-sdk'
import { Notification as BaseNotification } from '@contentstack/venus-components'
import { ContentstackReferenceField } from './components'
import { NotificationItemProps } from '@contentstack/venus-components/build/components/Notification/Notification'
import { ReferenceFieldConfigSchemaType, ReferenceFieldDataValueSchemaType, referenceFieldConfigSchema, referenceFieldDataSchema } from './schemas'
import { ZodError } from 'zod'
import { fromZodError} from 'zod-validation-error'

const Notification = BaseNotification as React.FC<NotificationItemProps>

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [fieldConfig, setFieldConfig] = useState<ReferenceFieldConfigSchemaType | null>(null)
  const [fieldData, setFieldData] = useState<ReferenceFieldDataValueSchemaType | null>(null)
  const [editable, setEditable] = useState(false)
  const [saveFieldData, setSaveFieldData] = useState<(data: ReferenceFieldDataValueSchemaType | null) => void>(() => (() => {}))

  const init = useCallback(async (abortSignal: AbortSignal) => {
    console.log(referenceFieldDataSchema.safeParse({
      "uid": "bltf7fa2d359507a7db",
      "fields": {
          "title": "Why Do Cats Like High Places?",
          "sort_date": "2023-07-25"
      },
      "content_type": "Blog_Article"
  }))

    if (import.meta.env.DEV) {
      setFieldConfig(referenceFieldConfigSchema.parse({
        api_key: import.meta.env.VITE_CONTENTSTACK_STACK_API_KEY,
        delivery_token: import.meta.env.VITE_CONTENTSTACK_DELIVERY_TOKEN,
        environment: import.meta.env.VITE_CONTENTSTACK_ENVIRONMENT,
        branch: import.meta.env.VITE_CONTENTSTACK_BRANCH,
        content_type: import.meta.env.VITE_CONTENT_TYPE,
        content_type_columns: JSON.parse(import.meta.env.VITE_CONTENT_TYPE_COLUMNS)
      }))
      setEditable(true)
      return
    }

    const extension = await ContentstackUIExtension.init()
    if (abortSignal.aborted) return

    if (extension.type !== 'FIELD') {
      throw new Error(`Contentstack extension initialized unexpected type. (expected: FIELD, got: ${extension.type}`)
    }

    extension.window.enableAutoResizing()

    const config = referenceFieldConfigSchema.parse(extension.fieldConfig)
    setFieldConfig(config)

    const unsafeData = extension.field.getData()
    const result = referenceFieldDataSchema.safeParse(unsafeData)

    setSaveFieldData(() => (value: ReferenceFieldDataValueSchemaType | null) => {
      extension.field.setData(value ?? {})
    })

    if (result.success) {
      setFieldData(('uid' in result.data) ? result.data : null)
      setEditable(true)
    } else {
      console.warn('warning - existing field data invalid format', unsafeData)
      setEditable(false)
    }
  }, [])

  useEffect(() => {
    const abortController = new AbortController()
    
    init(abortController.signal).catch((error) => {
      if (abortController.signal.aborted) return

      console.error(error)
      
      Notification({
        type: 'error',
        notificationContent: {
          text: 'Custom Reference Field Error',
          description: (error instanceof ZodError) ? fromZodError(error).message : (error instanceof Error) ? error.message : 'an unknown error has occured',
        }
      })
    }).finally(() => {
      if (abortController.signal.aborted) return
      setLoading(false)
    })

    return () => {
      abortController.abort()
    }
  }, [init])

  useEffect(() => {
    if (loading) return
    saveFieldData?.(fieldData)
  }, [loading, saveFieldData, fieldData])

  const query = useMemo(() => {
    if (!fieldConfig) return null
    const stack = Contentstack.Stack({
      api_key: fieldConfig.api_key,
      delivery_token: fieldConfig.delivery_token,
      environment: fieldConfig.environment,
      branch: fieldConfig.branch,
    })
    const query = stack.ContentType(fieldConfig.content_type).Query()
    return query
  }, [fieldConfig])
console.log('fieldData', fieldData)
  return <>
    {fieldConfig && query && <ContentstackReferenceField
      query={query}
      queryColumns={fieldConfig.content_type_columns}
      data={fieldData}
      onChange={(data) => setFieldData(data ? {
        ...data,
        content_type: fieldConfig.content_type,
      } : null)}
      editable={editable}
    />}
  </>
}

