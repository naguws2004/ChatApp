// common/utilities.js
import Cookies from 'js-cookie';

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        // Generate a random number between 0 and 8 (inclusive)
        const randomIndex = Math.floor(Math.random() * 9);
        color += letters[randomIndex];
    }
    return color.toString();
};

export function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
}

export function setCookie(cookieName, cookieValue) {
    const cookieOptions = { secure: true, sameSite: 'strict' };
    Cookies.set(cookieName, cookieValue, cookieOptions);
}

export function getCookie(cookieName) {
    try {
        const uidCookie = Cookies.get(cookieName);
        return uidCookie.toString();
    } catch (error) {
        return '';
    }
}

export function removeCookie(cookieName) {
    Cookies.remove(cookieName);
}
