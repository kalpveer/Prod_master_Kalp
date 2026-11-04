/* eslint-disable */
import { ADDRESS_LIST } from '../data/addresses';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/10 py-12 px-6">
      <div className="container mx-auto max-w-7xl flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-2">
            <img
              src="/8.png"
              alt="Productica"
              className="w-6 h-6 rounded-md object-cover"
            />
            <span className="text-white font-semibold tracking-tight text-sm">Productica</span>
          </div>

          <div className="flex flex-wrap justify-start md:justify-center gap-6 md:gap-12 text-xs uppercase tracking-widest font-mono text-white/40">
            <a href="https://x.com/Productica_in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            <a href="https://linkedin.com/company/productica-ai/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://www.instagram.com/productica.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="/TERMS%20AND%20CONDITIONS%20-%20Productica.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
            <a href="/TERMS%20AND%20CONDITIONS%20-%20Productica.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
          </div>

          <div className="text-xs text-white/30 font-mono md:text-right">
            © {new Date().getFullYear()} Productica AI Pvt. Ltd.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-white/5">
          {ADDRESS_LIST.map((loc) => (
            <div key={loc.label} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                {loc.label} · {loc.city}
              </span>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                {loc.lines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < loc.lines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
