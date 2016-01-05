﻿import tornado.web
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
        smtpObj.sendmail(sender, [email], self.request.body) 
        print "mail sent"
        self.write("ok")
        return

    def initialize(self):
        self.TEMPLATE_FILE = "feedback.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
