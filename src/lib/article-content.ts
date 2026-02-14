// ==========================================
// EEAT-COMPLIANT ARTICLE CONTENT
// Location-specific, jurisdiction-aware legal guides
// Following Google's Helpful Content & EEAT guidelines for YMYL pages
// ==========================================

export interface ArticleSection {
  heading: string;
  content: string;  // HTML allowed
  type?: 'guide' | 'jurisdiction' | 'process' | 'cost' | 'tip';
}

export interface ArticleContent {
  // SEO
  metaTitle: string;
  metaDescription: string;

  // Article
  introHtml: string;
  sections: ArticleSection[];
  jurisdictionNote: string;

  // Enhanced FAQ (beyond the auto-generated ones)
  additionalFaqs: { question: string; answer: string }[];

  // EEAT signals
  lastReviewed: string;       // e.g. "February 2026"
  reviewedBy: string;         // e.g. "LawyerHours Editorial Team"
  sourcesHtml: string;        // cited sources
}

// ==========================================
// FAMILY LAW — SAN DIEGO, CA
// ==========================================
const familyLawSanDiego: ArticleContent = {
  metaTitle: 'Family Law Attorneys in San Diego, CA — Evening & Weekend Hours (2026)',
  metaDescription: 'Find San Diego family law attorneys offering evening and weekend consultations. Compare custody, divorce, and child support lawyers with after-hours availability. Updated February 2026.',

  introHtml: `
    <p>If you're navigating a custody dispute, filing for divorce, or seeking a child support modification in San Diego, timing matters. Court deadlines in San Diego County Superior Court don't pause for your work schedule, and temporary restraining orders in domestic situations require urgent legal guidance.</p>
    <p>We compiled this directory of <strong>family law attorneys in San Diego who offer evening and weekend consultation hours</strong> — verified through Google Places data — so you can speak with a qualified attorney outside of traditional 9-to-5 business hours. Below, you'll also find a practical overview of how family law works in San Diego County, including court locations, filing costs, and key California statutes that may affect your case.</p>
  `,

  sections: [
    {
      heading: 'How Family Law Works in San Diego County',
      type: 'jurisdiction',
      content: `
        <p>San Diego County family law cases are handled by the <strong>San Diego Superior Court — Family Division</strong>. There are two primary courthouse locations for family law filings:</p>
        <ul>
          <li><strong>Central Division</strong> — 1100 Union Street, San Diego, CA 92101 (downtown San Diego)</li>
          <li><strong>North County Division</strong> — 325 S. Melrose Drive, Vista, CA 92081 (for Carlsbad, Encinitas, Escondido, Oceanside, and surrounding areas)</li>
        </ul>
        <p>Which courthouse you file in depends on where you and your spouse reside. If both parties live in San Diego County, most cases are filed at the Central Division. If either party lives in North County, you may file at the Vista courthouse.</p>
        <p>San Diego Superior Court accepts <strong>e-filing</strong> for family law cases, which is especially useful if you're working with an attorney during evening hours and need to file documents without visiting the courthouse in person. Local Rules Division V (effective January 1, 2026) govern family law procedures.</p>
      `,
    },
    {
      heading: 'What a Family Law Attorney in San Diego Handles',
      type: 'guide',
      content: `
        <p>Family law in California covers a broad range of legal matters that affect family relationships. A San Diego family law attorney can help with:</p>
        <ul>
          <li><strong>Divorce (Dissolution of Marriage)</strong> — California is a no-fault divorce state under <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=2310.&lawCode=FAM" class="text-blue-600 hover:underline" rel="nofollow noopener" target="_blank">Family Code §2310</a>. You only need to cite "irreconcilable differences." California mandates a <strong>6-month waiting period</strong> from the date the respondent is served before the divorce can be finalized.</li>
          <li><strong>Child Custody & Visitation</strong> — California Family Code §3080 creates a presumption favoring joint custody when both parents agree. Courts decide custody based on the <strong>"best interest of the child"</strong> standard (FC §3011), considering factors like health, safety, and each parent's relationship with the child. Starting in 2025, California courts adopted stronger guidelines favoring equal or significantly shared parenting time.</li>
          <li><strong>Child Support</strong> — Calculated using California's statewide guideline formula, which factors in each parent's income, time spent with the child, tax filing status, and allowable deductions. San Diego County uses the <strong>DissoMaster</strong> software for calculations.</li>
          <li><strong>Spousal Support (Alimony)</strong> — Temporary spousal support during proceedings is typically calculated by formula. Long-term support is determined by factors in Family Code §4320.</li>
          <li><strong>Property Division</strong> — California is a <strong>community property state</strong>. Family Code §2550 requires equal division of all assets and debts acquired during the marriage. Property acquired before marriage, after separation, or by gift/inheritance is generally separate property.</li>
          <li><strong>Domestic Violence Restraining Orders (DVRO)</strong> — Emergency protective orders can be issued by law enforcement 24/7, but a temporary restraining order (TRO) requires a court filing. An attorney available in the evening can help you prepare this paperwork urgently.</li>
          <li><strong>Adoption & Guardianship</strong> — Includes stepparent adoption, independent adoption, and legal guardianship of minors.</li>
          <li><strong>Paternity</strong> — Establishing legal parentage under the Uniform Parentage Act (Family Code §7600+).</li>
        </ul>
      `,
    },
    {
      heading: 'San Diego Family Law Filing Fees & Costs',
      type: 'cost',
      content: `
        <p>Understanding the costs involved helps you plan before meeting with an attorney. As of 2025–2026, San Diego County filing fees include:</p>
        <table class="w-full text-sm border-collapse my-4">
          <thead>
            <tr class="bg-gray-100">
              <th class="text-left p-3 border border-gray-200 font-semibold">Filing Type</th>
              <th class="text-left p-3 border border-gray-200 font-semibold">Approximate Fee</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="p-3 border border-gray-200">Petition for Dissolution (Divorce)</td><td class="p-3 border border-gray-200">$435</td></tr>
            <tr><td class="p-3 border border-gray-200">Response to Petition</td><td class="p-3 border border-gray-200">$435</td></tr>
            <tr><td class="p-3 border border-gray-200">Request for Order (custody/support modification)</td><td class="p-3 border border-gray-200">$60</td></tr>
            <tr><td class="p-3 border border-gray-200">Domestic Violence Restraining Order</td><td class="p-3 border border-gray-200">No fee</td></tr>
            <tr><td class="p-3 border border-gray-200">Family Court Services Mediation</td><td class="p-3 border border-gray-200">No fee (mandatory in custody disputes)</td></tr>
          </tbody>
        </table>
        <p><strong>Fee waivers</strong> are available for individuals who receive public benefits (CalWORKs, Medi-Cal, SSI, food stamps) or whose household income is below 125% of the federal poverty level. Submit Form <em>FW-001</em> with your filing.</p>
        <p>Attorney fees in San Diego typically range from <strong>$254 to $500+ per hour</strong> for family law, depending on the attorney's experience and case complexity. Many attorneys offer free initial consultations, especially those with evening availability.</p>
      `,
    },
    {
      heading: 'Why Evening and Weekend Hours Matter for Family Law',
      type: 'tip',
      content: `
        <p>Family law situations frequently arise outside business hours. A spouse may announce they want a divorce in the evening, a custody exchange could go wrong on a Saturday, or you may discover hidden assets while reviewing joint accounts at home after work.</p>
        <p>Attorneys who offer evening and weekend consultations understand that:</p>
        <ul>
          <li>Many clients work full-time and <strong>cannot take time off</strong> for weekday appointments without raising suspicion or losing wages</li>
          <li><strong>Domestic violence situations</strong> escalate unpredictably — emergency restraining order preparation shouldn't wait until Monday</li>
          <li>California's 6-month waiting period means <strong>every day of delay</strong> in filing pushes your final divorce date further out</li>
          <li><strong>Temporary custody and support orders</strong> can be sought early in the case, but require prompt legal action</li>
        </ul>
        <p>The attorneys listed below were verified through Google Places as having hours that extend beyond the standard workday — including evening, weekend, and in some cases 24/7 availability.</p>
      `,
    },
    {
      heading: 'San Diego Family Court Services (FCS) Mediation',
      type: 'process',
      content: `
        <p>In San Diego County, <strong>mediation through Family Court Services (FCS) is mandatory</strong> before a judge will hear any contested custody or visitation dispute. This is a free service provided by the court.</p>
        <p>What to know about FCS mediation in San Diego:</p>
        <ul>
          <li>San Diego uses a <strong>"recommending" model</strong> — the mediator can make a recommendation to the judge if parents cannot agree</li>
          <li>Sessions typically last <strong>1 to 2 hours</strong></li>
          <li>You can bring your attorney to the mediation session</li>
          <li>If domestic violence is alleged, you can request <strong>separate mediation</strong> (shuttle mediation) so both parties are not in the same room</li>
          <li>The mediator's recommendation carries significant weight with judges — preparation with your attorney beforehand is critical</li>
        </ul>
        <p>An evening or weekend consultation with a family law attorney can help you <strong>prepare for mediation</strong> without missing work — often one of the most impactful steps in a custody case.</p>
      `,
    },
    {
      heading: 'Choosing the Right Family Law Attorney in San Diego',
      type: 'tip',
      content: `
        <p>When comparing attorneys in the directory below, consider these factors:</p>
        <ul>
          <li><strong>Board Certification</strong> — California certifies family law specialists through the State Bar. A Certified Family Law Specialist (CFLS) has passed additional exams and demonstrated substantial experience in family law cases.</li>
          <li><strong>Availability</strong> — Check whether the attorney offers evening or weekend hours for your initial consultation, ongoing meetings, or both.</li>
          <li><strong>Location</strong> — San Diego is geographically large. An attorney near your courthouse (Central or North County) can simplify logistics.</li>
          <li><strong>Approach</strong> — Some attorneys focus on collaborative divorce and mediation, while others are experienced litigators for high-conflict cases. Your situation determines which approach fits best.</li>
          <li><strong>Fee Structure</strong> — Ask whether the attorney charges a flat fee for specific services (e.g., uncontested divorce) or bills hourly. Retainer amounts in San Diego typically range from $2,500 to $10,000+.</li>
          <li><strong>Reviews & Track Record</strong> — Google Maps reviews (shown in the listings below) provide insight into client experiences. Look for specifics about responsiveness, clarity, and outcomes.</li>
        </ul>
      `,
    },
  ],

  jurisdictionNote: 'This information applies to family law cases in San Diego County, California, governed by the California Family Code and San Diego Superior Court Local Rules (Division V, effective January 1, 2026). Laws and procedures may differ in other California counties or states.',

  additionalFaqs: [
    {
      question: 'How long does a divorce take in San Diego?',
      answer: 'California requires a minimum 6-month waiting period from the date the respondent is served. An uncontested divorce in San Diego can be finalized shortly after the 6-month mark. Contested divorces with custody or property disputes can take 1–3 years depending on complexity.',
    },
    {
      question: 'How is child custody decided in San Diego?',
      answer: 'San Diego family courts use the "best interest of the child" standard under California Family Code §3011. Factors include each parent\'s relationship with the child, the child\'s health and safety, any history of abuse, and the child\'s preference (if old enough). Mediation through Family Court Services is mandatory before a judge rules on contested custody.',
    },
    {
      question: 'How much does a family law attorney cost in San Diego?',
      answer: 'Hourly rates for family law attorneys in San Diego typically range from $254 to $500+, depending on experience and case type. Initial retainers often range from $2,500 to $10,000. Many attorneys with evening hours offer free initial consultations. Fee waivers are available for court filing fees if you qualify based on income.',
    },
    {
      question: 'Can I file for divorce in San Diego if I just moved here?',
      answer: 'To file for divorce in California, at least one spouse must have been a California resident for 6 months and a resident of San Diego County for 3 months. If you don\'t meet the residency requirement yet, you can file for legal separation immediately, which can later be converted to a dissolution.',
    },
    {
      question: 'What is community property and how does it apply in San Diego?',
      answer: 'California is a community property state. Under Family Code §2550, all assets and debts acquired during the marriage are presumed community property and must be divided equally in a divorce. Property acquired before marriage, after separation, or by gift/inheritance is generally separate property. This includes real estate, retirement accounts, business interests, and debts.',
    },
    {
      question: 'Do San Diego family law attorneys offer free consultations?',
      answer: 'Many family law attorneys in San Diego offer free initial consultations, typically lasting 15–30 minutes. This is especially common among attorneys with evening and weekend hours, as they cater to working professionals who want to evaluate their options before committing. Check each listing below for contact details.',
    },
    {
      question: 'What should I bring to my first family law consultation?',
      answer: 'Bring recent tax returns, pay stubs, a list of assets and debts, any existing court orders, relevant communication (texts, emails), and a timeline of key events. If children are involved, bring information about their school, medical providers, and current custody arrangements. Having this documentation ready makes your evening or weekend consultation much more productive.',
    },
  ],

  lastReviewed: 'February 2026',
  reviewedBy: 'LawyerHours Editorial Team',
  sourcesHtml: `
    <ul class="text-sm text-gray-500 space-y-1">
      <li><a href="https://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=FAM" class="text-blue-500 hover:underline" rel="nofollow noopener" target="_blank">California Family Code</a> — California Legislative Information</li>
      <li><a href="https://www.sdcourt.ca.gov/sdcourt/family2" class="text-blue-500 hover:underline" rel="nofollow noopener" target="_blank">San Diego Superior Court — Family Division</a></li>
      <li><a href="https://www.sdcourt.ca.gov/sites/default/files/sdcourt/generalinformation/localrulesofcourt/division_v_-_family_law__2026.pdf" class="text-blue-500 hover:underline" rel="nofollow noopener" target="_blank">San Diego Local Rules Division V — Family Law (2026)</a></li>
      <li><a href="https://selfhelp.courts.ca.gov/child-support" class="text-blue-500 hover:underline" rel="nofollow noopener" target="_blank">California Courts Self Help — Child Support</a></li>
      <li><a href="https://www.sdcourt.ca.gov/sdcourt/generalinformation/fees" class="text-blue-500 hover:underline" rel="nofollow noopener" target="_blank">San Diego Superior Court — Fee Schedule</a></li>
    </ul>
  `,
};

// ==========================================
// CONTENT REGISTRY
// Key format: "{practiceAreaSlug}-{citySlug}" for city-specific content
// Key format: "{practiceAreaSlug}" for generic fallback per practice area
// ==========================================
const articleRegistry: Record<string, ArticleContent> = {
  'family-law-san-diego-ca': familyLawSanDiego,
};

/**
 * Get article content for a specific practice area + city combination.
 * Returns city-specific content if available, otherwise null.
 */
export function getArticleContent(paSlug: string, citySlug: string): ArticleContent | null {
  const specificKey = `${paSlug}-${citySlug}`;
  return articleRegistry[specificKey] || null;
}
