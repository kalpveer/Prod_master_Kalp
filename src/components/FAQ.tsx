/* eslint-disable */
import { motion } from 'framer-motion';

const faqs = [
  {
    question: "How does Productica's Venture Intelligence Infrastructure work?",
    answer: "Our engine processes dynamic data points across venture-readiness frameworks, competitor activities, and market shifts to analyze startup opportunities, execution gaps, and GTM viability in real time."
  },
  {
    question: "Is this Venture Analysis specialized for the Indian market?",
    answer: "Yes, Productica is specifically trained on Indian consumer behavior, regional market cycles, and local competitive intelligence to provide founders with localized, actionable insights."
  },
  {
    question: "Can I use Venture Intelligence to validate my startup idea before building?",
    answer: "Absolutely. Productica is designed for the pre-build phase, helping you identify if your business idea is worth the build or if you should pivot based on real-time market signals."
  },
  {
    question: "How does Productica compare to traditional competitive intelligence tools?",
    answer: "While traditional tools provide static reports, Productica offers agentic, real-time mapping of the ecosystem, updating as soon as new market signals or competitor moves are detected."
  }
];

export default function FAQ() {
  return (
    <section className="py-32 bg-white text-black px-6 md:px-12" id="faq">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-16 text-center">
          Venture Intelligence <span className="text-zinc-400">FAQ</span>
        </h2>
        
        <div className="space-y-12">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border-b border-zinc-100 pb-12"
            >
              <h3 className="text-xl md:text-2xl font-medium mb-4 tracking-tight">
                {faq.question}
              </h3>
              <p className="text-lg text-zinc-500 leading-relaxed font-normal">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
