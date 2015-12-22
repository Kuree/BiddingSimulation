import tornado.web
from  jinja2 import Environment, FileSystemLoader

class FeedbackHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Feedback", ContentName="Feedback")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "feedback.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
