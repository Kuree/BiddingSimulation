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



#problems right now:
#    1. after refresh, the connection won't be consistent


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
    def assignFirm(client, firmList, usrFirm, bondCapacity):
        client.firmID = usrFirm
        client._socket.write_message(ujson.dumps({"command" : "assign_firm", "value" : {"firmList" : firmList, "userFirm" : usrFirm, "bondCapacity" : bondCapacity}}))
        return

    @staticmethod
    def updateInformation(client, firmList, offer, currentProject, bondCapacity):
        client._socketwrite_message(ujson.dumps({"command" : "update_info", "value" : {"firmList" : firmList, "offer" : offer, "currentPorject": currentProject, "bondCapacity" : bondCapacity}}))
        return

    

class SimulationInstance:

    MAX_CONNECTION = 2
    MAX_BID = 41

    def __init__(self, id):
        self.__clients = set()
        self.count = 1
        self.id = int(id)
        self.firmList = None
        self.currentBid = []
        self.bondCapacity = []
        self.currentProject = None
        self.currentProfitList = []
        self.currentGAList = []
        

    def writeMessage(self, message):
        for client in self.__clients:
            if client.isActive:
                client._sendMessage(message)

    def addClient(self, client):
        self.__clients.add(client)

    def findClient(self, id):
        for client in self.__clients:
            if int(client.id) == int(id):
                return client
        return None

    def __findClientIndex(self, id):
        for i in range(len(self.__clients)):
            if int(self.__clients[i].id) == int(id):
                return i
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
            return find

    def isConnectionReady(self):
        count = 0
        for client in self.__clients:
            if client.id != "admin": # admin is not included
                count += 1
        return count >= SimulationInstance.MAX_CONNECTION

    def isBiddingReady(self):
        #for offer in self.currentBid:
        #    if offer == 0:
        #        return False
        #return True
        count = 0
        for offer in self.currentBid:
            if offer != 0:
                count += 1
        return count == SimulationInstance.MAX_CONNECTION

    def getNoneAdminClients(self):
        result = []
        for client in self.__clients:
            if client.id != "admin": # admin is not included
                result.append(client)
        return result

    def getAllClients(self):
        return self.__clients

    def prepareToBid(self, firmList):
        self.firmList = copy.deepcopy(firmList)
        self.currentBid = [0] * len(RealtimeSimulationSocketHandler.firmList)
        for i in range(len(self.firmList)):
            self.bondCapacity.append(self.firmList[i]["bondCapacity"])

    def clientLen(self):
        return len(self.__clients)


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
        self.id = int(self.get_argument("id"))
        id = self.id
        if RealtimeSimulationSocketHandler.instance[-1].isConnectionReady(): # no more connection
            self.close()
            return

        if id != None: # make sure it is not a malicious connection
            find = RealtimeSimulationSocketHandler.instance[-1].findClient(id)
            print RealtimeSimulationSocketHandler.instance[-1].clientLen()
            if find == None: # might because the old simulation
                RealtimeSimulationSocketHandler.instance[-1].addClient(SimulationClient(self, id))
                CommandManager.deleteCookie(self, id) # PROBLEM HERE TO RECONNECT
                CommandManager.setCookie(self, id)
            else:
                client = RealtimeSimulationSocketHandler.instance[-1].activeClient(self.id)
                CommandManager.sendReady(client, true)
                CommandManager.sendDebugMessage(self, "client not none")
       
        
        if RealtimeSimulationSocketHandler.instance[-1].isConnectionReady(): # let the party begin!
            self.sendConnectionReady()
            self.assignFirms()
            self.sendProject()
            return

        CommandManager.sendDebugMessage(self, RealtimeSimulationSocketHandler.instance[-1].isConnectionReady())


    def on_message(self, message):      
        data = ujson.loads(message)
        command = data["command"]
        value = data["value"]
        currentInstance = RealtimeSimulationSocketHandler.instance[-1]
        if command == "send_offer":
            userFirm = value["userFirm"]
            offer = value["offer"]
            ga = value["ga"]
            profit = value["profit"]

            currentInstance.currentBid[userFirm] = offer
            currentInstance.currentGAList[usrFirm] = ga
            currentInstance.currentProfitList[usrFirm] = profit

            print currentInstance.currentBid

            if currentInstance.isBiddingReady():
                RealtimeSimulationSocketHandler.chooceAndProcessBidWinner() # choose winner
                RealtimeSimulationSocketHandler.processProject(currentInstance.firmList, currentInstance.count) # update all the information
                # send the information
                # reset offer/currentBid
                # send new project


    @staticmethod
    def chooceAndProcessBidWinner(currentInstance, currentProject):
        offer = currentInstance.currentBid
        minIndex = offer.index(min(offer))
        currentProject["ownerID"] = minIndex

        currentProject["offer"] = offer[minIndex];
        currentProject["profit"] = currentInstance.currentProfitList[minIndex] * currentProject["estimateCost"];
        currentProject["gaOverhead"] = currentInstance.currentGAList[minIndex];

        # push to project list
        currentInstance.firmList[minIndex]["projects"].append(copy.deepcopy(currentProject))
        # push to sum
        currentInstance.firmList[minIndex]["money"] += offer[minIndex];
        # update the bond capacity
        currentInstance.bondCapacity[minIndex] -= RealtimeSimulationSocketHandler.getBondCost(firmList[minIndex], currentProject["estimateCost"], currentInstance.bondCapacity[minIndex]);
        
        # cover some overhead
        firmList[minIndex]["currentGA"] += currentInstance.currentGAList[minIndex];

        currentInstance.count += 1

    @staticmethod
    def getBondCost(firm, directCost, bondCapacity):
        if (bondCapacity < 0) :
            return firm["bondCostRatioAbove"] * directCost;
        elif (bondCapacity < firm["bondLower"]) :
            return firm["bondCostRatioClose"] * directCost;
        else:
            return firm["bondCostRatioAbove"] * directCost;
        

    def on_close(self):
        RealtimeSimulationSocketHandler.instance[-1].suspendClient(self.id)
        pass

    def assignFirms(self):
        firmIDList = range(len(RealtimeSimulationSocketHandler.firmList)) # this is raw firm list
        random.shuffle(firmIDList)
        currentInstance = RealtimeSimulationSocketHandler.instance[-1]
        
        clientList = currentInstance.getNoneAdminClients()        
        currentInstance.prepareToBid(RealtimeSimulationSocketHandler.firmList)

        for i in range(len(clientList)):
            CommandManager.assignFirm(clientList[i], RealtimeSimulationSocketHandler.firmList, firmIDList[i], currentInstance.bondCapacity)
        pass

    def sendProject(self):
        clientList = RealtimeSimulationSocketHandler.instance[-1].getAllClients()
        RealtimeSimulationSocketHandler.instance[-1].currentProject = RealtimeSimulationSocketHandler.createProject()
        for client in clientList:
            CommandManager.sendProject(client, RealtimeSimulationSocketHandler.instance[-1].currentProject)

    def sendConnectionReady(self):
        clientList = RealtimeSimulationSocketHandler.instance[-1].getAllClients()
        for client in clientList:
            CommandManager.sendReady(client, True)

    def sendToWait(self):
        clientList = RealtimeSimulationSocketHandler.instance[-1].getNoneAdminClients()
        for client in clientList:
            CommandManager.sendReady(client, False)

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
        "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [], "ownerID": 0,
        "totalLength": length, "totalCost": cost, "ownerIndex": -1, "estimateCost": cost, "type": projectType, "size": projectSize, "description": projectDescription,
        "gaOverhead": 0, "isAlive": True, "offer": 0, "profit": 0, "sizeImpact": 0, "typeImpact": 0, "ownerImpact": 0 }

        return result;

    @staticmethod
    def createOwner(ownerClass):
        return { "name": name.find_name(), "email": internet.email(), "ui": "http://lorempixel.com/200/200/business/", "type": ownerClass, "company": company.company_name() };


    @staticmethod
    def processProject(firmList, count):
        for firm in firmList:
            if len(firm["projects"]) > 0:
                for project in firm["projects"]:
                    if project["length"] > 0:
                        RealtimeSimulationSocketHandler.randomEvent(firm, project)

        RealtimeSimulationSocketHandler.purageProjects(firmList)

        if count != 1 and count % 4 == 1:
            RealtimeSimulationSocketHandler.processGA()
        return


    @staticmethod
    def randomEvent(firm, project):
        # direct translation from javascript to python
        chooseFrom = ["owner", "project type", "project size"];
        eventType = random.choice(chooseFrom)
        event = {};
        addiitonalCost = 0;
        message = "";
        effectChance = 0;
    
        # firm events here
        if (eventType == chooseFrom[0]) : # owner impact
            ownerChanceList = RealtimeSimulationSocketHandler.ownerList[project["owner"]["type"]];
            effectChance = random.choice(ownerChanceList)
            
        else:
            chanceList = firmChance[firmList[project["ownerIndex"]]["type"]]
            targetChanceList = chanceList[project["type"]];
            effectChance = random.choice(targetChanceList)
        
        if (effectChance != 0):
            choice = "+" if (effectChance > 0) else "-"
            addiitonalCost = effectChance * project["quarterCost"];
            eventListFromRandom = eventList[eventType];
            if (eventListFromRandom == undefined):
                print "error"

            event["message"] = random.choice(eventListFromRandom[choice])
            event["additionalCost"] += addiitonalCost
            project["quarterCost"] += addiitonalCost
            project["totalCost"] += addiitonalCost

            # add impact to project's impact list
            if eventType == chooseFrom[0]:
                    project["ownerImpact"] += addiitonalCost
 
            elif eventType == chooseFrom[1]:
                    project["typeImpact"] += addiitonalCost

            elif eventType == chooseFrom[2]:
                    project["sizeImpact"] += addiitonalCost

            # clear event list
            project.events = [copy.deepcopy(event)]



    @staticmethod
    def purageProjects(firmList):
        for i in range(len(firmList)):
            if (firmList[i]["projects"].length > 0):
                for project in firmList[i]["projects"]:          
                    if (project["length"] > 0):
                        project["length"] -= 1;
                        firmList[project["ownerIndex"]]["money"] -= project["quarterCost"] # remove some part of money
                        project["quarterCost"] = project["estimateCost"] / float(project["totalLength"]) # reset the quarterCost


    @staticmethod
    def processGA(firmList):
        for firm in firmList:
            firm["money"] -= (100 - firm["currentGA"]) * firm["GA"] / 100;
        RealtimeSimulationSocketHandler.resetGAOverhead(firmList);

    @staticmethod
    def resetGAOverhead(firmList):
        for firm in firmList:
            firm["currentGA"] = 0;



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
        
