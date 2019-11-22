<component class="c-page">
    <h1>Platforms</h1>

    <h2>CA11 Webview</h2>
    <p>
    CA11 webview is the default build target and is the preferred target
    during development. It has the fastest development feedback
    loop. Code automatically rebuilds as you make filechanges,
    while the buildsystem automatically reloads the
    browser using <a href="https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)">
    livereload</a>. Use it when you are not developing platform-specific
    code. Start developing with:
<pre v-highlightjs><code class="bash">gulp develop</code></pre>
    </p>


    <h2>CA11 PWA</h2>
    <p>
     It is the CA11 PWA minus the serviceworker
    and manifest. is the default build platform, but CA11 Electron also a build target,
    but CA11 PWA is the preferred workflow during development.
    </p>


<pre v-highlightjs><code class="bash">gulp develop --target firefox</code></pre>
    <p>
        Navigate to <code>about:debugging</code> and switch <i>Enable add-on debugging</i> on. Select
        <i>Load Temporary Add-on</i> and point it to the <i>manifest.json</i> file in the <code>build/firefox</code>
        directory.
    </p>

    <h2>CA11 Electron</h2>
    <p>
        CA11 Electron uses the Electron runtime to execute CA11 as a desktop app.
        A compatible Electron version from npm is already installed on your system
        after you installed the dependencies through npm. To make a desktop build:
    </p>
<pre v-highlightjs><code class="bash">gulp build --target electron
./node_modules/electron/dist/electron build/ca11/electron/main.js
</code></pre>
</component>
