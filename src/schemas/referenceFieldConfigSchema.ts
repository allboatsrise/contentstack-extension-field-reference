import z from 'zod'

export type ReferenceFieldConfigSchemaType = z.infer<typeof referenceFieldConfigSchema>

export const referenceFieldConfigSchema = z.object({
  api_key: z.string(),
  delivery_token: z.string(),
  environment: z.string(),
  branch: z.string().default('main'),
  content_type: z.string(),
  content_type_columns: z.array(z.object({
    name: z.string(),
    id: z.string()
  })).min(1)
})
