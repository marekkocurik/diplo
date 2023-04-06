INSERT INTO CD.FACILITIES (FACID, NAME, MEMBERCOST, GUESTCOST, INITIALOUTLAY, MONTHLYMAINTENANCE) 
SELECT (SELECT MAX(FACID) FROM CD.FACILITIES)+1, 'Spa', 20, 30, 100000, 800;

[
  {
    type: 'insert',
    table: [ { db: 'CD', table: 'FACILITIES', as: null } ],
    columns: [
      'FACID',
      'NAME',
      'MEMBERCOST',
      'GUESTCOST',
      'INITIALOUTLAY',
      'MONTHLYMAINTENANCE'
    ],
    values: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: {
            type: 'binary_expr',
            operator: '+',
            left: {
              tableList: [ 'select::CD::FACILITIES' ],
              columnList: [ 'select::null::FACID' ],
              ast: {
                with: null,
                type: 'select',
                options: null,
                distinct: { type: null },
                columns: [
                  {
                    type: 'expr',
                    expr: {
                      type: 'aggr_func',
                      name: 'MAX',
                      args: {
                        expr: {
                          type: 'column_ref',
                          table: null,
                          column: 'FACID'
                        }
                      },
                      over: null
                    },
                    as: null
                  }
                ],
                into: { position: null },
                from: [ { db: 'CD', table: 'FACILITIES', as: null } ],
                where: null,
                groupby: null,
                having: null,
                orderby: null,
                limit: { seperator: '', value: [] },
                window: null
              },
              parentheses: true
            },
            right: { type: 'number', value: 1 }
          },
          as: null
        },
        {
          type: 'expr',
          expr: { type: 'single_quote_string', value: 'Spa' },
          as: null
        },
        { type: 'expr', expr: { type: 'number', value: 20 }, as: null },
        { type: 'expr', expr: { type: 'number', value: 30 }, as: null },
        {
          type: 'expr',
          expr: { type: 'number', value: 100000 },
          as: null
        },
        {
          type: 'expr',
          expr: { type: 'number', value: 800 },
          as: null
        }
      ],
      into: { position: null },
      from: null,
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null
    },
    partition: null,
    returning: null
  }
]