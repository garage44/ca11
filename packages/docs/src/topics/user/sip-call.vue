<component class="c-page">
    <h1>SIP Calls</h1>
    <p>
        <b>Disclaimer:</b><br/>
        <i>
            {{app.name}} supports calls from and to legacy Telecom networks using the
            SIP protocol, but the {{vendor.name}} company is not a Telecom provider.
            In no event will {{vendor.name}} be liable for any loss, damage or fraud
            that might result from using {{app.name}} with a third-party SIP service.
        </i>
    </p>
    <p>
        Enabling {{app.name}}'s SIP feature enhances your call reach to traditional
        telephony networks. You can basically call and be called  by anything from
        a landline, to a mobile, a service number or any device that communicates
        using the SIP protocol. Please note that, in comparison to SIG11 calls,
        SIP calls are only encrypted between you and your SIP service provider.
        SIG11 calls are end-to-end encrypted between you and your callee/caller.
    </p>
    <p>
        Please note that most VoIP providers don't support WebRTC yet. {{app.name}}'s
         A compatible
        VoIP provider needs to support SIP-over-WSS and
        depends on
        Ask your VoIP provider when you're not sure about WebRTC support, or setup
        <router-link :to="{name: 'view_developer_topic', params: {topic_id: 'asterisk'}}">your own PBX</router-link>
        if you have a technical background. SIP integration needs to be manually enabled from the
        <em>Settings</em> menu<i class="instruction__ref">1</i>at the SIP tab section.
    </p>

    <ol class="instructions steps">
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-sip-enabled.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            The SIP Domain is the address to the WebSocket SIP gateway
            of your provider. The SIP Extension and SIP Password are
            the same credentials you would use for a regular hardphone
            or softphone.
            </div>
        </li>
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-call-sip-setup-bob.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            Toggle SIP and saving settings will enable the SIP service.
            SIP calling is active when the SIP status icon in the status
            bar is visible and green. Next, select the Calls menu option
            to view the CA11 keypad. Switch to the SIP protocol,
            type a number and start the call!
            </div>
        </li>

        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-call-sip-talking-bob.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            Alice is initializing the call to Bob. Bob's phone should
            start ringing or the call may end if he's busy. The call will
            start as soon Bob picks up the phone.
            </div>
        </li>

        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/bob-call-sip-talking-alice.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            This is how the Bob sees the (video)call when its picked
            up. The actual video screen here is from an automated test.
            Normally, this would be the webcam feed of the other user
            in case of a video call.
            </div>
        </li>
    </ol>
</component>
