import tornado.websocket
from  jinja2 import Environment, FileSystemLoader
import ujson
import random
import hashlib
from faker import name, company, internet
import urllib
import requests
import copy

#Format of message to be send to the clients
#{
#    "command" : command,
#    "value" : any data
#}

class CommandManager:

    @staticmethod
    def setCookie(socket, id):
        socket.write_message(ujson.dumps({"command" : "set_cookie", "value" : str(id)}))
        return

    @staticmethod
    def deleteCookie(socket, id):
        socket.write_message(ujson.dumps({"command" : "remove_cookie", "value" : str(id)}))
        return

    @staticmethod
    def sendDebugMessage(socket, message):
        socket.write_message(ujson.dumps({"command" : "debug", "value" : str(message)}))
        return

    @staticmethod
    def sendProject(client, project):
        client._socket.write_message(ujson.dumps({"command" : "project", "value" : project}))
        return

    @staticmethod
    def sendReady(client, isReady):
        client._socket.write_message(ujson.dumps({"command" : "connection_ready", "value" : isReady}))
        return

    @staticmethod
    def assignFirm(client, firmList, usrFirm):
        client.firmID = usrFirm
        client._socket.write_message(ujson.dumps({"command" : "assign_firm", "value" : {"firmList" : firmList, "userFirm" : usrFirm}}))
        return

    

class SimulationInstance:

    MAX_CONNECTION = 1

    def __init__(self, id):
        self.__clients = set()
        self.count = 0
        self.id = id
        self.firms = None
        

    def writeMessage(self, message):
        for client in self.__clients:
            if client.isActive:
                client._sendMessage(message)

    def addClient(self, client):
        self.__clients.add(client)

    def findClient(self, id):
        for client in self.__clients:
            if client.id == id:
                return client
        return None

    def setCLientID(self, oldID, newID):
        find = self.findClient(oldID)
        if find != None:
            find.id = newID

    def suspendClient(self, id):
        find = self.findClient(id)
        if find != None:
            find.isActive = False

    def activeClient(self, id):
        find = self.findClient(id)
        if find != None:
            find.isActive = True

    def isReady(self):
        count = 0
        for client in self.__clients:
            if client.id != "admin": # admin is not included
                count += 1
        return count >= SimulationInstance.MAX_CONNECTION

    def getNoneAdminClients(self):
        result = []
        for client in self.__clients:
            if client.id != "admin": # admin is not included
                result.append(client)
        return result

    def getAllClients(self):
        return self.__clients


class SimulationClient:
    def __init__(self, socket, id):
        self._socket = socket
        self.id = id
        self.isActive = True
        self.firmID = 0

    def _sendMessage(self, message):
        self._socket.write_message(message)



class RealtimeSimulationSocketHandler(tornado.websocket.WebSocketHandler):   

    instance = [SimulationInstance(0)]
    firmChance = ujson.load(open("static/data/firmChance.json"))
    ownerList = ujson.load(open("static/data/firmChance.json"))
    eventList = ujson.load(open("static/data/events.json"))
    projectList = ujson.load(open("static/data/projects.json"))
    firmList = ujson.load(open("static/data/firms.json"))

    def open(self, *args):        
        self.id = self.get_argument("id")
        id = self.id
        if RealtimeSimulationSocketHandler.instance[-1].isReady(): # no more connection
            self.close()
            return

        if id != None: # make sure it is not a malicious connection
            find = RealtimeSimulationSocketHandler.instance[-1].findClient(id)
            if find == None: # might because the old simulation
                RealtimeSimulationSocketHandler.instance[-1].addClient(SimulationClient(self, id))
                CommandManager.deleteCookie(self, id) # I don't care if nothing is there
                CommandManager.setCookie(self, id)
            else:
                RealtimeSimulationSocketHandler.instance[-1].activeClient(self.id)
                CommandManager.sendDebugMessage(self, "client not none")
        else:
            RealtimeSimulationSocketHandler.instance[-1].addClient(SimulationClient(self, id))
            CommandManager.setCookie(self, id)
        
        if RealtimeSimulationSocketHandler.instance[-1].isReady(): # let the party begin!
            self.assignFirms()
            self.sendProject()
            return

        CommandManager.sendDebugMessage(self, RealtimeSimulationSocketHandler.instance[-1].isReady())


    def on_message(self, message):      
        data = ujson.loads(message)
        command = data["command"]
        value = data["data"]
            
        
    def on_close(self):
        RealtimeSimulationSocketHandler.instance[-1].suspendClient(self.id)
        pass

    def assignFirms(self):
        firmIDList = range(len(RealtimeSimulationSocketHandler.firmList)) # this is raw firm list
        random.shuffle(firmIDList)
        clientList = RealtimeSimulationSocketHandler.instance[-1].getNoneAdminClients()
        RealtimeSimulationSocketHandler.instance[-1].firms = copy.deepcopy(RealtimeSimulationSocketHandler.firmList)
        for i in range(len(clientList)):
            CommandManager.assignFirm(clientList[i], RealtimeSimulationSocketHandler.firmList, firmIDList[i])
        pass

    def sendProject(self):
        clientList = RealtimeSimulationSocketHandler.instance[-1].getAllClients()
        for client in clientList:
            CommandManager.sendProject(client, RealtimeSimulationSocketHandler.createProject())

    def sendConnectionReady(self):
        clientList = RealtimeSimulationSocketHandler.instance[-1].getAllClients()
        for client in clientList:
            CommandManager.sendReady(client, True)

    def sendConnectionNotReady(self):
        '''Need to pause the game because someone is offline'''
        clientList = RealtimeSimulationSocketHandler.instance[-1].getAllClients()
        for client in clientList:
            CommandManager.sendReady(client, False)

    @staticmethod
    def createProject():
        rawProject = random.choice(RealtimeSimulationSocketHandler.projectList)
        cost = rawProject["Direct Cost"];
        projectType = rawProject["Project Type"];
        length = random.randint(3, 5);
        owner = RealtimeSimulationSocketHandler.createOwner(rawProject["Owner Class"]);
        projectSize = rawProject["Project Size"];
        projectDescription = rawProject["Project Description"]; 
        count = RealtimeSimulationSocketHandler.instance[-1].count
        
        
        result = {
        "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [], "isCurrentUserOwned": False,
        "totalLength": length, "totalCost": cost, "ownerIndex": -1, "estimateCost": cost, "type": projectType, "size": projectSize, "description": projectDescription,
        "gaOverhead": 0, "isAlive": True, "offer": 0, "profit": 0, "sizeImpact": 0, "typeImpact": 0, "ownerImpact": 0 }

        return result;

    @staticmethod
    def createOwner(ownerClass):
        return { "name": name.find_name(), "email": internet.email(), "ui": "http://lorempixel.com/200/200/business/", "type": ownerClass, "company": company.company_name() };




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
        
