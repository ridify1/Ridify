exports.signUpTemplate = (name, otp) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your RIDIFY Verification Code</title>
    <style>
        @media screen and (max-width: 600px) {
            .content { padding: 20px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 8px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        
                        <!-- Header / Logo Area -->
                        <tr>
                            <td align="center" style="padding: 30px 20px 10px 20px;">
                                <h1 style="margin: 0; color: #00d2ff; font-size: 28px; font-weight: 800; letter-spacing: -1px;">RIDIFY</h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="content" style="padding: 30px 40px; text-align: center; color: #1f2937;">
                                <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700;">Welcome, ${name}!</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px; color: #4b5563;">
                                    We're excited to have you onboard. Use the verification code below to finish setting up your account:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                    <span class="otp-code" style="font-family: monospace; font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #111827; display: block;">
                                        ${otp}
                                    </span>
                                </div>

                                <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
                                    This code will expire in 10 minutes. <br>
                                    If you didn't request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Simple Footer -->
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #ffffff; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
                                <p style="margin: 0;">&copy; 2026 RIDIFY. The easiest way to share costs.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}

exports.resetPasswordTemplate = (data)=> {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your RIDIFY Password</title>
    <style>
        /* Mobile Styles */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 6px !important; }
            .content { padding: 30px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <!-- Main Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Brand Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #00d2ff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">RIDIFY</h1>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">
                                <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Password Reset</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px; color: #666666;">
                                    Hi ${data.name}, we received a request to reset your password. Use the code below to proceed:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #f8fafc; border: 2px dashed #00d2ff; border-radius: 12px; padding: 25px; margin: 20px 0;">
                                    <span class="otp-code" style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 10px; color: #1a1a1a; display: block;">
                                        ${data.otp}
                                    </span>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin-top: 25px; line-height: 1.4;">
                                    This code is valid for <strong>15 minutes</strong>. <br>
                                    If you didn't request this, please ignore this email or contact support if you're concerned about your account security.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 RIDIFY App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Help Center</a> • 
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Security Tips</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}

exports.resetPasswordSuccessfulTemplate = (name)=> {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .cta-button { width: 100% !important; box-sizing: border-box; text-align: center; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #00d2ff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">RIDIFY</h1>
                            </td>
                        </tr>

                        <!-- Success Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">
                                <!-- Success Icon (Simple Circle Check) -->
                                <div style="margin-bottom: 20px; font-size: 50px; color: #10b981;">✓</div>
                                
                                <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Password Reset Successful</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, your password for <strong>RIDIFY</strong> has been successfully updated. You can now log back into your account using your new credentials.
                                </p>
                                
                                <!-- CTA Button -->
                                <a href="https://maternalpath.app" class="cta-button" style="display: inline-block; background-color: #00d2ff; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Log In to RIDIFY
                                </a>

                                <!-- Security Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 40px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't do this?</strong> If you did not reset your password, please secure your account immediately by contacting our support team.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 RIDIFY App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Security Settings</a> • 
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}
exports.changePasswordSuccessfulTemplate = (name)=> {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed Successfully</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .cta-button { width: 100% !important; box-sizing: border-box; text-align: center; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #00d2ff; font-size: 24px; font-weight: 800; letter-spacing: 1px;">RIDIFY</h1>
                            </td>
                        </tr>

                        <!-- Success Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">
                                <!-- Success Icon (Simple Circle Check) -->
                                <div style="margin-bottom: 20px; font-size: 50px; color: #10b981;">✓</div>
                                
                                <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Password Reset Successful</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, your password for <strong>RIDIFY</strong> has been successfully updated. You can now log back into your account using your new credentials.
                                </p>
                                
                                <!-- CTA Button -->
                                <a href="https://maternalpath.app" class="cta-button" style="display: inline-block; background-color: #00d2ff; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Log In to RIDIFY
                                </a>

                                <!-- Security Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 40px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't do this?</strong> If you did not reset your password, please secure your account immediately by contacting our support team.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 RIDIFY App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Security Settings</a> • 
                                    <a href="#" style="color: #00d2ff; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}

exports.kycDeniedTemplate = (name, reason) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your RIDIFY KYC Verification Update</title>
    <style>
        @media screen and (max-width: 600px) {
            .content { padding: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">

                        <!-- Header / Logo Area -->
                        <tr>
                            <td align="center" style="padding: 30px 20px 10px 20px;">
                                <h1 style="margin: 0; color: #00d2ff; font-size: 28px; font-weight: 800; letter-spacing: -1px;">RIDIFY</h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="content" style="padding: 30px 40px; text-align: center; color: #1f2937;">
                                <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700;">Hi ${name},</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px; color: #4b5563;">
                                    Thank you for submitting your KYC details. Unfortunately, we were unable to verify your information at this time.
                                </p>

                                <!-- Reason Box -->
                                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left;">
                                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Reason for denial
                                    </p>
                                    <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #7f1d1d;">
                                        ${reason || 'The documents provided could not be verified.'}
                                    </p>
                                </div>

                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 8px; color: #4b5563;">
                                    To try again, please make sure that:
                                </p>
                                <ul style="text-align: left; font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 auto 24px; padding-left: 20px; max-width: 360px;">
                                    <li>Your ID is valid, not expired, and clearly readable</li>
                                    <li>Your selfie is well lit and shows your face clearly</li>
                                    <li>Your details match the name on your ID exactly</li>
                                </ul>

                                <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
                                    Need help? Reply to this email and our support team will assist you. <br>
                                    If you didn't submit this request, please contact us right away.
                                </p>
                            </td>
                        </tr>

                        <!-- Simple Footer -->
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #ffffff; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
                                <p style="margin: 0;">&copy; 2026 RIDIFY. The easiest way to share costs.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}

// Escapes admin/user-supplied text before placing it in HTML
const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

exports.deleteUserTemplate = (name, reason) => {
    const safeName = escapeHtml(name)
    const safeReason = escapeHtml(
        reason || 'Your account was removed for violating our community guidelines.'
    )

    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your RIDIFY Account Has Been Removed</title>
    <style>
        @media screen and (max-width: 600px) {
            .content { padding: 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">

                        <!-- Header / Logo Area -->
                        <tr>
                            <td align="center" style="padding: 30px 20px 10px 20px;">
                                <h1 style="margin: 0; color: #00d2ff; font-size: 28px; font-weight: 800; letter-spacing: -1px;">RIDIFY</h1>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="content" style="padding: 30px 40px; text-align: center; color: #1f2937;">
                                <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700;">Hi ${safeName},</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 24px; color: #4b5563;">
                                    We're writing to let you know that your RIDIFY account has been removed by our administrators. You will no longer be able to log in or use our services.
                                </p>

                                <!-- Reason Box -->
                                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left;">
                                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">
                                        Reason for removal
                                    </p>
                                    <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #7f1d1d;">
                                        ${safeReason}
                                    </p>
                                </div>

                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 8px; color: #4b5563;">
                                    What this means for you:
                                </p>
                                <ul style="text-align: left; font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 auto 24px; padding-left: 20px; max-width: 360px;">
                                    <li>You can no longer sign in to your account</li>
                                    <li>Your active sessions have been ended</li>
                                    <li>You are unable to create a new account with the same details</li>
                                </ul>

                                <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
                                    If you believe this was a mistake, reply to this email and our support team will review your case. <br>
                                    Please include any information that may help us look into it.
                                </p>
                            </td>
                        </tr>

                        <!-- Simple Footer -->
                        <tr>
                            <td align="center" style="padding: 20px; background-color: #ffffff; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
                                <p style="margin: 0;">&copy; 2026 RIDIFY. The easiest way to share costs.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}