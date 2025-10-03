import { linkPlugin, listsPlugin, MDXEditor, quotePlugin } from '@mdxeditor/editor';

type MarkdownViewerProps = {
  content: string;
};

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <MDXEditor
      markdown={content}
      readOnly
      plugins={[
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
      ]}
      contentEditableClassName={`
[&_ul]:list-disc
[&_ul]:pl-7
[&_ol]:list-decimal
[&_ol]:pl-7
[&_li]:my-1
[&_em]:italic
[&_p]:pt-4
[&_i]:italic
font-[Inter] text-black pl-0!`}
    />
  );
}
