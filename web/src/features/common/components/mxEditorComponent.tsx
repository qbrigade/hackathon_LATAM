import { type MDXEditorMethods } from '@mdxeditor/editor';
import {
  MDXEditor,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  Separator,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  CreateLink,
  quotePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import "../styles/mdx-editor.css";
import {useRef} from 'react';

interface MDXEditorComponentProps {
  markdown: string;
  onChange: (markdown: string) => void;
  error?: boolean;
}

export function MDXEditorComponent({
  markdown,
  onChange,
  error,
}: MDXEditorComponentProps) {
    const editorRef = useRef<MDXEditorMethods>(null);
    return (
    <div id="description" aria-describedby="description-error">
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={onChange}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <Separator />
                <ListsToggle options={['bullet', 'number']}/>
                <Separator />
                <CreateLink/>
              </>
            ),
          }),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          quotePlugin(),
        ]}
        contentEditableClassName={`
          mdx-editor
          ${error ? 'border-red-500' : 'border-gray-200'} min-h-[200px] rounded-md p-2`}
      />
    </div>
  );
}