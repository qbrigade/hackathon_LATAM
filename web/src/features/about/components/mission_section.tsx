import SectionSubtitle from '@common/components/subtitle';

export function MissionSection() {
  return (
    <section className="w-full py-25 px-6 md:px-25">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 md:gap-10 max-w-6xl mx-auto">
        <div className="flex-1 max-w-prose text-justify space-y-4 text-base leading-relaxed">
          <SectionSubtitle title="Nuestra misión" />
          <p>
            En Peruanista creemos que cada persona es un proyecto en constante desarrollo.
            Tú eres un nodo en una gran red social y productiva, y necesitas un link que te conecte con oportunidades reales en el entorno local, regional, nacional y global.
          </p>
          <p>
            Vivir sin participar en un proyecto colectivo es vivir aislado.
            En el Perú, el 78% de la población es informal porque no está incluida en el Proyecto País.
          </p>
          <p>
            Nuestra misión es integrarte.
            En Peruanista te brindamos información y herramientas basadas en Inteligencia Artificial para que te conectes, participes y nunca más seas excluido.
          </p>
        </div>
        <div className='justify-center w-full h-full max-w-[600px]'>
          <iframe
            width="100%"
            height="340px"
            src="https://www.youtube.com/embed/Fjffq_LYI1Q"
            title=""
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen>
          </iframe>
        </div>
      </div>
    </section>
  );
}
