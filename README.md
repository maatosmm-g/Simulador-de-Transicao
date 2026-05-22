# 📊 Simulador de Transição de Jornada: Impacto Operacional e Financeiro

> Um Web App interativo desenvolvido em TypeScript e Vite que permite a qualquer empreendedor ou gestor simular o impacto financeiro, operacional e de pessoal decorrente da redução gradual da jornada de trabalho (44h para 36h).

O simulador utiliza conceitos econômicos e de gestão de operações, como o **Mal de Baumol (Cost Disease)** e o cálculo de **FTE (Full-Time Equivalent)**, demonstrando que a perda de horas impacta diretamente a capacidade de atendimento simultâneo nos momentos de pico.

---

## 📋 Índice
- [Funcionalidades e Parametrização](#-funcionalidades-e-parametrização)
- [Interface e Layout do Sistema](#-interface-e-layout-do-sistema)
- [Indicadores Calculados (Métricas de Negócio)](#-indicadores-calculados-métricas-de-negócio)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Licença](#-licença)

---

## ✨ Funcionalidades e Parametrização

Diferente de modelos estáticos, esta ferramenta é **totalmente customizável** para a realidade de qualquer empresa. O usuário pode ajustar na interface:

* **Perfil da Unidade:** Tamanho da equipe atual (número de pessoas).
* **Metas de Jornada:** Transição interativa clicando nos cenários (44h, 40h, 39h, 38h, 37h, 36h).
* **Variáveis Financeiras:** Input de Ticket Médio, Salário Base e Margem de Venda Real.
* **Regime Tributário:** Alternância dinâmica entre **Simples Nacional** e **Lucro Real** para o cálculo exato de custos trabalhistas e encargos.

---

## 📈 Indicadores Calculados (Métricas de Negócio)

O motor de cálculo do simulador entrega respostas em tempo real organizadas em cards inteligentes:

1. **Déficit Real de Atendimento:** Porcentagem de capacidade retida e perda produtiva da equipe sem mitigação tecnológica.
2. **Equilíbrio Operacional:** Alertas visuais dinâmicos indicando se a jornada atual está dimensionada corretamente para a demanda.
3. **Funcionários Equivalentes (FTE):** Cálculo exato de quantas contratações seriam necessárias em tempo integral para manter o nível de serviço atual.
4. **Vendas em Risco / Impacto Financeiro:** Quantificação do custo de horas extras, gap e o risco de perda de receita por filas ou piora no atendimento personalizado.
5. **Nota Estratégica (Mal de Baumol):** Explicação teórica aplicada sobre o aumento direto de custo por hora trabalhada em serviços presenciais.

---

## 🛠️ Tecnologias Utilizadas

* **TypeScript** - Linguagem principal para tipagem estática e segurança do código.
* **Vite** - Build tool ultra-rápido para o desenvolvimento do ecossistema Frontend.
* **React / Tailwind CSS** - Para renderização dos componentes reativos e estilização moderna da interface.

---

## 🚀 Como Executar o Projeto Localmente

Certifique-se de ter o **Node.js** instalado na sua máquina e siga os passos:

```bash
# 1. Clone este repositório
$ git clone [https://github.com/maatosmm-g/Simulador-de-Transicao.git](https://github.com/maatosmm-g/Simulador-de-Transicao.git)

# 2. Acesse a pasta do projeto
$ cd Simulador-de-Transicao

# 3. Instale as dependências necessárias
$ npm install

# 4. Execute o projeto em modo de desenvolvimento
$ npm run dev
```

⭐ Gostou do Simulador? Deixe uma estrela no repositório para apoiar o projeto e ajudar a espalhar essa ferramenta estratégica!
---

