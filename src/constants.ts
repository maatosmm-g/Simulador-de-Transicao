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
}

export interface MitigationStrategy {
  id: string;
  name: string;
  description: string;
  productivityBoost: number; // percentual (0.05 = 5%)
  costPerEmployee: number;   // custo mensal por colaborador
  active: boolean;
}

// 🎯 Constantes de calibração do modelo (documentadas para auditoria)
export const MODEL_CALIBRATION = {
  // Quanto a equipe absorve do déficit via intensidade sem perder vendas
  INTENSITY_ABSORPTION: 0.05,
  // Proporção do tempo em que a fila gera desistência (horários de pico)
  PEAK_HOURS_RATIO: 0.30,
  // Taxa base de desistência em fila + sensibilidade ao déficit
  ABANDONMENT_BASE: 0.15,
  ABANDONMENT_SENSITIVITY: 0.10,
  ABANDONMENT_CEIL: 0.50,
  // Teto máximo de perda em relação ao movimento total (segurança)
  MAX_LOSS_RATIO: 0.12,
  // Margem mínima de retorno para considerar contratação "viável"
  HIRE_SAFETY_MARGIN: 1.20,
  // Multiplicadores de encargos trabalhistas
  TAX_MULTIPLIER: {
    simples: 1.35,
    real: 1.50,
  },
  // Média de semanas por mês (52 / 12)
  WEEKS_PER_MONTH: 4.33,
} as const;

export const INITIAL_PARAMETERS: SimulationParameters = {
  employeeCount: 7,
  avgProductivity: 4,
  currentHours: 44,
  targetHours: 40,
  avgTicket: 350,
  avgSalary: 1621,
  taxRegime: 'simples',
  grossMargin: 0.40,
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