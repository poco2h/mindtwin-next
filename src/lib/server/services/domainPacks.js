/**
 * Domain Packs para Servicio 2: Lenguaje Técnico (RAG Especializado)
 * Bases técnicas según Arquitectura Técnica v3 (§02, §05):
 * Aeronáutico (ICAO), Académico (IELTS/Research), Médico (PubMed), Jurídico (EUR-Lex), Financiero (CFA).
 */

export const DOMAIN_PACKS = {
  aeronautico: {
    slug: 'aeronautico',
    nombre: 'Inglés Técnico Aeronáutico (ICAO)',
    fuentes: ['ICAO Doc 9432 (Manual of Radiotelephony)', 'ICAO Annex 10', 'PANS-ATM Doc 4444'],
    descripcion: 'Fraseología estándar de aviación, procedimientos de emergencia, autorizaciones de torre y control de aproximación.',
    chunks: [
      {
        termino: 'ROGER vs WILCO',
        definicion: '"Roger" significa "he recibido y entendido toda tu transmisión". "Wilco" (Will Comply) significa "he entendido y cumpliré las instrucciones". Nunca se dice "Roger Wilco".',
        ejemplo: 'Tower: "Climb flight level 240, turn right heading 090". Pilot: "Wilco, climbing FL240, heading 090, Speedbird 123."',
        fonetica: 'ROGER /ˈrɒdʒər/ · WILCO /ˈwɪlkoʊ/'
      },
      {
        termino: 'LINE UP AND WAIT vs CLEARED FOR TAKEOFF',
        definicion: '"Line up and wait" autoriza a entrar en la pista activa y detenerse en posición, pero NO autoriza a despegar hasta recibir "Cleared for takeoff".',
        ejemplo: 'Tower: "Iberia 345, runway 25L, line up and wait." Pilot: "Runway 25L, line up and wait, Iberia 345."',
        fonetica: 'LINE UP /laɪn ʌp/ · TAKEOFF /ˈteɪk.ɒf/'
      },
      {
        termino: 'SQUAWK',
        definicion: 'Código transpondedor de 4 dígitos asignado por ATC para identificación radar (ej: Squawk 7500=interferencia ilícita, 7600=fallo radio, 7700=emergencia general).',
        ejemplo: 'Radar: "Air Europa 42, squawk 4521". Pilot: "Squawking 4521, Air Europa 42."',
        fonetica: 'SQUAWK /skwɔːk/'
      },
      {
        termino: 'GO AROUND',
        definicion: 'Maniobra de aproximación frustrada en la que la aeronave interrumpe el aterrizaje y asciende según el procedimiento publicado.',
        ejemplo: 'Tower: "Vueling 201, go around, runway obstructed". Pilot: "Going around, Vueling 201."',
        fonetica: 'GO AROUND /ɡoʊ əˈraʊnd/'
      },
      {
        termino: 'MAYDAY vs PAN-PAN',
        definicion: '"Mayday" (declarado 3 veces) indica peligro grave e inminente con necesidad de auxilio inmediato. "Pan-Pan" indica urgencia sobre la seguridad de la aeronave pero sin peligro inminente para la vida.',
        ejemplo: 'Pilot: "Mayday, Mayday, Mayday, Engine failure on departure, request immediate return."',
        fonetica: 'MAYDAY /ˈmeɪdeɪ/ · PAN-PAN /ˈpæn ˈpæn/'
      }
    ]
  },
  academico: {
    slug: 'academico',
    nombre: 'Inglés Académico e Investigación (IELTS / TOEFL / Papers)',
    fuentes: ['Academic Word List (AWL)', 'APA 7th Edition', 'Corpus of Academic English'],
    descripcion: 'Vocabulario para ponencias científicas, redacción de abstracts, refutación de hipótesis y defensa de tesis.',
    chunks: [
      {
        termino: 'EMPIRICAL EVIDENCE',
        definicion: 'Información verificada obtenida mediante observación directa o experimentación, en contraste con teorías deductivas o conjeturas.',
        ejemplo: '"The empirical evidence strongly corroborates the initial hypothesis regarding language acquisition velocity."',
        fonetica: 'EMPIRICAL /ɪmˈpɪr.ɪ.kəl/ · EVIDENCE /ˈev.ɪ.dəns/'
      },
      {
        termino: 'STATISTICAL SIGNIFICANCE (p < 0.05)',
        definicion: 'Medida que indica que los resultados observados en una muestra probablemente no se deben al azar.',
        ejemplo: '"The correlation between daily speech practice and accent reduction reached statistical significance (p = 0.012)."',
        fonetica: 'STATISTICAL /stəˈtɪs.tɪ.kəl/ · SIGNIFICANCE /sɪɡˈnɪf.ɪ.kəns/'
      },
      {
        termino: 'PEER REVIEW',
        definicion: 'Evaluación crítica del trabajo académico por expertos en el mismo campo antes de su publicación.',
        ejemplo: '"The manuscript is currently undergoing double-blind peer review in a high-impact linguistics journal."',
        fonetica: 'PEER REVIEW /pɪər rɪˈvjuː/'
      }
    ]
  },
  medico: {
    slug: 'medico',
    nombre: 'Inglés Médico y Clínico (PubMed / USMLE)',
    fuentes: ['PubMed Clinical Queries', 'DSM-5', 'GMC Medical Terminology'],
    descripcion: 'Anamnesis clínica, diagnóstico diferencial, farmacología y comunicación médico-paciente.',
    chunks: [
      {
        termino: 'DIFFERENTIAL DIAGNOSIS',
        definicion: 'Proceso de distinguir entre dos o más afecciones que comparten signos o síntomas similares.',
        ejemplo: '"Given the patient\'s acute chest discomfort and dyspnea, our differential diagnosis must rule out pulmonary embolism."',
        fonetica: 'DIAGNOSIS /ˌdaɪ.əɡˈnoʊ.sɪs/'
      },
      {
        termino: 'PROGNOSIS vs ANAMNESIS',
        definicion: '"Anamnesis" es el historial médico previo recogido del paciente. "Prognosis" es la predicción del curso probable y desenlace de la enfermedad.',
        ejemplo: '"After thorough anamnesis and clinical tests, the long-term prognosis is favorable with targeted therapy."',
        fonetica: 'PROGNOSIS /prɒɡˈnoʊ.sɪs/ · ANAMNESIS /ˌæn.æmˈniː.sɪs/'
      }
    ]
  },
  juridico: {
    slug: 'juridico',
    nombre: 'Inglés Jurídico y Contractual (EUR-Lex / Common Law)',
    fuentes: ['EUR-Lex Legal Corpus', 'Black\'s Law Dictionary'],
    descripcion: 'Contratos internacionales, cláusulas de indemnización, jurisdicción y resolución de disputas.',
    chunks: [
      {
        termino: 'FORCE MAJEURE CLAUSE',
        definicion: 'Cláusula contractual que exime a una o ambas partes del cumplimiento de sus obligaciones ante eventos extraordinarios e imprevisibles.',
        ejemplo: '"Neither party shall be liable for failure to perform under this agreement due to events of force majeure."',
        fonetica: 'FORCE MAJEURE /ˌfɔːs məˈʒɜːr/'
      },
      {
        termino: 'BREACH OF CONTRACT & INDEMNITY',
        definicion: 'Incumplimiento de una obligación vinculante y el deber contractual de compensar por las pérdidas o daños resultantes.',
        ejemplo: '"Failure to meet delivery milestones constitutes a material breach of contract subject to full indemnity."',
        fonetica: 'BREACH /briːtʃ/ · INDEMNITY /ɪnˈdem.nə.ti/'
      }
    ]
  },
  financiero: {
    slug: 'financiero',
    nombre: 'Inglés Financiero y Banca de Inversión (CFA)',
    fuentes: ['CFA Institute Curriculum', 'IFRS Standards'],
    descripcion: 'Estados financieros, ratios de liquidez, valoración de activos y derivados.',
    chunks: [
      {
        termino: 'EBITDA & FREE CASH FLOW',
        definicion: 'EBITDA (Beneficio antes de intereses, impuestos, depreciaciones y amortizaciones) como métrica de rentabilidad operativa pura.',
        ejemplo: '"Operating cash flow expanded by 18%, resulting in an adjusted EBITDA margin of 24.5%."',
        fonetica: 'EBITDA /ˌiː.bɪtˈdɑː/'
      }
    ]
  }
};

export function buscarEnDomainPack(domainSlug, queryText) {
  const pack = DOMAIN_PACKS[domainSlug];
  if (!pack) return [];

  const lowerQuery = (queryText || '').toLowerCase();
  // Búsqueda por coincidencia de términos / palabras clave
  const matches = pack.chunks.filter(c => {
    const term = c.termino.toLowerCase();
    const def = c.definicion.toLowerCase();
    const ex = c.ejemplo.toLowerCase();
    return lowerQuery.includes(term.split(' ')[0]) ||
           term.split(' ').some(w => w.length > 3 && lowerQuery.includes(w)) ||
           def.includes(lowerQuery) ||
           ex.includes(lowerQuery);
  });

  // Si no hay match exacto, devolver los top-2 chunks del dominio como contexto base
  return matches.length > 0 ? matches.slice(0, 3) : pack.chunks.slice(0, 2);
}
