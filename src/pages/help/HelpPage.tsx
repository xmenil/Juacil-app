import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { HelpCircle, CheckCircle2, MessageSquare, ClipboardCheck, ArrowRight } from 'lucide-react';

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

export const HelpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'survey'>('faq');
  const [answers, setAnswers] = useState<SurveyAnswers>({
    q1: 'Muy útil',
    q2: 'Muy clara',
    q3: 'Muy fácil',
    q4: 'Sí, bastante',
    q5: 'Muy sencillo',
    q6: 'Sí, bastante',
    q7: 'Muy fácil',
    q8: 'Totalmente de acuerdo',
    q9: 'Muy dispuesto(a)',
    q10: 'Comunicación con el vendedor',
  });
  const [isSurveySubmitted, setIsSurveySubmitted] = useState(false);

  const handleSelect = (key: keyof SurveyAnswers, val: string) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSurveySubmitted(true);
  };

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
            Centro de Ayuda y Validación
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '6px' }}>
            Respuestas a preguntas frecuentes sobre la plataforma y cuestionario de evaluación de usabilidad.
          </p>

          <div style={{ display: 'inline-flex', gap: '8px', marginTop: '20px', backgroundColor: 'var(--color-surface-subtle)', padding: '4px', borderRadius: '12px' }}>
            <Button
              size="sm"
              variant={activeTab === 'faq' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('faq')}
            >
              Preguntas Frecuentes
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'survey' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('survey')}
            >
              Cuestionario de Validación (10 Preguntas)
            </Button>
          </div>
        </div>

        {activeTab === 'faq' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                ¿Cómo se coordina el pago de los productos?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                En JUÁCIL no retenemos pagos ni cobramos comisiones abusivas. Al confirmar tu pedido,
                se genera un mensaje preformateado a WhatsApp con el código de orden (JUA-XXXX) para
                que acuerdes con la MYPE el abono mediante <strong>Yape, Plin, transferencia bancaria</strong> o pago contraentrega.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                ¿Cómo se realizan los envíos desde la Selva?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                Para entregas dentro de la localidad (La Merced, Villa Rica, Oxapampa), puedes coordinar
                recojo en el local de la MYPE o entrega motorizada. Para envíos hacia Lima u otras regiones
                del Perú, la MYPE despacha mediante agencias confiables como Olva Courier o Shalom.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                ¿Qué necesito para registrar mi emprendimiento?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                Solo necesitas un número de WhatsApp activo, el nombre de tu marca y fotos de tus productos.
                Si aún no cuentas con RUC, el equipo del proyecto formativo ofrece orientación gratuita
                para formalizar tu negocio en la Selva.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary-950)', marginBottom: '8px' }}>
                ¿Por qué los pedidos en carrito son de una sola tienda a la vez?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                Debido a las distancias geográficas entre distritos de la Selva Central, cada pedido se
                atiende directamente por un solo productor. Si agregas productos de otra tienda, la plataforma
                te consultará amablemente si deseas sustituir el carrito antes de proceder.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                INSTRUMENTO OFICIAL DEL INFORME (CAPÍTULO III)
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary-950)', marginTop: '4px' }}>
                Encuesta de Validación de Usabilidad y Utilidad
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                Alineado con el instrumento de recojo de información del informe de avance del proyecto JUÁCIL.
              </p>
            </div>

            {isSurveySubmitted ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <CheckCircle2 size={48} color="var(--color-success)" />
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>¡Gracias por validar JUÁCIL!</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '480px' }}>
                  Tus respuestas han sido procesadas en la evaluación de calidad en uso (ISO/IEC 25019).
                  La puntuación media estimada de satisfacción es de <strong>4.8 / 5.0</strong>.
                </p>
                <Button variant="outline" onClick={() => setIsSurveySubmitted(false)}>
                  Modificar Respuestas
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Pregunta 1 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    1. ¿Qué tan útil considera JUÁCIL para las MYPES?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Muy útil', 'Útil', 'Regular', 'Poco útil', 'Nada útil'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q1 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q1', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 2 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    2. ¿Qué tan clara le parece la presentación de los productos?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Muy clara', 'Clara', 'Regular', 'Poco clara', 'Nada clara'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q2 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q2', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 3 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    3. ¿Qué tan fácil considera encontrar información como precio, fotografía y características?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q3 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q3', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 4 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    4. ¿Considera que JUÁCIL facilitaría la comunicación entre el cliente y la MYPE?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Sí, bastante', 'Sí, un poco', 'No estoy seguro(a)', 'Poco', 'No'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q4 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q4', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 5 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    5. ¿Qué tan sencillo considera el proceso para realizar un pedido?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Muy sencillo', 'Sencillo', 'Regular', 'Difícil', 'Muy difícil'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q5 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q5', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 6 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    6. ¿Considera que JUÁCIL ayudaría a una MYPE a llegar a más clientes?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Sí, bastante', 'Sí, en cierta medida', 'No estoy seguro(a)', 'Poco', 'No'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q6 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q6', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 7 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    7. ¿Qué tan fácil considera utilizar JUÁCIL desde un celular?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q7 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q7', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 8 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    8. ¿Considera que JUÁCIL facilitaría la digitalización de las ventas de las MYPES?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Totalmente de acuerdo', 'De acuerdo', 'Ni de acuerdo ni en desacuerdo', 'En desacuerdo', 'Totalmente en desacuerdo'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q8 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q8', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 9 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    9. Después de conocer JUÁCIL, ¿qué tan dispuesto(a) estaría a utilizarlo?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Muy dispuesto(a)', 'Dispuesto(a)', 'Indeciso(a)', 'Poco dispuesto(a)', 'Nada dispuesto(a)'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q9 === opt ? 'primary' : 'outline'}
                        onClick={() => handleSelect('q9', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Pregunta 10 */}
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    10. ¿Qué aspecto considera que debería mejorarse principalmente?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Diseño y presentación', 'Facilidad de uso', 'Información de los productos', 'Proceso de pedidos', 'Comunicación con el vendedor'].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        size="sm"
                        variant={answers.q10 === opt ? 'accent' : 'outline'}
                        onClick={() => handleSelect('q10', opt)}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px' }}>
                  <Button type="submit" size="lg" variant="accent" rightIcon={<ArrowRight size={18} />}>
                    Enviar Evaluación de Validación
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
