import tornado.web
from  jinja2 import Environment, FileSystemLoader
from os import listdir
from os.path import isfile, join

class ResourcesHandler(tornado.web.RequestHandler):
    def get(self):
        files = self.getFiles()
        html_output = self.template.render(title="Resources For Downloads", ContentName="Resources For Downloads", files = files)
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "resources.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)


    def getFiles(self):
        return [ f for f in listdir("static/resources") if isfile(join("static/resources",f)) ]