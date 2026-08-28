import Link from "next/link";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

export default function TerminosPage() {
  return (
    <div className="mt-landing min-h-screen">
      <header className="flex items-center gap-3 border-b border-black/10 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={30} />
        </Link>
        <Link href="/" className="ml-auto text-sm text-black/50 hover:text-black">
          ← Volver
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-serif text-3xl">Términos y condiciones</h1>
        <p className="mt-2 text-sm text-black/50">Última actualización: 2026.</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-black/70">
          <section>
            <h2 className="text-base font-semibold text-black">1. Quiénes somos</h2>
            <p className="mt-2">
              MindTwins · Lili Speak es un servicio operado por Mylili. Al acceder o utilizar
              esta plataforma aceptas estos términos y condiciones.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black">2. El servicio</h2>
            <p className="mt-2">
              MindTwins permite a profesores y academias de idiomas crear un gemelo
              digital (&quot;Teacher MindTwin&quot;) entrenado con su pedagogía y su voz, al que sus
              alumnos acceden por texto y voz para práctica interactiva 24/7.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black">3. Cuentas y acceso docente</h2>
            <p className="mt-2">
              El alta como profesor de idiomas permite configurar el perfil pedagógico, subir materiales
              y gestionar alumnos.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black">4. Pagos y facturación</h2>
            <p className="mt-2">
              Los profesores gestionan sus servicios y sesiones de práctica a través de la plataforma.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black">5. Privacidad</h2>
            <p className="mt-2">
              El profesor tiene acceso a las métricas de avance y práctica de sus alumnos garantizando
              la confidencialidad y protección de datos.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-black">6. Contacto</h2>
            <p className="mt-2">
              Para cualquier consulta sobre estos términos, contacta con el equipo de soporte de Lili Speak.
            </p>
          </section>
        </div>
      </main>
      <Footer dark={false} />
    </div>
  );
}
