import type { Appeal } from '~/types/appeal';

const mockAppeals: Appeal[] = [
  {
    id: '1',
    title: 'Основное обращение 1',
    order: 1,
    children: [
      {
        id: '1-1',
        title: 'Вложенное обращение 1.1',
        parentId: '1',
        order: 1
      },
      {
        id: '1-2',
        title: 'Вложенное обращение 1.2',
        parentId: '1',
        order: 2,
        children: [
          {
            id: '1-2-1',
            title: 'Вложенное обращение 1.2.1',
            parentId: '1-2',
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Основное обращение 2',
    order: 2,
    children: [
      {
        id: '2-1',
        title: 'Вложенное обращение 2.1',
        parentId: '2',
        order: 1
      }
    ]
  },
  {
    id: '3',
    title: 'Основное обращение 3',
    order: 3
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
