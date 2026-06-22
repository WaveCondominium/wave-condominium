import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useNotifications } from './useNotifications';
import { toast } from 'sonner';
import { anchorMetadataOnChain } from '@/app/actions/blockchain';

export interface BlockchainRecord {
  id: string;
  type: 'proposal' | 'vote' | 'financial' | 'document' | 'user';
  title: string;
  description: string;
  timestamp: string;
  ledger?: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  explorerUrl?: string;
  metadata: any;
}

export function useBlockchainAutoRegistry() {
  const [records, setRecords] = useLocalStorage<BlockchainRecord[]>('wave_blockchain_records', []);
  const { addNotification } = useNotifications();

  const registerOnBlockchain = useCallback(async (
    type: BlockchainRecord['type'],
    title: string,
    description: string,
    metadata: any,
    silent: boolean = false
  ): Promise<BlockchainRecord> => {

    const pendingId = Date.now().toString();

    // Registro otimista como "pending" enquanto a transação é submetida à Stellar
    const pendingRecord: BlockchainRecord = {
      id: pendingId,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      txHash: '',
      status: 'pending',
      metadata
    };

    setRecords(prev => [pendingRecord, ...prev]);

    if (!silent) {
      toast.loading('Ancorando hash na Stellar...', {
        description: title,
        id: pendingId
      });
    }

    const result = await anchorMetadataOnChain(metadata);

    if (!result.success) {
      setRecords(prev =>
        prev.map(r => r.id === pendingId ? { ...r, status: 'failed' as const } : r)
      );

      if (!silent) {
        toast.error('Falha ao ancorar na Stellar', {
          id: pendingId,
          description: result.error ?? 'Tente novamente em alguns instantes.',
        });
      }

      return { ...pendingRecord, status: 'failed' };
    }

    const confirmedRecord: BlockchainRecord = {
      ...pendingRecord,
      txHash: result.txHash,
      ledger: result.ledger,
      explorerUrl: result.explorerUrl,
      status: 'confirmed',
    };

    setRecords(prev =>
      prev.map(r => r.id === pendingId ? confirmedRecord : r)
    );

    if (!silent) {
      addNotification({
        type: 'blockchain',
        title: 'Registro Confirmado na Stellar',
        message: title,
        priority: 'high',
        metadata: {
          blockchainHash: result.txHash
        }
      });

      toast.success('Hash ancorado na Stellar!', {
        id: pendingId,
        description: `${title} - Hash: ${result.txHash.substring(0, 10)}...`,
        action: {
          label: 'Ver no Explorador',
          onClick: () => window.open(result.explorerUrl, '_blank')
        },
        duration: 5000
      });
    }

    return confirmedRecord;
  }, [setRecords, addNotification]);

  // Funções específicas para cada tipo de registro

  const registerUser = useCallback(async (userData: {
    name: string;
    email: string;
    role: string;
    unit?: string;
  }) => {
    return registerOnBlockchain(
      'user',
      `Cadastro de Usuário: ${userData.name}`,
      `Novo ${userData.role} cadastrado no sistema`,
      {
        email: userData.email,
        role: userData.role,
        unit: userData.unit,
        registeredAt: new Date().toISOString()
      },
      true // silent mode - não mostra toast
    );
  }, [registerOnBlockchain]);

  const registerProposal = useCallback(async (proposalData: {
    title: string;
    description: string;
    category: string;
    proposalId: string;
  }) => {
    return registerOnBlockchain(
      'proposal',
      `Proposta Aprovada: ${proposalData.title}`,
      proposalData.description,
      {
        proposalId: proposalData.proposalId,
        category: proposalData.category,
        approvedAt: new Date().toISOString()
      }
    );
  }, [registerOnBlockchain]);

  const registerVote = useCallback(async (voteData: {
    proposalId: string;
    proposalTitle: string;
    voter: string;
    support: boolean;
  }) => {
    return registerOnBlockchain(
      'vote',
      `Voto Registrado: ${voteData.proposalTitle}`,
      `Voto ${voteData.support ? 'favorável' : 'contrário'} de ${voteData.voter}`,
      {
        proposalId: voteData.proposalId,
        voter: voteData.voter,
        support: voteData.support,
        votedAt: new Date().toISOString()
      }
    );
  }, [registerOnBlockchain]);

  const registerPayment = useCallback(async (paymentData: {
    boletoId: string;
    unitNumber: string;
    amount: number;
    referenceMonth: string;
  }) => {
    return registerOnBlockchain(
      'financial',
      `Pagamento Confirmado: Unidade ${paymentData.unitNumber}`,
      `Pagamento de R$ ${paymentData.amount.toFixed(2)} - ${paymentData.referenceMonth}`,
      {
        boletoId: paymentData.boletoId,
        unitNumber: paymentData.unitNumber,
        amount: paymentData.amount,
        referenceMonth: paymentData.referenceMonth,
        paidAt: new Date().toISOString()
      }
    );
  }, [registerOnBlockchain]);

  const registerTransaction = useCallback(async (transactionData: {
    type: 'receita' | 'despesa';
    description: string;
    amount: number;
    category: string;
  }) => {
    return registerOnBlockchain(
      'financial',
      `Transação: ${transactionData.description}`,
      `${transactionData.type === 'receita' ? 'Receita' : 'Despesa'} de R$ ${transactionData.amount.toFixed(2)}`,
      {
        type: transactionData.type,
        amount: transactionData.amount,
        category: transactionData.category,
        registeredAt: new Date().toISOString()
      }
    );
  }, [registerOnBlockchain]);

  const registerDocument = useCallback(async (documentData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    category: string;
    uploadedBy: string;
  }) => {
    return registerOnBlockchain(
      'document',
      `Documento Registrado: ${documentData.fileName}`,
      `Upload por ${documentData.uploadedBy} - Categoria: ${documentData.category}`,
      {
        fileName: documentData.fileName,
        fileType: documentData.fileType,
        fileSize: documentData.fileSize,
        category: documentData.category,
        uploadedBy: documentData.uploadedBy,
        uploadedAt: new Date().toISOString()
      }
    );
  }, [registerOnBlockchain]);

  return {
    records,
    registerUser,
    registerProposal,
    registerVote,
    registerPayment,
    registerTransaction,
    registerDocument
  };
}