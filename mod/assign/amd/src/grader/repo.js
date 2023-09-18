import Ajax from 'core/ajax';

export const foo = (userid, cmid) => {
    const request = {
        methodname: 'mod_assign_get_participant',
        args: {
            userid: userid,
            assignid: cmid,
            embeduser: true
        },
    };
    return Ajax.call([request])[0];
};
