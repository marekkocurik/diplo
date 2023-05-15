SELECT x.surname, x.slots, f.name, round(avg(f.membercost), 2) 
FROM (SELECT m.surname, b.* FROM cd.bookings b JOIN cd.members as m ON m.memid = b.memid WHERE b.slots > 4) as x 
JOIN cd.facilities f ON f.facid = x.facid 
WHERE f.membercost > 0 
GROUP BY x.surname, x.slots, f.name 
HAVING round(avg(f.membercost), 2) < 4 
ORDER BY x.slots;


-- AST:

{
  with: null,
  type: 'select',
  options: null,
  distinct: { type: null },
  columns: [
    {
      type: 'expr',
      expr: { type: 'column_ref', table: 'x', column: 'surname' },
      as: null
    },
    {
      type: 'expr',
      expr: { type: 'column_ref', table: 'x', column: 'slots' },
      as: null
    },
    {
      type: 'expr',
      expr: { type: 'column_ref', table: 'f', column: 'name' },
      as: null
    },
    {
      type: 'expr',
      expr: {
        type: 'function',
        name: 'round',
        args: {
          type: 'expr_list',
          value: [
            {
              type: 'aggr_func',
              name: 'AVG',
              args: {
                expr: {
                  type: 'column_ref',
                  table: 'f',
                  column: 'membercost'
                }
              },
              over: null
            },
            { type: 'number', value: 2 }
          ]
        }
      },
      as: null
    }
  ],
  into: { position: null },
  from: [
    {
      prefix: null,
      expr: {
        tableList: [
          'select::cd::bookings',
          'select::cd::members',
          'select::cd::facilities'
        ],
        columnList: [
          'select::x::surname',
          'select::x::slots',
          'select::facilities::name',
          'select::facilities::membercost',
          'select::members::surname',
          'select::bookings::(.*)',
          'select::members::memid',
          'select::bookings::memid',
          'select::bookings::slots',
          'select::facilities::facid',
          'select::x::facid'
        ],
        ast: {
          with: null,
          type: 'select',
          options: null,
          distinct: { type: null },
          columns: [
            {
              type: 'expr',
              expr: { type: 'column_ref', table: 'm', column: 'surname' },
              as: null
            },
            {
              expr: { type: 'column_ref', table: 'b', column: '*' },
              as: null
            }
          ],
          into: { position: null },
          from: [
            { db: 'cd', table: 'bookings', as: 'b' },
            {
              db: 'cd',
              table: 'members',
              as: 'm',
              join: 'INNER JOIN',
              on: {
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: 'm', column: 'memid' },
                right: { type: 'column_ref', table: 'b', column: 'memid' }
              }
            }
          ],
          where: {
            type: 'binary_expr',
            operator: '>',
            left: { type: 'column_ref', table: 'b', column: 'slots' },
            right: { type: 'number', value: 4 }
          },
          groupby: null,
          having: null,
          orderby: null,
          limit: { seperator: '', value: [] },
          window: null
        },
        parentheses: true
      },
      as: 'x'
    },
    {
      db: 'cd',
      table: 'facilities',
      as: 'f',
      join: 'INNER JOIN',
      on: {
        type: 'binary_expr',
        operator: '=',
        left: { type: 'column_ref', table: 'f', column: 'facid' },
        right: { type: 'column_ref', table: 'x', column: 'facid' }
      }
    }
  ],
  where: {
    type: 'binary_expr',
    operator: '>',
    left: { type: 'column_ref', table: 'f', column: 'membercost' },
    right: { type: 'number', value: 0 }
  },
  groupby: [
    { type: 'column_ref', table: 'x', column: 'surname' },
    { type: 'column_ref', table: 'x', column: 'slots' },
    { type: 'column_ref', table: 'f', column: 'name' }
  ],
  having: {
    type: 'binary_expr',
    operator: '<',
    left: {
      type: 'function',
      name: 'round',
      args: {
        type: 'expr_list',
        value: [
          {
            type: 'aggr_func',
            name: 'AVG',
            args: {
              expr: { type: 'column_ref', table: 'f', column: 'membercost' }
            },
            over: null
          },
          { type: 'number', value: 2 }
        ]
      }
    },
    right: { type: 'number', value: 4 }
  },
  orderby: [
    {
      expr: { type: 'column_ref', table: 'x', column: 'slots' },
      type: 'ASC',
      nulls: null
    }
  ],
  limit: { seperator: '', value: [] },
  window: null
}