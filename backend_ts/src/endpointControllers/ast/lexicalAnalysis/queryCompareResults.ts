const a = {
    sol_query: 'SELECT f.name, (SELECT membercost FROM cd.facilities x WHERE x.name = f.name) FROM cd.facilities f;',
    stud_query: 'SELECT f.name, (SELECT facid FROM cd.facilities x WHERE x.name = f.name) FROM cd.facilities f;',
    sol_ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: {
            tableList: ['select::CD::FACILITIES'],
            columnList: ['select::FACILITIES::NAME', 'select::FACILITIES::MEMBERCOST'],
            ast: {
              with: null,
              type: 'select',
              options: null,
              distinct: { type: null },
              columns: [
                {
                  type: 'expr',
                  expr: {
                    type: 'column_ref',
                    table: 'FACILITIES',
                    column: 'MEMBERCOST',
                  },
                  as: null,
                },
              ],
              into: { position: null },
              from: [{ db: 'CD', table: 'FACILITIES', as: null }],
              where: {
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
                right: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
              },
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          as: null,
        },
      ],
      into: { position: null },
      from: [{ db: 'CD', table: 'FACILITIES', as: null }],
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null,
    },
    stud_ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: {
            tableList: ['select::CD::FACILITIES'],
            columnList: ['select::FACILITIES::NAME', 'select::FACILITIES::FACID'],
            ast: {
              with: null,
              type: 'select',
              options: null,
              distinct: { type: null },
              columns: [
                {
                  type: 'expr',
                  expr: {
                    type: 'column_ref',
                    table: 'FACILITIES',
                    column: 'FACID',
                  },
                  as: null,
                },
              ],
              into: { position: null },
              from: [{ db: 'CD', table: 'FACILITIES', as: null }],
              where: {
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
                right: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
              },
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          as: null,
        },
      ],
      into: { position: null },
      from: [{ db: 'CD', table: 'FACILITIES', as: null }],
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null,
    },
    missing: {
      columns: [
        {
          ast: {
            columns: [
              {
                type: 'expr',
                expr: {
                  type: 'column_ref',
                  table: 'FACILITIES',
                  column: 'MEMBERCOST',
                },
                as: null,
              },
            ],
          },
        },
      ],
    },
    extras: {
      columns: [
        {
          ast: {
            columns: [
              {
                type: 'expr',
                expr: {
                  type: 'column_ref',
                  table: 'FACILITIES',
                  column: 'FACID',
                },
                as: null,
              },
            ],
          },
        },
      ],
    },
  };
  