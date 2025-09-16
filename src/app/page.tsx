import SessionWrapper from '@/components/SessionWrapper';
import DashboardClient from '@/components/DashboardClient';

export default function Page() {
  return (
    <SessionWrapper>
      <DashboardClient />
    </SessionWrapper>
  );
}