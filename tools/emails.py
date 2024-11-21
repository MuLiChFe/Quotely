import smtplib
from email.mime.text import MIMEText
from django.conf import settings
import os


def send_email(subject, body, recipients, sender=None, password=None):
    if not sender:
        sender = 'quotely.info@gmail.com'
    if not password:
        password = "psjn ndwy yfgl ipzn"

    msg = MIMEText(body, "html")
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)

    try:
        connection = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        connection.login(user=sender, password=password)
        connection.sendmail(from_addr=sender, to_addrs=recipients, msg=msg.as_string())
        connection.quit()
    except Exception as e:
        return False


website = "http://localhost:8000"

class EmailManage:
    @staticmethod
    def send_verification_email(recipient, token):
        subject = "Please Verify Your Email Address"
        # 构造模板文件的完整路径
        template_path = os.path.join(settings.STATICFILES_DIRS[0], "email", "verify.html")
        # 读取 HTML 模板并替换占位符
        with open(template_path, "r", encoding="utf-8") as file:
            body = file.read().replace("{verification_link}", f"{website}/verify_token/{str(token)}")

        send_email(subject, body, [recipient])
