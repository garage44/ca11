<component class="c-page">
    <h1>Themes & Plugins</h1>

    <h2>Themes</h2>
    <p>
        CA11's styling is SCSS-based and depends on a couple of variables. The color palette itself can be changed in <code>.ca11rc</code>
        to match a custom brand. The theme is a <a href="https://github.com/garage11/ca11-theme-default">package</a>
        that can be swapped in the config. Just fork the repository and include your own branding files.
        All brand-related material is separated from the CA11 core, to make it easy to adapt
        CA11 to any brand.
    </p>

    <h2>Plugins</h2>
    <p>
        CA11 has an <em>experimental</em> plugin system. There is a config section in
        <code>.ca11rc</code> where plugins can be added. The <em>builtin</em> plugins are
        existing plugins in CA11 core that can be augmented. Custom plugins are new plugins
        that can be added to CA11's core functionality. The source-code is your friend while
        the whole system is still in flux.
    </p>

<pre v-highlightjs><code class="json">"plugins": {
    "builtin": {
        "contacts": {
            "i18n": ["ca11-provider-contacts-customname"],
            "providers": ["ca11-provider-contacts-customname"]
        }
    },
    "custom": {
        "queues": {
            "name": "ca11-custom-mod",
            "parts": ["bg", "fg", "i18n"]
        }
    }
}
</code></pre>
<br/>
    <h3>API's</h3>
    <p>
        CA11 doesn't include an API client like Axios by default. All communication
        flows through Websockets(SIP/SIG11). You're free to add REST API functionality
        in a plugin offcourse. You can test API-calls during CA11 development without
        the need for CORS:
    </p>
<pre v-highlightjs><code class="bash">chromium --ignore-certificate-error --disable-web-security --user-data-dir=~/.chromium-temp</code></pre>
</component>
