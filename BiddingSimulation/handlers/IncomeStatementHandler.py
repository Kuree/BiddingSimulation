import tornado.web
from  jinja2 import Environment, FileSystemLoader
import json

class IncomeStatementHandler(tornado.web.RequestHandler):
    def post(self):
        #jsonArg = self.json_args
        html_output = self.template.render(firmName = "Firm Test")
        self.write(html_output)

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")

    def initialize(self):
        self.TEMPLATE_FILE = "incomeStatement.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)

    def prepare(self):
        #self.json_args = json_decode(self.request.body)
        pass