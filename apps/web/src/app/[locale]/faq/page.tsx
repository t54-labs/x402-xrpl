import type { Metadata } from "next";
import Link from "@/app/components/LocaleLink";
import { FAQ_CATEGORIES, faqPlainAnswer } from "./faq-data";
import { FAQ_CATEGORIES_KO } from "./faq-data.ko";
import { FaqList } from "./FaqList";
import { CHROME } from "@/app/lib/chrome-i18n";
import { isLocale, type Locale } from "@/app/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

async function resolveLocale({ params }: Props): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : "en";
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const locale = await resolveLocale(props);
  const t = CHROME[locale].faq;
  return {
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: {
      canonical: locale === "en" ? "/faq" : `/${locale}/faq`,
      languages: { en: "/faq", ko: "/ko/faq" },
    },
  };
}

export default async function FaqPage(props: Props) {
  const locale = await resolveLocale(props);
  const t = CHROME[locale].faq;
  const categories = locale === "ko" ? FAQ_CATEGORIES_KO : FAQ_CATEGORIES;
  const totalQuestions = categories.reduce((n, c) => n + c.items.length, 0);
  const [h1a, h1b] = t.h1.split("\n");
  const [introBefore, introAfter] = t.intro.split("{buildGuide}");

  // FAQPage structured data so answers surface in search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((c) =>
      c.items.map((item) => ({
        "@type": "Question",
        name: item.q.replace(/`/g, ""),
        acceptedAnswer: { "@type": "Answer", text: faqPlainAnswer(item) },
      })),
    ),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="animate-fade-up max-w-3xl">
        <span className="text-[10px] font-plek uppercase tracking-[0.28em] text-[var(--paper-mute)]">
          {t.kicker} · {totalQuestions} {t.questionsLabel}
        </span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-medium tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">
          {h1a}
          {h1b ? (
            <>
              <br />
              {h1b}
            </>
          ) : null}
        </h1>
        <p className="mt-5 text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {introBefore}
          <Link href="/build" className="text-[var(--brand-blue)] hover:underline">
            {t.buildGuide}
          </Link>
          {introAfter}
        </p>
      </header>

      <div className="mt-12 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <FaqList categories={categories} labels={t} />
      </div>
    </div>
  );
}
