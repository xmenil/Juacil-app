import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './HelpPage.module.css';
import { Link, useLocation } from 'react-router-dom';
import { Alert } from '@/shared/ui/Alert';
import { ROUTES } from '@/shared/config/routes';
import { SurveyRepository } from '@/entities/survey/model/surveyRepository';

type SurveyKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10';
type SurveyAnswers = Record<SurveyKey, string>;

const surveyQuestions: { key: keyof SurveyAnswers; title: string; options: string[] }[] = [
  {
    key: 'q1',
    title: '¿Qué tan fácil e intuitivo le resultó navegar y explorar las secciones de la plataforma JUÁCIL?',
    options: ['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'],
  },
  {
    key: 'q2',
    title: '¿Qué tan clara y comprensible le pareció la presentación de los productos (fotografías, precios y descripciones)?',
    options: ['Muy clara', 'Clara', 'Regular', 'Poco clara', 'Nada clara'],
  },
  {
    key: 'q3',
    title: '¿Qué tan fácil le resultó encontrar tiendas o productos de su interés según su rubro o categoría?',
    options: ['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'],
  },
  {
    key: 'q4',
    title: 'Al seleccionar productos, ¿qué tan sencillo y comprensible fue para usted agregar y revisar los artículos en el carrito?',
    options: ['Muy sencillo', 'Sencillo', 'Regular', 'Complicado', 'Muy complicado'],
  },
  {
    key: 'q5',
    title: 'Al momento de ingresar sus datos para generar el pedido, ¿qué tan rápido y claro le resultó este paso?',
    options: ['Muy rápido y claro', 'Rápido y claro', 'Regular', 'Lento o confuso', 'Muy lento o confuso'],
  },
  {
    key: 'q6',
    title: '¿Qué tan práctico considera el envío automático del pedido directamente al WhatsApp del comerciante?',
    options: ['Muy práctico', 'Práctico', 'Regular', 'Poco práctico', 'Nada práctico'],
  },
  {
    key: 'q7',
    title: '¿Qué tan cómoda y fluida fue su experiencia al utilizar JUÁCIL desde su teléfono móvil?',
    options: ['Muy cómoda y fluida', 'Cómoda', 'Regular', 'Incómoda', 'Muy incómoda'],
  },
  {
    key: 'q8',
    title: '¿Qué tan rápida y estable percibió la respuesta de la aplicación al interactuar con imágenes, filtros y botones?',
    options: ['Muy rápida y estable', 'Rápida', 'Regular', 'Lenta', 'Muy lenta'],
  },
  {
    key: 'q9',
    title: '¿En qué medida considera que JUÁCIL facilitará a los pequeños negocios de la región vender por internet y llegar a más clientes?',
    options: ['En gran medida', 'En buena medida', 'De forma moderada', 'En poca medida', 'Nada'],
  },
  {
    key: 'q10',
    title: 'Tomando en cuenta toda su experiencia general, ¿qué tan dispuesto(a) estaría a utilizar o recomendar JUÁCIL en la localidad?',
    options: ['Totalmente dispuesto(a)', 'Dispuesto(a)', 'Indeciso(a)', 'Poco dispuesto(a)', 'Nada dispuesto(a)'],
  },
];

export const HelpPage: React.FC = () => {
  const { hash } = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'survey'>(() => hash === '#encuesta' ? 'survey' : 'faq');
  const [answers, setAnswers] = useState<SurveyAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: '',
    q10: '',
  });
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);

  useEffect(() => { if (isSurveySubmitted && activeTab === 'survey') resultRef.current?.focus(); }, [isSurveySubmitted, activeTab]);
  const missingQuestions = surveyQuestions.filter(({ key }) => !answers[key]);

  const handleSelect = (key: keyof SurveyAnswers, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (missingQuestions.length > 0) {
      setShowErrors(true);
      formRef.current?.querySelector<HTMLInputElement>('input[name="' + missingQuestions[0].key + '"]')?.focus();
      return;
    }
    setShowErrors(false);
    setIsSurveySubmitted(true);
    try {
      SurveyRepository.addSubmission(answers as Record<string, string>, 'cliente');
    } catch {}
  };

  const totalScore = Object.entries(answers).reduce((acc, [key, val]) => {
    const q = surveyQuestions.find((sq) => sq.key === key);
    if (!q) return acc;
    const idx = q.options.indexOf(val);
    if (idx === -1) return acc;
    return acc + (5 - idx);
  }, 0);
  const usabilityPercent = Math.max(0, Math.min(100, Math.round(((totalScore - 10) / 40) * 100)));

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Ayuda
          </h1>
          <p className={styles.intro}>
            Resuelve tus dudas sobre compras y negocios en JUÁCIL.
          </p>

          <div className={styles.sectionSelector} role="group" aria-label="Secciones de ayuda">
            <Button
              type="button"
              className={styles.sectionButton}
              aria-pressed={activeTab === 'faq'}
              aria-controls="help-content"
              variant={activeTab === 'faq' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('faq')}
            >
              Preguntas frecuentes
            </Button>
            <Button
              type="button"
              className={styles.sectionButton}
              aria-pressed={activeTab === 'survey'}
              aria-controls="help-content"
              variant={activeTab === 'survey' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('survey')}
            >
              Evalúa JUÁCIL
            </Button>
          </div>
        </header>

        <section id="help-content" aria-label={activeTab === 'faq' ? 'Preguntas frecuentes' : 'Evalúa JUÁCIL'}>
        {activeTab === 'faq' ? (
          <div className={styles.faq}>
            <section aria-labelledby="help-purchases">
              <h2 id="help-purchases" className={styles.groupTitle}>Compras y pedidos</h2>
              <details className={styles.question}>
                <summary>¿Cómo coordino el pago?</summary>
                <p>JUÁCIL no procesa pagos reales en este prototipo. El enlace de WhatsApp prepara un mensaje con los datos del pedido; tú decides cuándo enviarlo. Coordina el medio de pago directamente con la tienda.</p>
              </details>
              <details className={styles.question}>
                <summary>¿Cómo coordino la entrega o el recojo?</summary>
                <p>Consulta la modalidad de tu pedido y coordina con la tienda la disponibilidad, el horario y cualquier costo de entrega. JUÁCIL no gestiona el transporte.</p>
              </details>
              <details className={styles.question}>
                <summary>¿Por qué el carrito reúne productos de una sola tienda?</summary>
                <p>Cada pedido corresponde a una tienda. Si agregas productos de otra, JUÁCIL te pedirá confirmar el reemplazo del carrito.</p>
              </details>
              <details className={styles.question}>
                <summary>¿Dónde consulto mi pedido?</summary>
                <p>En “Mis pedidos” puedes consultar el estado, los productos y los datos de coordinación de cada compra.</p>
                <Link className={styles.contextLink} to={ROUTES.CUSTOMER_ORDERS}>Ver mis pedidos <ArrowRight size={16} aria-hidden="true" /></Link>
              </details>
            </section>
            <section aria-labelledby="help-business">
              <h2 id="help-business" className={styles.groupTitle}>Tu negocio</h2>
              <details className={styles.question}>
                <summary>¿Qué necesito para registrar mi negocio?</summary>
                <p>Completa el nombre, rubro, ubicación y descripción del negocio, junto con el nombre del responsable, su correo y WhatsApp de contacto. El RUC es opcional. Después podrás agregar tus productos desde el panel.</p>
                <p>El registro crea un negocio demo en tu navegador; no realiza trámites de formalización.</p>
                <Link className={styles.contextLink} to={ROUTES.REGISTER_BUSINESS}>Registrar mi negocio <ArrowRight size={16} aria-hidden="true" /></Link>
              </details>
            </section>
          </div>
        ) : (
          <div className={styles.survey} id="encuesta">
            <div className={styles.surveyIntro}>
              <h2 className={styles.groupTitle}>Instrumento de Validación de Usabilidad</h2>
              <p>Responde estas 10 preguntas cerradas sobre tu experiencia al probar la plataforma JUÁCIL.</p>
              <p className={styles.demoNote}>Evaluación de experiencia de usuario (UX) para el proyecto de innovación.</p>
              <p className={styles.sourceNote}>Cuestionario oficial del Proyecto JUÁCIL — Selva Central.</p>
            </div>
            {isSurveySubmitted ? (
              <div className={styles.result}>
                <CheckCircle2 size={36} className={styles.successIcon} aria-hidden="true" />
                <h3 ref={resultRef} tabIndex={-1} className={styles.resultTitle}>Terminaste la encuesta demo</h3>
                
                <div style={{
                  background: 'var(--color-primary-50, #f0fdf4)',
                  border: '1px solid var(--color-primary-200, #bbf7d0)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  margin: '12px 0'
                }}>
                  <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Resultado de Evaluación de Usabilidad (UX)
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950, #0c3e25)', margin: '4px 0' }}>
                    {totalScore} / 50 puntos ({usabilityPercent}%)
                  </div>
                  <div style={{ fontSize: '14px', color: '#15803d', fontWeight: 600 }}>
                    {totalScore >= 42 ? '⭐ Nivel Excelente: Usabilidad Alta y Validación Favorable' :
                     totalScore >= 34 ? '✅ Nivel Aceptable: Usabilidad Moderada' :
                     totalScore >= 26 ? '⚠️ Nivel Regular: Se sugieren ajustes menores' :
                     '❌ Nivel Crítico: Requiere optimización de funciones'}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#4b5563' }}>
                    Tus respuestas han sido procesadas para la evaluación estadística del Capítulo III (Validación de Resultados) del proyecto JUÁCIL.
                  </p>
                </div>

                <div className={styles.resultActions}>
                  <Button type="button" onClick={() => {
                    setIsSurveySubmitted(false);
                    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input')?.focus());
                  }}>Revisar mis respuestas</Button>
                  <Button type="button" variant="outline" onClick={() => setActiveTab('faq')}>Volver a preguntas frecuentes</Button>
                </div>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSurveySubmit} noValidate className={styles.surveyForm}>
                <p className={styles.progress}>{surveyQuestions.length - missingQuestions.length} de 10 preguntas respondidas</p>
                {surveyQuestions.map((question, index) => (
                  <fieldset key={question.key} className={styles.surveyQuestion}>
                    <legend>{index + 1}. {question.title}</legend>
                    <div className={styles.options}>
                      {question.options.map((option) => (
                        <label key={option} className={styles.option}>
                          <input type="radio" name={question.key} value={option}
                            checked={answers[question.key] === option}
                            onChange={() => handleSelect(question.key, option)}
                            required
                            aria-invalid={showErrors && !answers[question.key]}
                            aria-describedby={showErrors && !answers[question.key] ? question.key + '-error' : undefined} />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    {showErrors && !answers[question.key] && <p id={question.key + '-error'} className={styles.fieldError}>Selecciona una respuesta.</p>}
                  </fieldset>
                ))}
                <div className={styles.submitArea}>
                  {showErrors && missingQuestions.length > 0 && (
                    <Alert variant="danger">Te {missingQuestions.length === 1 ? 'falta 1 pregunta' : 'faltan ' + missingQuestions.length + ' preguntas'} por responder.</Alert>
                  )}
                  <Button type="submit" size="lg" variant="accent" className={styles.submitButton} rightIcon={<ArrowRight size={18} />}>Finalizar encuesta demo</Button>
                </div>
              </form>
            )}
          </div>
        )}
        </section>
      </div>
    </div>
  );
};
