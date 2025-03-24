import type { Appeal } from '~/types/appeal';

const mockAppeals: Appeal[] = [
  {
    id: '1',
    title: 'Action Games',
    order: 1,
    children: [
      {
        id: '1-1',
        title: 'Counter-Strike 2',
        parentId: '1',
        order: 1
      },
      {
        id: '1-2',
        title: 'Call of Duty',
        parentId: '1',
        order: 2,
        children: [
          {
            id: '1-2-1',
            title: 'Warzone',
            parentId: '1-2',
            order: 1
          },
          {
            id: '1-2-2',
            title: 'Modern Warfare III',
            parentId: '1-2',
            order: 2
          }
        ]
      },
      {
        id: '1-3',
        title: 'Apex Legends',
        parentId: '1',
        order: 3
      }
    ]
  },
  {
    id: '2',
    title: 'RPG Games',
    order: 2,
    children: [
      {
        id: '2-1',
        title: 'The Witcher 3',
        parentId: '2',
        order: 1
      },
      {
        id: '2-2',
        title: 'Cyberpunk 2077',
        parentId: '2',
        order: 2
      },
      {
        id: '2-3',
        title: 'Skyrim',
        parentId: '2',
        order: 3
      }
    ]
  },
  {
    id: '3',
    title: 'Strategy Games',
    order: 3,
    children: [
      {
        id: '3-1',
        title: 'Age of Empires IV',
        parentId: '3',
        order: 1
      },
      {
        id: '3-2',
        title: 'Civilization VI',
        parentId: '3',
        order: 2
      }
    ]
  },
  {
    id: '4',
    title: 'Simulation Games',
    order: 4,
    children: [
      {
        id: '4-1',
        title: 'The Sims 4',
        parentId: '4',
        order: 1
      },
      {
        id: '4-2',
        title: 'Microsoft Flight Simulator',
        parentId: '4',
        order: 2
      }
    ]
  }
];

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedAppeals = mockAppeals.slice(start, end);
  
  return {
    appeals: paginatedAppeals,
    total: mockAppeals.length,
    page,
    limit,
    totalPages: Math.ceil(mockAppeals.length / limit)
  };
});
