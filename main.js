'use strict'

{
    function showHeader() {
        console.log('Header');
    }

    const showUsers = async () => {
        try
        {
            const response = await fetch('https://dotinstall.github.io/setup/fetchapi/users.json');
            const users = await response.json();
            console.log(users);
        }
        catch (err)
        {
            console.log('Something went wrong getting user data');
            console.log('Error log: ' + err);
        }    
    }

    function showFooter() {
        console.log('Footer');
    }

    showHeader();
    showUsers();
    showFooter();
}