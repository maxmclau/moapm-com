(function () {
    'use strict';

    const form = document.getElementById('signin-form');

    const idCont = document.getElementById('moa-id');
    const idInput = idCont.getElementsByClassName('id-input')[0];

    const passwordCont = document.getElementById('password');
    const passwordInput = document.getElementsByClassName('password-input')[0];

    const individualsCont = idCont.getElementsByClassName('individuals')[0];
    const idKeys = individualsCont.getElementsByTagName('input');

    if(idKeys[0].value != '') pop(idCont, idKeys[0]); // occassionally character will be left filled when returning to page

    Array.prototype.forEach.call(idKeys, el => {
        el.addEventListener('keydown', e => {
            if(e.keyCode > 31 && (e.keyCode < 48 || e.keyCode > 57)) e.preventDefault(); // if not a number
            
            if(e.keyCode == 8 && el.value == '' && el.previousElementSibling) el.previousElementSibling.focus(); // if backspace

            if(e.keyCode == 37 && el.previousElementSibling) el.previousElementSibling.focus(); // if left arrow
            if(e.keyCode == 39 && el.nextElementSibling) el.nextElementSibling.focus(); // if left arrow
        });

        el.addEventListener('keyup', e => {
            let entered = ''; // storage of all idKeys values
    
            Array.prototype.forEach.call(idKeys, el => {
                entered += el.value;
            });

            idInput.value = entered; // update id input with value of individuals

            if(e.keyCode >= 48 && e.keyCode <= 57 && el.value != '' && el.nextElementSibling) el.nextElementSibling.focus();
            else if(e.keyCode >= 48 && e.keyCode <= 57 && !el.nextElementSibling ) passwordInput.focus();

            if(el.value != '' && e.keyCode == 8) el.value = '';
        });

        el.addEventListener('blur', e => { // leaving input before typing
            if(idInput.value == '' && idKeys[0].value == '') { 
                idCont.classList.replace('active', 'inactive')
            };
        });

        el.addEventListener('focus', e => {pop(idCont, idKeys[0]);});
    });

    idCont.addEventListener('click', e => {pop(idCont, idKeys[0]);});
    passwordCont.addEventListener('click', e => {pop(passwordCont, passwordInput);});
    passwordInput.addEventListener('focus', e => {pop(passwordCont, passwordInput);});

    passwordInput.addEventListener('blur', e => {
        if(passwordInput.value == '') {
            password.classList.replace('active', 'inactive')
        };
    });

    form.addEventListener('submit', e => {
        e.preventDefault();

        const fd = new FormData(form);
        const xhr = new XMLHttpRequest();

        xhr.addEventListener("load", e => {
            switch(xhr.status) {
                case 200:
                    const dest = (document.URL.split('#').length > 1) ? document.URL.split('#')[1] : null;

                    if(dest) window.location.href = document.location.origin + "/" + dest;
                    else window.location.href = document.location.origin;
                    break;
                case 401:
                    document.getElementById('♥').classList.add('error');
                    form.classList.add('failed');
                    break;
            }
        });

        xhr.addEventListener("error", e => {
            console.log(e);
        });

        xhr.open("POST", form.action);
        
        xhr.send(fd);
    });

    function pop(cont, focus) {
        if(cont.classList.contains('inactive')) {
            focus.focus();

            cont.classList.replace('inactive', 'active');
        }
    }
})();

    