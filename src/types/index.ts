export interface Lord {
  tokenId: string;
  name: string;
  owner: string;
  isStaked: boolean;
  stakingDuration: number | null;
  attributes: {
    rank: string[];
    specie: string[];
  };
}

export interface GraphQLResponse {
  data: {
    erc721Tokens: {
      results: {
        name: string;
        owner: string;
        tokenId: string;
        attributes: {
          rank: string[];
          specie: string[];
        };
      }[];
    };
  };
}

export interface RPCResponse {
  result?: string;
  error?: {
    code: number;
    message: string;
    data: string;
  };
}

export interface StakingStats {
  uniqueStakers: number;
  totalStaked: number;
  averageDuration: number;
}

export interface StakingStatsProps {
  stats: StakingStats;
  loading: boolean;
  onRefresh?: () => void;
}

export interface FilterOptions {
  lordSpecie: string;
  lordRarity: string;
  minDuration: number;
  sortBy: SortOption;
  onlyStaked: boolean;
}

export interface OwnerData {
  address: string;
  totalLords: number;
  rare: number;
  epic: number;
  legendary: number;
  mystic: number;
  staked: number;
  rafflePower: number;
  lords: Lord[];
}

export interface OwnerStats {
  uniqueOwners: number;
  highestLordCount: number;
  highestLordOwner: string;
}

export interface OwnersStatsProps {
  uniqueOwners: number;
  highestLordCount: number;
  highestLordOwner: string;
  loading: boolean;
}

export interface OwnersListProps {
  owners: OwnerData[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface StakersMapProps {
  owners: OwnerData[];
  loading: boolean;
  onSelectStaker: (staker: OwnerData | null) => void;
  selectedStaker: OwnerData | null;
}

export interface StakerInfoPanelProps {
  staker: OwnerData;
  onClose: () => void;
}

export interface StakerDetailsProps {
  staker: OwnerData;
  onClose: () => void;
}

export interface Bubble {
  owner: OwnerData;
  x: number;
  y: number;
  radius: number;
}

export interface Participant {
  address: string;
  rafflePower: number;
  winChance: number;
  status: 'Eligible' | 'No Raffle Power';
}

export interface Winner {
  address: string;
  power: number;
  winChance: number;
}

export interface RaffleStats {
  total: number;
  eligible: number;
  ineligible: number;
  totalRafflePower: number;
}

export interface ValidationInfo {
  lines: number;
  validAddresses: number;
  uniqueAddresses: number;
  duplicates: number;
}

export interface ParticipantsListProps {
  participants: Participant[];
  statistics: RaffleStats;
}

export interface AddressInputProps {
  onAddressesChange: (text: string) => void;
  getAllStakersAction: (callback?: (text: string) => void) => void;
  validationInfo: ValidationInfo;
  loading: boolean;
  uniqueStakersCount: number;
}

export interface DrawWinnersProps {
  drawWinners: (categoryCounts: number[]) => void;
  exportWinnersToCSV: (categories: WinnerCategory[]) => void;
  loading: boolean;
  eligibleCount: number;
  allCategoryWinners: Winner[][];
}

export interface WinnerCategory {
  id: number;
  name: string;
  count: number;
  winners: Winner[];
}

export interface LevelingDataEntry {
  level: number;
  rarity: string;
  shards: {
    toReachCurrent: number;
    increaseFromPrev: number;
    totalFromLvl1: number;
  };
  gold: {
    toReachCurrent: number;
    increaseFromPrev: number;
    totalFromLvl1: number;
  };
}

export interface LevelingData {
  levelingData: LevelingDataEntry[];
  rarityCaps: {
    [key: string]: number;
  };
}

export interface CalculationResult {
  goldNeeded: number;
  shardsNeeded: number;
  description: string;
}

export interface ResultsTableProps {
  results: CalculationResult[];
}

export type SortOption = 
  | 'durationHighToLow' 
  | 'durationLowToHigh' 
  | 'tokenIdAsc'
  | 'tokenIdDesc';

export const LORD_SPECIES = ['All', 'Wolf', 'Owl', 'Raven', 'Boar', 'Fox'];
export const LORD_RARITIES = ['All', 'Rare', 'Epic', 'Legendary', 'Mystic'];