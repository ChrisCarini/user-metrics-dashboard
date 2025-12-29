import { Layout } from '@/components/Layout';
import dynamic from 'next/dynamic';

const RepositoriesTable = dynamic(
  () => import('@/components/RepositoriesTable'),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="p-4 md:p-10 mx-auto h-screen">
      <Layout>
        <RepositoriesTable />
      </Layout>
    </main>
  );
}
