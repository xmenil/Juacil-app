import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './HelpPage.module.css';
import { Link, useLocation } from 'react-router-dom';
import { Alert } from '@/shared/ui/Alert';
import { ROUTES } from '@/shared/config/routes';

interface SurveyAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
}

const surveyQuestions: { key: keyof SurveyAnswers; title: string; options: string[] }[] = [
  {
    "key": "q1",
    "title": "¿Qué tan útil considera JUÁCIL para las MYPES?",
    "options": [
      "Muy útil",
      "Útil",
      "Regular",
      "Poco útil",
      "Nada útil"
    ]
  },
  {
    "key": "q2",
    "title": "¿Qué tan clara le parece la presentación de los productos?",
    "options": [
      "Muy clara",
      "Clara",
      "Regular",
      "Poco clara",
      "Nada clara"
    ]
  },
  {
    "key": "q3",
    "title": "¿Qué tan fácil considera encontrar información como precio, fotografía y características?",
    "options": [
      "Muy fácil",
      "Fácil",
      "Regular",
      "Difícil",
      "Muy difícil"
    ]
  },
  {
    "key": "q4",
    "title": "¿Considera que JUÁCIL facilitaría la comunicación entre el cliente y la MYPE?",
    "options": [
      "Sí, bastante",
      "Sí, un poco",
      "No estoy seguro(a)",
      "Poco",
      "No"
    ]
  },
  {
    "key": "q5",
    "title": "¿Qué tan sencillo considera el proceso para realizar un pedido?",
    "options": [
      "Muy sencillo",
      "Sencillo",
      "Regular",
      "Difícil",
      "Muy difícil"
    ]
  },
  {
    "key": "q6",
    "title": "¿Considera que JUÁCIL ayudaría a una MYPE a llegar a más clientes?",
    "options": [
      "Sí, bastante",
      "Sí, en cierta medida",
      "No estoy seguro(a)",
      "Poco",
      "No"
    ]
  },
  {
    "key": "q7",
    "title": "¿Qué tan fácil considera utilizar JUÁCIL desde un celular?",
    "options": [
      "Muy fácil",
      "Fácil",
      "Regular",
      "Difícil",
      "Muy difícil"
    ]
  },
  {
    "key": "q8",
    "title": "¿Considera que JUÁCIL facilitaría la digitalización de las ventas de las MYPES?",
    "options": [
      "Totalmente de acuerdo",
      "De acuerdo",
      "Ni de acuerdo ni en desacuerdo",
      "En desacuerdo",
      "Totalmente en desacuerdo"
    ]
  },
  {
    "key": "q9",
    "title": "Después de conocer JUÁCIL, ¿qué tan dispuesto(a) estaría a utilizarlo?",
    "options": [
      "Muy dispuesto(a)",
      "Dispuesto(a)",
      "Indeciso(a)",
      "Poco dispuesto(a)",
      "Nada dispuesto(a)"
    ]
  },
  {
    "key": "q10",
    "title": "¿Qué aspecto considera que debería mejorarse principalmente?",
    "options": [
      "Diseño y presentación",
      "Facilidad de uso",
      "Información de los productos",
      "Proceso de pedidos",
      "Comunicación con el vendedor"
    ]
  }
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
  };

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
              <h2 className={styles.groupTitle}>Cuéntanos cómo te fue</h2>
              <p>Responde estas 10 preguntas después de probar JUÁCIL.</p>
              <p className={styles.demoNote}>Esta encuesta es demostrativa. Las respuestas permanecen mientras esta página siga abierta; no se envían a un equipo ni se guardan al recargar.</p>
              <p className={styles.sourceNote}>Cuestionario de evaluación del proyecto JUÁCIL.</p>
            </div>
            {isSurveySubmitted ? (
              <div className={styles.result}>
                <CheckCircle2 size={32} className={styles.successIcon} aria-hidden="true" />
                <h3 ref={resultRef} tabIndex={-1} className={styles.resultTitle}>Terminaste la encuesta demo</h3>
                <p>Puedes revisar tus respuestas mientras esta página siga abierta. No se enviaron ni se guardan al recargar.</p>
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
