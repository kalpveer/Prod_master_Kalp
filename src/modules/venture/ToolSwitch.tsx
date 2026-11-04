import { grantsHref, ideaHref, markWorkspaceOpen, type VentureTool } from './landingGate';

const tools = [
  { id: 'idea' as const, href: () => ideaHref(), name: 'Validate', job: 'Score the idea' },
  { id: 'grants' as const, href: () => grantsHref(), name: 'Grants', job: 'Find funding' },
];

export default function ToolSwitch({ active }: { active: VentureTool }) {
  return (
    <nav className="vl-switch" aria-label="Choose a tool">
      <span className={`vl-switch__pill${active === 'grants' ? ' is-right' : ''}`} aria-hidden />
      {tools.map(tool => {
        const on = active === tool.id;
        return (
          <a
            key={tool.id}
            href={tool.href()}
            onClick={markWorkspaceOpen}
            aria-current={on ? 'page' : undefined}
            className={`vl-switch__item${on ? ' is-on' : ''}`}
          >
            <span className="vl-switch__name">{tool.name}</span>
            <span className="vl-switch__job">{tool.job}</span>
          </a>
        );
      })}
    </nav>
  );
}
