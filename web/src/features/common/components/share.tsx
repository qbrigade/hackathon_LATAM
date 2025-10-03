import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from 'react-share';

type ShareProps = {
  title?: string,
  shareTitle?: string,
  location?: string,
  url: string,
  content?: string,
}

export function Share({ title, shareTitle, location, url, content }: ShareProps) {
  return (
    <div className='text-2xl font-bold'>
      <h1 className='my-1 mb-3'>{shareTitle ?? 'Comparte este contenido'}</h1>
      <div className='flex flex-col'>
        <textarea
          className='w-full h-20 bg-gray-200 focus:outline-border rounded-md p-2 font-normal text-lg overflow-auto resize-none'
          value={url}
          readOnly
          onFocus={(e) => {
            e.target.select();
            e.target.setSelectionRange(0, e.target.value.length);
          }}
        />
        <button
          className='bg-[var(--main-color-bt-bg)] text-white rounded-md p-2 font-normal text-lg my-2 hover:bg-pink-800 transition-colors duration-300 justify-self-end self-end'
          onClick={() => {
            navigator.clipboard.writeText(url);
            alert('URL copiada al portapapeles');
          }}
        >
          <p className='font-bold px-2'>Copiar</p>
        </button>
      </div>
      <p className='font-normal text-base' >Compártelo en tus redes sociales</p>
      <div className='flex flex-row gap-3 items-center my-3 overflow-x-auto py-0.5'>
        <FacebookShareButton url={url} hashtag={`peruanista #${location}`} >
          <FacebookIcon size={50} round />
        </FacebookShareButton>
        <TwitterShareButton url={url}
          title={title} >
          <XIcon size={50} round />
        </TwitterShareButton>
        <LinkedinShareButton url={url}
          title={title} >
          <LinkedinIcon size={50} round />
        </LinkedinShareButton>
        <EmailShareButton url={url}
          subject={title} body={content} >
          <EmailIcon size={50} round />
        </EmailShareButton>
        <WhatsappShareButton url={url}
          title={title} >
          <WhatsappIcon size={50} round />
        </WhatsappShareButton>
        <button className='cursor-pointer' onClick={() => {
          window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, '_blank');
        }
        }>
          <RedditIcon size={50} round />
        </button>
        <TelegramShareButton url={url}
          title={title} >
          <TelegramIcon size={50} round />
        </TelegramShareButton>
      </div>

    </div>
  );
}
