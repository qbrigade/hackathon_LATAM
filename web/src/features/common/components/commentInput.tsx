import { useState } from 'react';
import { db } from '@db/client';
import { useAuthStore } from '@auth/store/auth_store';
import { useForm } from 'react-hook-form';
import { Admonition } from '@common/components/admonition';
import { Info } from 'lucide-react';


export type CommentType ={
  project_id?: string | null;
  event_id?: string | null;
  publication_id?: string | null;
  handleRefresh: () => void;
}

type CommentInputData = {
  content: string;
  created_at: string;
}

//const COMMENTS_PER_PAGE = 5; // Número de comentarios por página

export function CommentInput({project_id, event_id, publication_id, handleRefresh}: CommentType) {
  // Determina el tipo de comentario según los IDs proporcionados
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CommentInputData>();

  const {user} = useAuthStore();
  const [focused, setFocused] = useState(false);
  //const [commentsPerPage, setCommentsPerPage] = useState(5);

  const onSubmit = async (form_data: CommentInputData) => {
    console.log(publication_id);
    try{
      if(!user) throw new Error('Debes iniciar sesión para comentar');

      const { error } = await db
        .from('comments')
        .insert([{
          author_id: user.id,
          content: form_data.content,
          created_at: new Date().toISOString(),
          event_id: event_id || null,
          project_id: project_id || null,
          publication_id: publication_id || null,
        }]);

      if (error) throw error;
      reset();
      alert('Comentario enviado con éxito');
      handleRefresh();

    }catch (error) {
      console.error('Error al enviar el comentario:', error);
      alert('Error al enviar el comentario. Por favor, inténtalo de nuevo más tarde.');
      reset();
      return;
    }
    setFocused(false);
  };




  return (
    <form onSubmit={handleSubmit(onSubmit)}  className="flex flex-col gap-3 py-3 border-b border-border">
      {
      !user && (
        <Admonition title="Debes iniciar sesión para poder comentar " icon={<Info />}/>
      )
      }
      {user && (
      <textarea
        placeholder="Únete a la conversación..."
        className={
        'flex-1 border-none outline-none text-sm placeholder-gray-500 ' +
        'overflow-auto resize-none max-h-[4.5em] min-h-[2.25em] ' +
        'break-words whitespace-pre-line ' +
        `${errors.content ? 'border-red-500' : 'border-gray-300'}`
        }
        {...register('content', {
        required: 'El comentario no puede estar vacío',
        minLength: {
          value: 1,
          message: 'El comentario debe tener al menos 1 carácter',
        },
        maxLength: {
          value: 500,
          message: 'El comentario no puede exceder los 500 caracteres',
        },
        })}

        style={{
          display: 'block',
          lineHeight: '1.5em',
          width: '100%',
          resize: 'vertical',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
        onFocus={() => setFocused(true)}
        rows={2}
      />
      )}

      {focused && (
      <div className="flex gap-2">
        <button
        className="text-white px-4 py-1 rounded-md"
        style={{ backgroundColor: 'var(--main-color-bt-bg)' }}
        type='submit'
        disabled={isSubmitting}
        >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>

        <button
        className="px-4 py-1 rounded-md border border-black"
        onClick={() => {
          setFocused(false);
          reset();
        }}
        type="button"
        >
        cancelar
        </button>
      </div>
      )}
    </form>
  );
}
