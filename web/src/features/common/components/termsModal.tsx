import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose}></div>

      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[65vh] h-auto flex flex-col z-50
        sm:max-w-2xl sm:p-0 p-0"
      >
        {/* Modal Title */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
          <h2 className="text-lg sm:text-2xl font-bold">
            TÉRMINOS Y CONDICIONES DE USO
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
            type="button"
          >
            <IoClose size={28} />
          </button>
        </div>
        {/* Contenido */}
        <div className="p-4 sm:p-7 overflow-y-auto text-xs sm:text-sm">
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            *No oficiales, solo para fines informativos. No se garantiza la
            exactitud de la información. Consulte fuentes oficiales para
            información precisa y actualizada.
          </p>

          <div className="space-y-3 sm:space-y-4">
            <p>
              Al acceder y utilizar la plataforma <strong>Peruanistas</strong>{" "}
              (en adelante, "la Plataforma"), usted acepta cumplir con los
              siguientes Términos y Condiciones de Uso. Si no está de acuerdo
              con estos términos, absténgase de utilizar nuestros servicios.
            </p>

            <h3 className="font-bold">1. ACEPTACIÓN DE LOS TÉRMINOS</h3>
            <p>
              El uso de la Plataforma implica la aceptación plena y vinculante
              de estos Términos y Condiciones, así como de nuestra Política de
              Privacidad. Peruanistas se reserva el derecho de modificar estos
              términos en cualquier momento, siendo responsabilidad del usuario
              revisarlos periódicamente.
            </p>

            <h3 className="font-bold">2. REQUISITOS DE REGISTRO</h3>
            <p>2.1. Para utilizar la Plataforma, el usuario debe:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ser mayor de 18 años.</li>
              <li>
                Proporcionar información veraz, exacta y completa durante el
                registro.
              </li>
              <li>
                Mantener la confidencialidad de sus credenciales de acceso.
              </li>
            </ul>
            <p>
              2.2. Peruanistas se reserva el derecho de suspender o cancelar
              cuentas que incumplan estos términos o realicen actividades
              fraudulentas.
            </p>

            <h3 className="font-bold">3. FUNCIONALIDADES DE LA PLATAFORMA</h3>
            <p>3.1. La Plataforma permite a los usuarios:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Proponer proyectos de interés comunitario o social.</li>
              <li>Votar por proyectos propuestos por otros usuarios.</li>
            </ul>
            <p>
              3.2. Peruanistas actúa únicamente como intermediario y no
              garantiza la ejecución de los proyectos, ni asume responsabilidad
              por su viabilidad o implementación.
            </p>

            <h3 className="font-bold">4. OBLIGACIONES DEL USUARIO</h3>
            <p>El usuario se compromete a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Utilizar la Plataforma de conformidad con la ley y la moral.
              </li>
              <li>
                No publicar contenido ilegal, difamatorio, obsceno o que vulnere
                derechos de terceros.
              </li>
              <li>
                No manipular el sistema de votos mediante métodos fraudulentos o
                automatizados.
              </li>
            </ul>

            <h3 className="font-bold">5. PROPIEDAD INTELECTUAL</h3>
            <p>
              5.1. Todos los derechos de propiedad intelectual sobre la
              Plataforma, incluyendo diseño, software y contenidos, son
              propiedad exclusiva de Peruanistas.
            </p>
            <p>
              5.2. Los proyectos publicados por los usuarios son de su
              responsabilidad, y Peruanistas no se atribuye derechos de autor
              sobre ellos, salvo la licencia para su visualización en la
              Plataforma.
            </p>

            <h3 className="font-bold">6. PROTECCIÓN DE DATOS PERSONALES</h3>
            <p>
              Los datos personales proporcionados por los usuarios serán
              tratados de acuerdo con nuestra Política de Privacidad, cumpliendo
              con la Ley N° 29733 - Ley de Protección de Datos Personales del
              Perú.
            </p>

            <h3 className="font-bold">7. LIMITACIÓN DE RESPONSABILIDAD</h3>
            <p>Peruanistas no será responsable por:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Daños directos o indirectos derivados del uso de la Plataforma.
              </li>
              <li>
                La imposibilidad temporal o permanente de acceder al servicio
                por causas ajenas a su control.
              </li>
              <li>
                El contenido publicado por los usuarios o la ejecución de los
                proyectos votados.
              </li>
            </ul>

            <h3 className="font-bold">8. MODIFICACIONES Y TERMINACIÓN</h3>
            <p>
              Peruanistas podrá actualizar estos Términos en cualquier momento,
              notificando a los usuarios mediante publicación en la Plataforma.
              Asimismo, podrá suspender o dar por terminado el servicio sin
              previo aviso, en caso de detectar un uso indebido de la Plataforma
              o por razones de fuerza mayor.
            </p>

            <h3 className="font-bold">
              9. LEGISLACIÓN APLICABLE Y JURISDICCIÓN
            </h3>
            <p>
              Estos Términos se rigen por la legislación peruana. Para cualquier
              controversia, las partes se someten a los tribunales competentes
              de Lima, Perú.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
