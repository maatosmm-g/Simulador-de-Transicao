export type TaxRegime = 'simples' | 'real';

export interface SimulationParameters {
  employeeCount: number;
  avgProductivity: number; // atendimentos por hora por colaborador
  currentHours: number;
  targetHours: number;
  avgTicket: number;
  avgSalary: number;
  taxRegime: TaxRegime;
  grossMargin: number; // Margem de contribuição (0-1)
  commercialEfficiency: number; // Fator de aproveitamento comercial (0-1, padrão 0.25)
}

export interface MitigationStrategy {
  id: 'tech' | 'training' | 'scales' | 'processes' | 'remote';
  name: string;
  description: string;
  productivityBoost: number; // percentual (0.05 = 5%)
  costPerEmployee: number;   // custo mensal por colaborador
  active: boolean;
}

// 🎯 Constantes de calibração do modelo (Altamente calibradas com a teoria do Efeito Baumol e o Mercado Brasileiro 2026)
export const MODEL_CALIBRATION = {
  /**
   * INTENSITY_ABSORPTION (Resiliência Operacional Inicial)
   * Representa a capacidade natural de absorção de déficit pela equipe (ex.: aumento temporário de foco
   * ou compressão de tempos mortos). Definido em 5%. Déficits menores que este limite não geram perdas de vendas,
   * amortecendo pequenas oscilações de horas produtivas.
   */
  INTENSITY_ABSORPTION: 0.05,
  
  /**
   * PEAK_HOURS_RATIO (Concentração de Fluxo em Horários de Pico)
   * Em negócios de serviços e comércio, a perda de horas operacionais não se distribui de maneira uniforme.
   * O déficit produtivo impacta majoritariamente as horas de pico de atendimento (estimado em 35% do tempo total),
   * onde a capacidade residual é zero e filas de espera geram gargalos imediatos.
   */
  PEAK_HOURS_RATIO: 0.35,
  
  /**
   * SENSITIVIDADE E LIMIARES DE DESISTÊNCIA (Abandonment Dynamics)
   * Modela matematicamente o comportamento de saída/desistência de clientes em filas.
   * - ABANDONMENT_BASE (15%): Taxa natural mínima de perda em cenários de fila saturada.
   * - ABANDONMENT_SENSITIVITY (15%): Fator multiplicador que acelera as desistências à medida que o déficit de horas
   *   por colaborador se acumula (representando filas exponencialmente maiores).
   * - ABANDONMENT_CEIL (85%): O teto limite de desistências para evitar infinitudes operacionais, capturando o total
   *   colapso de atendimento em reduções radicais desprotegidas de jornada (ex.: 36h sem mitigação tecnológica).
   */
  ABANDONMENT_BASE: 0.15,
  ABANDONMENT_SENSITIVITY: 0.15,
  ABANDONMENT_CEIL: 0.85,
  
  /**
   * MAX_LOSS_RATIO (Teto Produtivo de Perda Base)
   * Estabelece um limite macroeconômico realista de perda comercial de 40% sobre o volume do cenário base,
   * impedindo que o modelo projete perdas matemáticas abstratas superiores à própria escala física da operação.
   */
  MAX_LOSS_RATIO: 0.40,
  
  /**
   * HIRE_SAFETY_MARGIN (Margem de Segurança de Contratação)
   * Coeficiente de segurança financeira para avaliar se a receita recuperada por um colaborador adicional
   * justifica integralmente seu custo real carregado de encargos (exige 20% de margem positiva mínima).
   */
  HIRE_SAFETY_MARGIN: 1.20,
  
  /**
   * TAX_MULTIPLIER (Multiplicadores de Encargos Trabalhistas Totais - Mercado Brasileiro 2026)
   * Traduz o salário nominal bruto de carteira (CLT) para o custo patronal real carregado do empregador:
   * - 'simples' (1.35x): Custo de empresas no Simples Nacional. Inclui Férias (1/3 constitucional), 13º salário,
   *   FGTS (8%), provisão de multa rescisória e benefícios básicos.
   * - 'real' (1.60x): Custo sob o Lucro Presumido ou Lucro Real. Adiciona INSS Patronal (20%), RAT/FAP (ajustado),
   *   Salário Educação e contribuições de Terceiros (Sistema S) sobre a folha bruta.
   */
  TAX_MULTIPLIER: {
    simples: 1.35,
    real: 1.60,
  },
  
  /**
   * WEEKS_PER_MONTH (Fator exato de conversão cronológica mensal)
   * Média exata de semanas por mês calendário (52 semanas divididas por 12 meses = 4.3333).
   * Garante a precisão matemática na conversão de taxas operacionais semanais para demonstrações financeiras mensais.
   */
  WEEKS_PER_MONTH: 4.3333,
} as const;

export const INITIAL_PARAMETERS: SimulationParameters = {
  employeeCount: 7,
  avgProductivity: 4,
  currentHours: 44,
  targetHours: 44, 
  avgTicket: 320,  // Alinhado com o padrão de R$ 320 das suas simulações reais
  avgSalary: 1621,
  taxRegime: 'simples',
  grossMargin: 0.20, // Inicializado em 20% real conforme exibido nas telas de simulação de margem
  commercialEfficiency: 0.25, // Fator de aproveitamento comercial (coeficiente para pausas, baixa conversão, estoque, etc)
};

export const MITIGATION_STRATEGIES: MitigationStrategy[] = [
  {
    id: 'tech',
    name: 'Automação e IA',
    description: 'Implementação de sistemas de autoatendimento e ferramentas de IA para triagem.',
    productivityBoost: 0.12,
    costPerEmployee: 150,
    active: false,
  },
  {
    id: 'training',
    name: 'Treinamento Intensivo',
    description: 'Melhoria de processos internos e capacitação da equipe em multitarefa.',
    productivityBoost: 0.05,
    costPerEmployee: 50,
    active: false,
  },
  {
    id: 'scales',
    name: 'Escalas Otimizadas',
    description: 'Uso de softwares de escala flexível baseada em histórico de fluxo.',
    productivityBoost: 0.08,
    costPerEmployee: 30,
    active: false,
  },
  {
    id: 'processes',
    name: 'Revisão de Processos',
    description: 'Eliminação de gargalos burocráticos no atendimento presencial.',
    productivityBoost: 0.04,
    costPerEmployee: 0,
    active: false,
  },
  {
    id: 'remote',
    name: 'Suporte Híbrido',
    description: 'Migração de parte do atendimento para canais digitais assíncronos.',
    productivityBoost: 0.07,
    costPerEmployee: 80,
    active: false,
  },
];

export const EVOLUTION_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];