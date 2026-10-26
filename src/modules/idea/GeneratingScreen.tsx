import WaitNewsScreen from '../wait/WaitNewsScreen';

const PHASES = [
  'Reading your idea',
  'Scoring the Syncoro IQ',
  'Mapping buyers and competitors',
  'Sizing the market without the hype',
  'Running the pre-mortem',
  'Assembling your report',
];

interface Props {
  startedAt: number;
  onBack: () => void;
}

export default function GeneratingScreen({ startedAt, onBack }: Props) {
  return (
    <WaitNewsScreen
      eyebrow="Generating"
      title={<>Building your <span className="font-semibold">validation report.</span></>}
      note="This usually takes 1–3 minutes. You can leave this page — the report keeps generating and will be waiting in your history."
      phases={PHASES}
      startedAt={startedAt}
      backLabel="My validations"
      onBack={onBack}
    />
  );
}
