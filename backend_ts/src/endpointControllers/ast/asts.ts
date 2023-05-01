export const trees = [
  {
    query:
      'SELECT FACILITIES.FACID, FACILITIES.NAME, FACILITIES.MEMBERCOST, FACILITIES.GUESTCOST, FACILITIES.INITIALOUTLAY, FACILITIES.MONTHLYMAINTENANCE FROM CD.FACILITIES;',
    ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'FACID' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
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
        {
          type: 'expr',
          expr: {
            type: 'column_ref',
            table: 'FACILITIES',
            column: 'GUESTCOST',
          },
          as: null,
        },
        {
          type: 'expr',
          expr: {
            type: 'column_ref',
            table: 'FACILITIES',
            column: 'INITIALOUTLAY',
          },
          as: null,
        },
        {
          type: 'expr',
          expr: {
            type: 'column_ref',
            table: 'FACILITIES',
            column: 'MONTHLYMAINTENANCE',
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
  },
  {
    query: 'SELECT MEMBERS.MEMID, MAX(JOINDATE) AS LATEST FROM CD.MEMBERS;',
    ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
          as: null,
        },
        {
          type: 'expr',
          expr: {
            type: 'aggr_func',
            name: 'MAX',
            args: {
              expr: { type: 'column_ref', table: null, column: 'JOINDATE' },
            },
            over: null,
          },
          as: 'LATEST',
        },
      ],
      into: { position: null },
      from: [{ db: 'CD', table: 'MEMBERS', as: null }],
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query: 'SELECT MEMBERS.MEMID, (SELECT FACILITIES.FACID FROM CD.FACILITIES) as FACID FROM CD.MEMBERS',
    ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
          as: null,
        },
        {
          type: 'expr',
          expr: {
            tableList: ['select::CD::FACILITIES', 'select::CD::MEMBERS'],
            columnList: ['select::MEMBERS::MEMID', 'select::FACILITIES::FACID'],
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
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          as: 'FACID',
        },
      ],
      into: { position: null },
      from: [{ db: 'CD', table: 'MEMBERS', as: null }],
      where: null,
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query:
      "INSERT INTO CD.FACILITIES (FACID, NAME, MEMBERCOST, GUESTCOST, INITIALOUTLAY, MONTHLYMAINTENANCE) VALUES (9, 'Spa', 20, 30, 100000, 800);",
    ast: {
      type: 'insert',
      table: [{ db: 'CD', table: 'FACILITIES', as: null }],
      columns: ['FACID', 'NAME', 'MEMBERCOST', 'GUESTCOST', 'INITIALOUTLAY', 'MONTHLYMAINTENANCE'],
      values: [
        {
          type: 'expr_list',
          value: [
            { type: 'number', value: 9 },
            { type: 'single_quote_string', value: 'Spa' },
            { type: 'number', value: 20 },
            { type: 'number', value: 30 },
            { type: 'number', value: 100000 },
            { type: 'number', value: 800 },
          ],
        },
      ],
      partition: null,
      returning: null,
    },
  },
  {
    query: 'UPDATE CD.FACILITIES SET FACILITIES.INITIALOUTLAY = 10000 WHERE FACILITIES.FACID = 1;',
    ast: {
      type: 'update',
      table: [{ db: 'CD', table: 'FACILITIES', as: null }],
      set: [
        {
          column: 'INITIALOUTLAY',
          value: { type: 'number', value: 10000 },
          table: 'FACILITIES',
        },
      ],
      where: {
        type: 'binary_expr',
        operator: '=',
        left: { type: 'column_ref', table: 'FACILITIES', column: 'FACID' },
        right: { type: 'number', value: 1 },
      },
      returning: null,
    },
  },
  {
    query:
      'UPDATE CD.FACILITIES SET FACILITIES.MEMBERCOST = (SELECT FACILITIES.MEMBERCOST * 1.1 FROM CD.FACILITIES WHERE FACILITIES.FACID = 0), FACILITIES.GUESTCOST = (SELECT FACILITIES.GUESTCOST * 1.1 FROM CD.FACILITIES WHERE FACILITIES.FACID = 0) WHERE FACILITIES.FACID = 1;',
    ast: {
      type: 'update',
      table: [{ db: 'CD', table: 'FACILITIES', as: null }],
      set: [
        {
          column: 'MEMBERCOST',
          value: {
            tableList: ['select::CD::FACILITIES'],
            columnList: ['select::FACILITIES::MEMBERCOST', 'select::FACILITIES::FACID'],
            ast: {
              with: null,
              type: 'select',
              options: null,
              distinct: { type: null },
              columns: [
                {
                  type: 'expr',
                  expr: {
                    type: 'binary_expr',
                    operator: '*',
                    left: {
                      type: 'column_ref',
                      table: 'FACILITIES',
                      column: 'MEMBERCOST',
                    },
                    right: { type: 'number', value: 1.1 },
                  },
                  as: null,
                },
              ],
              into: { position: null },
              from: [{ db: 'CD', table: 'FACILITIES', as: null }],
              where: {
                type: 'binary_expr',
                operator: '=',
                left: {
                  type: 'column_ref',
                  table: 'FACILITIES',
                  column: 'FACID',
                },
                right: { type: 'number', value: 0 },
              },
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          table: 'FACILITIES',
        },
        {
          column: 'GUESTCOST',
          value: {
            tableList: ['select::CD::FACILITIES'],
            columnList: [
              'select::FACILITIES::MEMBERCOST',
              'select::FACILITIES::FACID',
              'select::FACILITIES::GUESTCOST',
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
                    type: 'binary_expr',
                    operator: '*',
                    left: {
                      type: 'column_ref',
                      table: 'FACILITIES',
                      column: 'GUESTCOST',
                    },
                    right: { type: 'number', value: 1.1 },
                  },
                  as: null,
                },
              ],
              into: { position: null },
              from: [{ db: 'CD', table: 'FACILITIES', as: null }],
              where: {
                type: 'binary_expr',
                operator: '=',
                left: {
                  type: 'column_ref',
                  table: 'FACILITIES',
                  column: 'FACID',
                },
                right: { type: 'number', value: 0 },
              },
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          table: 'FACILITIES',
        },
      ],
      where: {
        type: 'binary_expr',
        operator: '=',
        left: { type: 'column_ref', table: 'FACILITIES', column: 'FACID' },
        right: { type: 'number', value: 1 },
      },
      returning: null,
    },
  },
  {
    query: 'DELETE FROM CD.MEMBERS WHERE MEMBERS.MEMID NOT IN (SELECT MEMBERS.MEMID FROM CD.BOOKINGS);',
    ast: {
      type: 'delete',
      table: [{ db: 'CD', table: 'MEMBERS', as: null, addition: true }],
      from: [{ db: 'CD', table: 'MEMBERS', as: null }],
      where: {
        type: 'binary_expr',
        operator: 'NOT IN',
        left: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
        right: {
          type: 'expr_list',
          value: [
            {
              tableList: ['select::CD::BOOKINGS'],
              columnList: ['select::MEMBERS::MEMID'],
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
                      table: 'MEMBERS',
                      column: 'MEMID',
                    },
                    as: null,
                  },
                ],
                into: { position: null },
                from: [{ db: 'CD', table: 'BOOKINGS', as: null }],
                where: null,
                groupby: null,
                having: null,
                orderby: null,
                limit: { seperator: '', value: [] },
                window: null,
              },
            },
          ],
        },
      },
    },
  },
  {
    query:
      'WITH RECURSIVE RECOMMENDEDS(MEMBERS.MEMID) AS ( SELECT MEMBERS.MEMID FROM CD.MEMBERS WHERE MEMBERS.RECOMMENDEDBY = 1 UNION ALL SELECT MEMBERS.MEMID FROM RECOMMENDEDS INNER JOIN CD.MEMBERS ON MEMBERS.RECOMMENDEDBY = RECOMMENDEDS.MEMID ) SELECT RECOMMENDEDS.MEMID, MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM RECOMMENDEDS INNER JOIN CD.MEMBERS ON RECOMMENDEDS.MEMID = MEMBERS.MEMID ORDER BY MEMBERS.MEMID;',
    ast: {
      with: [
        {
          name: { type: 'default', value: 'RECOMMENDEDS' },
          stmt: {
            with: null,
            type: 'select',
            options: null,
            distinct: { type: null },
            columns: [
              {
                type: 'expr',
                expr: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
                as: null,
              },
            ],
            into: { position: null },
            from: [{ db: 'CD', table: 'MEMBERS', as: null }],
            where: {
              type: 'binary_expr',
              operator: '=',
              left: {
                type: 'column_ref',
                table: 'MEMBERS',
                column: 'RECOMMENDEDBY',
              },
              right: { type: 'number', value: 1 },
            },
            groupby: null,
            having: null,
            orderby: null,
            limit: { seperator: '', value: [] },
            window: null,
            _next: {
              with: null,
              type: 'select',
              options: null,
              distinct: { type: null },
              columns: [
                {
                  type: 'expr',
                  expr: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
                  as: null,
                },
              ],
              into: { position: null },
              from: [
                { db: null, table: 'RECOMMENDEDS', as: null },
                {
                  db: 'CD',
                  table: 'MEMBERS',
                  as: null,
                  join: 'INNER JOIN',
                  on: {
                    type: 'binary_expr',
                    operator: '=',
                    left: {
                      type: 'column_ref',
                      table: 'MEMBERS',
                      column: 'RECOMMENDEDBY',
                    },
                    right: {
                      type: 'column_ref',
                      table: 'RECOMMENDEDS',
                      column: 'MEMID',
                    },
                  },
                },
              ],
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            set_op: 'union all',
          },
          columns: [{ type: 'column_ref', table: 'MEMBERS', column: 'MEMID' }],
          recursive: true,
        },
      ],
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'RECOMMENDEDS', column: 'MEMID' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'FIRSTNAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          as: null,
        },
      ],
      into: { position: null },
      from: [
        { db: null, table: 'RECOMMENDEDS', as: null },
        {
          db: 'CD',
          table: 'MEMBERS',
          as: null,
          join: 'INNER JOIN',
          on: {
            type: 'binary_expr',
            operator: '=',
            left: { type: 'column_ref', table: 'RECOMMENDEDS', column: 'MEMID' },
            right: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
          },
        },
      ],
      where: null,
      groupby: null,
      having: null,
      orderby: [
        {
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
          type: 'ASC',
          nulls: null,
        },
      ],
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query:
      'WITH RECURSIVE RECOMMENDERS(RECOMMENDER, MEMBER) AS ( SELECT MEMBERS.RECOMMENDEDBY, MEMBERS.MEMID FROM CD.MEMBERS UNION ALL SELECT MEMBERS.RECOMMENDEDBY, RECOMMENDERS.MEMBER FROM RECOMMENDERS INNER JOIN CD.MEMBERS ON MEMBERS.MEMID = RECOMMENDERS.RECOMMENDER ) SELECT RECOMMENDERS.MEMBER MEMBER, RECOMMENDERS.RECOMMENDER, MEMBERS.FIRSTNAME, MEMBERS.SURNAME FROM RECOMMENDERS INNER JOIN CD.MEMBERS ON RECOMMENDERS.RECOMMENDER = MEMBERS.MEMID WHERE RECOMMENDERS.MEMBER = 22 OR RECOMMENDERS.MEMBER = 12 ORDER BY RECOMMENDERS.MEMBER ASC, RECOMMENDERS.RECOMMENDER DESC;',
    ast: {
      with: [
        {
          name: { type: 'default', value: 'RECOMMENDERS' },
          stmt: {
            with: null,
            type: 'select',
            options: null,
            distinct: { type: null },
            columns: [
              {
                type: 'expr',
                expr: {
                  type: 'column_ref',
                  table: 'MEMBERS',
                  column: 'RECOMMENDEDBY',
                },
                as: null,
              },
              {
                type: 'expr',
                expr: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
                as: null,
              },
            ],
            into: { position: null },
            from: [{ db: 'CD', table: 'MEMBERS', as: null }],
            where: null,
            groupby: null,
            having: null,
            orderby: null,
            limit: { seperator: '', value: [] },
            window: null,
            _next: {
              with: null,
              type: 'select',
              options: null,
              distinct: { type: null },
              columns: [
                {
                  type: 'expr',
                  expr: {
                    type: 'column_ref',
                    table: 'MEMBERS',
                    column: 'RECOMMENDEDBY',
                  },
                  as: null,
                },
                {
                  type: 'expr',
                  expr: {
                    type: 'column_ref',
                    table: 'RECOMMENDERS',
                    column: 'MEMBER',
                  },
                  as: null,
                },
              ],
              into: { position: null },
              from: [
                { db: null, table: 'RECOMMENDERS', as: null },
                {
                  db: 'CD',
                  table: 'MEMBERS',
                  as: null,
                  join: 'INNER JOIN',
                  on: {
                    type: 'binary_expr',
                    operator: '=',
                    left: {
                      type: 'column_ref',
                      table: 'MEMBERS',
                      column: 'MEMID',
                    },
                    right: {
                      type: 'column_ref',
                      table: 'RECOMMENDERS',
                      column: 'RECOMMENDER',
                    },
                  },
                },
              ],
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            set_op: 'union all',
          },
          columns: [
            { type: 'column_ref', table: null, column: 'RECOMMENDER' },
            { type: 'column_ref', table: null, column: 'MEMBER' },
          ],
          recursive: true,
        },
      ],
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'RECOMMENDERS', column: 'MEMBER' },
          as: 'MEMBER',
        },
        {
          type: 'expr',
          expr: {
            type: 'column_ref',
            table: 'RECOMMENDERS',
            column: 'RECOMMENDER',
          },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'FIRSTNAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          as: null,
        },
      ],
      into: { position: null },
      from: [
        { db: null, table: 'RECOMMENDERS', as: null },
        {
          db: 'CD',
          table: 'MEMBERS',
          as: null,
          join: 'INNER JOIN',
          on: {
            type: 'binary_expr',
            operator: '=',
            left: {
              type: 'column_ref',
              table: 'RECOMMENDERS',
              column: 'RECOMMENDER',
            },
            right: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
          },
        },
      ],
      where: {
        type: 'binary_expr',
        operator: 'OR',
        left: {
          type: 'binary_expr',
          operator: '=',
          left: { type: 'column_ref', table: 'RECOMMENDERS', column: 'MEMBER' },
          right: { type: 'number', value: 22 },
        },
        right: {
          type: 'binary_expr',
          operator: '=',
          left: { type: 'column_ref', table: 'RECOMMENDERS', column: 'MEMBER' },
          right: { type: 'number', value: 12 },
        },
      },
      groupby: null,
      having: null,
      orderby: [
        {
          expr: { type: 'column_ref', table: 'RECOMMENDERS', column: 'MEMBER' },
          type: 'ASC',
          nulls: null,
        },
        {
          expr: {
            type: 'column_ref',
            table: 'RECOMMENDERS',
            column: 'RECOMMENDER',
          },
          type: 'DESC',
          nulls: null,
        },
      ],
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query:
      "SELECT DISTINCT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE FACILITIES.NAME IN ('Tennis Court 2','Tennis Court 1') ORDER BY MEMBERS.SURNAME, FACILITIES.NAME;",
    ast: {
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
              right: { type: 'single_quote_string', value: ' ' },
            },
            right: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
          as: null,
        },
      ],
      into: { position: null },
      from: [
        { db: 'CD', table: 'MEMBERS', as: null },
        {
          db: 'CD',
          table: 'BOOKINGS',
          as: null,
          join: 'INNER JOIN',
          on: {
            type: 'binary_expr',
            operator: '=',
            left: { type: 'column_ref', table: 'MEMBERS', column: 'MEMID' },
            right: { type: 'column_ref', table: 'BOOKINGS', column: 'MEMID' },
          },
        },
        {
          db: 'CD',
          table: 'FACILITIES',
          as: null,
          join: 'INNER JOIN',
          on: {
            type: 'binary_expr',
            operator: '=',
            left: { type: 'column_ref', table: 'BOOKINGS', column: 'FACID' },
            right: { type: 'column_ref', table: 'FACILITIES', column: 'FACID' },
          },
        },
      ],
      where: {
        type: 'binary_expr',
        operator: 'IN',
        left: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
        right: {
          type: 'expr_list',
          value: [
            { type: 'single_quote_string', value: 'Tennis Court 2' },
            { type: 'single_quote_string', value: 'Tennis Court 1' },
          ],
        },
      },
      groupby: null,
      having: null,
      orderby: [
        {
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          type: 'ASC',
          nulls: null,
        },
        {
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
          type: 'ASC',
          nulls: null,
        },
      ],
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query:
      "SELECT MEMBERS.SURNAME, FACILITIES.NAME, COST FROM ( SELECT MEMBERS.FIRSTNAME || ' ' || MEMBERS.SURNAME, FACILITIES.NAME, CASE WHEN MEMBERS.MEMID = 0 THEN BOOKINGS.SLOTS*FACILITIES.GUESTCOST ELSE BOOKINGS.SLOTS*FACILITIES.MEMBERCOST END AS COST FROM CD.MEMBERS INNER JOIN CD.BOOKINGS ON MEMBERS.MEMID = BOOKINGS.MEMID INNER JOIN CD.FACILITIES ON BOOKINGS.FACID = FACILITIES.FACID WHERE BOOKINGS.STARTTIME >= '2012-09-14' AND BOOKINGS.STARTTIME < '2012-09-15' ) AS BOOKINGS WHERE COST > 30 ORDER BY COST DESC;",
    ast: {
      with: null,
      type: 'select',
      options: null,
      distinct: { type: null },
      columns: [
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'MEMBERS', column: 'SURNAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'NAME' },
          as: null,
        },
        {
          type: 'expr',
          expr: { type: 'column_ref', table: null, column: 'COST' },
          as: null,
        },
      ],
      into: { position: null },
      from: [
        {
          prefix: null,
          expr: {
            tableList: ['select::CD::MEMBERS', 'select::CD::BOOKINGS', 'select::CD::FACILITIES'],
            columnList: [
              'select::MEMBERS::SURNAME',
              'select::FACILITIES::NAME',
              'select::null::COST',
              'select::MEMBERS::FIRSTNAME',
              'select::MEMBERS::MEMID',
              'select::BOOKINGS::SLOTS',
              'select::FACILITIES::GUESTCOST',
              'select::FACILITIES::MEMBERCOST',
              'select::BOOKINGS::MEMID',
              'select::BOOKINGS::FACID',
              'select::FACILITIES::FACID',
              'select::BOOKINGS::STARTTIME',
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
                    type: 'binary_expr',
                    operator: '||',
                    left: {
                      type: 'binary_expr',
                      operator: '||',
                      left: {
                        type: 'column_ref',
                        table: 'MEMBERS',
                        column: 'FIRSTNAME',
                      },
                      right: { type: 'single_quote_string', value: ' ' },
                    },
                    right: {
                      type: 'column_ref',
                      table: 'MEMBERS',
                      column: 'SURNAME',
                    },
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
                    type: 'case',
                    expr: null,
                    args: [
                      {
                        type: 'when',
                        cond: {
                          type: 'binary_expr',
                          operator: '=',
                          left: {
                            type: 'column_ref',
                            table: 'MEMBERS',
                            column: 'MEMID',
                          },
                          right: { type: 'number', value: 0 },
                        },
                        result: {
                          type: 'binary_expr',
                          operator: '*',
                          left: {
                            type: 'column_ref',
                            table: 'BOOKINGS',
                            column: 'SLOTS',
                          },
                          right: {
                            type: 'column_ref',
                            table: 'FACILITIES',
                            column: 'GUESTCOST',
                          },
                        },
                      },
                      {
                        type: 'else',
                        result: {
                          type: 'binary_expr',
                          operator: '*',
                          left: {
                            type: 'column_ref',
                            table: 'BOOKINGS',
                            column: 'SLOTS',
                          },
                          right: {
                            type: 'column_ref',
                            table: 'FACILITIES',
                            column: 'MEMBERCOST',
                          },
                        },
                      },
                    ],
                  },
                  as: 'COST',
                },
              ],
              into: { position: null },
              from: [
                { db: 'CD', table: 'MEMBERS', as: null },
                {
                  db: 'CD',
                  table: 'BOOKINGS',
                  as: null,
                  join: 'INNER JOIN',
                  on: {
                    type: 'binary_expr',
                    operator: '=',
                    left: {
                      type: 'column_ref',
                      table: 'MEMBERS',
                      column: 'MEMID',
                    },
                    right: {
                      type: 'column_ref',
                      table: 'BOOKINGS',
                      column: 'MEMID',
                    },
                  },
                },
                {
                  db: 'CD',
                  table: 'FACILITIES',
                  as: null,
                  join: 'INNER JOIN',
                  on: {
                    type: 'binary_expr',
                    operator: '=',
                    left: {
                      type: 'column_ref',
                      table: 'BOOKINGS',
                      column: 'FACID',
                    },
                    right: {
                      type: 'column_ref',
                      table: 'FACILITIES',
                      column: 'FACID',
                    },
                  },
                },
              ],
              where: {
                type: 'binary_expr',
                operator: 'AND',
                left: {
                  type: 'binary_expr',
                  operator: '>=',
                  left: {
                    type: 'column_ref',
                    table: 'BOOKINGS',
                    column: 'STARTTIME',
                  },
                  right: { type: 'single_quote_string', value: '2012-09-14' },
                },
                right: {
                  type: 'binary_expr',
                  operator: '<',
                  left: {
                    type: 'column_ref',
                    table: 'BOOKINGS',
                    column: 'STARTTIME',
                  },
                  right: { type: 'single_quote_string', value: '2012-09-15' },
                },
              },
              groupby: null,
              having: null,
              orderby: null,
              limit: { seperator: '', value: [] },
              window: null,
            },
            parentheses: true,
          },
          as: 'BOOKINGS',
        },
      ],
      where: {
        type: 'binary_expr',
        operator: '>',
        left: { type: 'column_ref', table: null, column: 'COST' },
        right: { type: 'number', value: 30 },
      },
      groupby: null,
      having: null,
      orderby: [
        {
          expr: { type: 'column_ref', table: null, column: 'COST' },
          type: 'DESC',
          nulls: null,
        },
      ],
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query: 'SELECT name, membercost FROM cd.facilities WHERE facid IN (SELECT DISTINCT facid FROM cd.facilities);',
    ast: {
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
          expr: { type: 'column_ref', table: 'FACILITIES', column: 'MEMBERCOST' },
          as: null,
        },
      ],
      into: { position: null },
      from: [{ db: 'CD', table: 'FACILITIES', as: null }],
      where: {
        type: 'binary_expr',
        operator: 'IN',
        left: { type: 'column_ref', table: 'FACILITIES', column: 'FACID' },
        right: {
          type: 'expr_list',
          value: [
            {
              tableList: ['select::CD::FACILITIES'],
              columnList: ['select::FACILITIES::NAME', 'select::FACILITIES::MEMBERCOST', 'select::FACILITIES::FACID'],
              ast: {
                with: null,
                type: 'select',
                options: null,
                distinct: { type: 'DISTINCT' },
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
                where: null,
                groupby: null,
                having: null,
                orderby: null,
                limit: { seperator: '', value: [] },
                window: null,
              },
            },
          ],
        },
      },
      groupby: null,
      having: null,
      orderby: null,
      limit: { seperator: '', value: [] },
      window: null,
    },
  },
  {
    query: 'SELECT f.name, (SELECT membercost FROM cd.facilities x WHERE x.name = f.name) FROM cd.facilities f;',
    ast: {}
  },
  {
    query: 'SELECT x.name, x.membercost FROM (SELECT name, membercost FROM cd.facilities ) as x;',
    ast: {}
  },
  {
    query: 'SELECT name, membercost FROM cd.facilities WHERE facid IN (SELECT DISTINCT facid FROM cd.facilities);',
    ast: {}
  },
  {
    query: 'SELECT name, membercost FROM cd.facilities WHERE facid >= 0 GROUP BY facid, name, membercost HAVING facid IN (SELECT DISTINCT facid FROM cd.facilities);',
    ast: {}
  },
];
