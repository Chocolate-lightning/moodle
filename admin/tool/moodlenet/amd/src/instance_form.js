import {validation as validator} from 'tool_moodlenet/local/instance_form/validator';

export const init = () => {
    const form = document.querySelector('[data-region="mnet-form"]');
    registerListenerEvents(form);
};

const registerListenerEvents = (form) => {
    form.addEventListener('click', async(e) => {
        // Our fake submit button / browse button.
        if (e.target.matches('[data-action="submit"]')) {
            const passed = validator(form.querySelector('[data-var="mnet-link"]'));
            if (passed) {
                window.console.log('validation passed & now redirect');
                window.location = "https://mathew.solutions";
            } else {
                window.console.log('validation failed & set classes');
            }
        }
    });
};
