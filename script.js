window.fbAsyncInit = function() {
    FB.init({
        appId: 'YOUR_FACEBOOK_APP_ID',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v21.0'
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginFacebook() {
    FB.login(function(response) {
        if (response.status === 'connected') {
            document.getElementById('status').innerText = 'Status: Logged in to Facebook';
            fetchProfiles(response.authResponse.userID, response.authResponse.accessToken);
        } else {
            document.getElementById('status').innerText = 'Status: Facebook login failed';
        }
    }, { scope: 'public_profile,user_photos,publish_to_groups' });
}

function fetchProfiles(userId, accessToken) {
    FB.api('/me', { fields: 'profiles,name' }, function(response) {
        const profileSelect = document.getElementById('profileSelect');
        profileSelect.innerHTML = '<option value="">Select a profile</option>';
        response.profiles.data.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.id;
            option.textContent = profile.name;
            profileSelect.appendChild(option);
        });
        FB.api(`/${userId}/picture`, { type: 'large', redirect: false }, function(picResponse) {
            document.getElementById('profilePic').src = picResponse.data.url;
            document.getElementById('profileName').textContent = response.name || 'Main Profile';
        });
    });
}

function startAutomation() {
    const message = document.getElementById('message').value;
    const sheetLink = document.getElementById('sheetLink').value;
    const profileId = document.getElementById('profileSelect').value;
    const delay = 30;
    if (!message || !sheetLink || !profileId) {
        alert('Please enter a message, Google Sheet link, and select a profile.');
        return;
    }
    document.getElementById('status').innerText = 'Status: Starting automation with 30-second delay...';
    fetchClients();
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            fetch('YOUR_MAKE_WEBHOOK_URL', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, sheetLink, profileId, delay })
            }).then(response => {
                document.getElementById('status').innerText = 'Status: Automation started!';
            }).catch(error => {
                document.getElementById('status').innerText = `Status: Error: ${error.message}`;
            });
        } else {
            alert('Please log in to Facebook first.');
        }
    });
}

function stopAutomation() {
    document.getElementById('status').innerText = 'Status: Automation stopped.';
    fetch('YOUR_MAKE_STOP_WEBHOOK_URL', {
        method: 'POST'
    }).catch(error => {
        document.getElementById('status').innerText = `Status: Error stopping automation: ${error.message}`;
    });
}

function fetchClients() {
    const clients = [
        { name: 'Client 1', link: 'https://facebook.com/client1', status: 'Pending' },
        { name: 'Client 2', link: 'https://facebook.com/client2', status: 'Pending' }
    ];
    const tableBody = document.getElementById('clientTableBody');
    tableBody.innerHTML = '';
    clients.forEach(client => {
        const row = `<tr><td>${client.name}</td><td><a href="${client.link}">${client.link}</a></td><td>${client.status}</td></tr>`;
        tableBody.innerHTML += row;
    });
}

function toggleTheme() {
    document.body.dataset.theme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
}