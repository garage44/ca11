<component class="c-page">
    <h1>Start your Phone</h1>
    <p>
        When you initially open <a :href="vendor.website">{{app.name}}</a><i class="instruction__ref">1</i>,
        you will notice input fields for a <em>Phone Name</em> and a <em>Phone Password</em>.
        These are used to create a <em>Session</em> with. A session in {{app.name}} is an
        encrypted container for your data, that keeps it safe and locally stored in your browser.
        Your data is stored locally, because there is no technical reason to store
        it in the cloud.
    </p>

    <ol class="instructions steps">
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-new-session.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            The <em>Phone Name</em> and <em>Phone Password</em> can be anything;
            just make sure that it is easy for you, and just you, to remember!
            </div>
        </li>
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-new-session-filled.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            After filling the <em>Phone Name</em> and <em>Phone Password</em>,
            all you have to do is to click on the <em>Start your Phone</em>
            button. This will start a quick setup to get you started
            with your {{app.name}} phone.
            </div>
        </li>
    </ol>

    <p>
        The default behaviour for a session is <em>Auto-unlock</em>.
        This means that the key to decrypt your data is stored <em>with</em> the
        data, so you don't have to manually unlock your session with the password
        after a browser restart. You can also close the CA11 session manually,
        by logging out. This removes the key and requires you to enter the password
        again on next login.
    </p>

    <p class="instruction__warn">
        Please be aware that removing a <em>Session</em> implies removing all of
        your settings, contacts and local activity history.

        Session data is stored in a browser's local storage. The {{app.name}}
        PWA shares storage with the rest of the browser. Clearing your
        browser history will also remove your {{app.name}} session data.
    </p>
</component>
