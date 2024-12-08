interface AxiomtekLogoProps {
  className?: string;
}

export default function AxiomtekLogo({ className = '' }: AxiomtekLogoProps) {
  return (
    <div className="rounded bg-white p-1">
      <img
        src="/Axiomtek-Logo-Lg.png"
        alt="Axiomtek Logo"
        className={`h-8 w-auto ${className}`}
      />
    </div>
  );
}