import tornado.web
from  jinja2 import Environment, FileSystemLoader
import json
import smtplib

class FeedbackHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Feedback", ContentName="Feedback")
        self.write(html_output)
        return
    
    def post(self):
        # this is for the bot
        email = "kz005"
        email += "@"
        email += "bucknell.edu"
        sender = 'feedback@bucknell-bbs.com'
        smtpObj = smtplib.SMTP('localhost')
        content = json.loads(self.request.body)
        message_body = str.format("Name: {0}\nEmail:{1}\nFeedback:{2}", content["name"], content["email"], content["text"])
        message = str.format("From: Admin <{0}>\r\nTo: Keyi <{1}>\r\nSubject: Feedback\r\n\r\n{2}", sender, email, message_body)
        smtpObj.sendmail(sender, [email], message)
        print "mail sent"
        self.write("ok")
        return

    def initialize(self):
        self.TEMPLATE_FILE = "feedback.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
