// App-specific scope sections.
const appSections = [
    { value: 'api', name: 'API-endpoints' },
    { value: 'express', name: 'Express & HTTP logic' },
    { value: 'pdf', name: 'PDF rendering logic' },
    { value: 'puppeteer', name: 'Puppeteer & Pooling logic' }
]

module.exports = {
    types: [
        {
            value: 'chore',
            name: 'chore:    Build system, dependencies & auxiliary commits'
        },
        { value: 'docs', name: 'docs:     Documentation updates' },
        { value: 'feat', name: 'feat:     New feature' },
        { value: 'fix', name: 'fix:      Bug fix' },
        { value: 'perf', name: 'perf:     Performance improvement' },
        {
            value: 'ref',
            name:
                'ref:      Refactor: Structure, readability and high impact code changes'
        },
        { value: 'rev', name: 'rev:      Revert: Reverts a previous commit' },
        {
            value: 'qa',
            name: 'qa:       Quality Assurance: CI, tests, linting, formatting'
        }
    ],
    scopeOverrides: {
        chore: [
            { value: 'build', name: 'build: Build system adjustments' },
            { value: 'deps', name: 'deps:  Update Dependencies' }
        ],
        docs: [
            { value: 'code', name: 'code: Code documentation' },
            { value: 'dev', name: 'dev:  Developer instructions' },
            { value: 'user', name: 'user: User instructions' }
        ],
        feat: appSections,
        fix: appSections,
        perf: [
            { value: 'cpu', name: 'cpu: Improve handling of CPU resources' },
            { value: 'io', name: 'io:  Less disk IO' },
            { value: 'mem', name: 'mem: Improve memory footprint' },
            { value: 'sql', name: 'sql: Less queries, more efficient queries' }
        ],
        ref: [
            {
                value: 'init',
                name: 'init:   Major code commits during initial project phase'
            },
            { value: 'read', name: 'read:   Improves readability' },
            { value: 'rewrite', name: 'rewrite: Major code rewrite' },
            { value: 'structure', name: 'org: Code organisation & structure' }
        ],
        rev: [
            { value: 'bug', name: 'bug:   Criticial bug in production' },
            {
                value: 'req',
                name: 'imp:   Incorrect implementation (not in production)'
            }
        ],
        qa: [
            { value: 'ci', name: 'ci:     Continuous Integration' },
            {
                value: 'format',
                name: 'format: Formatting & low-risk cleanup actions'
            },
            { value: 'test', name: 'test:   Tests and Testing code changes' },
            {
                value: 'lint',
                name: 'lint:   Linting rule changes and definitions'
            }
        ]
    },
    messages: {
        type: "Select the type of change that you're committing:",
        scope: 'What is the scope of this change:',
        customScope: 'Denote the SCOPE of this change (press enter to skip):\n',
        subject: 'Write a SHORT, IMPERATIVE subject for the change:\n',
        body:
            'Optional - Provide a LONGER body to describe the change (press enter to skip):\n',
        breaking: 'Describe any BREAKING CHANGES (press enter to skip):\n',
        confirmCommit: 'Are you sure you want to proceed with the commit above?'
    },

    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix', 'perf', 'refactor'],
    skipQuestions: ['footer'],
    subjectLimit: 100,
    ticketNumberPrefix: 'SIM-',
    isTicketNumberRequired: true,
    allowTicketNumber: true
}
