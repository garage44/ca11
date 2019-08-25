<component class="c-devices-permission">

    {{$t('to make audio and video calls, {name} requires your permission to access the camera and microphone on this computer.', {name: app.name}).ca()}}

    <div class="browser-bar">
        <div class="cam-disabled">
            <icon name="cam-disabled" class="cam"/>
        </div>
    </div>

    {{$t('click on the device permission icon in the browser navigation bar to grant permission.').ca()}} 
    {{$t('the icon looks similar to the one above.').ca()}}

</component>
