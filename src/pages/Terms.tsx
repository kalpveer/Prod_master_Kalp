/* eslint-disable */
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Shield, ShieldCheck, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { ADDRESSES } from '../data/addresses';

const ease: any = [0.16, 1, 0.3, 1];

export default function Terms() {
  useEffect(() => {
    // Smooth scroll to top on load
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const sections = [
    { id: 'services', title: '1. Our Services' },
    { id: 'ip', title: '2. Intellectual Property' },
    { id: 'userreps', title: '3. User Representations' },
    { id: 'purchases', title: '4. Purchases & Payments' },
    { id: 'subscriptions', title: '5. Subscriptions' },
    { id: 'prohibited', title: '6. Prohibited Activities' },
    { id: 'ugc', title: '7. User Contributions' },
    { id: 'license', title: '8. Contribution License' },
    { id: 'thirdparty', title: '9. Third-Party Websites' },
    { id: 'management', title: '10. Services Management' },
    { id: 'privacy', title: '11. Privacy Policy' },
    { id: 'termination', title: '12. Term and Termination' },
    { id: 'modifications', title: '13. Modifications' },
    { id: 'governing-law', title: '14. Governing Law' },
    { id: 'disputes', title: '15. Dispute Resolution' },
    { id: 'corrections', title: '16. Corrections' },
    { id: 'disclaimer', title: '17. Disclaimer' },
    { id: 'liability', title: '18. Limitations of Liability' },
    { id: 'indemnity', title: '19. Indemnification' },
    { id: 'userdata', title: '20. User Data' },
    { id: 'electronic', title: '21. Electronic Communications' },
    { id: 'california', title: '22. California Users' },
    { id: 'misc', title: '23. Miscellaneous' },
    { id: 'contact', title: '24. Contact Us' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans pb-32">
      {/* ── Background Grid & Effects ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff04 1px, transparent 1px), linear-gradient(to bottom, #ffffff04 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/20 via-black to-black" />

      <Navbar />

      {/* ── Hero Title Section ── */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="flex flex-col gap-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Legal Agreement</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light tracking-tight text-white leading-none">
            Terms of <span className="font-semibold italic">Service & Policies</span>
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm font-mono text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Last updated: January 05, 2025</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Productica Ai Pvt. Ltd.</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── Main Content Columns ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Left Sticky Navigation Menu */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 hidden lg:flex flex-col gap-6 p-6 bg-zinc-950/40 border border-white/5 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs uppercase tracking-widest border-b border-white/10 pb-3">
              <BookOpen className="w-4 h-4" />
              <span>Contents</span>
            </div>
            <nav className="flex flex-col gap-2.5 max-h-[75vh] overflow-y-auto pb-6 pr-2">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className="text-left text-[13px] text-zinc-500 hover:text-white transition-colors duration-200 truncate py-0.5"
                >
                  {sec.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right Scrollable Legal Content */}
        <main className="lg:col-span-3 prose prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed space-y-16">
          
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white tracking-tight font-mono uppercase pb-3 border-b border-white/10">
              Agreement to Our Legal Terms
            </h2>
            <p>
              We are <strong>Productica Ai Pvt. Ltd.</strong> ("Company", "we", "us", or "our"), a company registered in India with its main office at {ADDRESSES.office.singleLine}, and a branch at {ADDRESSES.branch.singleLine}.
            </p>
            <p>
              We operate the website <a href="http://www.productica.in" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-zinc-300">http://www.productica.in</a> (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
            </p>
            <p>
              We provide reports which include current market scenarios, SWOT analysis, marketing strategies, and customized metrics tailored to the user's products.
            </p>
            <p>
              You can contact us by phone at <a href="tel:+917069133331" className="text-white hover:underline">+917069133331</a>, email at <a href="mailto:info@productica.in" className="text-white hover:underline">info@productica.in</a>, or by mail to {ADDRESSES.office.singleLine} (Office) or {ADDRESSES.branch.singleLine} (Branch).
            </p>
            <p>
              These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and Productica Ai Pvt. Ltd., concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. 
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-semibold text-white text-[13px] leading-relaxed uppercase tracking-wider font-mono">
              IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </div>
            <p className="text-sm text-zinc-500">
              The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.
            </p>
          </section>

          {/* Section 1 */}
          <section id="services" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              1. Our Services
            </h3>
            <p>
              The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. 
            </p>
            <p>
              Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
            </p>
          </section>

          {/* Section 2 */}
          <section id="ip" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              2. Intellectual Property Rights
            </h3>
            <h4 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">Our Intellectual Property</h4>
            <p>
              We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
            </p>
            <p>
              Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and treaties) in India and around the world. The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
            </p>

            <h4 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">Your Use of Our Services</h4>
            <p>
              Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services, and download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.
            </p>
            <p>
              No part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.
            </p>
          </section>

          {/* Section 3 */}
          <section id="userreps" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              3. User Representations
            </h3>
            <p>
              By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation.
            </p>
          </section>

          {/* Section 4 */}
          <section id="purchases" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              4. Purchases and Payment
            </h3>
            <p>
              We accept standard billing forms. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. You further agree to promptly update account and payment information, including email address, payment method, and card details, so that we can complete your transactions.
            </p>
            <p>
              Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in <strong>INR (₹)</strong>. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.
            </p>
          </section>

          {/* Section 5 */}
          <section id="subscriptions" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              5. Subscriptions
            </h3>
            <h4 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">Billing and Renewal</h4>
            <p>
              Your subscription will continue and automatically renew unless cancelled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge, until such time as you cancel the applicable order. The length of your billing cycle is monthly.
            </p>
            <h4 className="text-sm font-semibold text-zinc-300 font-mono uppercase tracking-wider">Free Trial & Cancellation</h4>
            <p>
              We offer a 30-day free trial to new users who register with the Services. Your account will not be charged and the subscription will remain active until upgraded or terminated. You can cancel your subscription at any time by contacting us at <a href="mailto:info@productica.in" className="text-white underline">info@productica.in</a>.
            </p>
          </section>

          {/* Section 6 */}
          <section id="prohibited" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              6. Prohibited Activities
            </h3>
            <p>
              You may not access or use the Services for any purpose other than that for which we make the Services available. As a user of the Services, you agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-4">
              <li>Systematically retrieve data or other content from the Services to compile a database or directory without written permission.</li>
              <li>Trick, defraud, or mislead us and other users, especially to learn sensitive details or account keys.</li>
              <li>Circumvent, disable, or interfere with security-related features of the Services.</li>
              <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
              <li>Engage in unauthorized framing of or linking to the Services.</li>
              <li>Upload viruses, Trojan horses, or other malicious code.</li>
              <li>Reverse engineer, decompile, or disassemble any of the software comprising the Services.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="ugc" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              7. User Generated Contributions
            </h3>
            <p>
              The Services do not typically invite users to post content. However, in the event that you share suggestions, comments, or materials (collectively, "Contributions"), you represent and warrant that your Contributions do not infringe any proprietary rights of third parties, are not misleading, and do not violate applicable regulations.
            </p>
          </section>

          {/* Section 8 */}
          <section id="license" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              8. Contribution License
            </h3>
            <p>
              You and the Services agree that we may access, store, process, and use any information and personal data that you provide following the terms of the Privacy Policy. By submitting suggestions or feedback, you agree that we can use and share such feedback for any purpose without compensation to you.
            </p>
          </section>

          {/* Section 9 */}
          <section id="thirdparty" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              9. Third-Party Websites & Content
            </h3>
            <p>
              Our Site may contain links to third-party portals or integrations. We are not responsible for any actions, cookies, data policies, or content on these external channels. Accessing external websites is completely at your own risk.
            </p>
          </section>

          {/* Section 10 */}
          <section id="management" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              10. Services Management
            </h3>
            <p>
              We reserve the right, but not the obligation, to monitor the Services for violations, take legal action against infringers, or manage the platform in a way designed to protect our property rights and support smooth operations.
            </p>
          </section>

          {/* Section 11 */}
          <section id="privacy" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              11. Privacy Policy
            </h3>
            <p>
              We care about data privacy and security. By using our Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms. Please be advised that the Services are hosted in India. 
            </p>
            <p>
              If you access the Services from other regions with laws governing personal data collection and use that differ from laws in India, your continued use means you are transferring your data to India and consent to processing therein.
            </p>
          </section>

          {/* Section 12 */}
          <section id="termination" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              12. Term and Termination
            </h3>
            <p>
              These Legal Terms shall remain in full force while you use our platform. We reserve the right to deny access to the Services to anyone for any reason, including for breach of representation or covenant, at our sole discretion without notice or liability.
            </p>
          </section>

          {/* Section 13 */}
          <section id="modifications" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              13. Modifications & Interruptions
            </h3>
            <p>
              We reserve the right to change, modify, or remove the contents of the Services at any time without notice. We are not liable to you or any third party for price changes, downtime, or service suspensions.
            </p>
          </section>

          {/* Section 14 */}
          <section id="governing-law" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              14. Governing Law
            </h3>
            <p>
              These Legal Terms shall be governed by and defined following the laws of <strong>India</strong>. Productica Ai Pvt. Ltd. and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any legal disputes.
            </p>
          </section>

          {/* Section 15 */}
          <section id="disputes" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              15. Dispute Resolution
            </h3>
            <p>
              Any legal action or dispute arising out of or in connection with these Legal Terms shall be submitted exclusively to the jurisdiction of the Indian courts. Productica Ai Pvt. Ltd. maintains the right to bring proceedings in your country of residence if needed.
            </p>
          </section>

          {/* Section 16 */}
          <section id="corrections" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              16. Corrections
            </h3>
            <p>
              There may be information on the platform containing typo errors, inaccuracies, or incomplete descriptions. We reserve the right to fix these corrections at any time without prior notice.
            </p>
          </section>

          {/* Section 17 */}
          <section id="disclaimer" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              17. Disclaimer
            </h3>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-[12px] leading-relaxed text-zinc-400 uppercase">
              THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </div>
          </section>

          {/* Section 18 */}
          <section id="liability" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              18. Limitations of Liability
            </h3>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-[12px] leading-relaxed text-zinc-400 uppercase">
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, ARISING FROM YOUR USE OF THE SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </div>
          </section>

          {/* Section 19 */}
          <section id="indemnity" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              19. Indemnification
            </h3>
            <p>
              You agree to defend, indemnify, and hold us harmless (including our subsidiaries, officers, partners, and employees) from and against any losses, damage, claims, or demands, including reasonable attorney fees, arising out of your use of the Services or breach of these Legal Terms.
            </p>
          </section>

          {/* Section 20 */}
          <section id="userdata" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              20. User Data
            </h3>
            <p>
              We maintain data you transmit to the Services to manage performance. Although we run routine backups, you are solely responsible for all data relating to your activity. You agree that we have no liability for data loss.
            </p>
          </section>

          {/* Section 21 */}
          <section id="electronic" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              21. Electronic Communications & Signatures
            </h3>
            <p>
              Visiting the Services, sending emails, and completing online forms constitute electronic communications. You consent to receive electronic communication and agree that all notices and disclosures satisfy legal requirements that such communication be in writing. 
            </p>
            <p>
              You agree to the use of electronic signatures, contracts, and electronic delivery of transactions initiated or completed via the Services.
            </p>
          </section>

          {/* Section 22 */}
          <section id="california" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              22. California Users
            </h3>
            <p>
              If any complaint with us is not satisfactorily resolved, you can contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs in writing at 1625 North Market Blvd., Suite N 112, Sacramento, California 95834 or by telephone at (800) 952-5210.
            </p>
          </section>

          {/* Section 23 */}
          <section id="misc" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              23. Miscellaneous
            </h3>
            <p>
              These Legal Terms constitute the entire agreement between you and us. Our failure to enforce any right or provision shall not operate as a waiver. If any provision is determined unlawful or void, that provision is severable and does not affect the validity of remaining covenants. No joint venture or partnership is created by these terms.
            </p>
          </section>

          {/* Section 24 */}
          <section id="contact" className="space-y-4 scroll-mt-28">
            <h3 className="text-lg font-semibold text-white tracking-tight font-mono">
              24. Contact Us
            </h3>
            <p>
              To resolve complaints or for any inquiries regarding the legal operations of our platform, please reach out to us at:
            </p>
            <div className="p-6 bg-zinc-950/60 border border-white/5 rounded-2xl flex flex-col gap-4 font-mono text-[13px] text-zinc-300">
              <span className="font-semibold text-white text-sm">Productica Ai Pvt. Ltd.</span>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Office · {ADDRESSES.office.city}</span>
                {ADDRESSES.office.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Branch · {ADDRESSES.branch.city}</span>
                {ADDRESSES.branch.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              <span className="mt-2">Phone: +917069133331</span>
              <span>Email: <a href="mailto:info@productica.in" className="text-white hover:underline">info@productica.in</a></span>
            </div>
          </section>

        </main>
      </div>

      {/* Floating CTA Back to Top */}
      <div className="fixed bottom-12 right-6 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center justify-center w-12 h-12 bg-white text-black hover:bg-neutral-200 transition-all rounded-full shadow-2xl hover:scale-105 active:scale-95"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
