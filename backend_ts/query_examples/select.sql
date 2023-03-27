SELECT m.memid, (SELECT f.name FROM cd.facilities f WHERE f.facid = b.facid) as fname, round(avg(b.slots), 2) 
FROM cd.members m 
JOIN cd.bookings b ON b.memid = m.memid 
WHERE m.memid > 5 
GROUP BY m.memid, fname 
HAVING round(avg(b.slots), 2) > 2.3 
ORDER BY m.memid ;

subquery najdem ako columns[x].expr.ast? !== undefined => obsahuje subquery v SELECT

-- AST:

{
  with: null,
  type: 'select',
  options: null,
  distinct: { type: null },
  columns: [
    {
      type: 'expr',
      expr: { type: 'column_ref', table: 'm', column: 'memid' },
      as: null
    },
    {
      type: 'expr',
      expr: {
        tableList: [
          'select::cd::facilities',
          'select::cd::members',
          'select::cd::bookings'
        ],
        columnList: [
          'select::members::memid',
          'select::facilities::name',
          'select::facilities::facid',
          'select::bookings::facid',
          'select::bookings::slots',
          'select::bookings::memid',
          'select::null::fname'
        ],
        ast: {
          with: null,
          type: 'select',
          options: null,
          distinct: { type: null },
          columns: [
            {
              type: 'expr',
              expr: { type: 'column_ref', table: 'f', column: 'name' },
              as: null
            }
          ],
          into: { position: null },
          from: [ { db: 'cd', table: 'facilities', as: 'f' } ],
          where: {
            type: 'binary_expr',
            operator: '=',
            left: { type: 'column_ref', table: 'f', column: 'facid' },
            right: { type: 'column_ref', table: 'b', column: 'facid' }
          },
          groupby: null,
          having: null,
          orderby: null,
          limit: { seperator: '', value: [] },
          window: null
        },
        parentheses: true
      },
      as: 'fname'
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
                expr: { type: 'column_ref', table: 'b', column: 'slots' }
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
    { db: 'cd', table: 'members', as: 'm' },
    {
      db: 'cd',
      table: 'bookings',
      as: 'b',
      join: 'INNER JOIN',
      on: {
        type: 'binary_expr',
        operator: '=',
        left: { type: 'column_ref', table: 'b', column: 'memid' },
        right: { type: 'column_ref', table: 'm', column: 'memid' }
      }
    }
  ],
  where: {
    type: 'binary_expr',
    operator: '>',
    left: { type: 'column_ref', table: 'm', column: 'memid' },
    right: { type: 'number', value: 5 }
  },
  groupby: [
    { type: 'column_ref', table: 'm', column: 'memid' },
    { type: 'column_ref', table: null, column: 'fname' }
  ],
  having: {
    type: 'binary_expr',
    operator: '>',
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
              expr: { type: 'column_ref', table: 'b', column: 'slots' }
            },
            over: null
          },
          { type: 'number', value: 2 }
        ]
      }
    },
    right: { type: 'number', value: 2.3 }
  },
  orderby: [
    {
      expr: { type: 'column_ref', table: 'm', column: 'memid' },
      type: 'ASC',
      nulls: null
    }
  ],
  limit: { seperator: '', value: [] },
  window: null
}
