import { formatCurrency, formatPercent } from '../utils/formatters.js';

/**
 * Evaluates the user's financial health score (0 - 100) and returns insights.
 * IMPORTANT: Salary and regular incomes are strictly separated from subscriptions/fixed expenses.
 */
export function analyzeFinancialHealth(
  summary = {},
  budgets = [],
  debts = [],
  recurring = [],
  investments = [],
  accounts = [],
  isEn = false
) {
  const {
    monthlyIncome = 0,
    monthlyExpenses = 0,
    monthlySavings = 0,
    monthlySavingsRate = 0,
    totalInvestmentCurrentValue = 0,
    totalInvestmentProfit = 0,
  } = summary;

  let score = 65; // Baseline
  const suggestions = [];
  const highlights = [];

  // 1. Separate regular incomes (salary) from regular expenses (subscriptions)
  const regularIncomes = recurring.filter(
    (r) => (r.isSalary || r.type === 'income') && r.isActive !== false
  );
  const regularExpenses = recurring.filter(
    (r) => !r.isSalary && r.type !== 'income' && r.isActive !== false
  );

  const salaryItem = recurring.find((r) => r.isSalary && r.isActive !== false) || recurring.find((r) => r.isSalary);
  const totalRegularIncome = regularIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalRegularExpense = regularExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // 2. Savings rate evaluation
  if (monthlyIncome > 0) {
    if (monthlySavingsRate >= 20) {
      score += 15;
      highlights.push(
        isEn
          ? `Great job! You are saving %${monthlySavingsRate.toFixed(1)} of your income, demonstrating strong financial discipline.`
          : `Tebrikler! Gelirinizin %${monthlySavingsRate.toFixed(1)}'ini tasarruf ederek güçlü bir finansal disiplin sergiliyorsunuz.`
      );
    } else if (monthlySavingsRate > 0) {
      score += 5;
      highlights.push(
        isEn
          ? `You are saving %${monthlySavingsRate.toFixed(1)} of your income. The target benchmark is at least %20.`
          : `Gelirinizin %${monthlySavingsRate.toFixed(1)}'ini biriktiriyorsunuz. İdeal hedef en az %20 seviyesidir.`
      );
      suggestions.push(
        isEn
          ? 'Aim to reach a 20% savings rate by trimming discretionary spending.'
          : 'Tasarruf oranınızı %20 seviyesine çıkarmak için keyfi harcamalardan tasarruf edebilirsiniz.'
      );
    } else {
      score -= 15;
      highlights.push(
        isEn
          ? 'Expenses exceeded your income this month (Net deficit).'
          : 'Bu ay harcamalarınız gelirinizin üzerinde gerçekleşti (Net nakit açığı var).'
      );
      suggestions.push(
        isEn
          ? 'Reduce non-essential expenses immediately to bring your budget back into positive cash flow.'
          : 'Bütçe açığını kapatmak için acil olmayan harcamalarınızı durdurmalı ve nakit akışını pozitife çekmelisiniz.'
      );
    }
  } else if (monthlyExpenses > 0) {
    score -= 10;
    suggestions.push(
      isEn
        ? 'No income recorded yet for this month. Do not forget to log your salary or earnings.'
        : 'Bu ay henüz gelir kaydı girilmedi. Maaş veya ek gelirlerinizi eklemeyi unutmayın.'
    );
  }

  // 3. Salary & Regular Income Insight
  if (salaryItem) {
    const sAmt = Number(salaryItem.amount) || 0;
    if (sAmt > 0) {
      highlights.push(
        isEn
          ? `Monthly salary: ${formatCurrency(sAmt)} (${salaryItem.dayOfMonth ? `Day ${salaryItem.dayOfMonth}` : 'Configured'}).`
          : `Tanımlı aylık maaşınız: ${formatCurrency(sAmt)} (${salaryItem.dayOfMonth ? `Her ayın ${salaryItem.dayOfMonth}. günü` : 'Aktif'}).`
      );
    }
  }

  // 4. Subscriptions & Fixed Expenses (Salary excluded!)
  if (totalRegularExpense > 0) {
    highlights.push(
      isEn
        ? `Monthly subscriptions and fixed bills total: ${formatCurrency(totalRegularExpense)} (${regularExpenses.length} items).`
        : `Aylık sabit abonelik ve faturalarınız: ${formatCurrency(totalRegularExpense)} (${regularExpenses.length} adet).`
    );

    if (monthlyIncome > 0 && (totalRegularExpense / monthlyIncome) > 0.4) {
      score -= 5;
      suggestions.push(
        isEn
          ? `Fixed expenses take up %${((totalRegularExpense / monthlyIncome) * 100).toFixed(0)} of your income. Consider reviewing recurring subscriptions.`
          : `Sabit giderleriniz gelirinizin %${((totalRegularExpense / monthlyIncome) * 100).toFixed(0)}'ini kaplıyor. Kullanmadığınız abonelikleri gözden geçirebilirsiniz.`
      );
    }
  }

  // 5. Budget adherence
  let exceededBudgetsCount = 0;
  budgets.forEach((b) => {
    if (b.spent > b.limit) exceededBudgetsCount++;
  });
  if (exceededBudgetsCount > 0) {
    score -= Math.min(15, 7 * exceededBudgetsCount);
    suggestions.push(
      isEn
        ? `You have exceeded your monthly limit in ${exceededBudgetsCount} budget categories.`
        : `${exceededBudgetsCount} kategoride aylık bütçe limitinizi aştınız.`
    );
  } else if (budgets.length > 0) {
    score += 5;
  }

  // 6. Debts & Installments
  let totalBorrowed = 0;
  let totalLent = 0;
  let monthlyInstallmentBurden = 0;

  debts.forEach((d) => {
    const remaining = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
    if (d.type === 'borrowed') {
      totalBorrowed += remaining;
      if (d.isInstallment && remaining > 0) {
        monthlyInstallmentBurden += Number(d.installmentAmount) || 0;
      }
    }
    if (d.type === 'lent') totalLent += remaining;
  });

  if (totalBorrowed > 0) {
    highlights.push(
      isEn
        ? `Remaining debts to pay: ${formatCurrency(totalBorrowed)}.`
        : `Kalan toplam borcunuz: ${formatCurrency(totalBorrowed)}.`
    );
    if (monthlyInstallmentBurden > 0) {
      highlights.push(
        isEn
          ? `Monthly debt installment burden: ${formatCurrency(monthlyInstallmentBurden)} / mo.`
          : `Aylık borç taksiti ödemeleriniz: ${formatCurrency(monthlyInstallmentBurden)} / ay.`
      );
    }
    if (monthlyIncome > 0 && totalBorrowed > monthlyIncome * 2) {
      score -= 10;
      suggestions.push(
        isEn
          ? 'Total debts exceed 2 months of income. Prioritize a debt payoff avalanche or snowball strategy.'
          : 'Toplam borç tutarınız 2 aylık gelirinizden yüksek. Taksit ve borç kapatmaya öncelik vermelisiniz.'
      );
    }
  }

  // 7. Emergency Fund Runway (Liquid cash vs monthly burn)
  const liquidCash = accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const monthlyBurn = monthlyExpenses > 0 ? monthlyExpenses : totalRegularExpense;
  const runwayMonths = monthlyBurn > 0 ? (liquidCash / monthlyBurn) : (liquidCash > 0 ? 6 : 0);

  if (liquidCash > 0 && monthlyBurn > 0) {
    if (runwayMonths >= 6) {
      score += 10;
      highlights.push(
        isEn
          ? `Excellent safety cushion: Liquid funds cover ~${runwayMonths.toFixed(1)} months of expenses.`
          : `Güçlü acil durum güvencesi: Nakit varlığınız ~${runwayMonths.toFixed(1)} aylık harcamanızı karşılıyor.`
      );
    } else if (runwayMonths >= 3) {
      score += 5;
      highlights.push(
        isEn
          ? `Healthy cushion: Liquid funds cover ~${runwayMonths.toFixed(1)} months of expenses.`
          : `İyi nakit güvencesi: Nakitiniz ~${runwayMonths.toFixed(1)} aylık harcamanızı karşılıyor.`
      );
    } else if (runwayMonths < 1 && monthlyExpenses > 0) {
      score -= 10;
      suggestions.push(
        isEn
          ? 'Emergency savings is under 1 month of expenses. Aim to build a 3-month emergency fund.'
          : 'Acil durum nakit tamponunuz 1 aydan az. Beklenmedik durumlar için 3 aylık birikim fonu oluşturmalısınız.'
      );
    }
  }

  // 8. Investments
  if (totalInvestmentCurrentValue > 0) {
    score += 8;
    if (totalInvestmentProfit > 0) {
      highlights.push(
        isEn
          ? `Investments are in profit: +${formatCurrency(totalInvestmentProfit)} net gain.`
          : `Yatırımlarınız kârda: +${formatCurrency(totalInvestmentProfit)} net kazanç.`
      );
    }
  } else {
    suggestions.push(
      isEn
        ? 'Consider allocating a portion of monthly savings into investment assets (Gold, Funds, Stocks) to beat inflation.'
        : 'Tasarruflarınızı enflasyona karşı korumak için düzenli olarak yatırıma (Altın, Vadeli Mevduat, Fon) aktarabilirsiniz.'
    );
  }

  // Clamp score
  score = Math.min(100, Math.max(15, Math.round(score)));

  let grade = 'İyi';
  if (isEn) {
    grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Moderate' : 'Needs Attention';
  } else {
    grade = score >= 85 ? 'Mükemmel' : score >= 70 ? 'İyi' : score >= 50 ? 'Orta' : 'Riskli';
  }

  return {
    score,
    grade,
    highlights,
    suggestions,
    totalBorrowed,
    totalLent,
    monthlyInstallmentBurden,
    totalRegularIncome,
    totalRegularExpense,
    salaryAmount: salaryItem ? (Number(salaryItem.amount) || 0) : 0,
    salaryTitle: salaryItem ? salaryItem.title : '',
    salaryDay: salaryItem ? salaryItem.dayOfMonth : null,
    regularExpensesList: regularExpenses,
    liquidCash,
    runwayMonths,
  };
}

/**
 * Calls Google Gemini API if an API key is available.
 */
async function callGeminiApi(promptText, apiKey) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim()) {
          return candidate.trim();
        }
      }
    } catch (e) {
      console.warn(`Gemini model ${model} failed, trying next:`, e);
    }
  }
  return null;
}

/**
 * Answers questions asked by the user in the AI Advisor chat.
 * Integrates Gemini API when key is configured, with a rich local fallback engine.
 */
export async function getAiAdvisorResponse(userQuery, context) {
  const {
    summary = {},
    categoriesData = [],
    budgets = [],
    debts = [],
    recurring = [],
    investments = [],
    accounts = [],
    geminiApiKey = '',
    isEn = false,
  } = context;

  const q = userQuery.toLowerCase().trim();

  // 1. Strictly separate salary/income from subscriptions/fixed expenses
  const regularIncomes = recurring.filter(
    (r) => (r.isSalary || r.type === 'income') && r.isActive !== false
  );
  const regularExpenses = recurring.filter(
    (r) => !r.isSalary && r.type !== 'income' && r.isActive !== false
  );

  const salaryItem = recurring.find((r) => r.isSalary && r.isActive !== false) || recurring.find((r) => r.isSalary);
  const totalRegularIncome = regularIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalRegularExpense = regularExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const liquidCash = accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const monthlyBurn = (summary.monthlyExpenses || 0) > 0 ? summary.monthlyExpenses : totalRegularExpense;
  const runwayMonths = monthlyBurn > 0 ? (liquidCash / monthlyBurn) : 0;

  let totalBorrowed = 0;
  let totalLent = 0;
  let monthlyInstallmentTotal = 0;
  debts.forEach((d) => {
    const rem = Math.max(0, (d.amount || 0) - (d.paidAmount || 0));
    if (d.type === 'borrowed') {
      totalBorrowed += rem;
      if (d.isInstallment && rem > 0) {
        monthlyInstallmentTotal += Number(d.installmentAmount) || 0;
      }
    }
    if (d.type === 'lent') totalLent += rem;
  });

  // 2. If Gemini API Key is present, attempt generative AI coaching
  if (geminiApiKey) {
    const subsDetails = regularExpenses.map((r) => `${r.title}: ${formatCurrency(r.amount)}`).join(', ');
    const topCats = categoriesData.slice(0, 5).map((c) => `${c.name}: ${formatCurrency(c.total)} (%${c.percentage?.toFixed(0) || 0})`).join(', ');
    const exceededBudgets = budgets.filter((b) => b.spent > b.limit).map((b) => `${b.categoryName || b.categoryId} (Limit: ${formatCurrency(b.limit)}, Harcanan: ${formatCurrency(b.spent)})`).join(', ');

    const systemPrompt = `
Sen "Kişisel Finans" uygulamasının uzman, samimi ve finansal koçluk yapan yapay zeka danışmanısın.
Kullanıcının gerçek finansal verileri:
- Bu Ayki Toplam Gelir: ${formatCurrency(summary.monthlyIncome || 0)}
- Bu Ayki Toplam Harcama: ${formatCurrency(summary.monthlyExpenses || 0)}
- Bu Ayki Net Tasarruf: ${formatCurrency(summary.monthlySavings || 0)} (Tasarruf Oranı: %${(summary.monthlySavingsRate || 0).toFixed(1)})
- Banka & Cüzdan Nakit Varlıklar: ${formatCurrency(liquidCash)} (~${runwayMonths.toFixed(1)} aylık acil durum güvencesi)
- Tanımlı Maaş: ${salaryItem ? `${salaryItem.title} - ${formatCurrency(salaryItem.amount)} (Her ayın ${salaryItem.dayOfMonth || 1}. günü)` : 'Tanımlanmadı'}
- Toplam Düzenli Gelir: ${formatCurrency(totalRegularIncome)}
- GERÇEK ABONELİKLER VE SABİT GİDERLER (Maaş KESİNLİKLE HARİÇTİR, maaş gelirdir): ${subsDetails || 'Yok'} (Aylık Toplam: ${formatCurrency(totalRegularExpense)})
- Kategori Harcamaları: ${topCats || 'Kayıt yok'}
- Aşılmış Bütçeler: ${exceededBudgets || 'Aşılan bütçe yok'}
- Borçlar (Ödenecek): ${formatCurrency(totalBorrowed)} (Aylık taksit yükü: ${formatCurrency(monthlyInstallmentTotal)})
- Alacaklar: ${formatCurrency(totalLent)}
- Yatırım Portföyü: Toplam ${formatCurrency(summary.totalInvestmentCurrentValue || 0)} (Kâr/Zarar: ${formatCurrency(summary.totalInvestmentProfit || 0)})

KULLANICININ SORUSU:
"${userQuery}"

ÇOK ÖNEMLİ KURAL:
Kullanıcının maaşını (${salaryItem ? formatCurrency(salaryItem.amount) : 'mevcut maaş'}) asla abonelik veya gider olarak sayma! Maaş bir düzenli GELİRDİR. Abonelikler yalnızca harcamalardır.

Lütfen kullanıcının sorusuna yukarıdaki gerçek verileri temel alarak doğrudan, net, motive edici ve uygulanabilir tavsiyeler içeren profesyonel bir yanıt ver. Maddeler halinde ve kalın vurgular kullan.
`;

    const geminiReply = await callGeminiApi(systemPrompt, geminiApiKey);
    if (geminiReply) {
      return geminiReply;
    }
  }

  // 3. Smart Local Heuristic Engine (Comprehensive & Zero API dependency)

  // A. "Abonelik / Sabit Giderler / Faturalar" (Strictly excludes salary!)
  if (
    q.includes('abonelik') ||
    q.includes('sabit') ||
    q.includes('subscription') ||
    q.includes('fatura') ||
    q.includes('servis') ||
    q.includes('bill')
  ) {
    if (regularExpenses.length === 0) {
      return isEn
        ? `You have no active subscription or recurring bill expenses recorded.\n\n💡 Note: Your salary (${salaryItem ? formatCurrency(salaryItem.amount) : 'income'}) is tracked as a regular **income** and is not treated as a subscription expense.`
        : `Kayıtlı aktif bir aboneliğiniz veya düzenli sabit gideriniz bulunmuyor.\n\n💡 **Önemli Not:** Tanımlı maaşınız (${salaryItem ? formatCurrency(salaryItem.amount) : 'geliriniz'}) düzenli bir **gelir** olarak sınıflandırılmış olup abonelik/gider sayılmaz.`;
    }

    const itemsList = regularExpenses
      .map((r) => `• **${r.title}**: ${formatCurrency(r.amount)} ${r.dayOfMonth ? `(Her ayın ${r.dayOfMonth}. günü)` : ''}`)
      .join('\n');

    return isEn
      ? `📅 **Active Subscriptions & Fixed Expenses (${regularExpenses.length} items):**\n\n${itemsList}\n\n• **Monthly Total Fixed Cost**: **${formatCurrency(totalRegularExpense)}**\n\n💡 *Note: Your monthly salary (${salaryItem ? formatCurrency(salaryItem.amount) : 'income'}) is an inflow and is strictly excluded from these expenses.*`
      : `📅 **Aylık Aktif Abonelik ve Sabit Giderleriniz (${regularExpenses.length} adet):**\n\n${itemsList}\n\n• **Toplam Aylık Sabit Maliyet**: **${formatCurrency(totalRegularExpense)}**\n\n💡 *Bilgi: Maaşınız (${salaryItem ? formatCurrency(salaryItem.amount) : 'tanımlı maaş'}) bir düzenli **gelirdir** ve bu gider kalemlerine kesinlikle dahil edilmemiştir.*`;
  }

  // B. "Maaş / Düzenli Gelir / Nakit Akışı"
  if (
    q.includes('maaş') ||
    q.includes('gelir') ||
    q.includes('salary') ||
    q.includes('income') ||
    q.includes('nakit akış') ||
    q.includes('cashflow')
  ) {
    const sAmt = salaryItem ? Number(salaryItem.amount) || 0 : 0;
    const netCashflow = totalRegularIncome - totalRegularExpense;

    let response = isEn ? '💼 **Salary & Regular Cash Flow Analysis:**\n\n' : '💼 **Maaş ve Düzenli Nakit Akışı Analiziniz:**\n\n';

    if (salaryItem && sAmt > 0) {
      response += isEn
        ? `• **Defined Salary**: **+${formatCurrency(sAmt)}** ${salaryItem.dayOfMonth ? `(Payment day: ${salaryItem.dayOfMonth})` : ''}\n`
        : `• **Tanımlı Maaş**: **+${formatCurrency(sAmt)}** ${salaryItem.dayOfMonth ? `(Her ayın ${salaryItem.dayOfMonth}. günü)` : ''}\n`;
    } else {
      response += isEn
        ? '• **Salary**: Not configured yet. You can set it with 1-click in the Subscriptions & Salary tab.\n'
        : '• **Maaş**: Henüz tanımlanmadı. Abonelikler & Düzenli İşlemler sekmesinden 1 tıkla maaş gününüzü belirleyebilirsiniz.\n';
    }

    response += isEn
      ? `• **Total Regular Income**: **+${formatCurrency(totalRegularIncome)}**\n` +
        `• **Fixed Bills & Subscriptions**: **-${formatCurrency(totalRegularExpense)}**\n` +
        `• **Net Monthly Regular Flow**: **${formatCurrency(netCashflow, true)}**\n\n`
      : `• **Toplam Düzenli Gelir**: **+${formatCurrency(totalRegularIncome)}**\n` +
        `• **Sabit Faturalar & Abonelikler**: **-${formatCurrency(totalRegularExpense)}**\n` +
        `• **Net Aylık Düzenli Akış**: **${formatCurrency(netCashflow, true)}**\n\n`;

    if (sAmt > 0 && totalRegularExpense > 0) {
      const fixedRatio = ((totalRegularExpense / sAmt) * 100).toFixed(0);
      response += isEn
        ? `💡 Fixed subscriptions take up **%${fixedRatio}** of your salary.`
        : `💡 Sabit abonelik ve giderleriniz maaşınızın **%${fixedRatio}**'ini oluşturuyor.`;
    }

    return response;
  }

  // C. "Harcamalarım / Nereye gitti / Kategori dağılımı"
  if (
    q.includes('nereye') ||
    q.includes('harcama') ||
    q.includes('dağılım') ||
    q.includes('gider') ||
    q.includes('spend') ||
    q.includes('where') ||
    q.includes('expense')
  ) {
    if (categoriesData.length === 0) {
      return isEn
        ? 'No expenses recorded yet for this month. You can quickly add one or scan a receipt!'
        : 'Bu ay henüz kaydedilmiş bir harcamanız bulunmuyor. Fiş çekerek veya hızlı işlem ekleyerek harcamalarınızı takip edebilirsiniz!';
    }
    const topCat = categoriesData[0];
    const top3 = categoriesData
      .slice(0, 3)
      .map((c) => `• **${c.name}**: ${formatCurrency(c.total)} (%${c.percentage?.toFixed(0) || 0})`)
      .join('\n');

    return isEn
      ? `📊 **Monthly Expense Breakdown:**\n\nTotal expenses this month: **${formatCurrency(summary.monthlyExpenses || 0)}**.\n\nTop Spending Categories:\n${top3}\n\nYour highest expense is in **${topCat.name}**.`
      : `📊 **Bu Ayki Harcama Dağılımınız:**\n\nBu ay toplam harcamanız: **${formatCurrency(summary.monthlyExpenses || 0)}**.\n\nEn Yüksek Harcama Kalemleri:\n${top3}\n\nEn çok bütçe ayrılan alan **${topCat.name}** kategorisidir.`;
  }

  // D. "Nasıl tasarruf edebilirim / Birikim tavsiyesi"
  if (
    q.includes('tasarruf') ||
    q.includes('birikim') ||
    q.includes('öneri') ||
    q.includes('tavsiye') ||
    q.includes('save') ||
    q.includes('saving') ||
    q.includes('tip')
  ) {
    const tips = [];
    if (categoriesData.length > 0) {
      const topCat = categoriesData[0];
      const cut15 = topCat.total * 0.15;
      tips.push(
        isEn
          ? `1. **${topCat.name} Optimization**: Trimming this category by 15% would save you **${formatCurrency(cut15)}** every month.`
          : `1. **${topCat.name} Optimizasyonu**: Bu alandaki harcamaları %15 kısarak ayda **${formatCurrency(cut15)}** doğrudan cebinizde tutabilirsiniz.`
      );
    }

    if (regularExpenses.length > 0) {
      tips.push(
        isEn
          ? `2. **Subscription Audit**: You have ${regularExpenses.length} recurring subscriptions (${formatCurrency(totalRegularExpense)}/mo). Canceling unused digital subscriptions frees up instant cash.`
          : `2. **Abonelik Denetimi**: Aylık ${regularExpenses.length} adet abonelik/sabit ödemeniz var (${formatCurrency(totalRegularExpense)}/ay). Düzenli kullanmadıklarınızı iptal etmek net nakit kazandırır.`
      );
    }

    tips.push(
      isEn
        ? '3. **Pay Yourself First**: On payday, immediately transfer at least 20% of your earnings to your Investment Portfolio (Gold, Time Deposit, Stocks) before spending.'
        : '3. **"Önce Kendine Öde" Kuralı**: Maaş yattığı gün, harcamaya başlamadan önce gelirinizin en az %20\'sini doğrudan Yatırımlarınıza (Altın, Vadeli Mevduat, Fon) aktarın.'
    );

    return isEn
      ? `💡 **Personalized Savings Recommendations:**\n\n${tips.join('\n\n')}`
      : `💡 **Verilerinize Özel Tasarruf Önerileri:**\n\n${tips.join('\n\n')}`;
  }

  // E. "Borç / Alacak / Taksitler"
  if (
    q.includes('borç') ||
    q.includes('alacak') ||
    q.includes('taksit') ||
    q.includes('debt') ||
    q.includes('installment') ||
    q.includes('owe')
  ) {
    return isEn
      ? `🤝 **Debt & Installment Status:**\n\n` +
        `• Total Debts to Pay: **${formatCurrency(totalBorrowed)}**\n` +
        (monthlyInstallmentTotal > 0 ? `• Monthly Installment Obligation: **${formatCurrency(monthlyInstallmentTotal)} / mo**\n` : '') +
        `• Receivables to Collect: **${formatCurrency(totalLent)}**\n` +
        `• Net Balance: **${formatCurrency(totalLent - totalBorrowed, true)}**`
      : `🤝 **Borç, Alacak ve Taksit Analiziniz:**\n\n` +
        `• Ödenecek Toplam Borç: **${formatCurrency(totalBorrowed)}**\n` +
        (monthlyInstallmentTotal > 0 ? `• Aylık Taksit Yükünüz: **${formatCurrency(monthlyInstallmentTotal)} / ay**\n` : '') +
        `• Tahsil Edilecek Alacaklar: **${formatCurrency(totalLent)}**\n` +
        `• Net Durum: **${formatCurrency(totalLent - totalBorrowed, true)}**`;
  }

  // F. "50/30/20 Kuralı"
  if (q.includes('50') || q.includes('kural') || q.includes('rule')) {
    const inc = summary.monthlyIncome || totalRegularIncome || 0;
    if (inc <= 0) {
      return isEn
        ? 'The 50/30/20 rule divides your income into:\n• 50% Needs (Rent, Bills, Groceries)\n• 30% Wants (Dining out, Entertainment)\n• 20% Savings & Debt Repayment.\n\nPlease log an income or configure your salary to calculate your exact breakdown!'
        : '50/30/20 Kuralı gelir dağılımı rehberidir:\n• **%50 Zorunlu İhtiyaçlar** (Kira, faturalar, market)\n• **%30 İstekler & Keyif** (Yeme-içme, eğlence, alışveriş)\n• **%20 Tasarruf & Yatırım** (Birikim ve borç kapatma).\n\nNet hesaplama için lütfen maaşınızı veya aylık gelirinizi tanımlayın!';
    }

    const needs = inc * 0.5;
    const wants = inc * 0.3;
    const savings = inc * 0.2;

    return isEn
      ? `📐 **50/30/20 Rule for your Income (${formatCurrency(inc)}):**\n\n` +
        `• **50% Needs (Max)**: **${formatCurrency(needs)}**\n` +
        `• **30% Wants (Max)**: **${formatCurrency(wants)}**\n` +
        `• **20% Savings (Target)**: **${formatCurrency(savings)}**\n\n` +
        `Your actual current savings: **${formatCurrency(summary.monthlySavings || 0, true)}** (%${(summary.monthlySavingsRate || 0).toFixed(1)}).`
      : `📐 **Maaş/Gelirinize (${formatCurrency(inc)}) Göre 50/30/20 Dağılımı:**\n\n` +
        `• **%50 Zorunlu İhtiyaçlar (En Fazla)**: **${formatCurrency(needs)}**\n` +
        `• **%30 İstekler & Sosyal (En Fazla)**: **${formatCurrency(wants)}**\n` +
        `• **%20 Tasarruf & Yatırım (Hedef)**: **${formatCurrency(savings)}**\n\n` +
        `Şu anki aylık fiili tasarrufunuz: **${formatCurrency(summary.monthlySavings || 0, true)}** (%${(summary.monthlySavingsRate || 0).toFixed(1)}).`;
  }

  // G. "Acil Durum Fonu / Runway"
  if (q.includes('acil') || q.includes('fon') || q.includes('emergency') || q.includes('tampon') || q.includes('runway')) {
    return isEn
      ? `🛡️ **Emergency Fund & Runway Status:**\n\n` +
        `• Liquid Cash in Accounts: **${formatCurrency(liquidCash)}**\n` +
        `• Estimated Monthly Burn: **${formatCurrency(monthlyBurn)}**\n` +
        `• Runway: **~${runwayMonths.toFixed(1)} Months**\n\n` +
        (runwayMonths >= 3
          ? '✅ Your emergency fund meets healthy standards (3-6 months).'
          : '⚠️ Your emergency fund is low. Try to set aside enough cash to cover 3 months of living expenses.')
      : `🛡️ **Acil Durum Fonu ve Nakit Güvencesi:**\n\n` +
        `• Kasa & Bankalardaki Likit Nakit: **${formatCurrency(liquidCash)}**\n` +
        `• Tahmini Aylık Harcama / Maliyet: **${formatCurrency(monthlyBurn)}**\n` +
        `• Nakit Dayanma Gücü: **~${runwayMonths.toFixed(1)} Ay**\n\n` +
        (runwayMonths >= 3
          ? '✅ Acil durum fonunuz güvenli standartları (3-6 ay) karşılıyor.'
          : '⚠️ Acil durum birikiminiz düşük seviyede. Beklenmedik durumlar için 3 aylık harcamanızı karşılayacak bir acil durum fonu oluşturmanızı öneririm.');
  }

  // H. "Yatırım / Portföy"
  if (q.includes('yatırım') || q.includes('portföy') || q.includes('altın') || q.includes('hisse') || q.includes('invest')) {
    const val = summary.totalInvestmentCurrentValue || 0;
    const profit = summary.totalInvestmentProfit || 0;
    const pct = summary.totalInvestmentProfitPercent || 0;

    return isEn
      ? `📈 **Investment Portfolio Status:**\n\n` +
        `• Total Portfolio Value: **${formatCurrency(val)}**\n` +
        `• Net Profit / Loss: **${formatCurrency(profit, true)} (${formatPercent(pct)})**\n` +
        (investments.length > 0 ? `• Total Assets: ${investments.length} items (Gold, Stocks, Deposits, Crypto)` : '• No investment assets recorded yet.')
      : `📈 **Yatırım Portföyü Durumunuz:**\n\n` +
        `• Toplam Portföy Değeri: **${formatCurrency(val)}**\n` +
        `• Net Kâr / Zarar: **${formatCurrency(profit, true)} (${formatPercent(pct)})**\n` +
        (investments.length > 0 ? `• Varlık Sayısı: ${investments.length} kalem (Altın, Borsa, Faiz/Mevduat, Kripto)` : '• Henüz portföye yatırım varlığı eklenmedi.');
  }

  // Default Comprehensive Diagnostic
  const health = analyzeFinancialHealth(summary, budgets, debts, recurring, investments, accounts, isEn);
  return isEn
    ? `🎯 **Financial Health Score: ${health.score}/100 (${health.grade})**\n\n` +
      `• Monthly Net Savings: **${formatCurrency(summary.monthlySavings || 0, true)}** (%${(summary.monthlySavingsRate || 0).toFixed(1)})\n` +
      `• Cash Cushion: **~${health.runwayMonths.toFixed(1)} Months**\n` +
      (health.salaryAmount > 0 ? `• Salary: **${formatCurrency(health.salaryAmount)}**\n` : '') +
      (health.totalRegularExpense > 0 ? `• Subscriptions/Bills: **${formatCurrency(health.totalRegularExpense)}**\n` : '') +
      `\n💡 ${health.suggestions[0] || 'Keep recording transactions regularly to optimize your finances!'}`
    : `🎯 **Finansal Sağlık Puanınız: ${health.score}/100 (${health.grade})**\n\n` +
      `• Bu Ayki Net Tasarruf: **${formatCurrency(summary.monthlySavings || 0, true)}** (%${(summary.monthlySavingsRate || 0).toFixed(1)})\n` +
      `• Nakit Güvencesi: **~${health.runwayMonths.toFixed(1)} Ay**\n` +
      (health.salaryAmount > 0 ? `• Maaş: **${formatCurrency(health.salaryAmount)}**\n` : '') +
      (health.totalRegularExpense > 0 ? `• Gerçek Sabit Abonelikler: **${formatCurrency(health.totalRegularExpense)}**\n` : '') +
      `\n💡 **Öneri**: ${health.suggestions[0] || 'Düzenli harcama ve bütçe takibi yaparak finansal hedeflerinize emin adımlarla ilerleyin!'}`;
}
