# flow-control
Examples of flow control

## Problem

Suppose your application has a forgot password functionality.
A possible flow considering HTTP requests is:
- post email to /password
- check if user exists from email
- if email exists get user id
- create resetCode
- send email to user email
- reply to request

Actually the interesting part comes afterwards, the reset password steps.
- post reset password with new pass and resetCode
- check if resetCode exist
- if does NOT exist stop flow and reply with 404
- if does exist check that has not been used
- check if it is not expired
- check that password and confirm password are identical
- get user from resetCode entry
- update password
- invalidate resetCode
- reply success

For the implementation check 'reset_password.js'. Here a snippet:
```js
module.exports = {
  create:pipeP(
    partial(getUser,[rawState]),
    partial(createResetCode,[rawState]),
    partial(sendEmail,[rawState])
  ),
  set:pipeP(
    partial(checkResetCode,[rawState]),
    partial(setUserId,[rawState]),
    partial(getUser,[rawState]),
    partial(validatePass,[rawState]),
    partial(hashPass,[rawState]),
    partial(updateUser,[rawState]),
    partial(invalidateResetCode,[rawState])
  )
};
```
