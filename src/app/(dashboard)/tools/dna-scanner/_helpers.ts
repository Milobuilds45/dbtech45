// DNA Scanner helper functions and data

export interface LayerQuestion {
  id: string;
  question: string;
  description: string;
}

export interface LayerDef {
  id: number;
  name: string;
  shortName: string;
  iconName: string;
  questions: LayerQuestion[];
}

export type Answers = Record<string, number>;

export const LAYERS: LayerDef[] = [
  {
    id: 1, name: 'Problem/Solution Fit', shortName: 'Problem', iconName: 'Target',
    questions: [
      { id: 'l1q1', question: 'How clearly defined is the specific problem your business solves?', description: 'A well-defined problem is the foundation of every successful business.' },
      { id: 'l1q2', question: 'How urgent is this problem for your target customers?', description: 'Urgency determines willingness to pay and speed of adoption.' },
      { id: 'l1q3', question: 'How significant is the cost of NOT solving this problem?', description: 'Higher cost of inaction = stronger business case.' },
      { id: 'l1q4', question: 'How well do you understand current alternatives customers use?', description: 'Knowing the competitive landscape reveals your opportunity.' },
    ],
  },
  {
    id: 2, name: 'Market Opportunity', shortName: 'Market', iconName: 'TrendingUp',
    questions: [
      { id: 'l2q1', question: 'How large is your total addressable market?', description: 'Market size determines your growth ceiling.' },
      { id: 'l2q2', question: 'How fast is your target market growing?', description: 'Growing markets lift all boats.' },
      { id: 'l2q3', question: 'How well do you understand your competitive landscape?', description: 'Know thy enemy — and thy opportunity.' },
      { id: 'l2q4', question: 'How strong is your competitive advantage or moat?', description: 'A defensible position separates businesses from hobbies.' },
    ],
  },
  {
    id: 3, name: 'Business Model', shortName: 'Model', iconName: 'DollarSign',
    questions: [
      { id: 'l3q1', question: 'How clear and proven is your revenue model?', description: 'How you make money should be crystal clear.' },
      { id: 'l3q2', question: 'How healthy are your unit economics?', description: 'Every sale should be profitable at the unit level.' },
      { id: 'l3q3', question: 'How well do you know your customer acquisition cost (CAC)?', description: "If you don't know CAC, you're flying blind." },
      { id: 'l3q4', question: 'How strong is your customer lifetime value (LTV)?', description: 'LTV > CAC is the formula for sustainable growth.' },
    ],
  },
  {
    id: 4, name: 'Go-to-Market Strategy', shortName: 'GTM', iconName: 'Megaphone',
    questions: [
      { id: 'l4q1', question: 'How clearly defined are your customer acquisition channels?', description: 'Know exactly where your customers are and how to reach them.' },
      { id: 'l4q2', question: 'How effective is your current marketing strategy?', description: 'Marketing should generate predictable, measurable results.' },
      { id: 'l4q3', question: 'How diversified are your distribution channels?', description: 'Multiple channels reduce risk and increase reach.' },
      { id: 'l4q4', question: 'How scalable is your customer acquisition process?', description: 'Can you 10x without breaking?' },
    ],
  },
  {
    id: 5, name: 'Operations & Execution', shortName: 'Ops', iconName: 'Settings',
    questions: [
      { id: 'l5q1', question: 'How well-documented are your key operational processes?', description: 'Systems > hustle. Document everything.' },
      { id: 'l5q2', question: 'How capable is your current team for the next growth phase?', description: 'The team that got you here may not get you there.' },
      { id: 'l5q3', question: 'How robust are your systems, tools, and technology stack?', description: "The right tools multiply your team's output." },
      { id: 'l5q4', question: 'How clearly defined are your success metrics and KPIs?', description: 'What gets measured gets managed.' },
    ],
  },
  {
    id: 6, name: 'Financial Projections', shortName: 'Finance', iconName: 'BarChart3',
    questions: [
      { id: 'l6q1', question: 'How realistic and data-driven are your revenue projections?', description: 'Hope is not a strategy. Use real numbers.' },
      { id: 'l6q2', question: 'How well do you understand your funding requirements?', description: 'Know exactly what you need and when you need it.' },
      { id: 'l6q3', question: 'How clear is your path to break-even or profitability?', description: 'Every dollar should have a plan.' },
      { id: 'l6q4', question: 'How well do you track your key financial metrics?', description: 'Cash flow, margins, burn rate — know your numbers.' },
    ],
  },
  {
    id: 7, name: 'Risk Management', shortName: 'Risk', iconName: 'Shield',
    questions: [
      { id: 'l7q1', question: 'How well have you identified your biggest business risks?', description: "You can't manage what you haven't identified." },
      { id: 'l7q2', question: 'How strong are your risk mitigation strategies?', description: 'Plans are useless — planning is everything.' },
      { id: 'l7q3', question: 'How prepared is your contingency planning?', description: 'When Plan A fails, Plan B should be ready.' },
      { id: 'l7q4', question: 'How adaptable is your business to market changes?', description: "Adapt or die — the market doesn't wait." },
    ],
  },
];

export function layerScore(id: number, a: Answers): number {
  const l = LAYERS.find(x => x.id === id)!;
  const v = l.questions.map(q => a[q.id] || 0).filter(x => x > 0);
  return v.length ? Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 10) / 10 : 0;
}

export function layerDone(id: number, a: Answers): boolean {
  return LAYERS.find(x => x.id === id)!.questions.every(q => a[q.id] > 0);
}

export function overallScore(a: Answers): number {
  const s = LAYERS.map(l => layerScore(l.id, a)).filter(x => x > 0);
  return s.length ? Math.round((s.reduce((t, x) => t + x, 0) / s.length) * 10) / 10 : 0;
}

export function overallPct(a: Answers): number {
  return Math.round((overallScore(a) / 10) * 100);
}

export function scoreColor(s: number): string {
  return s < 4 ? '#EF4444' : s <= 6 ? '#EAB308' : '#10B981';
}

export function scoreLabel(s: number): string {
  return s < 4 ? 'Needs Work' : s <= 6 ? 'Developing' : s <= 8 ? 'Strong' : 'Excellent';
}

export function layerRec(id: number, s: number): string {
  const m: Record<number, [string, string, string]> = {
    1: [
      'Your problem definition needs sharpening. Conduct 20+ customer interviews to validate the pain point and quantify the cost.',
      'Good foundation — dig deeper into customer urgency and map the entire customer journey around this problem.',
      'Strong problem/solution fit. Continue validating as you scale and watch for market shifts.',
    ],
    2: [
      'Market research is critical. Size your TAM/SAM/SOM, identify growth trends, and deeply analyze 3-5 competitors.',
      'You have a sense of the market but need harder data. Commission research or build your own data moat.',
      'Excellent market understanding. Focus on defending and expanding your competitive advantage.',
    ],
    3: [
      'Your business model needs fundamental work. Get crystal clear on revenue streams, pricing, and unit economics before scaling.',
      'Business model is taking shape. Focus on improving unit economics — reduce CAC, increase LTV.',
      'Solid business model. Optimize for efficiency and explore adjacent revenue streams.',
    ],
    4: [
      'Your GTM strategy needs a complete overhaul. Start with one channel, prove it works, then expand.',
      'GTM is functional but not yet scalable. Invest in automation and begin testing new channels.',
      'Strong GTM engine. Focus on scale, efficiency, and building brand moats.',
    ],
    5: [
      'Operations are a bottleneck. Document core processes, invest in team development, and implement tracking systems.',
      'Good operational foundation. Systemize for the next growth phase and fill team gaps.',
      'Operations running well. Focus on optimization and building a culture of continuous improvement.',
    ],
    6: [
      'Financial blind spots are dangerous. Build a proper financial model, track key metrics weekly, understand your runway.',
      'Financial awareness is growing. Sharpen projections with real data and build scenario planning into your process.',
      'Strong financial discipline. Continue optimizing and prepare for scale-up capital needs.',
    ],
    7: [
      'Risk management is severely lacking. Conduct a formal risk assessment and build contingency plans for your top 5 risks.',
      "You're aware of risks but need stronger mitigation plans. Build adaptability into your business model.",
      'Solid risk management. Continue stress-testing and building organizational resilience.',
    ],
  };
  const i = s < 4 ? 0 : s <= 6 ? 1 : 2;
  return m[id]?.[i] || '';
}

export async function generatePDF(answers: Answers, email: string, chartCanvas: HTMLCanvasElement | null) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  let y = 20;
  const os = overallScore(answers);
  const op = overallPct(answers);

  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, W, 50, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 50, W, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(245, 158, 11);
  doc.text('BUSINESS DNA REPORT', 20, 25);
  doc.setFontSize(11);
  doc.setTextColor(161, 161, 170);
  doc.text('Generated for: ' + email, 20, 34);
  doc.text('Date: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 20, 41);
  y = 62;

  doc.setFontSize(16);
  doc.setTextColor(250, 250, 250);
  doc.text('Executive Summary', 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(161, 161, 170);
  const sum = 'Your business scored ' + os + '/10 overall (' + op + '%). ' +
    (op >= 70 ? 'Strong fundamentals across most dimensions. Focus on optimizing weaker areas to achieve excellence.'
      : op >= 50 ? 'Solid foundation with room for growth. Address lower-scoring areas to unlock your next level.'
      : 'Significant opportunities for improvement. Start with your lowest-scoring layers for the biggest impact.');
  const sl = doc.splitTextToSize(sum, W - 40);
  doc.text(sl, 20, y);
  y += sl.length * 6 + 8;

  if (chartCanvas) {
    try {
      const img = chartCanvas.toDataURL('image/png');
      doc.addImage(img, 'PNG', (W - 100) / 2, y, 100, 100);
      y += 108;
    } catch { y += 5; }
  }

  LAYERS.forEach(layer => {
    if (y > 250) { doc.addPage(); y = 20; }
    const sc = layerScore(layer.id, answers);
    const rgb = sc < 4 ? [239, 68, 68] : sc <= 6 ? [234, 179, 8] : [16, 185, 129];
    doc.setFillColor(24, 24, 27);
    doc.roundedRect(15, y - 4, W - 30, 8, 2, 2, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(250, 250, 250);
    doc.text('Layer ' + layer.id + ': ' + layer.name, 20, y + 2);
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(sc + '/10 — ' + scoreLabel(sc), W - 20, y + 2, { align: 'right' });
    y += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(161, 161, 170);
    const rec = layerRec(layer.id, sc);
    const sr = doc.splitTextToSize(rec, W - 40);
    doc.text(sr, 20, y);
    y += sr.length * 5 + 10;
  });

  if (y > 230) { doc.addPage(); y = 20; }
  doc.setFillColor(245, 158, 11);
  doc.rect(15, y, W - 30, 1, 'F');
  y += 8;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('Next Steps', 20, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(161, 161, 170);
  const weak = LAYERS.map(l => ({ n: l.name, s: layerScore(l.id, answers) })).sort((a, b) => a.s - b.s);
  const steps = [
    '1. Priority Focus: Start with "' + weak[0].n + '" (Score: ' + weak[0].s + '/10)',
    '2. Quick Win: Address "' + weak[1].n + '" to improve your overall position',
    '3. Strengthen: Build on "' + weak[2].n + '" for a more balanced business',
    '4. Re-assess: Take this assessment again in 90 days to measure progress',
    op < 50 ? '5. Consider: Book a strategy consultation for expert guidance' : '5. Scale: Your fundamentals are solid — focus on growth acceleration',
  ];
  steps.forEach(st => {
    const sp = doc.splitTextToSize(st, W - 40);
    doc.text(sp, 20, y);
    y += sp.length * 5 + 4;
  });

  y += 10;
  doc.setFillColor(245, 158, 11);
  doc.rect(15, y, W - 30, 0.5, 'F');
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(113, 113, 122);
  doc.text('Business DNA Scanner — dbtech45.com', W / 2, y, { align: 'center' });
  doc.text('© 2025 DB Tech. All rights reserved.', W / 2, y + 5, { align: 'center' });
  doc.save('Business-DNA-Report.pdf');
}
