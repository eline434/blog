import type { DefaultNodeTypes, SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import type { Media } from '@/payload-types'

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }): string => {
  const doc = linkNode.fields.doc
  if (doc?.relationTo === 'posts' && typeof doc.value === 'object') {
    return `/log/${(doc.value as { slug?: string }).slug}`
  }
  return '/'
}

const converters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  upload: ({ node }) => {
    const doc = node.value as Media | number
    if (typeof doc !== 'object' || !doc.url || !doc.width || !doc.height) return null
    return (
      <figure className="figure">
        <Image
          src={doc.url}
          alt={doc.alt}
          width={doc.width}
          height={doc.height}
          sizes="(max-width: 760px) 100vw, 720px"
        />
      </figure>
    )
  },
})

export function RichText({ data }: { data: SerializedEditorState }) {
  return <PayloadRichText className="prose" converters={converters} data={data} />
}
