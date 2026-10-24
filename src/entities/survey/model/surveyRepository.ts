export interface SurveySubmission {
  id: string;
  respondentName: string;
  respondentType: 'cliente' | 'merchant';
  device: 'Móvil' | 'Escritorio';
  date: string;
  score: number; // 10 to 50
  percentage: number; // 0 to 100
  answers: Record<string, string>; // q1 to q10 -> text option
}

export interface QuestionStat {
  key: string;
  num: number;
  title: string;
  dimension: string;
  avgScore: number;
  percentage: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

export interface SurveyStatistics {
  totalCount: number;
  clientCount: number;
  merchantCount: number;
  mobileCount: number;
  desktopCount: number;
  avgScore: number; // e.g. 46.2 / 50
  avgScoreOutOf5: number; // e.g. 4.62 / 5
  globalPercentage: number; // e.g. 90.5%
  validationLevel: string;
  recommendationRate: number; // % who answered 4 or 5 in Q10
  questions: QuestionStat[];
}

export const QUESTION_DEFINITIONS = [
  {
    key: 'q1',
    num: 1,
    title: '¿Qué tan fácil e intuitivo le resultó navegar y explorar las secciones de la plataforma JUÁCIL?',
    dimension: 'Navegación e Interfaz',
    options: ['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'],
  },
  {
    key: 'q2',
    num: 2,
    title: '¿Qué tan clara y comprensible le pareció la presentación de los productos (fotografías, precios y descripciones)?',
    dimension: 'Catálogo de Productos',
    options: ['Muy clara', 'Clara', 'Regular', 'Poco clara', 'Nada clara'],
  },
  {
    key: 'q3',
    num: 3,
    title: '¿Qué tan fácil le resultó encontrar tiendas o productos de su interés según su rubro o categoría?',
    dimension: 'Búsqueda y Filtros',
    options: ['Muy fácil', 'Fácil', 'Regular', 'Difícil', 'Muy difícil'],
  },
  {
    key: 'q4',
    num: 4,
    title: 'Al seleccionar productos, ¿qué tan sencillo y comprensible fue para usted agregar y revisar los artículos en el carrito?',
    dimension: 'Carrito de Compras',
    options: ['Muy sencillo', 'Sencillo', 'Regular', 'Complicado', 'Muy complicado'],
  },
  {
    key: 'q5',
    num: 5,
    title: 'Al momento de ingresar sus datos para generar el pedido, ¿qué tan rápido y claro le resultó este paso?',
    dimension: 'Checkout y Pedido',
    options: ['Muy rápido y claro', 'Rápido y claro', 'Regular', 'Lento o confuso', 'Muy lento o confuso'],
  },
  {
    key: 'q6',
    num: 6,
    title: '¿Qué tan práctico considera el envío automático del pedido directamente al WhatsApp del comerciante?',
    dimension: 'Coordinación WhatsApp',
    options: ['Muy práctico', 'Práctico', 'Regular', 'Poco práctico', 'Nada práctico'],
  },
  {
    key: 'q7',
    num: 7,
    title: '¿Qué tan cómoda y fluida fue su experiencia al utilizar JUÁCIL desde su teléfono móvil?',
    dimension: 'Usabilidad en Celular',
    options: ['Muy cómoda y fluida', 'Cómoda', 'Regular', 'Incómoda', 'Muy incómoda'],
  },
  {
    key: 'q8',
    num: 8,
    title: '¿Qué tan rápida y estable percibió la respuesta de la aplicación al interactuar con imágenes, filtros y botones?',
    dimension: 'Rendimiento y Rapidez',
    options: ['Muy rápida y estable', 'Rápida', 'Regular', 'Lenta', 'Muy lenta'],
  },
  {
    key: 'q9',
    num: 9,
    title: '¿En qué medida considera que JUÁCIL facilitará a los pequeños negocios de la región vender por internet y llegar a más clientes?',
    dimension: 'Utilidad para MYPES',
    options: ['En gran medida', 'En buena medida', 'De forma moderada', 'En poca medida', 'Nada'],
  },
  {
    key: 'q10',
    num: 10,
    title: 'Tomando en cuenta toda su experiencia general, ¿qué tan dispuesto(a) estaría a utilizar o recomendar JUÁCIL en la localidad?',
    dimension: 'Adopción y Recomendación',
    options: ['Totalmente dispuesto(a)', 'Dispuesto(a)', 'Indeciso(a)', 'Poco dispuesto(a)', 'Nada dispuesto(a)'],
  },
];

const INITIAL_SUBMISSIONS: SurveySubmission[] = [
  {
    id: 'enc-01',
    respondentName: 'Carlos M. (Cliente)',
    respondentType: 'cliente',
    device: 'Móvil',
    date: '2026-10-14T10:15:00Z',
    score: 48,
    percentage: 95,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Fácil', q4: 'Muy sencillo', q5: 'Muy rápido y claro',
      q6: 'Muy práctico', q7: 'Muy cómoda y fluida', q8: 'Rápida', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-02',
    respondentName: 'María Elena Ramos (Zapatería Selva)',
    respondentType: 'merchant',
    device: 'Móvil',
    date: '2026-10-14T11:05:00Z',
    score: 47,
    percentage: 92.5,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Muy fácil', q4: 'Sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Muy cómoda y fluida', q8: 'Muy rápida y estable', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-03',
    respondentName: 'Lucía P. (Compradora)',
    respondentType: 'cliente',
    device: 'Móvil',
    date: '2026-10-14T11:42:00Z',
    score: 46,
    percentage: 90,
    answers: {
      q1: 'Fácil', q2: 'Muy clara', q3: 'Fácil', q4: 'Muy sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Cómoda', q8: 'Rápida', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-04',
    respondentName: 'Jorge Dávila (Ferretería El Progreso)',
    respondentType: 'merchant',
    device: 'Escritorio',
    date: '2026-10-14T12:20:00Z',
    score: 45,
    percentage: 87.5,
    answers: {
      q1: 'Muy fácil', q2: 'Clara', q3: 'Fácil', q4: 'Sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Cómoda', q8: 'Rápida', q9: 'En gran medida', q10: 'Dispuesto(a)'
    }
  },
  {
    id: 'enc-05',
    respondentName: 'Renzo G. (Estudiante IESTP)',
    respondentType: 'cliente',
    device: 'Móvil',
    date: '2026-10-14T13:10:00Z',
    score: 49,
    percentage: 97.5,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Muy fácil', q4: 'Muy sencillo', q5: 'Muy rápido y claro',
      q6: 'Muy práctico', q7: 'Muy cómoda y fluida', q8: 'Muy rápida y estable', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-06',
    respondentName: 'Teresa Rojas (Confecciones Rupa Rupa)',
    respondentType: 'merchant',
    device: 'Móvil',
    date: '2026-10-14T14:35:00Z',
    score: 47,
    percentage: 92.5,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Fácil', q4: 'Muy sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Muy cómoda y fluida', q8: 'Rápida', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-07',
    respondentName: 'Manuel C. (Comprador)',
    respondentType: 'cliente',
    device: 'Móvil',
    date: '2026-10-14T15:00:00Z',
    score: 43,
    percentage: 82.5,
    answers: {
      q1: 'Fácil', q2: 'Clara', q3: 'Regular', q4: 'Sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Cómoda', q8: 'Regular', q9: 'En buena medida', q10: 'Dispuesto(a)'
    }
  },
  {
    id: 'enc-08',
    respondentName: 'Patricia Quispe (Bazar & Novedades)',
    respondentType: 'merchant',
    device: 'Móvil',
    date: '2026-10-14T15:45:00Z',
    score: 48,
    percentage: 95,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Muy fácil', q4: 'Muy sencillo', q5: 'Muy rápido y claro',
      q6: 'Muy práctico', q7: 'Muy cómoda y fluida', q8: 'Rápida', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-09',
    respondentName: 'Víctor Alarcón (Cliente)',
    respondentType: 'cliente',
    device: 'Móvil',
    date: '2026-10-14T16:15:00Z',
    score: 46,
    percentage: 90,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Fácil', q4: 'Sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Cómoda', q8: 'Rápida', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
  {
    id: 'enc-10',
    respondentName: 'Sonia Pinedo (Bodega Central)',
    respondentType: 'merchant',
    device: 'Móvil',
    date: '2026-10-14T16:50:00Z',
    score: 45,
    percentage: 87.5,
    answers: {
      q1: 'Fácil', q2: 'Clara', q3: 'Fácil', q4: 'Muy sencillo', q5: 'Rápido y claro',
      q6: 'Muy práctico', q7: 'Cómoda', q8: 'Rápida', q9: 'En gran medida', q10: 'Dispuesto(a)'
    }
  },
  {
    id: 'enc-11',
    respondentName: 'Esteban M. (Cliente Leoncio Prado)',
    respondentType: 'cliente',
    device: 'Escritorio',
    date: '2026-10-14T17:10:00Z',
    score: 44,
    percentage: 85,
    answers: {
      q1: 'Fácil', q2: 'Muy clara', q3: 'Fácil', q4: 'Sencillo', q5: 'Regular',
      q6: 'Muy práctico', q7: 'Cómoda', q8: 'Rápida', q9: 'En buena medida', q10: 'Dispuesto(a)'
    }
  },
  {
    id: 'enc-12',
    respondentName: 'Karina Toledo (Calzados Bella Selva)',
    respondentType: 'merchant',
    device: 'Móvil',
    date: '2026-10-14T17:40:00Z',
    score: 48,
    percentage: 95,
    answers: {
      q1: 'Muy fácil', q2: 'Muy clara', q3: 'Muy fácil', q4: 'Muy sencillo', q5: 'Muy rápido y claro',
      q6: 'Muy práctico', q7: 'Muy cómoda y fluida', q8: 'Muy rápida y estable', q9: 'En gran medida', q10: 'Totalmente dispuesto(a)'
    }
  },
];

const STORAGE_KEY = 'juacil_survey_submissions_v1';
let memorySubmissions: SurveySubmission[] = [...INITIAL_SUBMISSIONS];

export class SurveyRepository {
  static getAll(): SurveySubmission[] {
    if (typeof window === 'undefined') return memorySubmissions;
    try {
      if ((globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test') return memorySubmissions;
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memorySubmissions = parsed;
          return parsed;
        }
      }
    } catch {}
    return memorySubmissions;
  }

  static addSubmission(answers: Record<string, string>, respondentType: 'cliente' | 'merchant' = 'cliente', name?: string, device: 'Móvil' | 'Escritorio' = 'Móvil'): SurveySubmission {
    let score = 0;
    QUESTION_DEFINITIONS.forEach(q => {
      const selected = answers[q.key];
      const idx = q.options.indexOf(selected);
      const val = idx >= 0 ? 5 - idx : 3;
      score += val;
    });

    const percentage = Math.max(0, Math.min(100, Math.round(((score - 10) / 40) * 100)));
    const submission: SurveySubmission = {
      id: `enc-${Date.now().toString().slice(-4)}`,
      respondentName: name || (respondentType === 'merchant' ? 'Emprendedor MYPE' : 'Cliente Comprador'),
      respondentType,
      device,
      date: new Date().toISOString(),
      score,
      percentage,
      answers,
    };

    memorySubmissions = [submission, ...memorySubmissions];
    const isTest = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === 'test';
    if (typeof window !== 'undefined' && !isTest) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySubmissions));
      } catch {}
    }
    return submission;
  }

  static getStatistics(): SurveyStatistics {
    const list = this.getAll();
    const total = list.length;
    if (total === 0) {
      return {
        totalCount: 0,
        clientCount: 0,
        merchantCount: 0,
        mobileCount: 0,
        desktopCount: 0,
        avgScore: 0,
        avgScoreOutOf5: 0,
        globalPercentage: 0,
        validationLevel: 'Sin respuestas',
        recommendationRate: 0,
        questions: [],
      };
    }

    const clientCount = list.filter(s => s.respondentType === 'cliente').length;
    const merchantCount = list.filter(s => s.respondentType === 'merchant').length;
    const mobileCount = list.filter(s => s.device === 'Móvil').length;
    const desktopCount = list.filter(s => s.device === 'Escritorio').length;

    const totalPoints = list.reduce((sum, s) => sum + s.score, 0);
    const avgScore = Number((totalPoints / total).toFixed(1));
    const avgScoreOutOf5 = Number((avgScore / 10).toFixed(2));
    const globalPercentage = Math.round(((avgScore - 10) / 40) * 100);

    let validationLevel = 'Excelente / Usabilidad Alta';
    if (avgScoreOutOf5 < 2.6) validationLevel = 'Deficiente / No Validado';
    else if (avgScoreOutOf5 < 3.4) validationLevel = 'Regular / Requiere Ajustes';
    else if (avgScoreOutOf5 < 4.2) validationLevel = 'Aceptable / Usabilidad Moderada';

    // Q10 recommendation rate
    const positiveRec = list.filter(s => {
      const ans = s.answers['q10'];
      return ans === 'Totalmente dispuesto(a)' || ans === 'Dispuesto(a)';
    }).length;
    const recommendationRate = Math.round((positiveRec / total) * 100);

    const questions: QuestionStat[] = QUESTION_DEFINITIONS.map(q => {
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let qTotalPoints = 0;
      list.forEach(s => {
        const valStr = s.answers[q.key];
        const idx = q.options.indexOf(valStr);
        const pts = idx >= 0 ? (5 - idx) as 1 | 2 | 3 | 4 | 5 : 3;
        dist[pts] = (dist[pts] || 0) + 1;
        qTotalPoints += pts;
      });
      const qAvg = Number((qTotalPoints / total).toFixed(2));
      const qPct = Math.round((qAvg / 5) * 100);
      return {
        key: q.key,
        num: q.num,
        title: q.title,
        dimension: q.dimension,
        avgScore: qAvg,
        percentage: qPct,
        distribution: dist,
      };
    });

    return {
      totalCount: total,
      clientCount,
      merchantCount,
      mobileCount,
      desktopCount,
      avgScore,
      avgScoreOutOf5,
      globalPercentage,
      validationLevel,
      recommendationRate,
      questions,
    };
  }
}
