interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function SettingsSection({
  title,
  children,
  fullWidth = false,
}: SettingsSectionProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${
        fullWidth ? 'lg:col-span-2' : ''
      }`}
    >
      <h2 className="mb-4 text-xl font-semibold text-axiom-500">{title}</h2>
      {children}
    </div>
  );
}