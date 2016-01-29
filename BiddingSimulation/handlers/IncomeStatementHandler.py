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
        quarter = self.getQuarter(count)
        for project in firm["projects"]:
            #if self.getYear(project["length"]) > 0:
            if project["length"] > 0:
                projects.append(project)
        html_output = self.template.render(projects = projects, firm = firm, year = year, quarter = quarter)
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
        self.templateEnv.globals["intWithCommas"] = IncomeStatementHandler.intWithCommas

    def prepare(self):
        self.json_args = self.request.body
        #pass

    def getYear(self, count):
        return (count / 4  + 1) if count % 4 != 0 else count / 4

    def getQuarter(self, count):
        return count % 4 if (count % 4 != 0) else 4
    
    @staticmethod
    def intWithCommas(x):
        x = int(x)
        if x < 0:
            return '-' + IncomeStatementHandler.intWithCommas(-x)
        result = ''
        while x >= 1000:
            x, r = divmod(x, 1000)
            result = ",%03d%s" % (r, result)
        return "%d%s" % (x, result)