<component class="c-page">
    <h1>Call Options</h1>

    <p>
        CA11 has several features to control an ongoing call. Please note
        that not all features are available for each protocol. Each feature
        has a tag next to it, indicating which protocols it supports. At this moment,
        a lot of SIG11 functionality is being implemented, while SIP features were
        already in-place. This will change pretty soon though, so bear with us!
    </p>

    <h2>IVR [SIP]</h2>
    <p>
        <em>IVR</em> - Interactive Voice Response - is typically being used
        to welcome a caller or to redirect a call to the right person in a company.
        Alice and Bob are both working at ISP Acme Corporation to answer callers.
        Alice knows everything about technical questions; Bob deals with financial
        questions. Charlie calls Acme Corporation with a financial question.
        Charlie's call starts with an IVR message:

        <i class="c-page__quote">"Press 1 to talk to Alice, press 2 to talk to Bob..."</i>

        Charlie opens the CA11 keypad during the call and presses number 2, which
        instructs the IVR to route Charlie's call to Bob. Bob's phone is now ringing.
        He picks up the phone and now talks with Charlie.
    </p>

    <h2>On-hold [SIP, SIG11]</h2>
    <p>
        Bob is in a call with Charlie. Charlie is asking if Acme Corporation
        can confirm that Charlie paid his invoice. Bob needs to dive into some
        financial records, that require him to focus on the task. He asks Charlie
        if he can put him <em>On-hold</em> in the meanwhile, so he doesn't get
        distracted. Charlie doesn't mind, as long as it helps his cause.
    </p>
    <p>
        Bob presses the <em>On-hold</em> button. Charlie doesn't hear
        Bob anymore, but instead is entertained by lift music,
        while Bob now has room to concentrate on his task. Bob finds out that
        Acme Corporation received Charlie's payment one day ago, and gets back
        to Charlie with the happy news after pressing the <em>On-hold</em> button
        again.
    </p>


    <h2>Transfer [SIP]</h2>
    <p>
        Charlie is still on the phone with Bob; who just solved Charlie's
        financial perils. Besides, Charlie also has complaints about a
        malfunctioning internet router, that he leases from Acme Corporation.
        <img class="illustration right shadow" src="/screens/bob-call-sip-transfer-init-alice-charlie.png"/>
        <br/><br/>

        Bob explains that he can transfer Charlie to the technical support
        division, so someone like Alice can further help Charlie.
        Bob presses the <em>Toggle Transfer</em> button, which puts the call
        on hold and opens the Transfer dialog.

        He types Alice her internal number in the phonenumber input and presses
        the Call button. Alice picks up Bob's incoming call. Bob explains
        Charlie's situation to Alice and asks her to take over the call.
        Bob presses the <em>Finalize Transfer</em> button. Charlie is now
        calling with Alice. Bob's calls to Alice and Charlie are automatically
        ended.
    </p>

    <h2>Mute microphone [SIP, SIG11]</h2>
    <p>
        Alice stumbled in a call with Charlie, after Charlie was blindly transferred by
        hasty Bob. Her colleague Mallory - sitting next to Alice - notices
        that Alice is irritated about Charlie's unannounced call(thanks Bob!).
        She makes a gesture to Alice to put the microphone on mute. Alice selects
        the audio stream and clicks on the <em>Mute Microphone</em> button,
        so she can have a short private conversation with Mallory about Bob,
        while Charlie continues ranting about his broken internet router
        from Acme Corporation.
    </p>
    <p>
        This situation offcourse doesn't apply when Charlie is in a video call
        with Alice. The mute microphone functionality can also be useful for
        supressing coughing sounds though.
    </p>

    <h2>DND (Do Not Disturb) [SIP, SIG11]</h2>
    <p>
        Alice just finished a tiring call with Charlie, so she could use a break.
        She toggles the <em>DND</em> switch in the status bar, which makes
        her unreachable for new incoming calls. Mallory is still available
        and takes over any incoming new calls in the meanwhile.
    </p>
</component>
