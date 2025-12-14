interface PromptChipsProps {
  prompts: string[];
  onSelect?: (prompt: string) => void;
}

const PromptChips = ({ prompts, onSelect }: PromptChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelect?.(prompt)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-soft hover:border-primary hover:bg-accent"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default PromptChips;
