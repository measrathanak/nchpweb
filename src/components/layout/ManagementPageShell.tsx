import { ReactNode } from 'react';

interface ManagementPageShellProps {
  title: string;
  subtitle: string;
  main: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
}

export default function ManagementPageShell({ title: _title, subtitle: _subtitle, main, aside, footer }: ManagementPageShellProps) {
  return (
    <div className="space-y-8">
      {aside ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">{main}</div>
          <aside className="space-y-6">{aside}</aside>
        </div>
      ) : (
        main
      )}

      {footer}
    </div>
  );
}
