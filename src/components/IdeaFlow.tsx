/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ValidationReport from './ValidationReport';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import fpPromise from '@fingerprintjs/fingerprintjs';

export default function IdeaFlow() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', idea: '' });
  const [focused, setFocused] = useState({ name: false, email: false, idea: false });
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isFloating = (key: keyof typeof focused) => focused[key] || form[key as keyof typeof form].length > 0;
  
  const sectionRef = useRef<HTMLElement>(null);

  // Use a ResizeObserver rather than setTimeout so that we catch all height
  // changes precisely as framer-motion animates the new step into view.
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const observer = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    
    observer.observe(sectionRef.current);
    
    return () => observer.disconnect();
  }, []);

  const handleChange = (key: keyof typeof form, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const handleFocus = (key: keyof typeof focused) => setFocused(prev => ({ ...prev, [key]: true }));
  const handleBlur = (key: keyof typeof focused) => setFocused(prev => ({ ...prev, [key]: false }));

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email) {
      setStep(2);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idea) return;
    
    setValidating(true);
    setValidationError(null);

    const STACK_AI_TOKEN = "24aca533-c147-4a96-a309-b59bf6bb9c77";

    const stackAiPayload = { "user_id": form.email || "demo", "in-0": form.idea };

    try {
      // 1. Generate Browser Fingerprint
      let deviceId = "default-dev";
      try {
        const fp = await fpPromise.load();
        const resultFp = await fp.get();
        deviceId = resultFp.visitorId;
      } catch (e) { console.error("FP failed", e); }

      // Fire Discord notification (fire-and-forget) directly
      fetch(import.meta.env.VITE_DISCORD_WEBHOOK_URL ?? "", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**New Free Validation Submission!**\n**Name:** ${form.name || 'N/A'}\n**Email:** ${form.email || 'N/A'}\n**Device ID:** \`${deviceId}\`\n**Idea:**\n${form.idea}`
        })
      }).catch(() => {});

      // Direct call to Stack AI (Bypassing Vercel's 10s timeout)
      const response = await fetch(
        "https://api.stackai.com/inference/v0/run/82daafa8-4b94-431b-989d-d482e0c29e95/69d556e109f5613fdf74a15b",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${STACK_AI_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stackAiPayload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
      }

      const result = await response.json();
      
      const output = result?.outputs?.['out-0'] ?? result?.['out-0'] ?? JSON.stringify(result, null, 2);
      setValidationResult(output);
      setStep(3);
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || "Validation failed. Please try again later.");
    } finally {
      setValidating(false);
    }
  };

  return (
    <section 
      id="free-validation"
      ref={sectionRef}
      className={`relative z-[30] w-full bg-stone-50 flex flex-col items-center px-6 transition-all duration-500 ${
        step === 3 ? 'py-16' : 'min-h-screen justify-center py-20'
      }`}
    >
      
      {/* Background aesthetics */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />
      
      <div className={`relative z-10 w-full mx-auto flex flex-col items-center transition-all duration-500 ${
        step === 3 ? 'max-w-[1400px]' : 'max-w-3xl'
      }`}>
        
        {/* Header — hidden on step 3 to give report full space */}
        {step !== 3 && (
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tighter text-black font-semibold">
            Evaluate your <span className="text-black/30 italic">Idea</span>
          </h2>
          <p className="mt-4 text-sm font-mono uppercase tracking-[0.2em] text-black/40">
            Free market validation module
          </p>
        </div>
        )}

        {/* Form Container */}
        <div className={`w-full flex flex-col relative ${
          step === 3 ? '' : 'bg-white border border-black/5 shadow-2xl shadow-black/[0.03] rounded-3xl p-8 md:p-12 min-h-[420px] overflow-hidden'
        }`}>
          
          {/* Step Progress — hidden on step 3 */}
          {step !== 3 && (
          <div className="flex items-center gap-2 mb-10">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ease-out ${step >= 1 ? 'bg-black' : 'bg-black/10'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ease-out ${step >= 2 ? 'bg-black' : 'bg-black/10'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ease-out ${step >= 3 ? 'bg-black' : 'bg-black/10'}`} />
          </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onSubmit={nextStep}
                className="flex flex-col flex-grow justify-center"
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-medium tracking-tight mb-2 text-black">Who is building?</h3>
                  <p className="text-black/60 text-sm font-normal">Let's start with your details.</p>
                </div>

                <div className="flex flex-col gap-8">
                  {/* Name Input */}
                  <div className="relative">
                    <label 
                      className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                        isFloating('name') ? 'text-black/40 -top-5 text-[10px]' : 'text-black/30 top-3'
                      }`}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                      required
                      className="w-full bg-transparent border-0 border-b border-black/10 pb-3 pt-3 text-black text-base font-normal outline-none focus:border-black/40 transition-colors duration-300 placeholder-transparent"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="relative mt-2">
                    <label 
                      className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                        isFloating('email') ? 'text-black/40 -top-5 text-[10px]' : 'text-black/30 top-3'
                      }`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                      required
                      className="w-full bg-transparent border-0 border-b border-black/10 pb-3 pt-3 text-black text-base font-normal outline-none focus:border-black/40 transition-colors duration-300 placeholder-transparent"
                    />
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button 
                    type="submit" 
                    className="flex items-center gap-2 group px-8 py-3.5 bg-black text-white rounded-full text-sm font-medium hover:bg-black/80 active:scale-[0.98] transition-all"
                  >
                    Continue
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onSubmit={handleValidate}
                className="flex flex-col flex-grow justify-center"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-medium tracking-tight mb-2 text-black">What's the vision?</h3>
                  <p className="text-black/60 text-sm font-normal leading-relaxed">
                    Describe your product, the exact problem it solves, and your target audience. Be as detailed as possible.
                  </p>
                </div>

                <div className="relative flex-grow flex flex-col">
                  <label 
                    className={`absolute left-0 font-mono text-xs uppercase tracking-widest transition-all duration-300 pointer-events-none ${
                      isFloating('idea') ? 'text-black/40 -top-5 text-[10px]' : 'text-black/30 top-3'
                    }`}
                  >
                    Your Business Idea
                  </label>
                  <textarea
                    value={form.idea}
                    onChange={e => handleChange('idea', e.target.value)}
                    onFocus={() => handleFocus('idea')}
                    onBlur={() => handleBlur('idea')}
                    required
                    className="w-full flex-grow min-h-[140px] bg-transparent border-0 border-b border-black/10 pb-3 pt-3 text-black text-base font-normal outline-none focus:border-black/40 transition-colors duration-300 placeholder-transparent resize-none leading-relaxed"
                  />
                </div>

                {validationError && (
                  <p className="mt-4 text-xs text-red-500 font-medium text-center">{validationError}</p>
                )}

                <div className="mt-10 flex items-center justify-between">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-xs font-mono uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={validating}
                    className={`flex items-center gap-2 group px-8 py-4 rounded-full text-sm font-medium transition-all ${
                      validating 
                        ? 'bg-black/5 text-black/30 cursor-not-allowed' 
                        : 'bg-black text-white hover:bg-black/80 active:scale-[0.98]'
                    }`}
                  >
                    {validating ? (
                      <span className="flex items-center gap-2">
                        Validating
                        <span className="flex gap-1">
                          <span className="w-1 h-1 rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 rounded-full bg-black/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </span>
                    ) : (
                      <>
                        Validate My Idea
                        <Sparkles size={16} className="text-white/80 group-hover:text-white transition-colors" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && validationResult && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full"
              >
                <ValidationReport
                  raw={validationResult}
                  ideaName={form.idea}
                  onReset={() => {
                    setStep(1);
                    setForm({ name: '', email: '', idea: '' });
                    setValidationResult(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      {/* Custom Scrollbar Styles for the report card */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}} />
    </section>
  );
}
