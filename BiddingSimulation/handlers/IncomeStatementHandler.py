import tornado.web
from  jinja2 import Environment, FileSystemLoader
import ujson
import math
class IncomeStatementHandler(tornado.web.RequestHandler):
    def post(self):
        jsonArg = self.json_args
        data = ujson.loads(jsonArg)
        firm = data["firm"]
        projects = []
        count = data["count"]
        year = self.getYear(count)
        for project in firm["projects"]:
            if self.getYear(project["number"]) == year:
                projects.append(project)
        html_output = self.template.render(projects = projects, firm = firm, year = year)
        self.write(html_output)

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")

    def initialize(self):
        self.TEMPLATE_FILE = "incomeStatement.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
        self.templateEnv.globals["round"] = round
        self.templateEnv.globals["int"] = int

    def prepare(self):
        self.json_args = self.request.body
        #pass

    def getYear(self, count):
        return (count / 4  + 1) if count % 4 != 0 else count / 4