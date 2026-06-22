import { useUser } from '@/contexts/UserContext';
import { registerVoteOnChain, registerDocumentOnChain, hashDocument } from '@/app/actions/blockchain';

export function useContracts() {
  const { userProfile, isAuthenticated } = useUser();
  const account = userProfile?.walletAddress;

  const contracts = {
    governance: {
      proposalCount: async () => BigInt(2), // Mock return
      totalResidents: async () => BigInt(100),
      createProposal: async (title: string, description: string, category: string, proposalType: string, durationDays: number, metadataHash: string) => {
        // In a real app, this would call a server action or smart contract
        console.log('Creating proposal:', { title, description });
        const mockHash = '0xmock' + Math.random().toString(16).slice(2);
        return { 
          hash: mockHash,
          wait: async () => ({ status: 1, transactionHash: mockHash }) 
        };
      },
      vote: async (proposalId: number, support: boolean) => {
        if (!isAuthenticated || !userProfile) throw new Error("Usuário não autenticado");
        // Use server action for voting
        const result = await registerVoteOnChain(proposalId.toString(), support ? 'yes' : 'no', userProfile.id);
        return { 
          hash: result.txHash,
          wait: async () => ({ status: result.success ? 1 : 0, transactionHash: result.txHash }) 
        };
      },
      executeProposal: async (proposalId: number) => {
        const mockHash = '0xmock' + Math.random().toString(16).slice(2);
        return { 
          hash: mockHash,
          wait: async () => ({ status: 1, transactionHash: mockHash }) 
        };
      },
      getProposal: async (proposalId: number) => {
        // Return mock proposal data matching ABI structure
        return [
          `Proposta ${proposalId}`, // title
          'Descrição simulada da proposta para demonstração.', // description
          'Manutenção', // category
          BigInt(15), // votesFor
          BigInt(3), // votesAgainst
          BigInt(18), // totalVotes
          BigInt(Math.floor(Date.now() / 1000) + 86400 * 2), // deadline (2 days from now)
          false, // executed
          false // approved
        ];
      },
      hasVoted: async (proposalId: number, voter: string) => {
        return false;
      },
      getVote: async (proposalId: number, voter: string) => {
        return [false, false, BigInt(0)];
      },
      authorizedVoters: async (voter: string) => {
        return true;
      }
    },
    document: {
      documentCount: async () => BigInt(5),
      registerDocument: async (documentHash: string, title: string, category: string) => {
        if (!isAuthenticated || !userProfile) throw new Error("Usuário não autenticado");
        const result = await registerDocumentOnChain(documentHash, userProfile.id);
        return { 
          hash: result.txHash,
          wait: async () => ({ status: result.success ? 1 : 0, transactionHash: result.txHash }) 
        };
      },
      verifyDocument: async (documentHash: string) => {
        return true;
      },
      getDocument: async (documentHash: string) => {
        return [
          'Documento Simulado', // title
          'Ata', // category
          BigInt(Math.floor(Date.now() / 1000) - 86400), // timestamp
          '0x123...', // uploader
          true // exists
        ];
      },
      getUploaderDocuments: async (uploader: string) => {
        return [];
      },
      getTotalDocuments: async () => BigInt(5)
    },
    financial: {
      transactionCount: async () => BigInt(10),
      registerTransaction: async () => {
        const mockHash = '0xmock' + Math.random().toString(16).slice(2);
        return { 
          hash: mockHash,
          wait: async () => ({ status: 1, transactionHash: mockHash }) 
        };
      },
      getTransaction: async (txHash: string) => {
        return [
          'payment', // type
          BigInt(1000), // amount
          'Pagamento Condomínio', // description
          BigInt(Math.floor(Date.now() / 1000)), // timestamp
          '0x123...', // registrar
          true // approved
        ];
      },
      getTotalTransactions: async () => BigInt(10)
    }
  };

  return {
    contracts,
    isConnected: isAuthenticated,
    account,
    signer: null,
    provider: null
  };
}

// Helper para gerar hash de conteúdo (SHA-256, calculado no servidor via Server Action)
export async function generateHash(content: string): Promise<string> {
  return hashDocument(content);
}

// Helper para formatar timestamp
export function formatTimestamp(timestamp: bigint | number): string {
  return new Date(Number(timestamp) * 1000).toLocaleDateString('pt-BR');
}

// Helper para calcular dias restantes
export function getDaysRemaining(deadline: bigint | number): number {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(deadline) - now;
  return Math.max(0, Math.floor(diff / 86400));
}
