import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAgentsData, type AgentItem } from '../data/agentMockData';

interface AgentState {
  agentsList: AgentItem[];
  lastAddedAgentId: string | null;
  addAgent: (
    agentData: Omit<AgentItem, 'id' | 'isOnline' | 'isAllocated'> & Partial<AgentItem>
  ) => AgentItem;
  updateAgent: (id: string, updates: Partial<AgentItem>) => void;
  deleteAgent: (id: string) => void;
  resetToDefaults: () => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agentsList: mockAgentsData,
      lastAddedAgentId: null,

      addAgent: (agentData) => {
        const id = agentData.id || `agent-${Date.now()}`;
        const newAgent: AgentItem = {
          id,
          agentName: agentData.agentName.trim(),
          supervisor: agentData.supervisor?.trim() || 'Priyam Kumar Singh',
          bnId: agentData.bnId?.trim() || `BN${Math.floor(5260 + Math.random() * 50)}`,
          dra: agentData.dra || 'No',
          area: agentData.area?.trim() || 'Ranchi',
          basePincode: agentData.basePincode?.trim() || '834010',
          residencePincode: agentData.residencePincode?.trim() || '834010',
          currentAddress: agentData.currentAddress?.trim() || 'Ranchi',
          permanentAddress: agentData.permanentAddress?.trim() || agentData.currentAddress?.trim() || 'Ranchi',
          experience: agentData.experience?.trim() || '2 Years',
          campaign: agentData.campaign?.trim() || '-',
          acr: agentData.acr?.trim() || '800 - 1000',
          type: agentData.type || 'CALL',
          isOnline: agentData.isOnline ?? false,
          isAllocated: agentData.isAllocated ?? (agentData.campaign !== '-' && agentData.campaign !== ''),
        };

        set((state) => ({
          agentsList: [newAgent, ...state.agentsList],
          lastAddedAgentId: id,
        }));

        return newAgent;
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agentsList: state.agentsList.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent
          ),
        }));
      },

      deleteAgent: (id) => {
        set((state) => ({
          agentsList: state.agentsList.filter((agent) => agent.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({
          agentsList: mockAgentsData,
          lastAddedAgentId: null,
        });
      },
    }),
    {
      name: 'design-crm-agent-store',
    }
  )
);

export default useAgentStore;
