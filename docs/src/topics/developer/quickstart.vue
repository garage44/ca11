<component class="c-page">
    <h1>Quickstart</h1>
    <p>
        CA11 applies a simple but powerful reactive data-oriented design based on Vue.js. This allows CA11
        to be developed at a very fast pace while keeping code maintainable and flexible to adapt. The CA11
        softphone is targetting desktop and mobile web platforms.
    </p>
    <p>
        CA11 builds as a PWA and as an Electron desktop application. Headless mode in Node.js is implemented
        partially for tests. Let's start with building CA11 to begin with. You need a recent version of Chrome
        or Chromium (70+), Node.js(11+), Yarn and GIT. Then install CA11 like:
    </p>

<pre v-highlightjs><code class="bash">git clone git@github.com:ca11/ca11.git
cd ca11
yarn
cp ./.ca11rc.example ~/.ca11rc
</code></pre>

    <p>
        CA11 uses the <a href="https://gulpjs.com/">Gulp</a> build system,
        a configuration file(<code>.ca11rc</code>) and runtime flags to
        determine how to build CA11. The build system is quite flexible
        and allows you to automate all kinds of tasks. Type the following
        to see the available options:
<pre v-highlightjs><code class="bash">gulp</code></pre>
    </p>

    <p>
        Creating the default PWA build and launching the development services
        is straightforward:
    </p>

<pre v-highlightjs><code class="bash">gulp develop</code></pre>

    <p>
        Open a Chrome/Chromium browser to <code>http://localhost:3000</code> to
        try CA11 PWA.
    </p>

</component>
