import os
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    @staticmethod
    def send_otp_email(to_email: str, otp_code: str) -> bool:
        smtp_server = os.getenv("SMTP_SERVER", "")
        smtp_port = os.getenv("SMTP_PORT", "")
        smtp_username = os.getenv("SMTP_USERNAME", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        smtp_from = os.getenv("SMTP_FROM", smtp_username or "noreply@bookophilic.com")

        # Auto-detect common email provider settings if server/port are not explicitly provided
        if smtp_username and not smtp_server:
            clean_username = smtp_username.strip().lower()
            if clean_username.endswith("@gmail.com"):
                smtp_server = "smtp.gmail.com"
                if not smtp_port:
                    smtp_port = "587"
            elif clean_username.endswith("@outlook.com") or clean_username.endswith("@hotmail.com"):
                smtp_server = "smtp.office365.com"
                if not smtp_port:
                    smtp_port = "587"
            elif clean_username.endswith("@yahoo.com"):
                smtp_server = "smtp.mail.yahoo.com"
                if not smtp_port:
                    smtp_port = "465"

        subject = "Bookophilic - Password Reset OTP"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 20px; border-radius: 10px;">
                <div style="max-width: 600px; margin: 0 auto; text-align: center; border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 15px;">
                    <h2 style="color: #a78bfa; margin-bottom: 20px;">Bookophilic Study Room</h2>
                    <p style="font-size: 16px; color: #94a3b8;">You have requested to reset your password. Please use the following One-Time Password (OTP) to continue:</p>
                    <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #ec4899; margin: 25px 0; border: 1px solid rgba(255,255,255,0.05); display: inline-block; padding-left: 20px; padding-right: 20px;">
                        {otp_code}
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 25px;">This OTP is valid for 10 minutes. If you did not make this request, please ignore this email.</p>
                </div>
            </body>
        </html>
        """

        # Log OTP to console/terminal (critical fallback/development feedback loop)
        print("\n" + "="*50)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] OTP EMAIL TRIGGERED FOR: {to_email}")
        print(f"OTP CODE: {otp_code}")
        print("="*50 + "\n")

        if not smtp_server or not smtp_username or not smtp_password:
            print("Warning: SMTP settings not configured in environment. OTP has been logged to console above.")
            return False

        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_from
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'html'))

            port = int(smtp_port) if smtp_port else 587
            if port == 465:
                server = smtplib.SMTP_SSL(smtp_server, port, timeout=10.0)
                server.login(smtp_username, smtp_password)
            else:
                server = smtplib.SMTP(smtp_server, port, timeout=10.0)
                server.starttls()
                server.login(smtp_username, smtp_password)
            
            server.sendmail(smtp_from, to_email, msg.as_string())
            server.close()
            print("Email sent successfully via SMTP.")
            return True
        except Exception as e:
            print(f"Error sending email via SMTP: {e}")
            print("Make sure your SMTP credentials are correct.")
            return False
