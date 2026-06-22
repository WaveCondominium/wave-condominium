import { ProposalDetailsWrapper } from './wrapper';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProposalDetailsWrapper id={resolvedParams.id} />;
}
