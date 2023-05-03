const a = [
  {
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
  },
  {
    sol_query: 'SELECT x.name, x.membercost FROM (SELECT name, membercost FROM cd.facilities ) as x',
    stud_query: 'SELECT x.name, x.membercost FROM (SELECT facid, name, membercost FROM cd.facilities ) as x',
    sol_ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'X', column: 'NAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'X', column: 'MEMBERCOST' },
          as: null,
        },
      ],
      into: { position: null },
      from: [
        {
          prefix: null,
          expr: {
            tableList: ['select::CD::FACILITIES'],
            columnList: [
              'select::X::NAME',
              'select::X::MEMBERCOST',
              'select::FACILITIES::NAME',
              'select::FACILITIES::MEMBERCOST',
            ],
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
                    column: 'NAME',
                  },
                  as: null,
                },
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
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          as: 'X',
        },
      ],
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
          expr: { type: 'column_ref', table: 'X', column: 'NAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'X', column: 'MEMBERCOST' },
          as: null,
        },
      ],
      into: { position: null },
      from: [
        {
          prefix: null,
          expr: {
            tableList: ['select::CD::FACILITIES'],
            columnList: [
              'select::X::NAME',
              'select::X::MEMBERCOST',
              'select::FACILITIES::FACID',
              'select::FACILITIES::NAME',
              'select::FACILITIES::MEMBERCOST',
            ],
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
                {
                  type: 'expr',
                  expr: {
                    type: 'column_ref',
                    table: 'FACILITIES',
                    column: 'NAME',
                  },
                  as: null,
                },
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
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          as: 'X',
        },
      ],
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null,
    },
    missing: {},
    extras: {
      from: [
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
  },
  {
    sol_query: '',
    stud_query: '',
    sol_ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: 'DISTINCT' },
      columns: [
        {
          type: 'expr',
          expr: {
            type: 'binary_expr',
            operator: '||',
            left: {
              type: 'binary_expr',
              operator: '||',
              left: { type: 'column_ref', table: 'MEMBERS', column: 'FIRSTNAME' },
              right: { type: 'single_quote_string', value: ' ' }
            },
            right: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' }
          },
          as: null
        }
      ],
      into: { position: null },
      from: [ { db: 'CD', table: 'MEMBERS', as: null } ],
      where: null,
      groupby: null,
      having: null,
      orderby: [
        {
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          type: 'ASC',
          nulls: null
        }
      ],
      limit: { seperator: '', value: [] },
      window: null
    },
    stud_ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: 'DISTINCT' },
      columns: [
        {
          type: 'expr',
          expr: {
            type: 'binary_expr',
            operator: '||',
            left: {
              type: 'binary_expr',
              operator: '||',
              left: { type: 'column_ref', table: 'MEMBERS', column: 'FIRSTNAME' },
              right: { type: 'single_quote_string', value: ' ' }
            },
            right: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' }
          },
          as: null
        }
      ],
      into: { position: null },
      from: [ { db: 'CD', table: 'MEMBERS', as: null } ],
      where: null,
      groupby: null,
      having: null,
      orderby: [
        {
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          type: 'ASC',
          nulls: null
        }
      ],
      limit: { seperator: '', value: [] },
      window: null
    }
  }
];
