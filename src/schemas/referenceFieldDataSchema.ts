import z from 'zod'

export type ReferenceFieldDataEmptySchemaType = z.infer<typeof referenceFieldDataEmptySchema>
export const referenceFieldDataEmptySchema = z.object({}).strict()

export type ReferenceFieldDataValueSchemaType = z.infer<typeof referenceFieldDataValueSchema>
export const referenceFieldDataValueSchema = z.object({
  uid: z.string(),
  fields: z.record(z.unknown()),
  content_type: z.string(),
})

export type ReferenceFieldDataSchemaType = z.infer<typeof referenceFieldDataSchema>
export const referenceFieldDataSchema = z.union([
  referenceFieldDataEmptySchema,
  referenceFieldDataValueSchema
]) 
