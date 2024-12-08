import { ClipboardList, Search, Settings } from 'lucide-react';
import Button from '../components/Button';

const features = [
  {
    icon: ClipboardList,
    title: 'Start New Work Order',
    description: 'Begin a new Hipot test log for multiple servers',
    subtext: 'Create a new work order and add up to 10 servers for testing.',
    href: '/new-test',
    variant: 'primary' as const,
  },
  {
    icon: Search,
    title: 'View Past Logs',
    description: 'Access and search previous test logs',
    subtext: 'Search, view, and download past Hipot test logs.',
    href: '/logs',
    variant: 'outline' as const,
  },
  {
    icon: Settings,
    title: 'Settings',
    description: 'Configure system preferences',
    subtext: 'Manage users, update company branding, and set default values.',
    href: '/settings',
    variant: 'outline' as const,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
      <div className="grid w-full max-w-7xl gap-8 px-4 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg"
          >
            <div className="mb-6">
              <feature.icon className="h-10 w-10 text-axiom-500" />
            </div>
            <h3 className="mb-3 text-2xl font-semibold text-axiom-500">
              {feature.title}
            </h3>
            <p className="mb-3 text-base text-gray-600">{feature.description}</p>
            <p className="mb-8 text-sm text-gray-500">{feature.subtext}</p>
            <Button
              href={feature.href}
              variant={feature.variant}
              className="mt-auto w-full text-base py-2.5"
            >
              {feature.title === 'Start New Work Order'
                ? 'Start New Work Order'
                : feature.title === 'View Past Logs'
                ? 'View Past Logs'
                : 'Open Settings'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}