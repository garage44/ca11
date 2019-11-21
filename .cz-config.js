// App-specific scope sections.
const appSections = [
    {value: 'vue', name: 'vue:  UI/View code'},
    {value: 'webrtc', name: 'webrtc:    WebRTC logic'},
    {value: 'crypto', name: 'crypto:  Cryptography changes'},
    {value: 'sig11', name: 'sig11:     SIG11 functionality'},
    {value: 'sip', name: 'sip:     SIP functionality'},
];

module.exports = {
    types: [
        {value: 'feat', name: 'feat:     New feature'},
        {value: 'fix', name: 'fix:      Bug fix'},
        {value: 'docs', name: 'docs:     Documentation only changes'},
        {value: 'style', name: 'style:    Formatting changes that do not affect the meaning of the code'},
        {value: 'refactor', name: 'refactor: Code complexity & Readability'},
        {value: 'perf', name: 'perf:     Performance improvements'},
        {value: 'test', name: 'test:     Test, linting, CI'},
        {value: 'chore', name: 'chore:    Process, Build, dependencies & auxiliary commits'}
    ],
    scopeOverrides: {
        feat: appSections,
        fix: appSections,
        docs: [
            { value: 'dev', name: 'dev:  Developer documentation'},
            { value: 'user', name: 'user: User documentation'}
        ],
        style: [
            { value: 'js', name: 'js: Javascript-related styling changes'}
        ],
        refactor: appSections,
        perf: [
            {value: 'code', name: 'code:  Code execution improvement'},
            {value: 'proc', name: 'proc:  Process improvement'}
        ],
        test: [
            {value: 'ci', name: 'ci:     Continuous Integration'},
            {value: 'lint', name: 'lint:   Linting rule changes and definitions'}
        ],
        chore: [
            {value: 'build', name: 'build: Build process (i.e. transpilation)'},
            {value: 'deps', name: 'deps:  Dependency updates'}
        ]
    },
    messages: {
        type: "Select the type of change that you're committing:",
        scope: 'What is the scope of this change:',
        customScope: 'Denote the SCOPE of this change (press enter to skip):\n',
        subject: 'Write a SHORT, IMPERATIVE subject for the change:\n',
        body: 'Provide a LONGER body to describe the change (press enter to skip):\n',
        breaking: 'Describe any BREAKING CHANGES (press enter to skip):\n',
        confirmCommit: 'Are you sure you want to proceed with the commit above?'
    },

    allowCustomScopes: true,
    allowBreakingChanges: ['feat', 'fix', 'perf', 'refactor'],
    skipQuestions: ['footer'],
    subjectLimit: 100,
    ticketNumberPrefix: '#',
    isTicketNumberRequired: false,
    allowTicketNumber: true
};
