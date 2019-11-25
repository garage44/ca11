<component class="c-page">
    <h1>Quick Setup</h1>
    <p>
        After starting your {{app.name}} phone with a new session, {{app.name}}
        will walk you through a few steps to get you up and running. The first step<i class="instruction__ref">1</i>
        is to choose the number where people can call you on.
    </p>

    <ol class="instructions steps">
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-wizard-sig11.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            The <em>Display Name</em> and the <em>SIG11 Identifier</em>
            are what people see on their {{app.name}} phone when you call
            them. The SIG11 Identifier can be your own phonenumber or any
            random number you like.

            You can decide from this step to go back and close the session
            or to proceed to the next step.
            </div>
        </li>
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-wizard-click-to-dial.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
            Open <em>tel:</em> hyperlinks with {{app.name}} is particulary
            useful when you browse the web and want to open {{app.name}}
            automatically with the filled number, just by clicking on a number
            on a webpage.
            </div>
        </li>

        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-wizard-devices.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
                This step is to give permission to use your audio device and
                to setup audio. You are likely to have a separate Bluetooth/
                USB headset installed. In the Device setup, you can assign
                devices to several tasks, like on which device the Ringtone
                should play.
            </div>
        </li>
        <li class="instruction">
            <div class="instruction__image">
                <img src="/screens/alice-wizard-telemetry.png"/>
            </div>
            <div class="instruction__counter"></div>
            <div class="instruction__text">
                By enabling this option, you allow semi-anonimized bug reports to be
                sent to an external service for bug tracking. Choose <em>Deny</em> if
                you're not comfortable with this.
            </div>
        </li>
    </ol>
</component>
