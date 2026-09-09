/* eslint-disable */
function extractSectionContent(content: string, startHeadingRegex: RegExp, nextHeadingRegex: RegExp): string {
  const match = content.match(new RegExp(`${startHeadingRegex.source}(?<content>[\\s\\S]*?)(?:(?=${nextHeadingRegex.source})|$)`, 'i'));
  return match?.groups?.content?.trim() || "";
}

const cleanString = (str: string | undefined): string => {
  if (!str) return "";
  return str.trim()
            .replace(/^\*+\s*/, '') // Remove starting asterisks and space
            .replace(/\s*\*+$/, ''); // Remove trailing asterisks
};

export interface ParsedReport {
  decision: string;
  confidence: number;
  oneLine: string;
  
  // 1. CLARITY CHECK
  realProblem: string;
  whoCares: string;
  whatTheyUse: string;
  whyDifferent: string;

  // 2. MARKET TRUTH
  marketReality: string;
  tam: string;
  whoPays: string;
  hardTruth: string;

  // 3. COMPETITION
  competitors: { name: string; details: string }[];
  whyYouLose: string;

  // 4. WAY YOU WIN
  winAngle: string;
  winOptions: { title: string; details: string }[];
  ideaDead: string;

  // 5. FAILURES
  failurePattern: string;
  trap: string;

  // 6. MONEY REALITY
  moneyWhoPays: string;
  moneyHowMuch: string;
  moneyWhyNot: string;
  moneyRisk: string;

  // 7. FIRST 10 USERS
  exactPeople: string;
  whereFind: string;
  whySayYes: string;

  // 8. 72 HOURS
  steps: { title: string; details: string }[];
  mustInclude: string;

  // 9 & 10. SIGNALS
  continueSignals: string[];
  stopSignals: string[];

  // 11. SMARTER VERSION
  smarterVersion: string;

  // 12. FINAL SCORE & VERDICT
  survivalProb: string;
  marketScore: string;
  compScore: string;
  monetizationScore: string;

  finalVerdictText: string;
  whatShouldDo: string;
  whatHappens: string;
  brutalTruth: string;
}

// Resilient helper to extract score fraction or number from a matched line
function extractScoreFromText(text: string, keyword: RegExp): string {
  const lines = text.split('\n');
  const line = lines.find(l => keyword.test(l));
  if (!line) return "";
  
  // Matches "2/10", "2", "2.5", "20%" etc.
  const match = /(\d+(?:\.\d+)?(?:\/\d+)?|[\d%]+)/.exec(line);
  return match ? match[1] : "";
}

export function parseStackAiReport(raw: string): ParsedReport {
  let text = raw.replace(/\r\n/g, '\n');
  const data = {} as ParsedReport;

  // Decision & Confidence
  data.decision = cleanString(/Decision\*?\*?:\*?\*?\s*(.*?)(?=\n|$)/i.exec(text)?.[1] || "NO");
  data.confidence = parseInt(/Confidence\*?\*?:\*?\*?\s*(\d+)/i.exec(text)?.[1] || "5", 10);
  data.oneLine = cleanString(/In one line\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\n|---|\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?1\.)/i.exec(text)?.[1]);

  // 1. CLARITY CHECK
  const claritySection = extractSectionContent(text, /(?:#\s*)?1\.[ \w()]+/, /(?:#\s*)?2\./);
  data.realProblem = cleanString(/Real Problem\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Who actually)/i.exec(claritySection)?.[1]);
  data.whoCares = cleanString(/Who actually cares\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?What they use)/i.exec(claritySection)?.[1]);
  data.whatTheyUse = cleanString(/What they use today\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Why your idea)/i.exec(claritySection)?.[1]);
  data.whyDifferent = cleanString(/Why your idea is different\*?\*?:\*?\*?\s*([\s\S]*?)$/i.exec(claritySection)?.[1]);

  // 2. MARKET TRUTH
  const marketSection = extractSectionContent(text, /(?:#\s*)?2\.[ \w()]+/, /(?:#\s*)?3\./);
  data.marketReality = cleanString(/fantasy\*?\*?\?\*?\*?\s*(?:Real market, wrong approach\.)?\n*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?TAM)/i.exec(marketSection)?.[1]);
  if (!data.marketReality) {
      data.marketReality = cleanString(marketSection.split(/\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?TAM/)[0].replace(/.*fantasy\?\s*/i, ''));
  }
  data.tam = cleanString(/TAM\*?\*?(?:\s*\(rough.*?\))?\*?\*?:\*?\*?\s*\n?([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Who actually)/i.exec(marketSection)?.[1]);
  data.whoPays = cleanString(/Who actually pays\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Hard truth)/i.exec(marketSection)?.[1]);
  data.hardTruth = cleanString(/Hard truth\*?\*?:\*?\*?\s*([\s\S]*?)$/i.exec(marketSection)?.[1]);

  // 3. COMPETITION
  const compSection = extractSectionContent(text, /(?:#\s*)?3\.[ \w()]+/, /(?:#\s*)?4\./);
  data.competitors = [];
  const compSplit = compSection.split(/→|Why you lose by default:/i);
  
  const compLines = compSplit[0].split('\n').map(l => l.trim());
  const tableLines = compLines.filter(l => l.startsWith('|') && l.includes('|'));
  
  if (tableLines.length >= 3 && tableLines.some(l => l.includes('---'))) {
      // Markdown table parsing
      let headers = tableLines[0].split('|').map(c => c.trim()).filter(Boolean);
      const dataLines = tableLines.filter(l => !l.includes('---') && l !== tableLines[0]);
      
      dataLines.forEach(line => {
          const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          if (cols.length >= 1) {
              const name = cols[0].replace(/\*\*/g, '').replace(/^[#\-\s\d.]*/, '').trim();
              let detailsParts: string[] = [];
              for (let i = 1; i < cols.length; i++) {
                  const headerName = headers[i] || `Info`;
                  if (cols[i]) {
                      detailsParts.push(`**${headerName}:** ${cols[i]}`);
                  }
              }
              const details = detailsParts.join('\n\n');
              if (name) {
                  data.competitors.push({ name, details });
              }
          }
      });
  } else {
      // Fallback: Split competitors by double newline for discrete blocks
      const compList = compSplit[0].trim().split(/\n\n+/);
      compList.forEach(block => {
          let name = "Competitor";
          let details = block.trim();
          
          if (!details) return;
    
          // Match bolded text at the very beginning of the string (ignoring any # or - or whitespace)
          const boldMatch = block.match(/^[#\-\s\d.]*\*\*(.*?)\*\*/);
          if (boldMatch && boldMatch[1].trim().length > 0) {
              name = boldMatch[1].trim();
              let cleanedDetails = block.replace(boldMatch[0], '').replace(/^[\s\-:]+/, '');
              details = cleanedDetails.trim() || details;
          } else {
              // If no bold match, evaluate the first line as the name
              const lines = block.split('\n');
              if (lines.length > 1) {
                  name = lines[0].replace(/^[#\-\s\d.]+/, '').trim();
                  details = lines.slice(1).join('\n').trim();
              }
          }
    
          // Final sanitization of the name string to remove rogue markdown symbols
          name = name.replace(/[\*#]/g, '').trim();
    
          if (details.replace(/[\*# \t-]/g, '').length === 0) return;
    
          if (details.length > 0 && name.length > 0) {
              data.competitors.push({ name, details });
          }
      });
  }

  data.whyYouLose = compSplit.length > 1 ? cleanString(compSplit[1].replace(/Why you lose by default\*?\*?:\*?\*?\s*/i, '')) : "";

  // 4. WAY YOU WIN
  let winSection = extractSectionContent(text, /(?:#\s*)?4\.[ \w()]+/, /(?:#\s*)?5\./);
  
  // Extract "Idea dead" and remove it from winSection
  data.ideaDead = cleanString(/If this is missing[^:]*\*?\*?:\*?\*?\s*\n?([\s\S]*?)$/i.exec(winSection)?.[1]);
  if (data.ideaDead) {
      winSection = winSection.substring(0, winSection.search(/If this is missing/i)).trim();
  }

  data.winOptions = [];
  let hasOpts = false;

  // Method 1: Check for explicit "Option A:" or "**Option 1**" formatting
  const optRegex = /(?:\*\*Option\s+[A-Z\d]+:?\*\*?|Option\s+[A-Z\d]+:?)\s*\n?([^\n]*)\n([\s\S]*?)(?=\n(?:(?:\*\*?)?Option\s+[A-Z\d]+)|$)/gi;
  let m;
  while ((m = optRegex.exec(winSection)) !== null) {
      let title = cleanString(m[1]).replace(/\*\*/g, '');
      let details = cleanString(m[2]);
      if (!title && details) title = "Strategy";
      if (title || details) {
         data.winOptions.push({ title: title || "Strategy", details: details });
         hasOpts = true;
      }
  }

  // Method 2 (Fallback): Split by numbered list "1. ", "2. " exactly at the start of a line
  if (!hasOpts) {
      const listSplit = winSection.split(/^(?:\d+\.\s+|\*\*?\d+\.\*\*?\s+)/m);
      if (listSplit.length > 1) {
          // The first part is the angle thesis
          data.winAngle = cleanString(listSplit[0].replace(/The ONE angle[^:]*\*?\*?:\*?\*?\s*/i, '').replace(/\*\*/g, ''));
          for (let i = 1; i < listSplit.length; i++) {
              const itemText = listSplit[i].trim();
              if (itemText.length === 0) continue;

              const titleMatch = itemText.match(/^([^\n]+?)\n([\s\S]*)$/);
              let title = `Strategy ${i}`;
              let details = itemText;

              if (titleMatch) {
                  title = titleMatch[1].trim().replace(/\*\*/g, '');
                  details = titleMatch[2].trim();
              } else {
                  // No newline, whole line is the point
                  title = itemText.replace(/\*\*/g, '');
                  details = '';
              }
              
              if (title.length > 0 || details.length > 0) {
                 data.winOptions.push({ title, details });
                 hasOpts = true;
              }
          }
      }
  }

  // Method 3 (Legacy fallback): split by "Then:" bullets
  if (!hasOpts) {
      const thenMatch = /\*?\*?Then\*?\*?:\*?\*?\s*\n([\s\S]*?)$/i.exec(winSection);
      if (thenMatch && thenMatch[1]) {
          const bullets = thenMatch[1].split(/\n+(?=- |\* |\d+\. )/);
          bullets.forEach(b => {
              const cleaned = cleanString(b.replace(/^[-*]\s*/, ''));
              if (cleaned.length > 5) {
                  data.winOptions.push({ title: "Strategy", details: cleaned });
                  hasOpts = true;
              }
          });
          data.winAngle = cleanString(winSection.substring(0, winSection.search(/\*?\*?Then:/i)).replace(/The ONE angle[^:]*\*?\*?:\*?\*?\s*/i, '').replace(/\*\*/g, ''));
      } else {
          // No options, extract everything into angle
          data.winAngle = cleanString(winSection.replace(/The ONE angle[^:]*\*?\*?:\*?\*?\s*/i, '').replace(/\*\*/g, ''));
      }
  }

  if (hasOpts && !data.winAngle) {
       // if winAngle wasn't filled by method 2 or 3
       const angleMatch = winSection.split(/\n\*?\*?(?:Option|1\.|Then:)/i)[0];
       data.winAngle = cleanString(angleMatch.replace(/The ONE angle[^:]*\*?\*?:\*?\*?\s*/i, '')).replace(/\*\*/g, '');
  }

  // 5. FAILURES
  const failSection = extractSectionContent(text, /(?:#\s*)?5\.[ \w()]+/, /(?:#\s*)?6\./);
  data.failurePattern = cleanString(/Real failure pattern\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?The trap)/i.exec(failSection)?.[1]);
  data.trap = cleanString(/The trap you're about to fall into\*?\*?:\*?\*?\s*([\s\S]*?)$/i.exec(failSection)?.[1]);

  // 6. MONEY REALITY
  const moneySection = extractSectionContent(text, /(?:#\s*)?6\.[ \w()]+/, /(?:#\s*)?7\./);
  data.moneyWhoPays = cleanString(/Who pays\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?How much)/i.exec(moneySection)?.[1]);
  data.moneyHowMuch = cleanString(/How much they pay\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Why they)/i.exec(moneySection)?.[1]);
  data.moneyWhyNot = cleanString(/Why they might NOT pay\*?\*?:\*?\*?\s*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?(?:Biggest risk|→\s*Biggest risk))/i.exec(moneySection)?.[1]);
  data.moneyRisk = cleanString(/(?:Biggest risk|→\s*Biggest risk)\*?\*?:\*?\*?\s*([\s\S]*?)$/i.exec(moneySection)?.[1]);

  // 7. FIRST 10 USERS
  const usersSection = extractSectionContent(text, /(?:#\s*)?7\.[ \w()— \-]+/, /(?:#\s*)?8\./);
  data.exactPeople = cleanString(/EXACT people\*?\*?:\*?\*?\s*\n?([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Where to find)/i.exec(usersSection)?.[1]);
  data.whereFind = cleanString(/Where to find them\*?\*?:\*?\*?\s*\n?([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Why they would)/i.exec(usersSection)?.[1]);
  data.whySayYes = cleanString(/Why they would say YES immediately\*?\*?:\*?\*?\s*\n?([\s\S]*?)$/i.exec(usersSection)?.[1]);

  // 8. 72 HOURS
  const hoursSection = extractSectionContent(text, /(?:#\s*)?8\.[ \w()]+/, /(?:#\s*)?9\./);
  data.steps = [];
  const stepRegex = /Step \d+\*?\*?:\*?\*?\s*\n*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?(?:Step \d+|Must include)|$)/gi;
  while ((m = stepRegex.exec(hoursSection)) !== null) {
      data.steps.push({ title: 'Step', details: cleanString(m[1]) });
  }
  if (data.steps.length === 0) {
      const splitSteps = hoursSection.split(/Step \d+:\s*/i).filter(Boolean);
      splitSteps.forEach(s => {
          if(!s.trim().toLowerCase().startsWith("must include") && cleanString(s).length > 5) {
              data.steps.push({ title: "Step", details: cleanString(s)});
          }
      });
  }
  data.mustInclude = cleanString(/Must include\*?\*?:\*?\*?\s*\n*(?:→\s*)?([\s\S]*?)$/i.exec(hoursSection)?.[1]);

  // 9 & 10. SIGNALS
  const continueSection = extractSectionContent(text, /(?:#\s*)?9\.[ \w()→ ]+/, /(?:#\s*)?10\./);
  const stopSection = extractSectionContent(text, /(?:#\s*)?10\.[ \w()→ ]+/, /(?:#\s*)?11\./);
  
  const extractSignals = (txt: string) => {
     const sigs: string[] = [];
     const sr = /Signal \d+\*?\*?:\*?\*?\s*\n*([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Signal|$)/gi;
     while((m = sr.exec(txt))!==null) sigs.push(cleanString(m[1]));
     return sigs;
  };
  data.continueSignals = extractSignals(continueSection);
  data.stopSignals = extractSignals(stopSection);

  // 11. SMARTER VERSION
  const smarterSection = extractSectionContent(text, /(?:#\s*)?11\.[ \w()+ ]+/, /(?:#\s*)?12\./);
  data.smarterVersion = cleanString(smarterSection.replace(/Version that has higher chance of working:\n*/i, ''));

  // 12. FINAL SCORE & VERDICT
  const finalSection = extractSectionContent(text, /(?:#\s*)?12\.[ \w()+ ]+/, /FINAL VERDICT:/i);
  const verdictIndex = text.search(/FINAL VERDICT:/i);
  const verdictSection = verdictIndex !== -1 ? text.substring(verdictIndex) : "";

  // Highly resilient scorecard parsing using split keyword matching
  const scoreSearchArea = finalSection || text;
  data.survivalProb = extractScoreFromText(scoreSearchArea, /survival/i);
  data.marketScore = extractScoreFromText(scoreSearchArea, /market/i);
  data.compScore = extractScoreFromText(scoreSearchArea, /(?:comp|competition)/i);
  data.monetizationScore = extractScoreFromText(scoreSearchArea, /monetiz/i);

  // Highly resilient verdict extraction
  let verdictText = "";
  if (verdictSection) {
      const verdictLines = verdictSection.split('\n').map(l => l.trim()).filter(Boolean);
      // Find a line starting with '→' or containing the core verdict phrase
      const mainVerdictLine = verdictLines.find(l => l.startsWith('→') || l.startsWith('"') || l.toLowerCase().includes('idea because') || l.toLowerCase().includes('verdict is'));
      
      if (mainVerdictLine) {
          verdictText = mainVerdictLine.replace(/^[→"'\s]+|["'\s]+$/g, '');
      } else {
          // Fallback: find first line that isn't heading or empty
          const filteredLines = verdictLines.filter(l => 
              !l.toLowerCase().includes('final verdict') && 
              !l.toLowerCase().includes('evaluation') && 
              !l.match(/^\*\*[^*]+\*\*$/)
          );
          if (filteredLines.length > 0) {
              verdictText = filteredLines[0].replace(/^[→"'\s]+|["'\s]+$/g, '');
          }
      }
  }

  data.finalVerdictText = cleanString(verdictText) || data.oneLine || "Analysis indicates significant pivots are required.";

  // Brutal truth and what to do
  data.brutalTruth = cleanString(/The brutal truth\*?\*?:\*?\*?\s*\n?([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?What you should actually do|\nWhat you should do)/i.exec(verdictSection)?.[1]);
  data.whatShouldDo = cleanString(/What you should(?: actually)? do\*?\*?:\*?\*?\s*\n?([\s\S]*?)(?=\n\s*(?:\*|-|\d+\.)?\s*(?:\*\*)?Stop building|\nYou have 72 hours|$)/i.exec(verdictSection)?.[1]);
  
  return data as ParsedReport;
}
