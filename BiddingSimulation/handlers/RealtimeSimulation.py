import tornado.websocket
from  jinja2 import Environment, FileSystemLoader
import ujson
import random
import hashlib
from faker import name, company, internet
import urllib
import requests
 
class RealtimeSimulationSocketHandler(tornado.websocket.WebSocketHandler):   
     
    clients = set()
    instance = []
    firmChance = ujson.load(open("static/data/firmChance.json"))
    ownerList = ujson.load(open("static/data/firmChance.json"))
    eventList = ujson.load(open("static/data/events.json"))
    projectList = ujson.load(open("static/data/projects.json"))
    firmList = ujson.load(open("static/data/firms.json"))

    def open(self, *args):
        RealtimeSimulationSocketHandler.clients.add(self)

    def on_message(self, message):      
        #self.write_message("Did you just say " + message)
        #print RealtimeSimulationSocketHandler.createProject()
        self.write_message(ujson.dumps(RealtimeSimulationSocketHandler.createOwner("A")))
        
    def on_close(self):
        RealtimeSimulationSocketHandler.clients.remove(self)


    @staticmethod
    def createProject():
        rawProject = random.choice(RealtimeSimulationSocketHandler.projectList)
        cost = rawProject["Direct Cost"];
        projectType = rawProject["Project Type"];
        length = random.randint(3, 5);
        owner = createOwner(rawProject["Owner Class"]);
        projectSize = rawProject["Project Size"];
        projectDescription = rawProject["Project Description"]; 

        result = {
        "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [], "isCurrentUserOwned": false,
        "totalLength": length, "totalCost": cost, "ownerIndex": -1, "estimateCost": cost, "type": projectType, "size": projectSize, "description": projectDescription,
        "gaOverhead": 0, "isAlive": true, "offer": 0, "profit": 0, "sizeImpact": 0, "typeImpact": 0, "ownerImpact": 0 }

        return result;

    @staticmethod
    def createOwner(ownerClass):
        imageData = ujson.loads(requests.get("http://uifaces.com/api/v1/random").text)
        print imageData["image_urls"]["epic"]      
        return { "name": name.find_name(), "email": internet.email(), "ui": imageData["image_urls"]["epic"], "type": ownerClass, "company": company.company_name() };

class RealtimeSimulationHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Realtime Simulation", ContentName="This hasn't been implemented yet")
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "realtimeSimulation.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
        
