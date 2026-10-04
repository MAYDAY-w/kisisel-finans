import { formatCurrency, formatPercent } from '../utils/formatters.js';

/**
 * Evaluates the user's financial health score (0 - 100) and returns insights.
 */
export function analyzeFinancialHealth(summary, budgets = [], debts = [], recurring = []) {
  const { monthlyIncome, monthlyExpenses, monthlySavings, monthlySavingsRate } = summary;

  let score = 70; // baseline
  const suggestions = [];
  const highlights = [];

  // 1. Savings rate evaluation
  if (monthlyIncome > 0) {
    if (monthlySavingsRate >= 20) {
      score += 15;
      highlights.push(`Tebrikler! Gelirinizin %${monthlySavingsRate.toFixed(1)}'ini tasarruf ederek harika bir finansal disiplin sergiliyorsunuz.`);
    } else if (monthlySavingsRate > 0) {
      score += 5;
      highlights.push(`Gelirinizin %${monthlySavingsRate.toFixed(1)}'ini biriktiriyorsunuz. İdeal oran en az %20'dir.`);
      suggestions.push('Aylık tasarruf oranınızı %20 seviyesine çıkarmak için zorunlu olmayan harcamaları gözden geçirebilirsiniz.');
    } else {
      score -= 20;
      highlights.push('Bu ay harcamalarınız gelirinizin üzerinde gerçekleşti (Net açık var).');
      suggestions.push('Bütçe açığını kapatmak için acil olmayan harcamalarınızı durdurmalı ve bütçe limitlerini sıkılaştırmalısınız.');
    }
  } else if (monthlyExpenses > 0) {
    score -= 10;
    suggestions.push('Bu ay henüz gelir kaydı girilmedi. Gelirlerinizi eklemeyi unutmayın.');
  }

  // 2. Budget adherence
  let exceededBudgetsCount = 0;
  budgets.forEach((b) => {
    if (b.spent > b.limit) exceededBudgetsCount++;
  });
  if (exceededBudgetsCount > 0) {
    score -= 10 * exceededBudgetsCount;
    suggestions.push(`${exceededBudgetsCount} kategoride belirlenen aylık bütçe limitini aştınız.`);
  }

  // 3. Debts & Receivables
  let totalBorrowed = 0;
  let totalLent = 0;
  debts.forEach((d) => {
    const remaining = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
    if (d.type === 'borrowed') totalBorrowed += remaining;
    if (d.type === 'lent') totalLent += remaining;
  });

  if (totalBorrowed > 0) {
    highlights.push(`Toplam ödenecek borcunuz: ${formatCurrency(totalBorrowed)}.`);
    if (totalBorrowed > monthlyIncome) {
      score -= 10;
      suggestions.push('Mevcut borç tutarınız aylık gelirinizden yüksek. Borç kapatma planına öncelik vermelisiniz.');
    }
  }

  // 4. Recurring subscriptions
  let totalRecurringMonthly = 0;
  recurring.forEach((r) => {
    totalRecurringMonthly += Number(r.amount) || 0;
  });
  if (totalRecurringMonthly > 0) {
    highlights.push(`Aylık sabit abonelik ve planlı ödemeler toplamı: ${formatCurrency(totalRecurringMonthly)}.`);
  }

  // Clamp score
  score = Math.min(100, Math.max(10, score));

  return {
    score,
    grade: score >= 85 ? 'Mükemmel' : score >= 70 ? 'İyi' : score >= 50 ? 'Orta' : 'Riskli',
    highlights,
    suggestions,
    totalBorrowed,
    totalLent,
    totalRecurringMonthly,
  };
}

/**
 * Answers questions asked by the user in the AI Advisor chat.
 */
export function getAiAdvisorResponse(userQuery, context) {
  const { summary, categoriesData = [], budgets = [], debts = [], recurring = [] } = context;
  const q = userQuery.toLowerCase().trim();

  // "Bu ay nereye gitti / harcamalarım"
  if (q.includes('nereye') || q.includes('harcama') || q.includes('dağılım') || q.includes('gider')) {
    if (categoriesData.length === 0) {
      return 'Bu ay henüz kaydedilmiş bir harcamanız bulunmuyor. Fiş çekerek veya sesle harcama ekleyebilirsiniz!';
    }
    const topCat = categoriesData[0];
    const top3 = categoriesData.slice(0, 3).map((c) => `${c.name} (${formatCurrency(c.total)} - %${c.percentage.toFixed(0)})`).join(', ');
    return `Bu ay toplam **${formatCurrency(summary.monthlyExpenses)}** harcadınız. En yüksek harcamanız **${topCat.name}** kategorisinde (${formatCurrency(topCat.total)}). \n\nİlk 3 harcama alanınız: ${top3}.`;
  }

  // "Nasıl tasarruf edebilirim / tasarruf"
  if (q.includes('tasarruf') || q.includes('birikim') || q.includes('öneri') || q.includes('tavsiye')) {
    const suggestions = [];
    if (categoriesData.length > 0) {
      const topCat = categoriesData[0];
      suggestions.push(`1. **${topCat.name}** harcamanızı %15 oranında kısarak ayda **${formatCurrency(topCat.total * 0.15)}** tasarruf edebilirsiniz.`);
    }
    if (recurring.length > 0) {
      suggestions.push(`2. Düzenli ${recurring.length} adet aboneliğiniz bulunuyor. Kullanmadığınız dijital servisleri iptal etmek nakit akışınızı rahatlatır.`);
    }
    suggestions.push(`3. Gelirinizin en az %20'sini maaş günü doğrudan Yatırım Portföyünüze (Altın, Fon, Hisse) aktararak "Önce Kendine Öde" kuralını uygulayın.`);
    return `İşte sizin verilerinize özel tasarruf önerilerim:\n\n${suggestions.join('\n')}`;
  }

  // "Borç / Alacak durumu"
  if (q.includes('borç') || q.includes('alacak') || q.includes('kime')) {
    let totalBorrowed = 0;
    let totalLent = 0;
    debts.forEach((d) => {
      const rem = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
      if (d.type === 'borrowed') totalBorrowed += rem;
      if (d.type === 'lent') totalLent += rem;
    });

    return `Borç/Alacak Analiziniz:\n• Kalan Toplam Borcunuz: **${formatCurrency(totalBorrowed)}**\n• Tahsil Edilecek Alacaklarınız: **${formatCurrency(totalLent)}**\n• Net Fark: **${formatCurrency(totalLent - totalBorrowed, true)}**`;
  }

  // "Abonelik / Sabit ödemeler"
  if (q.includes('abonelik') || q.includes('sabit') || q.includes('planlı') || q.includes('fatura')) {
    if (recurring.length === 0) {
      return 'Kayıtlı aktif bir aboneliğiniz veya planlı ödemeniz bulunmuyor. Kira, aidat veya dijital servislerinizi ekleyebilirsiniz.';
    }
    const total = recurring.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const names = recurring.map((r) => `${r.title} (${formatCurrency(r.amount)})`).join(', ');
    return `Aktif ${recurring.length} adet planlı ödemeniz var. Aylık toplam maliyeti: **${formatCurrency(total)}**.\n\nKayıtlar: ${names}.`;
  }

  // Default response
  const health = analyzeFinancialHealth(summary, budgets, debts, recurring);
  return `Finansal Sağlık Puanınız: **${health.score}/100 (${health.grade})**.\n\nBu ayki net tasarrufunuz: **${formatCurrency(summary.monthlySavings, true)}**.\n${health.highlights[0] || ''}\n\nÖneri: ${health.suggestions[0] || 'Düzenli harcama ve fiş kaydı tutarak bütçenizi kontrol altında tutun.'}`;
}
